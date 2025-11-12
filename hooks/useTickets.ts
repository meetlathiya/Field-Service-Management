import { useState, useCallback, useEffect } from 'react';
import { Ticket, TicketUpdatePayload } from '../types';
import { firebaseService } from '../services/firebaseService';
import { INITIAL_TICKETS } from '../constants';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [operationError, setOperationError] = useState<Error | null>(null);

  const clearOperationError = useCallback(() => setOperationError(null), []);

  useEffect(() => {
    // Subscribe to real-time ticket updates.
    // The `unsubscribe` function is returned by streamTickets and will be called on component unmount.
    const unsubscribe = firebaseService.streamTickets(
        (loadedTickets) => {
            setTickets(loadedTickets);
            setIsLoading(false);
            setError(null); // Clear any previous error on success
        },
        (err) => {
            console.error("Failed to stream tickets:", err);
            setError(err);
            // FIX: On error, fall back to mock data so the app remains usable.
            setTickets(INITIAL_TICKETS);
            setIsLoading(false); // Ensure loading stops on error
        }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Use an empty dependency array to run only once on mount.

  const addTicket = useCallback(async (newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
        await firebaseService.createTicket(newTicketData);
        setOperationError(null);
    } catch (error) {
        console.error("Failed to add ticket", error);
        setOperationError(error as Error);
    }
  }, []);

  const updateTicket = useCallback(async (ticketId: string, updates: TicketUpdatePayload) => {
    try {
        await firebaseService.updateTicket(ticketId, updates);
        setOperationError(null);
    } catch (error) {
         console.error("Failed to update ticket", error);
         setOperationError(error as Error);
    }
  }, []);

  return {
    tickets,
    addTicket,
    updateTicket,
    isLoading,
    error,
    operationError,
    clearOperationError,
  };
};