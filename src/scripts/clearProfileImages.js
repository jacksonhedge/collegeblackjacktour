import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase/config.js';

const clearAllProfileImages = async () => {
  try {
    console.log('Starting to clear profile images...');
    
    // Get all users
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    let updatedCount = 0;
    let totalCount = 0;
    
    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      totalCount++;
      const userData = userDoc.data();
      
      // Check if user has a profile image
      if (userData.profileImage || userData.photoURL) {
        console.log(`Clearing profile image for user: ${userDoc.id}`);
        
        // Update the user document to remove profile images
        await updateDoc(doc(db, 'users', userDoc.id), {
          profileImage: null,
          photoURL: null
        });
        
        updatedCount++;
      }
    }
    
    console.log(`\nCompleted!`);
    console.log(`Total users processed: ${totalCount}`);
    console.log(`Profile images cleared: ${updatedCount}`);
    
  } catch (error) {
    console.error('Error clearing profile images:', error);
  }
};

// Run the script
console.log('Firebase Profile Image Cleaner');
console.log('==============================');
console.log('This will clear all profile images from user profiles.');
console.log('Users will automatically get default profile images.\n');

// Add a 3 second delay to allow cancellation
console.log('Starting in 3 seconds... (Press Ctrl+C to cancel)');
setTimeout(() => {
  clearAllProfileImages();
}, 3000);