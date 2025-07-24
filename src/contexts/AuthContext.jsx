import React, { createContext, useState, useContext, useEffect, useCallback, memo } from 'react';
import { auth, db } from '../services/firebase/config';
import StorageService from '../services/firebase/StorageService';
import { bonusWalletService } from '../services/BonusWalletService';
import { walletService, PLATFORMS } from '../services/WalletService';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  fetchSignInMethodsForEmail,
  deleteUser
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
const DEFAULT_PROFILE_IMAGE = '/images/profile_1.jpeg';

// List of admin emails
const ADMIN_EMAILS = [
  'admin@bankroll.com',
  'jackson@bankroll.com',
  'jackson@hedgepay.co'
];

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = memo(({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [signupData, setSignupData] = useState(null);

  const isAdmin = useCallback((user) => {
    return user && ADMIN_EMAILS.includes(user.email);
  }, []);

  const updateUserData = useCallback(async (userId, data) => {
    if (!db) {
      console.warn('Firestore is not initialized (development mode)');
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        ...data,
        lastUpdated: serverTimestamp()
      });

      const updatedDoc = await getDoc(userRef);
      const updatedData = updatedDoc.data();

      setCurrentUser(prev => ({
        ...prev,
        ...updatedData
      }));

      return updatedData;
    } catch (error) {
      console.error("Error in updateUserData:", error);
      throw error;
    }
  }, []);

  const updateProfileImage = useCallback(async (userId, imageFile) => {
    if (!db) {
      console.warn('Firestore is not initialized (development mode)');
      return;
    }

    try {
      console.log('Starting profile image update for user:', userId);

      let imageUrl;
      if (imageFile instanceof File) {
        console.log('Uploading new image file to Storage');
        imageUrl = await StorageService.uploadProfileImage(imageFile, userId);
        console.log('Image uploaded successfully, URL:', imageUrl);
      } else {
        console.log('Using provided image URL');
        imageUrl = imageFile;
      }

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        profileImage: imageUrl,
        lastUpdated: serverTimestamp()
      });
      console.log('Firestore document updated with new image URL');

      const updatedDoc = await getDoc(userRef);
      const updatedData = updatedDoc.data();

      setCurrentUser(prev => ({
        ...prev,
        ...updatedData,
        profileImage: imageUrl
      }));
      console.log('Local state updated with new user data');

      return imageUrl;
    } catch (error) {
      console.error("Error in updateProfileImage:", error);
      throw error;
    }
  }, []);

  const validateSignupStep1 = useCallback(async (email, password) => {
    if (!auth) {
      console.warn('Auth is not initialized (development mode)');
      return;
    }

    try {
      // Check if email is already in use using Firebase Auth
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        throw new Error('Email is already in use');
      }

      // Store credentials for step 2
      setSignupData({ email, password });
      setIsNewUser(true);
      return true;
    } catch (error) {
      console.error('Signup validation error:', error);
      throw error;
    }
  }, []);

  const completeSignup = useCallback(async (userData) => {
    if (!db || !signupData) {
      console.warn('Firestore is not initialized or no signup data');
      return;
    }

    let tempUser = null;

    try {
      const requiredFields = ['firstName', 'lastName', 'username', 'phoneNumber'];
      for (const field of requiredFields) {
        if (!userData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      if (!userData.username.startsWith('#')) {
        throw new Error('Username must start with #');
      }

      // Create Firebase Auth user first
      const userCredential = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      tempUser = userCredential.user;

      // Now that we're authenticated, check username availability
      const usernameQuery = query(collection(db, "users"), where("username", "==", userData.username));
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        // Username is taken, delete the auth user and throw error
        await deleteUser(tempUser);
        throw new Error('Username is already taken');
      }

      const formattedSleeperUsername = userData.sleeperUsername ? 
        (userData.sleeperUsername.startsWith('@') ? userData.sleeperUsername : `@${userData.sleeperUsername}`) : 
        null;

      const formattedVenmoUsername = userData.venmoUsername ? 
        (userData.venmoUsername.startsWith('@') ? userData.venmoUsername : `@${userData.venmoUsername}`) : 
        null;

      const userDoc = {
        id: tempUser.uid,
        email: signupData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        phoneNumbers: [{
          number: userData.phoneNumber,
          verified: false,
          primary: true,
          dateAdded: new Date().toISOString() // Use ISO string instead of serverTimestamp
        }],
        identifiers: {
          username: userData.username,
          sleeperUsername: formattedSleeperUsername,
          venmoUsername: formattedVenmoUsername
        },
        profileImage: DEFAULT_PROFILE_IMAGE,
        notificationPreferences: {
          inApp: true,
          email: userData.notificationPreferences?.email ?? true,
          pushToken: null
        },
        notifications: [],
        dwollaCustomerId: '',
        dwollaBalance: 0,
        bonusBalance: 25, // Initial bonus balance to distribute
        lastUpdated: serverTimestamp(),
        lastBalanceUpdate: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      console.log('Creating Firestore document for user:', userDoc);
      await setDoc(doc(db, "users", tempUser.uid), userDoc);
      console.log('Firestore document created successfully');

      // Initialize the user's wallet structure
      await walletService.initializeUserWallet(tempUser.uid);

      // Add $5 bonus to each platform
      for (const platformId of Object.keys(PLATFORMS)) {
        try {
          await bonusWalletService.transferBonusToSubWallet(tempUser.uid, platformId, 5);
        } catch (error) {
          console.error(`Error adding bonus for platform ${platformId}:`, error);
          // Continue with other platforms even if one fails
        }
      }
      
      setIsNewUser(false);
      setSignupData(null);
      setCurrentUser({ ...tempUser, ...userDoc });

      return userDoc;
    } catch (error) {
      // If something fails and we created a temporary user, clean it up
      if (tempUser) {
        try {
          await deleteUser(tempUser);
        } catch (cleanupError) {
          console.error('Error cleaning up temporary user:', cleanupError);
        }
      }
      console.error('Signup completion error:', error);
      throw error;
    }
  }, [signupData]);

  const login = useCallback(async (emailOrUsername, password) => {
    if (!auth || !db) {
      console.warn('Auth/Firestore is not initialized (development mode)');
      return null;
    }

    try {
      await setPersistence(auth, browserLocalPersistence);
      console.log('Auth persistence set to LOCAL');

      let email = emailOrUsername;
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(emailOrUsername);

      if (!isEmail) {
        console.log('Looking up user by username:', emailOrUsername);
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", emailOrUsername));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error("No user found with this username");
        }

        email = querySnapshot.docs[0].data().email;
        console.log('Found email for username:', email);
      }

      console.log('Attempting to sign in with email:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful, user ID:', result.user.uid);

      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('Fetched user data from Firestore:', userData);
        setCurrentUser({ ...result.user, ...userData });
      } else {
        console.warn('No Firestore document found for user:', result.user.uid);
        setCurrentUser(result.user);
      }

      return result.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    if (!auth) {
      console.warn('Auth is not initialized (development mode)');
      return;
    }

    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsNewUser(false);
      setSignupData(null);
      StorageService.clearCache();
      console.log('User signed out successfully');
    } catch (error) {
      console.error("Error in logout:", error);
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
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
  }, []);

  useEffect(() => {
    if (!auth) {
      console.warn('Auth is not initialized (development mode)');
      setLoading(false);
      return;
    }

    console.log('Setting up auth state change listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed. User:', user ? user.uid : 'null');
      
      if (user && db && !isNewUser) {
        try {
          console.log('Fetching additional user data from Firestore');
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data fetched successfully:', userData);
            setCurrentUser({ 
              ...user, 
              ...userData,
              profileImage: userData.profileImage || DEFAULT_PROFILE_IMAGE,
              isAdmin: isAdmin(user)
            });
          } else {
            console.warn('No Firestore document found for user:', user.uid);
            setCurrentUser({
              ...user,
              profileImage: DEFAULT_PROFILE_IMAGE,
              isAdmin: isAdmin(user)
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser({
            ...user,
            profileImage: DEFAULT_PROFILE_IMAGE,
            isAdmin: isAdmin(user)
          });
        }
      } else if (!isNewUser) {
        console.log('No user logged in or new user in signup process');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isNewUser, isAdmin]);

  const value = {
    currentUser,
    validateSignupStep1,
    completeSignup,
    login,
    logout,
    resetPassword,
    updateProfileImage,
    updateUserData,
    loading,
    isNewUser,
    isAdmin: currentUser ? isAdmin(currentUser) : false
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
});

AuthProvider.displayName = 'AuthProvider';

export default AuthContext;
