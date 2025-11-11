import { GoogleGenAI } from "@google/genai";
import { Ticket } from '../types';

let ai: GoogleGenAI;

// Singleton pattern to initialize the AI instance only once.
const getAiInstance = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            // A friendly error for the developer if the API key is missing.
            alert("Google AI API key is not configured. Please add it to your environment variables.");
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

export const geminiService = {
    generateImage: async (prompt: string): Promise<string> => {
        const aiInstance = getAiInstance();
        const response = await aiInstance.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
            return response.generatedImages[0].image.imageBytes;
        }

        throw new Error("Image generation failed or returned no images.");
    },

    getChatbotResponse: async (query: string, tickets: Ticket[]): Promise<string> => {
        const aiInstance = getAiInstance();
        
        const systemInstruction = `You are a helpful AI assistant for the "Payal Electronics Service Management App".
        Your role is to answer questions based on the provided ticket data.
        The current date is ${new Date().toDateString()}.
        Analyze the following JSON data which represents the current list of service tickets.
        Do not make up information. If the answer is not in the data, say so.
        Format your answers clearly, using markdown for lists or tables if appropriate.
        Keep your answers concise and clear.
        
        Ticket Data:
        ${JSON.stringify(tickets, null, 2)}
        `;

        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: query,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text;
    },
};