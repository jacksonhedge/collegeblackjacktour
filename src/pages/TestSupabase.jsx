import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase/config';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { sendVerificationCode, verifyPhoneNumber } from '../services/supabase/phoneVerification';

const TestSupabase = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('Test123!');
  const [phoneNumber, setPhoneNumber] = useState('+14125551234');
  const [verificationCode, setVerificationCode] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, signOut, currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      setUserId(currentUser.id);
      setMessage(`Logged in as: ${currentUser.email}`);
    }
  }, [currentUser]);

  const testSignUp = async () => {
    setLoading(true);
    try {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        username: '#testuser' + Date.now()
      };
      
      const result = await signUp(email, password, userData);
      setMessage('Sign up successful! User ID: ' + result.user.id);
      setUserId(result.user.id);
    } catch (error) {
      setMessage('Sign up error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    try {
      const result = await signIn(email, password);
      setMessage('Sign in successful! User ID: ' + result.user.id);
      setUserId(result.user.id);
    } catch (error) {
      setMessage('Sign in error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setMessage('Signed out successfully');
      setUserId('');
    } catch (error) {
      setMessage('Sign out error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSendCode = async () => {
    if (!userId) {
      setMessage('Please sign in first');
      return;
    }
    
    setLoading(true);
    try {
      const result = await sendVerificationCode(phoneNumber, userId);
      if (result.success) {
        setMessage('Verification code sent successfully!');
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Send code error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testVerifyCode = async () => {
    if (!userId) {
      setMessage('Please sign in first');
      return;
    }
    
    setLoading(true);
    try {
      const result = await verifyPhoneNumber(phoneNumber, verificationCode, userId);
      if (result.success) {
        setMessage('Phone verified successfully!');
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Verify error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkTables = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });
      
      if (error) throw error;
      setMessage(`Users table exists! Count: ${data}`);
    } catch (error) {
      setMessage('Table check error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Supabase Integration Test</h1>
        
        {/* Status Message */}
        {message && (
          <div className={`mb-4 p-4 rounded ${
            message.includes('error') || message.includes('Error') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Current User Info */}
        {currentUser && (
          <div className="mb-4 p-4 bg-blue-100 rounded">
            <p className="font-semibold">Current User:</p>
            <p>ID: {currentUser.id}</p>
            <p>Email: {currentUser.email}</p>
          </div>
        )}

        {/* Test Controls */}
        <div className="space-y-4">
          {/* Database Test */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">1. Test Database Connection</h2>
            <button
              onClick={checkTables}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Check Tables
            </button>
          </div>

          {/* Auth Test */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">2. Test Authentication</h2>
            <div className="space-y-2 mb-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="space-x-2">
              <button
                onClick={testSignUp}
                disabled={loading || currentUser}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                Sign Up
              </button>
              <button
                onClick={testSignIn}
                disabled={loading || currentUser}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Sign In
              </button>
              <button
                onClick={testSignOut}
                disabled={loading || !currentUser}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Phone Verification Test */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">3. Test Phone Verification</h2>
            <p className="text-sm text-gray-600 mb-2">
              Note: Edge Functions must be deployed for this to work
            </p>
            <div className="space-y-2 mb-4">
              <input
                type="tel"
                placeholder="Phone Number (+1...)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="space-x-2">
              <button
                onClick={testSendCode}
                disabled={loading || !currentUser}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
              >
                Send Code
              </button>
              <button
                onClick={testVerifyCode}
                disabled={loading || !currentUser || !verificationCode}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
              >
                Verify Code
              </button>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSupabase;