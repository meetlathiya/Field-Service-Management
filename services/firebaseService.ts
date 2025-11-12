// FIX: Update imports to use v8 firebase object from config.

import firebase, { db, storage, initError } from './firebaseConfig';
import { Ticket, TicketUpdatePayload, TicketStatus } from '../types';

// Re-export the initialization error so other parts of the app can check it.
export { initError };

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
  uploadImage: (
    imageData: Blob | string,
    folder: 'ticket-photos' | 'signatures',
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    if (!storage) {
        return Promise.reject(initError || new Error("Firebase Storage is not initialized."));
    }
    let extension = 'png';
    // Performance: Check if we are uploading a jpeg blob and set the extension.
    if (imageData instanceof Blob && imageData.type === 'image/jpeg') {
        extension = 'jpg';
    }

    // Create a unique filename
    const fileName = `${folder}/${new Date().getTime()}-${Math.random().toString(36).substring(2)}.${extension}`;
    const storageRef = storage.ref(fileName);

    // Upload the file.
    if (typeof imageData === 'string') {
        // Handle base64 data strings (from signature pad). Progress reporting is not supported.
        return storageRef.putString(imageData, 'data_url').then(snapshot => {
            return snapshot.ref.getDownloadURL();
        });
    } else {
        // Handle Blob/File objects (from photo uploads), which is more efficient and supports progress.
        // FIX: Explicitly set the content type metadata to prevent uploads from stalling.
        const metadata = { contentType: imageData.type };
        return new Promise((resolve, reject) => {
            const uploadTask = storageRef.put(imageData, metadata);

            uploadTask.on(
                firebase.storage.TaskEvent.STATE_CHANGED,
                (snapshot) => {
                    // BUG FIX: Add a guard against division by zero if totalBytes is not yet available
                    // or the file is empty, preventing NaN progress values that would hang the UI.
                    const progress = snapshot.totalBytes > 0
                        ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        : 0;
                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                (error) => {
                    reject(error);
                },
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then(resolve).catch(reject);
                }
            );
        });
    }
  },
  
  streamTickets: (
    onSuccess: (tickets: Ticket[]) => void,
    onError: (error: Error) => void
  ): (() => void) => {
    if (!db) {
        onError(initError || new Error("Firestore is not initialized."));
        return () => {}; // Return an empty unsubscribe function
    }
    // FIX: Use v8 chained query syntax
    const ticketsCollectionRef = db.collection('tickets');
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
    if (!db) {
        return Promise.reject(initError || new Error("Firestore is not initialized."));
    }
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = now.getFullYear().toString().slice(-2);
    const idPrefix = `PE-${month}${year}`;
    
    // FIX: Use v8 doc reference syntax for the counter.
    const ticketsCollectionRef = db.collection('tickets');
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
     if (!db) {
        return Promise.reject(initError || new Error("Firestore is not initialized."));
     }
     const ticketsCollectionRef = db.collection('tickets');
     // FIX: Use v8 doc reference and update syntax.
     const ticketRef = ticketsCollectionRef.doc(firestoreDocId);
     await ticketRef.update({
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
     });
  },
};
