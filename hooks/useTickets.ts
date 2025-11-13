import { useState, useCallback, useEffect } from 'react';
import { Ticket, TicketUpdatePayload } from '../types';
import { firebaseService, initError } from '../services/firebaseService';


export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [operationError, setOperationError] = useState<any>(null);

  const clearOperationError = useCallback(() => setOperationError(null), []);

  useEffect(() => {
    // If Firebase itself failed to initialize, do not proceed.
    // The App component will show a specific warning.
    if (initError) {
      setError(initError);
      setIsLoading(false);
      return;
    }
    
    // Subscribe to real-time ticket updates from Firebase.
    const unsubscribe = firebaseService.streamTickets(
        (loadedTickets) => {
            setTickets(loadedTickets);
            setIsLoading(false);
            setError(null); // Clear any previous error on success
        },
        (err: any) => {
            console.error("Failed to stream tickets from Firebase:", err);
            setError(err); // Capture the specific Firebase error
            setIsLoading(false); 
        }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const addTicket = useCallback(async (newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
        await firebaseService.createTicket(newTicketData);
        setOperationError(null);
    } catch (error) {
        console.error("Failed to add ticket", error);
        setOperationError(error);
    }
  }, []);

  const updateTicket = useCallback(async (ticketId: string, updates: TicketUpdatePayload) => {
    try {
        await firebaseService.updateTicket(ticketId, updates);
        setOperationError(null);
    } catch (error) {
         console.error("Failed to update ticket", error);
         setOperationError(error);
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