import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getMessaging, Messaging } from 'firebase/messaging';

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

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore with type assertion
const db = getFirestore(app);

// Initialize other services
const auth = getAuth(app);
const storage = getStorage(app);
let analytics: Analytics | null = null;

// Initialize Analytics only in browser environment
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Add connection state listener for Firestore
try {
  const connectedRef = (db as any)._firestoreClient?.connectivityMonitor;
  if (connectedRef) {
    connectedRef.addCallback((isConnected: boolean) => {
      // console.log('Firestore connection state:', isConnected ? 'CONNECTED' : 'DISCONNECTED');
    });
  }
} catch (error) {
  console.error('Error setting up Firestore connection listener:', error);
}

// Add storage connection state logging
// console.log('Storage bucket:', storage.app.options.storageBucket);

// Export initialized services
// Initialize Messaging only in browser environment
let messaging: Messaging | null = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Error initializing messaging:', error);
  }
}

export { db, auth, analytics, storage, messaging };
export default app;

// Type assertions for better type safety
declare module 'firebase/firestore' {
  export function getFirestore(app: FirebaseApp): Firestore;
}

declare module 'firebase/auth' {
  export function getAuth(app: FirebaseApp): Auth;
}

declare module 'firebase/storage' {
  export function getStorage(app: FirebaseApp): FirebaseStorage;
}

declare module 'firebase/messaging' {
  export function getMessaging(app: FirebaseApp): Messaging;
}
