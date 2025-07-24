import { signInWithCustomToken, signInAnonymously, updateProfile } from 'firebase/auth';
import { auth } from './config';
import { supabase } from '../supabase/config';

class FirebaseAuthBridge {
  constructor() {
    this.currentFirebaseUser = null;
    this.authInitialized = false;
  }

  async initializeFirebaseAuth(supabaseUser) {
    if (!supabaseUser) {
      // console.log('No Supabase user to bridge to Firebase');
      return null;
    }

    try {
      // For now, we'll use anonymous authentication
      // In production, you should implement custom token generation
      // via a Supabase Edge Function that calls Firebase Admin SDK
      
      // Check if already signed in
      if (auth.currentUser) {
        // console.log('Firebase user already authenticated:', auth.currentUser.uid);
        this.currentFirebaseUser = auth.currentUser;
        return auth.currentUser;
      }

      // Sign in anonymously to Firebase
      // console.log('Signing in anonymously to Firebase for user:', supabaseUser.id);
      const { user: firebaseUser } = await signInAnonymously(auth);
      
      // Update the Firebase user profile to link with Supabase user
      await updateProfile(firebaseUser, {
        displayName: supabaseUser.email,
        // Store Supabase user ID in photoURL as a workaround
        // In production, use custom claims via Admin SDK
        photoURL: supabaseUser.id
      });

      this.currentFirebaseUser = firebaseUser;
      this.authInitialized = true;
      
      // console.log('Firebase auth initialized for user:', firebaseUser.uid);
      return firebaseUser;
    } catch (error) {
      console.error('Error initializing Firebase auth:', error);
      throw error;
    }
  }

  async signOutFirebase() {
    try {
      await auth.signOut();
      this.currentFirebaseUser = null;
      this.authInitialized = false;
      // console.log('Firebase auth signed out');
    } catch (error) {
      console.error('Error signing out from Firebase:', error);
    }
  }

  getFirebaseUser() {
    return this.currentFirebaseUser || auth.currentUser;
  }

  isAuthenticated() {
    return !!this.getFirebaseUser();
  }

  // Helper to get the Supabase user ID from Firebase user
  getSupabaseUserId() {
    const user = this.getFirebaseUser();
    return user?.photoURL || null; // We stored Supabase ID in photoURL
  }
}

export const firebaseAuthBridge = new FirebaseAuthBridge();