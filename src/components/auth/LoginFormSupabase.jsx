import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { usePostHog } from '../../contexts/PostHogContext';
import { trustedDeviceService, pinAuthService } from '../../services/supabase/pinAuth';
import { getDeviceFingerprint } from '../../utils/deviceFingerprint';
import PINLogin from './PINLogin';
import { supabase } from '../../services/supabase/config';
import LoadingAnimation from '../ui/LoadingAnimation';

const LoginFormSupabase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { trackEvent, trackFunnelStep, trackFormSubmit, trackError } = usePostHog();
  const [loading, setLoading] = useState(false);
  const [checkingDevice, setCheckingDevice] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPinLogin, setShowPinLogin] = useState(false);
  const [userHasPin, setUserHasPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
  });

  const from = location.state?.from?.pathname || '/wallet';

  // Check if this is a trusted device when email changes
  useEffect(() => {
    const checkTrustedDevice = async () => {
      if (!formData.email || !formData.email.includes('@')) {
        setShowPinLogin(false);
        setCheckingDevice(false);
        return;
      }

      setCheckingDevice(true);
      try {
        // Get user ID from email
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', formData.email.toLowerCase())
          .single();

        if (userData) {
          // Check if device is trusted
          const deviceInfo = getDeviceFingerprint();
          const isTrusted = await trustedDeviceService.isDeviceTrusted(
            userData.id, 
            deviceInfo.deviceId
          );

          // Check if user has PIN
          const hasPin = await pinAuthService.hasPIN(userData.id);
          
          setUserHasPin(hasPin);
          // Enable PIN login for trusted devices with PIN set up
          setShowPinLogin(isTrusted && hasPin);
        } else {
          setShowPinLogin(false);
        }
      } catch (error) {
        console.error('Error checking device trust:', error);
        setShowPinLogin(false);
      } finally {
        setCheckingDevice(false);
      }
    };

    // Debounce the check
    const timer = setTimeout(checkTrustedDevice, 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    
    // Real-time validation
    if (name === 'email' && value && !validateEmail(value)) {
      setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    } else if (name === 'email') {
      setValidationErrors(prev => ({ ...prev, email: '' }));
    }
    
    if (name === 'password' && value && value.length < 8) {
      setValidationErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
    } else if (name === 'password') {
      setValidationErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate before submission
    if (!validateEmail(formData.email)) {
      setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }
    
    if (formData.password.length < 8) {
      setValidationErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
      return;
    }
    
    setLoading(true);

    // Track login attempt
    trackFunnelStep('login', 1, { method: 'email_password', remember_me: rememberMe });
    trackEvent('login_attempt', { method: 'email_password' });

    try {
      // console.log('Starting login with email:', formData.email);
      const result = await signIn(formData.email, formData.password, rememberMe);
      // console.log('Sign in result:', result);
      
      // Track successful login
      trackFormSubmit('login', true, { method: 'email_password', has_pin: userHasPin, remember_me: rememberMe });
      trackFunnelStep('login', 2, { method: 'email_password', success: true });
      
      // Sign in successful - navigate immediately
      setLoading(false);
      
      // Navigate without delay to prevent flash
      // After successful login, offer to set up PIN if they don't have one
      if (!userHasPin) {
        navigate('/setup-pin', { state: { from } });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Track failed login
      trackFormSubmit('login', false, { method: 'email_password', error: error.message });
      trackError(error.message || 'Failed to log in', 'login_error', { method: 'email_password' });
      
      // Provide user-friendly error messages
      let userError = 'Failed to log in. Please try again.';
      if (error.message?.includes('Invalid login credentials')) {
        userError = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message?.includes('Email not confirmed')) {
        userError = 'Please check your email to confirm your account before logging in.';
      } else if (error.message?.includes('Too many requests')) {
        userError = 'Too many login attempts. Please wait a few minutes and try again.';
      }
      
      setError(userError);
      setLoading(false);
    }
  };

  const handlePinSuccess = async (userId) => {
    // PIN was verified successfully, now we need to log in the user
    // Since we can't use the PIN as a password, we need to trigger the regular login
    setShowPinLogin(false);
    // The user should now use their regular password to complete login
    setError('PIN verified! Please enter your password to complete login.');
  };

  const handlePasswordLogin = () => {
    setShowPinLogin(false);
  };

  const handleBack = () => {
    setFormData({ email: '', password: '' });
    setShowPinLogin(false);
  };

  // Show PIN login if trusted device
  if (showPinLogin && !checkingDevice) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Gradient Background - Orange & Purple */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-orange-800">
          <div className="absolute inset-0 bg-wavy-gradient opacity-60"></div>
        </div>
        
        {/* Animated blob shapes */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-lava-1"></div>
          <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-lava-2"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-2xl animate-lava-3"></div>
        </div>
        
        <div className="relative z-10 min-h-screen flex flex-col">
          <nav className="p-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to home</span>
              </Link>
              <Link to="/" className="text-2xl font-bold text-white">
                Bankroll
              </Link>
            </div>
          </nav>

          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <PINLogin
                  email={formData.email}
                  onBack={handleBack}
                  onSuccess={handlePinSuccess}
                  onPasswordLogin={handlePasswordLogin}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background - Orange & Purple */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-orange-800">
        <div className="absolute inset-0 bg-wavy-gradient opacity-60"></div>
      </div>
      
      {/* Animated blob shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-lava-1"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-lava-2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-2xl animate-lava-3"></div>
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="p-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to home</span>
            </Link>
            <Link to="/" className="text-2xl font-bold text-white">
              Bankroll
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-3">
                Welcome back
              </h1>
              <p className="text-white/80 text-lg">
                Sign in to your Bankroll account
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-white/90 mb-2"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                        text-white placeholder-white/60 transition-all"
                      placeholder="Enter your email"
                      autoComplete="email"
                    />
                    {checkingDevice && formData.email && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white/50"></div>
                      </div>
                    )}
                  </div>
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-300">{validationErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-white/90 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                        text-white placeholder-white/60 transition-all pr-12"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-300">{validationErrors.password}</p>
                  )}
                </div>

                {/* Remember Me & Trusted Device */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 bg-white/20 border-2 border-white/40 rounded text-purple-600 
                        focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-transparent
                        checked:bg-purple-600 checked:border-purple-600 transition-all"
                    />
                    <span className="text-sm text-white/80">Remember me</span>
                  </label>
                  
                  {userHasPin && !checkingDevice && (
                    <div className="flex items-center gap-1 text-sm text-white/70">
                      <Shield className="w-3 h-3" />
                      <span>PIN available</span>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm text-center font-medium">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || checkingDevice || !formData.email || !formData.password}
                  className={`w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-lg 
                    transition-all duration-200 font-medium shadow-lg transform relative overflow-hidden
                    ${loading || checkingDevice || !formData.email || !formData.password
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:from-purple-700 hover:to-orange-600 hover:shadow-xl hover:scale-105 active:scale-95'}
                    `}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></span>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* Helper Links */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => navigate('/reset-password')}
                    className="text-white/80 hover:text-white transition-colors text-sm underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            </div>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-white/80">
                New to Bankroll?{' '}
                <Link
                  to="/signup"
                  className="text-white font-semibold hover:underline transition-all"
                >
                  Create your account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 text-center">
          <div className="text-xs text-white/60 max-w-2xl mx-auto space-y-2">
            <p>© 2024 Bankroll. All Rights Reserved.</p>
            <p>
              Banking Services provided by partner institutions. FDIC insured deposits. 
              Your funds are protected with bank-level security and encryption.
            </p>
          </div>
        </footer>
      </div>

      {/* Full-screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <LoadingAnimation text="Signing in..." />
        </div>
      )}
    </div>
  );
};

export default LoginFormSupabase;