import { adminDb } from './admin.js';

// Import college names
import { collegeNames } from './collegeNames.js';

// Helper function to normalize college name (same as in CollegeList.jsx)
const normalizeCollegeName = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// List of schools to add Pi Kappa Alpha to
const targetSchools = [
  "Florida Gulf Coast Eagles",
  "Florida Gators",
  "Stetson Hatters",
  "South Florida Bulls",
  "James Madison Dukes",
  "George Mason Patriots",
  "Old Dominion Monarchs",
  "Northern Arizona Lumberjacks",
  "Arizona State Sun Devils",
  "East Carolina Pirates",
  "South Carolina Gamecocks",
  "Clemson Tigers",
  "College of Charleston Cougars"
];

// Get normalized IDs for the schools
const schools = targetSchools
  .filter(school => collegeNames.includes(school))
  .map(school => normalizeCollegeName(school));

const addFraternity = async () => {
  try {
    for (const schoolId of schools) {
      await adminDb
        .collection('colleges')
        .doc(schoolId)
        .collection('fraternities')
        .doc('pi-kappa-alpha')
        .set({
          name: "Pi Kappa Alpha",
          letters: "ΠΚΑ",
          active: true,
          joinDate: new Date()
        });
      console.log(`Successfully added Pi Kappa Alpha to ${schoolId}`);
    }
    console.log('Completed adding Pi Kappa Alpha to all schools');
  } catch (error) {
    console.error('Error adding fraternity:', error);
  }
};

addFraternity();
