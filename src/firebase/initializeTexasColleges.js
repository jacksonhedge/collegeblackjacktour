import { adminDb } from './admin.js';

const texasColleges = [
  {
    id: 'texas-longhorns',
    name: 'Texas Longhorns',
    fraternities: [
      {
        id: 'pi-kappa-alpha',
        name: 'Pi Kappa Alpha',
        letters: 'ΠΚΑ',
        active: true,
        joinDate: new Date()
      },
      {
        id: 'sigma-chi',
        name: 'Sigma Chi',
        letters: 'ΣΧ',
        active: true,
        joinDate: new Date()
      },
      {
        id: 'phi-gamma-delta',
        name: 'Phi Gamma Delta',
        letters: 'FIJI',
        active: true,
        joinDate: new Date()
      }
    ]
  }
];

const initializeTexasColleges = async () => {
  try {
    for (const college of texasColleges) {
      console.log(`Initializing ${college.name}...`);
      
      // Add or update college document
      await adminDb.collection('colleges').doc(college.id).set({
        name: college.name,
        logoUrl: `https://storage.googleapis.com/collegeblackjacktour.appspot.com/college-logos/${college.name.replace(/\s+/g, '-')}-logo.png`
      });
      
      // Add fraternities as subcollection
      const fraternitiesRef = adminDb.collection('colleges').doc(college.id).collection('fraternities');
      for (const fraternity of college.fraternities) {
        await fraternitiesRef.doc(fraternity.id).set({
          ...fraternity,
          updatedAt: new Date()
        });
      }
      
      console.log(`Successfully initialized ${college.name} with ${college.fraternities.length} fraternities`);
    }
    
    console.log('Texas colleges initialization complete');
  } catch (error) {
    console.error('Error initializing Texas colleges:', error);
  }
};

initializeTexasColleges();

export { initializeTexasColleges };
