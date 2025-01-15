import { ref, uploadBytes } from 'firebase/storage';
import { storage } from './config.js';

/**
 * Helper function to upload a college logo to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} filename - The filename to use in storage
 * @returns {Promise<void>}
 */
export const uploadCollegeLogo = async (file, filename) => {
  try {
    const imageRef = ref(storage, `college-logos/${filename}`);
    await uploadBytes(imageRef, file);
    console.log(`Successfully uploaded ${filename}`);
  } catch (error) {
    console.error(`Error uploading ${filename}:`, error);
  }
};

/**
 * Example usage:
 * 
 * import { uploadCollegeLogo } from './uploadCollegeLogos';
 * 
 * // Create a File object from an image
 * const file = new File([''], 'default-college.png', { type: 'image/png' });
 * 
 * // Upload the file
 * await uploadCollegeLogo(file, 'default-college.png');
 */
