import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './config';
import sampleTournaments from './sampleTournaments';

/**
 * Adds sample tournament data to Firestore
 * Run this function once to populate the database with initial data
 */
export const initializeFirestore = async () => {
  try {
    const tournamentsRef = collection(db, 'tournaments');
    
    // Add each tournament document
    for (const tournament of sampleTournaments) {
      // Convert Date objects to Firestore Timestamps
      const tournamentData = {
        ...tournament,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };

      await addDoc(tournamentsRef, tournamentData);
    }

    console.log('Sample tournaments added successfully');
  } catch (error) {
    console.error('Error adding sample tournaments:', error);
    throw error;
  }
};

/*
To use this function, run the following in your browser console:
  import('./firebase/initializeFirestore.js')
    .then(module => module.initializeFirestore())
    .then(() => console.log('Database initialized'))
    .catch(console.error);
*/
