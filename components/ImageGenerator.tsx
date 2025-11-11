import React, { useState } from 'react';
import { Ticket, TicketUpdatePayload } from '../types';
import { geminiService } from '../services/geminiService';
import { PhotoIcon } from './Icons';

interface ImageGeneratorProps {
  tickets: Ticket[];
  onUpdateTicket: (ticketId: string, updates: TicketUpdatePayload) => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ tickets, onUpdateTicket }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [attachStatus, setAttachStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setAttachStatus('idle');

    try {
      const base64Data = await geminiService.generateImage(prompt);
      setGeneratedImage(`data:image/png;base64,${base64Data}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachImage = () => {
    if (!generatedImage || !selectedTicketId) return;
    
    const ticketToUpdate = tickets.find(t => t.firestoreDocId === selectedTicketId);
    if (!ticketToUpdate) {
        setAttachStatus('error');
        return;
    }

    const updatedPhotos = [...ticketToUpdate.photos, generatedImage];
    onUpdateTicket(selectedTicketId, { photos: updatedPhotos });
    setAttachStatus('success');
    setTimeout(() => setAttachStatus('idle'), 3000); // Reset status after 3s
  };

  const openTickets = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Completed');

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center mb-6">
            <PhotoIcon className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">AI Image Generator</h1>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="mb-4 text-gray-600">
                Describe an image you want to create. This can be useful for visualizing customer issues, identifying spare parts, or creating reference diagrams.
            </p>
            <form onSubmit={handleGenerateImage} className="flex flex-col sm:flex-row items-stretch gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A cracked smartphone screen, close-up"
                    disabled={isLoading}
                    className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900"
                    required
                />
                <button type="submit" disabled={isLoading} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-light disabled:bg-gray-400 transition-colors font-semibold flex items-center justify-center">
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </>
                    ) : 'Generate Image'}
                </button>
            </form>
        </div>

        <div className="mt-6">
            {isLoading && (
                <div className="text-center p-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">The AI is creating your image. This may take a moment...</p>
                </div>
            )}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            {generatedImage && (
                <div className="bg-white p-6 rounded-lg shadow-lg animate-fade-in">
                    <style>{`
                        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                        .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
                    `}</style>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Generated Image</h2>
                    <img src={generatedImage} alt={prompt} className="w-full max-w-lg mx-auto rounded-md shadow-md mb-6"/>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Attach to Ticket</h3>
                        <div className="flex flex-col sm:flex-row items-stretch gap-2">
                            <select
                                value={selectedTicketId}
                                onChange={(e) => setSelectedTicketId(e.target.value)}
                                className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900"
                            >
                                <option value="" disabled>Select a ticket...</option>
                                {openTickets.map(ticket => (
                                    <option key={ticket.firestoreDocId} value={ticket.firestoreDocId}>
                                        {ticket.id} - {ticket.customerName}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAttachImage}
                                disabled={!selectedTicketId || attachStatus === 'success'}
                                className="px-6 py-2 bg-accent text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors font-semibold"
                            >
                                {attachStatus === 'success' ? 'Attached!' : 'Attach Image'}
                            </button>
                        </div>
                         {attachStatus === 'error' && <p className="text-sm text-danger mt-2">Could not attach image. Please try again.</p>}
                    </div>
                </div>
            )}
        </div>
      </div>
    </main>
  );
};