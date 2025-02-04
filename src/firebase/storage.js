import { ref, uploadString, getDownloadURL, getStorage } from 'firebase/storage';
import { app } from './config';

const storage = getStorage(app);

// Helper function to convert File to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

/**
 * Uploads a college logo to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} collegeName - The name of the college
 * @param {string} conference - The conference abbreviation
 * @returns {Promise<string>} The download URL of the uploaded image
 */
export const uploadCollegeLogo = async (file, collegeName, conference = 'Unknown') => {
  try {
    console.log('Starting upload for:', { collegeName, conference, fileName: file.name });
    
    // Clean up the filename and path
    const cleanName = collegeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const extension = file.name.split('.').pop().toLowerCase();
    const filename = `${cleanName}-logo.${extension}`;
    console.log('Generated filename:', filename);
    
    const cleanConference = conference.replace(/[^a-zA-Z0-9-]+/g, '-');
    const path = `college-logos/${cleanConference}/${filename}`;
    console.log('Storage path:', path);

    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    // Create a storage reference
    const storageRef = ref(storage, path);

    // Upload base64 data
    const snapshot = await uploadString(storageRef, base64Data, 'base64', {
      contentType: file.type
    });
    console.log('File uploaded successfully');

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Got download URL:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading college logo:', error);
    console.error('Error details:', {
      message: error.message
    });
    throw error;
  }
};

/**
 * Uploads a tournament image to Firebase Storage
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The download URL of the uploaded image
 */
export const uploadTournamentImage = async (file) => {
  try {
    const filename = `${Date.now()}-${file.name}`;
    const path = `tournament-images/${filename}`;

    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    // Create a storage reference
    const storageRef = ref(storage, path);

    // Upload base64 data
    const snapshot = await uploadString(storageRef, base64Data, 'base64', {
      contentType: file.type
    });
    console.log('Tournament image uploaded successfully');

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading tournament image:', error);
    throw error;
  }
};

/**
 * Gets the download URL for a tournament image
 * @param {string} imagePath - The path to the image in storage
 * @returns {Promise<string>} The download URL of the image
 */
export const getTournamentImageURL = async (imagePath) => {
  try {
    const storageRef = ref(storage, `tournament-images/${imagePath}`);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error(`Error getting tournament image URL for ${imagePath}:`, error);
    // Get default image URL
    const defaultRef = ref(storage, 'tournament-images/default.jpg');
    return await getDownloadURL(defaultRef);
  }
};
