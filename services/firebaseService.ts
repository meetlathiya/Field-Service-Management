// FIX: Update imports to use v8 firebase object from config.

import firebase, { db, storage } from './firebaseConfig';
import { Ticket, TicketUpdatePayload, TicketStatus } from '../types';

// FIX: Use v8 syntax db.collection()
const ticketsCollectionRef = db.collection('tickets');
// FIX: Get Timestamp from the v8 firebase namespace.
const Timestamp = firebase.firestore.Timestamp;

// Helper to convert Firestore Timestamps to JS Date objects
const fromFirestore = (ticketData: any): Ticket => {
    const { createdAt, updatedAt, scheduledDate, ...rest } = ticketData;
    return {
        ...rest,
        createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : new Date(createdAt),
        updatedAt: updatedAt instanceof Timestamp ? updatedAt.toDate() : new Date(updatedAt),
        scheduledDate: scheduledDate ? (scheduledDate instanceof Timestamp ? scheduledDate.toDate() : new Date(scheduledDate)) : null,
    } as Ticket;
}

export const firebaseService = {
  uploadImage: async (imageData: Blob | string, folder: 'ticket-photos' | 'signatures'): Promise<string> => {
    let extension = 'png';
    // Performance: Check if we are uploading a jpeg blob and set the extension.
    if (imageData instanceof Blob && imageData.type === 'image/jpeg') {
        extension = 'jpg';
    }

    // Create a unique filename
    const fileName = `${folder}/${new Date().getTime()}-${Math.random().toString(36).substring(2)}.${extension}`;
    const storageRef = storage.ref(fileName);

    let uploadTask;
    // Upload the file.
    if (typeof imageData === 'string') {
        // Handle base64 data strings (from signature pad)
        uploadTask = await storageRef.putString(imageData, 'data_url');
    } else {
        // Handle Blob/File objects (from photo uploads), which is more efficient
        uploadTask = await storageRef.put(imageData);
    }
    
    // Get the download URL
    const downloadURL = await uploadTask.ref.getDownloadURL();
    return downloadURL;
  },
  
  streamTickets: (
    onSuccess: (tickets: Ticket[]) => void,
    onError: (error: Error) => void
  ): (() => void) => {
    // FIX: Use v8 chained query syntax
    const q = ticketsCollectionRef.orderBy('createdAt', 'desc');

    // FIX: Use v8 onSnapshot on the query object
    const unsubscribe = q.onSnapshot((querySnapshot) => {
      const tickets = querySnapshot.docs.map(doc => fromFirestore({ ...doc.data(), firestoreDocId: doc.id }));
      onSuccess(tickets);
    }, (error) => {
        onError(error);
    });

    return unsubscribe;
  },

  createTicket: async (newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = now.getFullYear().toString().slice(-2);
    const idPrefix = `PE-${month}${year}`;
    
    // FIX: Use v8 doc reference syntax for the counter.
    const counterRef = db.collection('counters').doc(idPrefix);

    try {
      // FIX: Refactored complex and buggy logic into a single, efficient v8 transaction.
      const docRef = await db.runTransaction(async (transaction) => {
          const counterDoc = await transaction.get(counterRef);
          const newCount = (counterDoc.exists ? counterDoc.data()!.count : 0) + 1;
          const finalId = `${idPrefix}-${String(newCount).padStart(3, '0')}`;
          
          const newTicketPayload = {
              ...newTicketData,
              id: finalId,
              createdAt: Timestamp.fromDate(now),
              updatedAt: Timestamp.fromDate(now),
              status: TicketStatus.New
          };

          const newTicketRef = ticketsCollectionRef.doc();
          transaction.set(newTicketRef, newTicketPayload);
          transaction.set(counterRef, { count: newCount });

          return newTicketRef;
      });

      return docRef.id;

    } catch (e) {
        console.error("Transaction failed: ", e);
        throw new Error("Failed to create ticket.");
    }
  },

  updateTicket: async (firestoreDocId: string, updates: TicketUpdatePayload): Promise<void> => {
     // FIX: Use v8 doc reference and update syntax.
     const ticketRef = ticketsCollectionRef.doc(firestoreDocId);
     await ticketRef.update({
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
     });
  },
};