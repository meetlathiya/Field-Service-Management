import { useState, useCallback, useEffect } from 'react';
import { Ticket, TicketUpdatePayload } from '../types';
import { ticketService } from '../services/ticketService';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial tickets when the hook is first used
    const loadTickets = async () => {
        try {
            const initialTickets = await ticketService.getTickets();
            setTickets(initialTickets);
        } catch (error) {
            console.error("Failed to load tickets", error);
        } finally {
            setIsLoading(false);
        }
    };
    loadTickets();
  }, []);

  const addTicket = useCallback(async (newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
        const newTicket = await ticketService.createTicket(newTicketData);
        setTickets(prevTickets => [newTicket, ...prevTickets]);
    } catch (error) {
        console.error("Failed to add ticket", error);
        // Here you could add user-facing error handling
    }
  }, []);

  const updateTicket = useCallback(async (ticketId: string, updates: TicketUpdatePayload) => {
    try {
        const updatedTicket = await ticketService.updateTicket(ticketId, updates);
        setTickets(prevTickets =>
            prevTickets.map(ticket =>
                ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket
            )
        );
    } catch (error) {
         console.error("Failed to update ticket", error);
         // Here you could add user-facing error handling
    }
  }, []);

  return {
    tickets,
    addTicket,
    updateTicket,
    isLoading,
  };
};
