import { db } from './config.js';
import { collection, getDocs } from 'firebase/firestore';

import { collegeNames } from './collegeNames.js';

// Helper function to normalize college name for Firestore ID (same as in CollegeList.jsx)
const normalizeCollegeName = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Get all college IDs from collegeNames
const colleges = collegeNames.map(name => normalizeCollegeName(name));

async function getFraternityData() {
  const fraternityData = {};

  try {
    for (const college of colleges) {
      const fraternityCollectionRef = collection(db, 'colleges', college, 'fraternities');
      const fraternitySnapshot = await getDocs(fraternityCollectionRef);
      
      fraternityData[college] = [];
      
      fraternitySnapshot.forEach((doc) => {
        fraternityData[college].push({
          id: doc.id,
          ...doc.data()
        });
      });
    }

    // Output the data
    console.log(JSON.stringify(fraternityData, null, 2));
    return fraternityData;
  } catch (error) {
    console.error('Error fetching fraternity data:', error);
    throw error;
  }
}

// Execute the function
getFraternityData();

export { getFraternityData };
