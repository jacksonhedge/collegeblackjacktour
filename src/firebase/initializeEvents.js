import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from './config.js';

const db = getFirestore();

const sampleEvents = [
  {
    fraternityId: 'sample-fraternity-1',
    collegeId: 'william-and-mary-tribe',
    date: new Date('2024-02-15'),
    status: 'scheduled',
    type: 'tournament',
    title: 'Sample Tournament 1',
    description: 'First scheduled tournament',
    location: 'Campus Center',
    attendees: [],
    createdAt: new Date()
  },
  {
    fraternityId: 'sample-fraternity-2',
    collegeId: 'virginia-tech-hokies',
    date: new Date('2024-01-10'),
    status: 'completed',
    type: 'tournament',
    title: 'Sample Tournament 2',
    description: 'Completed tournament',
    location: 'Student Union',
    attendees: [],
    createdAt: new Date()
  }
];

async function initializeEvents() {
  try {
    const eventsRef = collection(db, 'events');

    for (const event of sampleEvents) {
      await addDoc(eventsRef, event);
      console.log(`Added event: ${event.title}`);
    }

    console.log('Events collection initialized successfully');
  } catch (error) {
    console.error('Error initializing events:', error);
  }
}

// Execute the initialization
initializeEvents();
