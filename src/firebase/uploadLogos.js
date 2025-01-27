import { ref, uploadBytes } from 'firebase/storage';
import { storage } from './admin-config.js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Uploads all college logos to Firebase Storage in a flat, alphabetical structure
 */
async function uploadLogos() {
  const baseDir = join(dirname(__dirname), '..', 'public', 'college-logos');
  const logoFiles = [];
  
  // Function to collect all logo files
  function collectLogoFiles(dirPath) {
    const entries = readdirSync(dirPath);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Process subdirectory
        collectLogoFiles(fullPath);
      } else if (stats.isFile() && (entry.endsWith('.png') || entry.endsWith('.svg'))) {
        // Store file info
        logoFiles.push({
          path: fullPath,
          name: entry,
          isDefault: entry === 'default-college-logo.svg'
        });
      }
    }
  }
  
  try {
    // Collect all logo files
    collectLogoFiles(baseDir);
    
    // Sort files alphabetically, but put default logo first if it exists
    logoFiles.sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return a.name.localeCompare(b.name);
    });
    
    // Upload files
    for (const file of logoFiles) {
      const fileContent = readFileSync(file.path);
      // Store in root of college-logos without conference subdirectories
      const storagePath = `college-logos/${file.name}`;
      const imageRef = ref(storage, storagePath);
      
      try {
        await uploadBytes(imageRef, fileContent, {
          contentType: file.name.endsWith('.png') ? 'image/png' : 'image/svg+xml'
        });
        console.log(`Successfully uploaded: ${storagePath}`);
      } catch (error) {
        console.error(`Error uploading ${storagePath}:`, error);
      }
    }
    
    console.log('Upload complete!');
  } catch (error) {
    console.error('Error during upload:', error);
  }
}

// Run the upload
uploadLogos();
