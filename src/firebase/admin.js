import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let app;
try {
  // Initialize admin SDK if not already initialized
  const apps = admin.apps;
  if (!apps.length) {
    const serviceAccount = require('../../serviceAccountKey.json');
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'collegeblackjacktour.appspot.com'
    });
  } else {
    app = apps[0];
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  throw error;
}

export const adminDb = app.firestore();
export const adminStorage = app.storage();
