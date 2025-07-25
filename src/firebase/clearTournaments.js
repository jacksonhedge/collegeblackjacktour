// Script to clear fake tournaments from Firebase
// Run this once to clean up the database, then delete this file

import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './config.js';

const fakeTournamentTitles = [
  "Texas Hold'em Championship",
  "Blackjack Tournament", 
  "Poker Night",
  "Spring Poker Championship",
  "March Madness Casino Night",
  "Spring Break Poker Series",
  "April Poker Classic",
  "Spring Finals Casino Night"
];

const clearFakeTournaments = async () => {
  try {
    const tournamentsRef = collection(db, 'tournaments');
    const snapshot = await getDocs(tournamentsRef);
    
    let deletedCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      // Check if this is one of the fake tournaments
      if (fakeTournamentTitles.includes(data.title)) {
        await deleteDoc(doc(db, 'tournaments', docSnapshot.id));
        console.log(`Deleted fake tournament: ${data.title}`);
        deletedCount++;
      }
    }
    
    console.log(`\nDeleted ${deletedCount} fake tournaments.`);
    console.log('Database cleaned successfully!');
    
  } catch (error) {
    console.error('Error clearing tournaments:', error);
  }
};

// Run the cleanup
clearFakeTournaments();