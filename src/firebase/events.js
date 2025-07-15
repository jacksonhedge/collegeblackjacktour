import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from './config';

const EVENTS_COLLECTION = 'events';
const TOURNAMENT_REQUESTS_COLLECTION = 'tournamentRequests';

// Create a new event
export const createEvent = async (eventData) => {
  try {
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Get all events
export const getAllEvents = async () => {
  try {
    const q = query(collection(db, EVENTS_COLLECTION), orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get events by status
export const getEventsByStatus = async (status) => {
  try {
    // If no status provided, get all events
    if (!status) {
      return getAllEvents();
    }
    
    const q = query(
      collection(db, EVENTS_COLLECTION), 
      where('status', '==', status),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching events by status:', error);
    // Fallback to fetching all events and filtering in memory
    try {
      const allEvents = await getAllEvents();
      return allEvents.filter(event => event.status === status);
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      return [];
    }
  }
};

// Update an event
export const updateEvent = async (eventId, updateData) => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  try {
    await deleteDoc(doc(db, EVENTS_COLLECTION, eventId));
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Submit a tournament request
export const submitTournamentRequest = async (requestData) => {
  try {
    const docRef = await addDoc(collection(db, TOURNAMENT_REQUESTS_COLLECTION), {
      ...requestData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error submitting tournament request:', error);
    throw error;
  }
};

// Get tournament requests (for admin)
export const getTournamentRequests = async () => {
  try {
    const q = query(
      collection(db, TOURNAMENT_REQUESTS_COLLECTION), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching tournament requests:', error);
    throw error;
  }
};