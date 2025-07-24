import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase, getUserProfile } from '../services/supabase/config';
import { pinAuthService } from '../services/supabase/pinAuth';
import { syncUserToFirebase } from '../services/supabase/userSync';
import { firebaseAuthBridge } from '../services/firebase/authBridge';

const AuthContext = createContext({});

// List of admin emails
const ADMIN_EMAILS = [
  'admin@bankroll.com',
  'jackson@bankroll.com',
  'jackson@hedgepay.co'
];

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const SupabaseAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [signupData, setSignupData] = useState(null);

  // Check if user is admin
  const isAdmin = useCallback((user) => {
    return user && ADMIN_EMAILS.includes(user.email);
  }, []);

  // Get user profile
  const getUserProfile = async (userId) => {
    try {
      // console.log('Fetching profile for user:', userId);
      
      // Add timeout to prevent hanging - reduced for development
      const timeout = import.meta.env.DEV ? 3000 : 10000;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), timeout)
      );
      
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      // console.log('Profile query result:', { data, error });
      
      if (error) throw error;
      return data;
    } catch (error) {
      // In development, suppress timeout errors since Supabase might not be fully set up
      if (import.meta.env.DEV && error.message === 'Profile fetch timeout') {
        console.warn('Supabase profile fetch timed out - this is expected if Supabase is not fully configured');
      } else {
        console.error('Get user profile error:', error);
      }
      return null;
    }
  };

  // Sign up new user
  const signUp = async (email, password, userData) => {
    try {
      // Step 1: Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: userData.username,
            phoneNumber: userData.phoneNumber
          }
        }
      });

      if (authError) throw authError;

      // Step 2: Create user data using secure function that bypasses RLS
      const { error: setupError } = await supabase
        .rpc('handle_user_signup', {
          user_id: authData.user.id,
          user_email: email,
          user_username: userData.username,
          user_first_name: userData.firstName,
          user_last_name: userData.lastName,
          user_phone: userData.phoneNumber || null
        });

      if (setupError) {
        console.error('Setup error:', setupError);
        // Don't throw - try to continue anyway
      }

      // The RPC function handles wallet, notification preferences, and phone number

      // Set up PIN if provided
      if (userData.pin) {
        try {
          await pinAuthService.setupPIN(authData.user.id, userData.pin);
        } catch (pinError) {
          console.error('PIN setup error:', pinError);
          // Don't fail signup if PIN setup fails
        }
      }

      // Send welcome email
      try {
        const EmailService = (await import('../services/EmailService')).default;
        const emailService = new EmailService();
        await emailService.sendWelcomeEmail(
          email,
          userData.username || userData.firstName || email.split('@')[0]
        );
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail signup if email fails
      }

      return authData;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // Sign in existing user
  const signIn = async (email, password) => {
    try {
      // console.log('Auth context: Starting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // console.log('Auth context: Sign in response:', { data, error });
      
      if (error) throw error;

      // Send login notification email
      try {
        const EmailService = (await import('../services/EmailService')).default;
        
        // Get device info for the email
        const deviceInfo = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          vendor: navigator.vendor,
          location: 'Location detection available in production',
          ipAddress: 'Available in production'
        };

        await EmailService.sendSecurityEmail({
          to: email,
          alertType: 'new_login',
          data: {
            email,
            deviceInfo,
            loginTime: new Date().toLocaleString()
          }
        });
      } catch (emailError) {
        console.error('Error sending login notification:', emailError);
        // Don't fail login if email fails
      }

      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Send password reset email
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Send phone verification code
  const sendVerificationCode = async (phoneNumber) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { 
          phoneNumber, 
          userId: currentUser?.id 
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Send verification code error:', error);
      throw error;
    }
  };

  // Verify phone number with code
  const verifyPhone = async (phoneNumber, code) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-phone', {
        body: { 
          phoneNumber, 
          code, 
          userId: currentUser?.id 
        }
      });
      
      if (error) throw error;
      
      // Refresh user profile to get updated phone verification status
      if (currentUser?.id) {
        const profile = await getUserProfile(currentUser.id);
        setCurrentUser({ ...currentUser, profile });
      }
      
      return data;
    } catch (error) {
      console.error('Verify phone error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserData = async (userId, updates) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setCurrentUser(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          ...data
        }
      }));

      return data;
    } catch (error) {
      console.error('Update user data error:', error);
      throw error;
    }
  };

  // Update profile image
  const updateProfileImage = async (userId, imageFile) => {
    try {
      let imageUrl;
      
      if (imageFile instanceof File) {
        // Upload to Supabase Storage
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `profile-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      } else {
        imageUrl = imageFile;
      }

      // Update user profile
      const updatedUser = await updateUserData(userId, { profile_image: imageUrl });
      return imageUrl;
    } catch (error) {
      console.error('Update profile image error:', error);
      throw error;
    }
  };

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (error && error.code !== '42501') {
        // Ignore RLS errors, throw other errors
        throw error;
      }
      return !data; // Returns true if username is available
    } catch (error) {
      console.error('Check username error:', error);
      // For now, assume username is available if we can't check
      return true;
    }
  };

  // Validate signup data before creating account
  const validateSignupStep1 = async (email, password) => {
    try {
      // For now, just store the credentials
      // Email uniqueness will be enforced by Supabase Auth
      setSignupData({ email, password });
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      throw error;
    }
  };

  // Complete signup with all user data
  const completeSignup = async (userData) => {
    if (!signupData) {
      throw new Error('No signup data found. Please start over.');
    }

    try {
      return await signUp(signupData.email, signupData.password, userData);
    } finally {
      // Clear signup data
      setSignupData(null);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    // Check active session
    // console.log('Checking active session...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      // console.log('Session check result:', { session, error });
      
      if (error) {
        console.error('Session check error:', error);
        setLoading(false);
        setSessionChecked(true);
        return;
      }
      
      if (session?.user) {
        // console.log('User found in session:', session.user.email);
        getUserProfile(session.user.id).then(async profile => {
          // console.log('User profile loaded:', profile);
          
          // Sync user to Firebase
          // console.log('Syncing user to Firebase...');
          await syncUserToFirebase(session.user, profile);
          
          // Skip Firebase auth bridge for now - anonymous auth is disabled
          // TODO: Implement proper Firebase custom token authentication
          
          setCurrentUser({
            ...session.user,
            profile,
            isAdmin: isAdmin(session.user)
          });
          setLoading(false);
          setSessionChecked(true);
        }).catch(error => {
          console.error('Error loading user profile:', error);
          // Still set the user even if profile fails
          setCurrentUser({
            ...session.user,
            profile: null,
            isAdmin: isAdmin(session.user)
          });
          setLoading(false);
          setSessionChecked(true);
        });
      } else {
        // console.log('No active session found');
        setLoading(false);
        setSessionChecked(true);
      }
    }).catch(error => {
      console.error('Fatal session check error:', error);
      setLoading(false);
      setSessionChecked(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // console.log('User signed in, fetching profile...');
          try {
            const profile = await getUserProfile(session.user.id);
            // console.log('Profile fetched:', profile);
            
            // Sync user to Firebase
            // console.log('Syncing user to Firebase...');
            await syncUserToFirebase(session.user, profile);
            
            // Skip Firebase auth bridge for now - anonymous auth is disabled
            // TODO: Implement proper Firebase custom token authentication
            
            setCurrentUser({
              ...session.user,
              profile,
              isAdmin: isAdmin(session.user)
            });
          } catch (err) {
            console.error('Error in auth state change:', err);
            // Set user without profile if profile fetch fails
            setCurrentUser({
              ...session.user,
              profile: null,
              isAdmin: isAdmin(session.user)
            });
          }
        } else if (event === 'SIGNED_OUT') {
          // console.log('User signed out');
          setCurrentUser(null);
        } else if (event === 'USER_UPDATED' && session?.user) {
          // console.log('User updated, fetching profile...');
          const profile = await getUserProfile(session.user.id);
          setCurrentUser({
            ...session.user,
            profile,
            isAdmin: isAdmin(session.user)
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [isAdmin]);

  const value = {
    currentUser,
    loading,
    sessionChecked,
    isAdmin: currentUser?.isAdmin || false,
    signUp,
    signIn,
    signOut,
    resetPassword,
    sendVerificationCode,
    verifyPhone,
    updateUserData,
    updateProfileImage,
    checkUsernameAvailability,
    validateSignupStep1,
    completeSignup,
    isNewUser: !!signupData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default SupabaseAuthProvider;