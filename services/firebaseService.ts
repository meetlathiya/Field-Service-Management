import { 
    getDoc, 
    doc, 
    collection, 
    query, 
    orderBy, 
    onSnapshot,
    runTransaction,
    Timestamp,
    updateDoc
} from 'firebase/firestore';
import { 
    ref, 
    uploadString, 
    uploadBytesResumable, 
    getDownloadURL 
} from 'firebase/storage';
import { User } from 'firebase/auth';
import { db, storage, initError } from './firebaseConfig';
import { Ticket, TicketUpdatePayload, TicketStatus, UserProfile } from '../types';

export { initError };

/**
 * A utility function that retries an async operation with exponential backoff.
 * @param operation The async function to be executed.
 * @param maxRetries The maximum number of retries.
 * @param initialDelay The initial delay in milliseconds.
 * @returns A promise that resolves with the result of the operation.
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      // List of retryable error codes from Firebase Storage
      const isRetryable = 
        error.code === 'storage/retry-limit-exceeded' || 
        error.code === 'storage/unknown' ||
        error.code === 'storage/server-file-wrong-size' ||
        error.code === 'storage/object-not-found'; // Can be transient if object is being created

      if (!isRetryable || attempt === maxRetries - 1) {
        console.error(`Operation failed after ${attempt + 1} attempts.`, error);
        throw error; // Rethrow the final error
      }
      
      const delay = initialDelay * Math.pow(2, attempt);
      console.warn(`Attempt ${attempt + 1} failed with code: ${error.code}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  // This line should be unreachable if logic is correct, but satisfies TypeScript
  throw new Error('Retry logic failed unexpectedly.');
};


const fromFirestore = (ticketData: any): Ticket => {
    const { createdAt, updatedAt, scheduledDate, ...rest } = ticketData;
    return {
        ...rest,
        createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : new Date(createdAt),
        updatedAt: updatedAt instanceof Timestamp ? updatedAt.toDate() : new Date(updatedAt),
        scheduledDate: scheduledDate ? (scheduledDate instanceof Timestamp ? scheduledDate.toDate() : new Date(scheduledDate)) : null,
    } as Ticket;
};

export const firebaseService = {
  getUserProfile: async (user: User): Promise<UserProfile | null> => {
    if (!db) {
      return Promise.reject(initError || new Error("Firestore is not initialized."));
    }
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        return {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName!,
            // FIX: Pass the user's photoURL to the userProfile object.
            photoURL: user.photoURL,
            role: data.role,
            technicianId: data.technicianId,
        }
    }
    return null;
  },

  uploadImage: (
    imageData: Blob | string,
    folder: 'ticket-photos' | 'signatures',
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    if (!storage) {
        return Promise.reject(initError || new Error("Firebase Storage is not initialized."));
    }
    
    let extension = 'png';
    if (imageData instanceof Blob && imageData.type === 'image/jpeg') {
        extension = 'jpg';
    }

    const fileName = `${folder}/${new Date().getTime()}-${Math.random().toString(36).substring(2)}.${extension}`;
    const storageRef = ref(storage, fileName);

    if (typeof imageData === 'string') {
        return uploadString(storageRef, imageData, 'data_url').then(snapshot => {
            return getDownloadURL(snapshot.ref);
        });
    } else {
        const metadata = { contentType: imageData.type };
        return new Promise((resolve, reject) => {
            const uploadTask = uploadBytesResumable(storageRef, imageData, metadata);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
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
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    } catch (error) {
                        reject(error);
                    }
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
        return () => {};
    }
    const ticketsCollectionRef = collection(db, 'tickets');
    const q = query(ticketsCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
    
    const counterRef = doc(db, 'counters', idPrefix);

    try {
      const newTicketRef = await runTransaction(db, async (transaction) => {
          const counterDoc = await transaction.get(counterRef);
          const newCount = (counterDoc.exists() ? (counterDoc.data()?.count || 0) : 0) + 1;
          const finalId = `${idPrefix}-${String(newCount).padStart(3, '0')}`;
          
          const newTicketPayload = {
              ...newTicketData,
              id: finalId,
              createdAt: Timestamp.fromDate(now),
              updatedAt: Timestamp.fromDate(now),
              status: TicketStatus.New
          };
          
          const newDocRef = doc(collection(db, 'tickets'));
          transaction.set(newDocRef, newTicketPayload);
          transaction.set(counterRef, { count: newCount });

          return newDocRef;
      });

      return newTicketRef.id;

    } catch (e) {
        console.error("Transaction failed: ", e);
        throw new Error("Failed to create ticket.");
    }
  },

  updateTicket: async (firestoreDocId: string, updates: TicketUpdatePayload): Promise<void> => {
     if (!db) {
        return Promise.reject(initError || new Error("Firestore is not initialized."));
     }
     const ticketRef = doc(db, 'tickets', firestoreDocId);
     await updateDoc(ticketRef, {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
     });
  },
};
