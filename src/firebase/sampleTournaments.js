import { collection, addDoc } from 'firebase/firestore';
import { db } from './config.js';

const sampleTournaments = [
  {
    title: "Texas Hold'em Championship",
    college: "University of Texas",
    fraternity: "Sigma Chi",
    date: "2024-02-15",
    time: "7:00 PM",
    type: "Texas Hold'em",
    status: "scheduled",
    location: "UT Student Union"
  },
  {
    title: "Blackjack Tournament",
    college: "Texas A&M",
    fraternity: "Pi Kappa Alpha",
    date: "2024-02-20",
    time: "8:00 PM",
    type: "Blackjack",
    status: "upcoming",
    location: "TAMU Recreation Center"
  },
  {
    title: "Poker Night",
    college: "Texas Tech",
    fraternity: "Phi Delta Theta",
    date: "2024-02-25",
    time: "6:30 PM",
    type: "Mixed Poker Games",
    status: "scheduled",
    location: "TTU Student Center"
  },
  {
    title: "Spring Poker Championship",
    college: "University of Houston",
    fraternity: "Alpha Tau Omega",
    date: "2024-03-10",
    time: "7:30 PM",
    type: "Texas Hold'em",
    status: "scheduled",
    location: "UH Student Center"
  },
  {
    title: "March Madness Casino Night",
    college: "SMU",
    fraternity: "Kappa Sigma",
    date: "2024-03-15",
    time: "8:00 PM",
    type: "Mixed Casino Games",
    status: "scheduled",
    location: "SMU Hughes-Trigg Center"
  },
  {
    title: "Spring Break Poker Series",
    college: "Baylor University",
    fraternity: "Sigma Alpha Epsilon",
    date: "2024-03-20",
    time: "6:00 PM",
    type: "Texas Hold'em",
    status: "scheduled",
    location: "Baylor SUB"
  },
  {
    title: "April Poker Classic",
    college: "TCU",
    fraternity: "Beta Theta Pi",
    date: "2024-04-05",
    time: "7:00 PM",
    type: "Texas Hold'em",
    status: "scheduled",
    location: "TCU Brown-Lupton Center"
  },
  {
    title: "Spring Finals Casino Night",
    college: "Rice University",
    fraternity: "Delta Tau Delta",
    date: "2024-04-25",
    time: "8:30 PM",
    type: "Mixed Casino Games",
    status: "scheduled",
    location: "Rice Memorial Center"
  }
];

export const addSampleTournaments = async () => {
  try {
    const tournamentsRef = collection(db, 'tournaments');
    
    for (const tournament of sampleTournaments) {
      await addDoc(tournamentsRef, tournament);
    }
    
    console.log('Sample tournaments added successfully');
  } catch (error) {
    console.error('Error adding sample tournaments:', error);
  }
};
