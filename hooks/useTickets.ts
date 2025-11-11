import { useState, useCallback, useEffect } from 'react';
import { Ticket, TicketUpdatePayload } from '../types';
import { firebaseService } from '../services/firebaseService';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to real-time ticket updates.
    // The `unsubscribe` function is returned by streamTickets and will be called on component unmount.
    const unsubscribe = firebaseService.streamTickets((loadedTickets) => {
        setTickets(loadedTickets);
        if (isLoading) {
            setIsLoading(false);
        }
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [isLoading]); // Rerun effect only if isLoading changes, which it does once.

  const addTicket = useCallback(async (newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
        // The real-time listener will automatically update the UI.
        await firebaseService.createTicket(newTicketData);
    } catch (error) {
        console.error("Failed to add ticket", error);
        // Here you could add user-facing error handling (e.g., a toast notification)
    }
  }, []);

  const updateTicket = useCallback(async (ticketId: string, updates: TicketUpdatePayload) => {
    try {
        // The real-time listener will automatically update the UI.
        await firebaseService.updateTicket(ticketId, updates);
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