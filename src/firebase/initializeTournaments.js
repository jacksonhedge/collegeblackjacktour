import { db } from './config.js';
import { addSampleTournaments } from './sampleTournaments.js';

const initializeTournaments = async () => {
  console.log('Starting tournaments initialization...');
  try {
    await addSampleTournaments();
    console.log('Tournaments initialization completed successfully');
  } catch (error) {
    console.error('Error initializing tournaments:', error);
  }
  process.exit(0);
};

initializeTournaments();
