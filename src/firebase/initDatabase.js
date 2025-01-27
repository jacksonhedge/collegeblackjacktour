import { initializeColleges } from './initializeColleges.js';

const initDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    await initializeColleges();
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
};

// Run the initialization
initDatabase();
