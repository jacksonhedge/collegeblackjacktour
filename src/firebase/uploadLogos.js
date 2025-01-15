import { adminStorage } from './admin.js';
import { COLLEGE_IMAGES } from './initializeColleges.js';
import * as fs from 'fs';
import * as path from 'path';

const uploadLogos = async () => {
  console.log('Starting logo upload...');
  const bucket = adminStorage.bucket();

  for (const imageName of COLLEGE_IMAGES) {
    try {
      const localPath = path.join(process.cwd(), 'public', 'college-logos', imageName);
      
      // Check if file exists locally
      if (!fs.existsSync(localPath)) {
        console.log(`File not found: ${localPath}`);
        continue;
      }

      // Upload to Firebase Storage
      await bucket.upload(localPath, {
        destination: `college-logos/${imageName}`,
        metadata: {
          contentType: 'image/png',
          cacheControl: 'public, max-age=31536000',
        },
      });

      console.log(`Successfully uploaded ${imageName}`);
    } catch (error) {
      console.error(`Error uploading ${imageName}:`, error);
    }
  }

  console.log('Logo upload complete');
};

uploadLogos().catch(console.error);
