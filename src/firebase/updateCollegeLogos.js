import { adminStorage } from './admin.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const uploadLogo = async (filepath, filename) => {
  try {
    const fileBuffer = readFileSync(filepath);
    const file = adminStorage.bucket().file(`college-logos/${filename}`);
    await file.save(fileBuffer, {
      metadata: {
        contentType: 'image/png'
      }
    });
    console.log(`Successfully uploaded ${filename}`);
  } catch (error) {
    console.error(`Error uploading ${filename}:`, error);
    throw error;
  }
};

const updateLogos = async () => {
  try {
    // Upload Abilene Christian logo
    await uploadLogo(
      join(process.cwd(), 'Abilene-Christian-Wildcats-logo.png'),
      'Abilene-Christian-Wildcats-logo.png'
    );

    // Upload Air Force logo
    await uploadLogo(
      join(process.cwd(), 'Air_Force_Falcons_logo.png'),
      'Air_Force_Falcons_logo.png'
    );

    // Run database initialization to update Firestore
    const { initDatabase } = await import('./initDatabase.js');
    await initDatabase();
    
    console.log('Successfully updated college logos and database');
  } catch (error) {
    console.error('Error updating college logos:', error);
  }
};

updateLogos();
