import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app, db } from './config.js';

const fraternities = [
  {
    name: "Sigma Pi",
    letters: "ΣΠ",
    active: true
  },
  {
    name: "Sigma Chi",
    letters: "ΣΧ",
    active: true
  },
  {
    name: "Sig Ep",
    letters: "ΣΦΕ",
    active: true
  }
];

async function addFraternities() {
  const collegeId = 'william-and-mary-tribe';

  try {
    for (const fraternity of fraternities) {
      const fraternityRef = collection(db, 'colleges', collegeId, 'fraternities');
      
      const docRef = await addDoc(fraternityRef, {
        ...fraternity,
        joinDate: new Date(),
        createdAt: new Date()
      });
      
      console.log(`Added fraternity ${fraternity.name} with ID: ${docRef.id}`);
    }
    
    console.log('All fraternities added successfully');
  } catch (error) {
    console.error('Error adding fraternities:', error);
  }
}

// Execute the function
addFraternities();
