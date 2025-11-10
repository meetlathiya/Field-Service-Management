

import { GoogleGenAI, Chat } from "@google/genai";
import { Ticket } from '../types';
import { INITIAL_TICKETS } from '../constants';

// System instruction to make Gemini act as a key-value store.
const SYSTEM_INSTRUCTION = `
You are a highly reliable JSON data store for a ticket management application.
Your entire purpose is to store and retrieve a single JSON array of ticket objects.
You will hold the state in your memory.
When I send "GET_STATE", you MUST respond ONLY with the JSON array of tickets you have in memory, and nothing else.
If you have no data in memory, you MUST respond with the exact string "NO_DATA".
When I send "UPDATE_STATE:" followed by a JSON array, you MUST store this new array, overwriting any previous data. After storing it, you MUST respond ONLY with the exact string "OK", and nothing else.
Do not add any commentary, greetings, or extra text to your responses. Stick to the protocol strictly.
`;

let ai: GoogleGenAI;
let dataStoreChat: Chat;

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

// Singleton for the data store chat session.
const getDataStoreChat = () => {
    if (!dataStoreChat) {
        const aiInstance = getAiInstance();
        dataStoreChat = aiInstance.chats.create({
            model: 'gemini-2.5-flash', // A fast and efficient model for this task
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            }
        });
    }
    return dataStoreChat;
}

// Function to safely parse JSON from Gemini's response
const parseTicketsFromResponse = (text: string): Ticket[] | null => {
    try {
        // The model might wrap the JSON in markdown backticks, so we clean it up.
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        if (cleanText === "NO_DATA") {
            return null;
        }
        const parsed = JSON.parse(cleanText) as Ticket[];
        // Revive Date objects which are stored as strings in JSON
        return parsed.map(ticket => ({
            ...ticket,
            createdAt: new Date(ticket.createdAt),
            updatedAt: new Date(ticket.updatedAt),
            scheduledDate: ticket.scheduledDate ? new Date(ticket.scheduledDate) : null,
        }));
    } catch (e) {
        console.error("Failed to parse tickets from Gemini response:", e);
        console.error("Original response text:", text);
        // If parsing fails, it's safer to return the initial state to avoid crashing.
        return INITIAL_TICKETS;
    }
};

export const geminiService = {
    getCloudState: async (): Promise<Ticket[]> => {
        const chatSession = getDataStoreChat();
        const response = await chatSession.sendMessage({ message: "GET_STATE" });
        const tickets = parseTicketsFromResponse(response.text);

        if (tickets === null) {
            // This is the first run, so we initialize the state in the cloud.
            console.log("No data found in cloud, initializing with default tickets.");
            await geminiService.updateCloudState(INITIAL_TICKETS);
            return INITIAL_TICKETS;
        }

        return tickets;
    },

    updateCloudState: async (tickets: Ticket[]): Promise<void> => {
        const chatSession = getDataStoreChat();
        // Use a reviver to ensure dates are stored in a consistent ISO format
        const jsonString = JSON.stringify(tickets);
        const response = await chatSession.sendMessage({ message: `UPDATE_STATE:${jsonString}`});
        
        if (response.text.trim() !== "OK") {
            console.warn("Gemini did not confirm state update correctly. Response:", response.text);
            // Optionally, we could add retry logic here.
        }
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

    // FIX: Add generateImage method to provide image generation functionality.
    generateImage: async (prompt: string): Promise<string> => {
        const aiInstance = getAiInstance();
        const response = await aiInstance.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }

        throw new Error("Image generation failed or returned no images.");
    },
};