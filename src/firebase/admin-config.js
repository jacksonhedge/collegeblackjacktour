import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyASqfvAYLwOKdVXzSUkstJ51FMz3u6EtH0",
  authDomain: "collegeblackjacktour.firebaseapp.com",
  projectId: "collegeblackjacktour",
  storageBucket: "collegeblackjacktour.firebasestorage.app",
  messagingSenderId: "512136585011",
  appId: "1:512136585011:web:19779ff336906f253ce846",
  measurementId: "G-R6CRVZQ904"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
