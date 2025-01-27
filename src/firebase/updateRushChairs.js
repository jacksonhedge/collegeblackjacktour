import { getFirestore, collection, doc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { app, db } from './config.js';

const rushChairData = [
  {
    firstName: "Sam",
    lastName: "Vido",
    phoneNumber: "443-640-5839",
    fraternity: "Sigma Pi",
    title: "Rush Chair"
  },
  {
    firstName: "Matt",
    lastName: "Hussey",
    phoneNumber: "703-582-0584",
    fraternity: "Sigma Chi",
    title: "Rush Chair"
  },
  {
    firstName: "Tommy",
    lastName: "Zavre",
    phoneNumber: "703-268-0637",
    fraternity: "Sig Ep",
    title: "Rush Chair"
  }
];

async function updateRushChairs() {
  const collegeId = 'william-and-mary-tribe'; // College ID in the format used in the database

  try {
    for (const rushChair of rushChairData) {
      // Get the fraternity collection for William & Mary
      const fraternityRef = collection(db, 'colleges', collegeId, 'fraternities');
      
      // Query to find the specific fraternity
      const q = query(fraternityRef, where("name", "==", rushChair.fraternity));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const fratDoc = querySnapshot.docs[0];
        
        // Update the fraternity document with rush chair information
        await updateDoc(fratDoc.ref, {
          rushChairName: `${rushChair.firstName} ${rushChair.lastName}`,
          rushChairNumber: rushChair.phoneNumber
        });
        
        console.log(`Updated ${rushChair.fraternity} with rush chair: ${rushChair.firstName} ${rushChair.lastName}`);
      } else {
        console.log(`Fraternity not found: ${rushChair.fraternity}`);
      }
    }
    
    console.log('Rush chair updates completed');
  } catch (error) {
    console.error('Error updating rush chairs:', error);
  }
}

// Execute the update
updateRushChairs();
