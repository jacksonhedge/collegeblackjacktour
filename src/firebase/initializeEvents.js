import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const sampleEvents = [
  {
    title: "UC San Diego Dye Tournament Spring 2025",
    date: new Date('2025-06-01'),
    time: "1:00 PM",
    location: "Sigma Nu",
    backgroundImage: "/tournament-images/default.jpg",
    status: "upcoming",
    maxParticipants: 100,
    currentParticipants: 0,
    entryFee: 25,
    prizePool: 2500,
    collegeId: "ucsd"
  },
  {
    title: "Oregon State Dye Tournament Spring 2025",
    date: new Date('2025-05-31'),
    time: "1:00 PM",
    location: "RAVE",
    backgroundImage: "/tournament-images/default.jpg",
    status: "upcoming",
    maxParticipants: 120,
    currentParticipants: 0,
    entryFee: 30,
    prizePool: 3000,
    collegeId: "oregon-state"
  },
  {
    title: "2025 Wonderfront Festival Dye Tournament Day 3",
    date: new Date('2025-05-18'),
    time: "2:00 PM",
    location: "Wonderfront Festival",
    backgroundImage: "/tournament-images/default.jpg",
    status: "upcoming",
    maxParticipants: 200,
    currentParticipants: 0,
    entryFee: 50,
    prizePool: 5000,
    collegeId: "wonderfront"
  },
  {
    title: "2025 Wonderfront Festival Dye Tournament Day 2",
    date: new Date('2025-05-17'),
    time: "2:00 PM",
    location: "Wonderfront Festival",
    backgroundImage: "/tournament-images/default.jpg",
    status: "upcoming",
    maxParticipants: 200,
    currentParticipants: 0,
    entryFee: 50,
    prizePool: 5000,
    collegeId: "wonderfront"
  },
  {
    title: "2025 Wonderfront Festival Dye Tournament Day 1",
    date: new Date('2025-05-16'),
    time: "2:00 PM",
    location: "Wonderfront Festival",
    backgroundImage: "/tournament-images/default.jpg",
    status: "upcoming",
    maxParticipants: 200,
    currentParticipants: 0,
    entryFee: 50,
    prizePool: 5000,
    collegeId: "wonderfront"
  },
  {
    title: "Cal Poly SLO Dye Tournament Spring 2025",
    date: new Date('2025-05-10'),
    time: "11:00 AM",
    location: "Alpha Sig",
    backgroundImage: "/tournament-images/default.jpg",
    status: "upcoming",
    maxParticipants: 80,
    currentParticipants: 0,
    entryFee: 20,
    prizePool: 1600,
    collegeId: "cal-poly-slo"
  },
  // Some completed events
  {
    title: "UCLA Spring Tournament 2024",
    date: new Date('2024-05-15'),
    time: "12:00 PM",
    location: "Delta Tau Delta",
    backgroundImage: "/tournament-images/default.jpg",
    status: "completed",
    maxParticipants: 100,
    currentParticipants: 98,
    entryFee: 25,
    prizePool: 2500,
    collegeId: "ucla",
    winner: "John Smith",
    runnerUp: "Jane Doe"
  },
  {
    title: "USC Championship 2024",
    date: new Date('2024-04-20'),
    time: "2:00 PM",
    location: "SAE House",
    backgroundImage: "/tournament-images/default.jpg",
    status: "completed",
    maxParticipants: 150,
    currentParticipants: 145,
    entryFee: 30,
    prizePool: 4000,
    collegeId: "usc",
    winner: "Mike Johnson",
    runnerUp: "Sarah Williams"
  }
];

export const initializeEvents = async () => {
  try {
    console.log('Initializing events...');
    
    for (const event of sampleEvents) {
      await addDoc(collection(db, 'events'), {
        ...event,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Added event: ${event.title}`);
    }
    
    console.log('Events initialized successfully!');
  } catch (error) {
    console.error('Error initializing events:', error);
  }
};

// To run this, uncomment the line below and run the file once
// initializeEvents();
