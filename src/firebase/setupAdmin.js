const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyASqfvAYLwOKdVXzSUkstJ51FMz3u6EtH0",
  authDomain: "collegeblackjacktour.firebaseapp.com",
  projectId: "collegeblackjacktour",
  storageBucket: "collegeblackjacktour.firebasestorage.app",
  messagingSenderId: "512136585011",
  appId: "1:512136585011:web:19779ff336906f253ce846",
  measurementId: "G-R6CRVZQ904"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const ADMIN_EMAIL = 'admin@collegeblackjacktour.com';
const ADMIN_PASSWORD = 'hedgepayments';

const setupAdmin = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('Admin user created successfully:', userCredential.user.uid);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists');
    } else {
      console.error('Error creating admin user:', error);
    }
  }
};

setupAdmin();
