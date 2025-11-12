// This service's functionality (AI Chatbot, Image Generation) is being re-enabled
// using the @google/genai SDK.
import { GoogleGenAI } from "@google/genai";
import { Ticket } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async generateImage(prompt: string): Promise<string> {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error('Image generation failed to return an image.');
    }

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return base64ImageBytes;
  },

  async getChatbotResponse(prompt: string, tickets: Ticket[]): Promise<string> {
    // A simplified string representation to fit within prompt limits if necessary
    const ticketsSummary = tickets.map(t => ({
      id: t.id,
      customerName: t.customerName,
      status: t.status,
      issue: t.issueDescription.substring(0, 100) + (t.issueDescription.length > 100 ? '...' : ''),
      technicianId: t.technicianId,
      scheduledDate: t.scheduledDate
    }));

    const ticketsContext = JSON.stringify(ticketsSummary, null, 2);

    const fullPrompt = `Based on the following service tickets data, answer the user's question.
---
Tickets Data (JSON summary):
${ticketsContext}
---
User Question: "${prompt}"
---
Answer:`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: "You are a helpful AI assistant for 'Payal Electronics' service management portal. Your name is Service Assistant. You only answer questions related to the provided ticket data. If asked about something else, politely decline.",
      }
    });
    
    return response.text;
  },
};
