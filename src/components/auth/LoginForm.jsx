import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });

  const from = location.state?.from?.pathname || '/platforms';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Replace with Supabase authentication
      await login(formData.emailOrUsername, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.code === 'auth/invalid-credential'
          ? 'Invalid email/username or password'
          : 'Failed to log in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#9D8CDB] via-[#B5A7E6] to-[#7B68D8] animate-gradient-slow"></div>
      
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
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email/Username Field */}
                <div>
                  <label 
                    htmlFor="emailOrUsername" 
                    className="block text-sm font-medium text-white/90 mb-2"
                  >
                    Email or Username
                  </label>
                  <input
                    type="text"
                    id="emailOrUsername"
                    name="emailOrUsername"
                    value={formData.emailOrUsername}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
                      text-white placeholder-white/60 transition-all"
                    placeholder="Enter your email or username"
                  />
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
                        focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
                        text-white placeholder-white/60 transition-all pr-12"
                      placeholder="Enter your password"
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
                  disabled={loading}
                  className={`w-full px-6 py-3 bg-[#5B3A9B] text-white rounded-lg 
                    transition-all duration-200 font-medium shadow-lg
                    ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#4A2F82] hover:shadow-xl'}
                    `}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      Signing in...
                    </div>
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
    </div>
  );
};

export default LoginForm;