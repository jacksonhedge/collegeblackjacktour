// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../services/firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  query,
  collection,
  where,
  getDocs,
  serverTimestamp, 
  Timestamp,
  updateDoc
} from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to update user's profile image
  async function updateProfileImage(userId, profileImage) {
    if (!db) {
      console.warn('Firestore is not initialized (development mode)');
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        profileImage: profileImage,
        lastUpdated: serverTimestamp()
      });

      // Update local state
      setCurrentUser(prev => ({
        ...prev,
        profileImage: profileImage
      }));
    } catch (error) {
      console.error("Error updating profile image:", error);
      throw error;
    }
  }

  // Sign up function with enhanced user data handling
  async function signup(email, password, userData) {
    if (!auth) {
      console.warn('Auth is not initialized (development mode)');
      return null;
    }

    try {
      console.log('Starting signup process for:', email);
      
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User authentication created:', user.uid);

      if (!db) {
        console.warn('Firestore is not initialized (development mode)');
        return user;
      }

      // Convert birthday string to timestamp
      const birthdayDate = new Date(userData.birthday);
      const birthdayTimestamp = Timestamp.fromDate(birthdayDate);

      // Format usernames with @ prefix if needed
      const formattedSleeperUsername = userData.sleeperUsername?.startsWith('@') 
        ? userData.sleeperUsername 
        : `@${userData.sleeperUsername}`;

      const formattedVenmoUsername = userData.venmoUsername?.startsWith('@') 
        ? userData.venmoUsername 
        : `@${userData.venmoUsername}`;

      // Ensure username is provided
      if (!userData.username) {
        throw new Error('Username is required');
      }

      // Create the user document in Firestore
      const userDoc = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        username: userData.username,
        venmoUsername: formattedVenmoUsername,
        address1: userData.address1 || '',
        address2: userData.address2 || null,
        city: userData.city || '',
        state: userData.state || '',
        postalCode: userData.postalCode || '',
        birthday: birthdayTimestamp,
        phoneNumber: userData.phoneNumber,
        sleeperUsername: formattedSleeperUsername,
        promoCode: userData.promoCode || null,
        dwollaCustomerId: '',
        dwollaBalance: 0,
        bonusBalance: 0,
        id: user.uid,
        profileImage: null, // Will be set on first profile load
        lastUpdated: serverTimestamp(),
        lastBalanceUpdate: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      console.log('Creating Firestore document for user:', userDoc);
      await setDoc(doc(db, "users", user.uid), userDoc);
      console.log('Firestore document created successfully');

      return user;
    } catch (error) {
      console.error('Signup error:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Enhanced login function that handles both email and username
  async function login(emailOrUsername, password) {
    if (!auth || !db) {
      console.warn('Auth/Firestore is not initialized (development mode)');
      return null;
    }

    try {
      let email = emailOrUsername;
      
      // Check if input is an email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(emailOrUsername);

      // If not an email, look up the corresponding email by username
      if (!isEmail) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", emailOrUsername));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error("No user found with this username");
        }

        email = querySnapshot.docs[0].data().email;
      }

      // Proceed with Firebase email/password authentication
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Logout function
  async function logout() {
    if (!auth) {
      console.warn('Auth is not initialized (development mode)');
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error in logout:", error);
      throw error;
    }
  }

  // Password reset function
  async function resetPassword(email) {
    if (!auth) {
      console.warn('Auth is not initialized (development mode)');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error in password reset:", error);
      throw error;
    }
  }

  // Effect to handle auth state changes
  useEffect(() => {
    if (!auth) {
      console.warn('Auth is not initialized (development mode)');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && db) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setCurrentUser({ ...user, ...userDoc.data() });
          } else {
            setCurrentUser(user);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateProfileImage,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
