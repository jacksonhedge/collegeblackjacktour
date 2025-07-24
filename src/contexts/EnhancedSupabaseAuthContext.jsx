import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase/config';
import { referralService } from '../services/ReferralService';
import { inviteService } from '../services/InviteService';
import { syncUserToFirebase, bridgeAuthToFirebase } from '../services/supabase/userSync';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

const SupabaseAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false); // NEW: Track if initial session check is complete
  const [signupData, setSignupData] = useState(null);
  const [pinError, setPinError] = useState('');

  // Helper function to check if user is admin
  const isAdmin = (user) => {
    return user?.email === 'jacksonfitzgerald3@gmail.com';
  };

  // Get user profile from Supabase
  const getUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Profile not found, will be created on first update');
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile
      const profile = await getUserProfile(data.user.id);
      
      // Sync to Firebase
      await syncUserToFirebase(data.user, profile);

      const userData = {
        ...data.user,
        profile,
        isAdmin: isAdmin(data.user)
      };

      setCurrentUser(userData);
      
      return { user: userData, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error };
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        const profileData = {
          id: data.user.id,
          email: data.user.email,
          full_name: userData.full_name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          username: userData.username,
          phone_number: userData.phoneNumber,
          date_of_birth: userData.dateOfBirth,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // Sync to Firebase
        await syncUserToFirebase(data.user, profileData);
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setCurrentUser(null);
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  // Update user data
  const updateUserData = async (userId, updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Update current user profile
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => ({
          ...prev,
          profile: { ...prev.profile, ...data }
        }));
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error updating user data:', error);
      return { data: null, error };
    }
  };

  // Phone verification functions
  const sendVerificationCode = async (phoneNumber) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error sending verification code:', error);
      return { success: false, error };
    }
  };

  const verifyPhone = async (phoneNumber, code) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: code,
        type: 'sms'
      });

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error verifying phone:', error);
      return { success: false, error };
    }
  };

  // PIN functions
  const verifyPIN = async (userId, pin) => {
    try {
      const { data, error } = await supabase.rpc('verify_pin', {
        p_user_id: userId,
        p_pin: pin
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setPinError('Invalid PIN. Please try again.');
      return false;
    }
  };

  const createPIN = async (userId, pin) => {
    try {
      const { error } = await supabase.rpc('create_pin', {
        p_user_id: userId,
        p_pin: pin
      });

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error creating PIN:', error);
      return { success: false, error };
    }
  };

  const updatePIN = async (userId, currentPin, newPin) => {
    try {
      const { data, error } = await supabase.rpc('update_pin', {
        p_user_id: userId,
        p_current_pin: currentPin,
        p_new_pin: newPin
      });

      if (error) throw error;
      return { success: data, error: null };
    } catch (error) {
      console.error('Error updating PIN:', error);
      return { success: false, error };
    }
  };

  const hasPIN = async (userId) => {
    try {
      const { data, error } = await supabase.rpc('has_pin', {
        p_user_id: userId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking PIN:', error);
      return false;
    }
  };

  // Staging signup data functions
  const validateSignupStep1 = async (data) => {
    const errors = {};

    // Validate email
    if (!data.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Invalid email address';
    } else {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .single();
      
      if (existingUser) {
        errors.email = 'Email already in use';
      }
    }

    // Validate names
    if (!data.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!data.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    return { valid: Object.keys(errors).length === 0, errors };
  };

  const stageSignupData = (data) => {
    setSignupData(prev => ({ ...prev, ...data }));
  };

  const completeSignup = async () => {
    if (!signupData) {
      throw new Error('No signup data staged');
    }

    const userData = {
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      username: signupData.username,
      phoneNumber: signupData.phoneNumber,
      dateOfBirth: signupData.birthday
    };

    try {
      return await signUp(signupData.email, signupData.password, userData);
    } finally {
      // Clear signup data
      setSignupData(null);
    }
  };

  // Set up auth state listener with improved handling
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check active session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Session check error:', error);
          setLoading(false);
          setSessionChecked(true);
          return;
        }
        
        if (session?.user) {
          // Load user profile
          const profile = await getUserProfile(session.user.id);
          
          if (!mounted) return;
          
          // Sync to Firebase in background
          syncUserToFirebase(session.user, profile).catch(console.error);
          
          setCurrentUser({
            ...session.user,
            profile,
            isAdmin: isAdmin(session.user)
          });
        }
        
        setLoading(false);
        setSessionChecked(true);
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          setSessionChecked(true);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session) {
        const profile = await getUserProfile(session.user.id);
        
        if (!mounted) return;
        
        // Sync to Firebase in background
        syncUserToFirebase(session.user, profile).catch(console.error);
        
        setCurrentUser({
          ...session.user,
          profile,
          isAdmin: isAdmin(session.user)
        });
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      } else if (event === 'USER_UPDATED' && session) {
        const profile = await getUserProfile(session.user.id);
        
        if (!mounted) return;
        
        setCurrentUser({
          ...session.user,
          profile,
          isAdmin: isAdmin(session.user)
        });
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    loading,
    sessionChecked, // NEW: Expose session check status
    signIn,
    signUp,
    signOut,
    updateUserData,
    sendVerificationCode,
    verifyPhone,
    verifyPIN,
    createPIN,
    updatePIN,
    hasPIN,
    pinError,
    setPinError,
    validateSignupStep1,
    stageSignupData,
    completeSignup,
    signupData,
    refreshUserProfile: async () => {
      if (currentUser) {
        const profile = await getUserProfile(currentUser.id);
        setCurrentUser(prev => ({ ...prev, profile }));
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default SupabaseAuthProvider;