
import { Ticket, TicketUpdatePayload, TicketStatus } from '../types';
import { geminiService } from './geminiService';

// This is a local cache to avoid re-fetching from the cloud on every operation within a session.
let ticketCache: Ticket[] | null = null;

// Function to load tickets from the cloud or return the cache.
const getOrFetchTickets = async (): Promise<Ticket[]> => {
    if (ticketCache) {
        return ticketCache;
    }
    const ticketsFromCloud = await geminiService.getCloudState();
    ticketCache = ticketsFromCloud;
    return ticketsFromCloud;
};

// Function to update the cloud and the local cache simultaneously.
const updateAndCacheTickets = async (tickets: Ticket[]): Promise<void> => {
    ticketCache = tickets;
    await geminiService.updateCloudState(tickets);
};

export const ticketService = {
  getTickets: async (): Promise<Ticket[]> => {
    // We clear the cache on initial load to ensure we get the latest from the cloud.
    ticketCache = null; 
    return await getOrFetchTickets();
  },

  createTicket: async (newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Ticket> => {
    const currentTickets = await getOrFetchTickets();
    
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = now.getFullYear().toString().slice(-2);
    const idPrefix = `PE-${month}${year}-`;

    const currentMonthTickets = currentTickets.filter(t => t.id.startsWith(idPrefix));
    
    let lastNumber = 0;
    if (currentMonthTickets.length > 0) {
      const numbers = currentMonthTickets.map(t => {
        const numPart = t.id.split('-').pop();
        return parseInt(numPart || '0', 10);
      }).filter(n => !isNaN(n));
      
      if (numbers.length > 0) {
          lastNumber = Math.max(...numbers);
      }
    }
    
    const newNumber = lastNumber + 1;
    const newId = `${idPrefix}${String(newNumber).padStart(3, '0')}`;

    const newTicket: Ticket = {
      ...newTicketData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      status: TicketStatus.New,
    };

    const updatedTickets = [newTicket, ...currentTickets];
    await updateAndCacheTickets(updatedTickets);
    
    return newTicket;
  },

  updateTicket: async (ticketId: string, updates: TicketUpdatePayload): Promise<Ticket> => {
     const currentTickets = await getOrFetchTickets();
     let updatedTicket: Ticket | undefined;

     const updatedTickets = currentTickets.map(ticket => {
        if (ticket.id === ticketId) {
            updatedTicket = { ...ticket, ...updates, updatedAt: new Date() };
            return updatedTicket;
        }
        return ticket;
     });

     if (!updatedTicket) {
         throw new Error("Ticket not found");
     }

     await updateAndCacheTickets(updatedTickets);
     return updatedTicket;
  },
};
