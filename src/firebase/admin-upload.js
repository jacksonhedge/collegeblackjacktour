import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../../serviceAccountKey.json'), 'utf8')
);

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'collegeblackjacktour.firebasestorage.app'
});

const bucket = getStorage(app).bucket();

/**
 * Recursively uploads all logos from the public/college-logos directory to Firebase Storage
 */
async function uploadLogos() {
  const baseDir = join(dirname(__dirname), '..', 'public', 'college-logos');
  
  // Function to recursively process directories
  async function processDirectory(dirPath, relativePath = '') {
    const entries = readdirSync(dirPath);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Process subdirectory
        await processDirectory(fullPath, join(relativePath, entry));
      } else if (stats.isFile() && (entry.endsWith('.png') || entry.endsWith('.svg'))) {
        // Upload file
        const storagePath = join('college-logos', relativePath, entry).replace(/\\/g, '/');
        
        try {
          await bucket.upload(fullPath, {
            destination: storagePath,
            metadata: {
              contentType: entry.endsWith('.png') ? 'image/png' : 'image/svg+xml'
            }
          });
          console.log(`Successfully uploaded: ${storagePath}`);
        } catch (error) {
          console.error(`Error uploading ${storagePath}:`, error);
        }
      }
    }
  }
  
  try {
    await processDirectory(baseDir);
    console.log('Upload complete!');
  } catch (error) {
    console.error('Error during upload:', error);
  }
}

// Run the upload
uploadLogos();
