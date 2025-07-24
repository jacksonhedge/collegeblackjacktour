import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD7VNKg6Gqam8qHZiHUpzgleVYbk8Gc9qU",
  authDomain: "bankroll-2ccb4.firebaseapp.com",
  databaseURL: "https://bankroll-2ccb4-default-rtdb.firebaseio.com",
  projectId: "bankroll-2ccb4",
  storageBucket: "bankroll-2ccb4.firebasestorage.app",
  messagingSenderId: "443440711718",
  appId: "1:443440711718:web:dc3f58dfe81324edc3bee7",
  measurementId: "G-QZ2NEGJV6D"
};

let app = null;
let db = null;
let auth = null;
let analytics = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
} catch (error) {
  console.warn('Firebase initialization error:', error);
}

export { db, auth, analytics };
export default app;
