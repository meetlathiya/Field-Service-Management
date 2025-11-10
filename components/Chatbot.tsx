
import React, { useState, useRef, useEffect } from 'react';
import { Ticket } from '../types';
import { CloseIcon, ChatBubbleOvalLeftEllipsisIcon } from './Icons';
import { geminiService } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatbotProps {
  tickets: Ticket[];
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
    </div>
);

export const Chatbot: React.FC<ChatbotProps> = ({ tickets }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<null | HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        { role: 'model', text: "Hello! I'm the Service Assistant. Ask me anything about the current tickets." }
      ]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await geminiService.getChatbotResponse(currentInput, tickets);
      const modelMessage: Message = { role: 'model', text: responseText };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-5 left-5 z-30">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary-light text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          aria-label="Open AI Assistant"
        >
          <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-full max-h-[80vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-up">
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">AI Service Assistant</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                    <div className="rounded-lg px-4 py-2 bg-gray-200 text-gray-800">
                        <TypingIndicator />
                    </div>
                </div>
              )}
               <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-gray-50">
              <form onSubmit={handleSend} className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about tickets..."
                  disabled={isLoading}
                  className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900 disabled:bg-gray-100"
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light disabled:bg-gray-400 transition-colors">
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
