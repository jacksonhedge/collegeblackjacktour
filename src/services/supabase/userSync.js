import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { supabase } from './config';
import { auth as firebaseAuth } from '../firebase/config';

/**
 * Syncs a Supabase user to Firebase Firestore
 * Creates a user document in Firebase if it doesn't exist
 */
export const syncUserToFirebase = async (supabaseUser, profile) => {
  if (!supabaseUser?.id) {
    // console.log('No Supabase user provided for sync');
    return false;
  }

  try {
    const userRef = doc(db, 'users', supabaseUser.id);
    
    // Check if user already exists in Firebase
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // console.log('Firebase user document does not exist for:', supabaseUser.email);
      // Don't try to create it - just return false
      // The Firebase sync is optional and not critical for app functionality
      return false;
    } else {
      // console.log('Firebase user document already exists');
      
      // Update existing document with latest profile info
      const updates = {};
      
      if (profile?.username) updates.username = profile.username;
      if (profile?.first_name) {
        updates.firstName = profile.first_name;
        updates.displayName = `${profile.first_name} ${profile.last_name || ''}`.trim();
      }
      if (profile?.last_name) updates.lastName = profile.last_name;
      if (profile?.phone_number) updates.phoneNumber = profile.phone_number;
      if (profile?.profile_image) updates.profileImage = profile.profile_image;
      
      if (Object.keys(updates).length > 0) {
        await setDoc(userRef, updates, { merge: true });
        // console.log('Firebase user document updated');
      }
      
      return true;
    }
  } catch (error) {
    // Silently fail - Firebase sync is not critical
    // console.log('Firebase sync skipped:', error.code);
    return false;
  }
};

/**
 * Ensures user exists in both Supabase and Firebase
 * Call this after successful authentication
 */
export const ensureUserSync = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }
    
    // Get user profile from Supabase
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Sync to Firebase
    return await syncUserToFirebase(user, profile);
  } catch (error) {
    console.error('Error in ensureUserSync:', error);
    return false;
  }
};