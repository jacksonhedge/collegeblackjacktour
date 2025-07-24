import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Check, 
  Gamepad2, 
  TrendingUp, 
  DollarSign,
  Users,
  Target,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';

// Step 1: Email and Basic Info
const BasicInfoStep = ({ formData, setFormData, errors, onNext }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPasswordValid = (password) => {
    return (
      password.length >= 8 &&
      password.length <= 16 &&
      /[A-Z]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };

  const canProceed = formData.email && 
                    formData.firstName && 
                    formData.lastName && 
                    formData.password && 
                    formData.confirmPassword &&
                    isPasswordValid(formData.password) &&
                    formData.password === formData.confirmPassword;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Let's get you started
        </h2>
        <p className="text-white/80">
          Create your Bankroll account in just a few steps
        </p>
      </div>

      <div className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Email address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
              text-white placeholder-white/60 transition-all"
            placeholder="your@email.com"
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-300">{errors.email}</p>
          )}
        </div>

        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              First name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
                text-white placeholder-white/60 transition-all"
              placeholder="First"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Last name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
                text-white placeholder-white/60 transition-all"
              placeholder="Last"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
                text-white placeholder-white/60 transition-all pr-12"
              placeholder="Create a strong password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Password Requirements */}
          <div className="mt-2 space-y-1">
            {[
              { text: '8-16 characters', check: formData.password.length >= 8 && formData.password.length <= 16 },
              { text: 'One uppercase letter', check: /[A-Z]/.test(formData.password) },
              { text: 'One special character', check: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) }
            ].map((req, index) => (
              <div key={index} className={`flex items-center gap-2 text-sm ${req.check ? 'text-green-300' : 'text-white/60'}`}>
                <div className={`w-2 h-2 rounded-full ${req.check ? 'bg-green-300' : 'bg-white/30'}`} />
                <span>{req.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Confirm password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
              text-white placeholder-white/60 transition-all"
            placeholder="Confirm your password"
            required
          />
          {formData.confirmPassword && (
            <p className={`mt-1 text-sm ${formData.password === formData.confirmPassword ? 'text-green-300' : 'text-red-300'}`}>
              {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords don\'t match'}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
          ${canProceed 
            ? 'bg-[#5B3A9B] hover:bg-[#4A2F82] text-white shadow-lg' 
            : 'bg-white/20 text-white/50 cursor-not-allowed'
          }`}
      >
        Continue
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// Step 2: Personal Details
const PersonalDetailsStep = ({ formData, setFormData, onNext, onBack }) => {
  const canProceed = formData.username && formData.phoneNumber && formData.birthday;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Personal details
        </h2>
        <p className="text-white/80">
          Help us verify your identity and secure your account
        </p>
      </div>

      <div className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full pl-8 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
                text-white placeholder-white/60 transition-all"
              placeholder="Choose a unique username"
              required
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">@</span>
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Phone number
          </label>
          <div className="relative">
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\\d()-\\s]/g, '');
                if (value.length <= 14) {
                  setFormData({ ...formData, phoneNumber: value });
                }
              }}
              className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
                text-white placeholder-white/60 transition-all"
              placeholder="(555) 123-4567"
              required
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">+1</span>
          </div>
        </div>

        {/* Birthday */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Date of birth
          </label>
          <input
            type="date"
            value={formData.birthday}
            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
              text-white transition-all"
            required
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-white/20 text-white rounded-lg font-medium transition-all duration-200 hover:bg-white/30"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
            ${canProceed 
              ? 'bg-[#5B3A9B] hover:bg-[#4A2F82] text-white shadow-lg' 
              : 'bg-white/20 text-white/50 cursor-not-allowed'
            }`}
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Step 3: Onboarding Questions
const OnboardingStep = ({ formData, setFormData, onNext, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Get selected platforms for dynamic content
  const selectedPlatforms = formData.onboarding.platforms || [];
  const primaryPlatform = selectedPlatforms.includes('fanduel') ? 'FanDuel' :
                         selectedPlatforms.includes('draftkings') ? 'DraftKings' :
                         selectedPlatforms.length > 0 ? 'your sportsbook' : '';

  const questions = [
    {
      id: 'experience',
      title: 'What\'s your sports betting experience?',
      icon: <Target className="w-8 h-8" />,
      options: [
        { value: 'beginner', label: '🤷 Just getting started', desc: 'New to sports betting' },
        { value: 'casual', label: '😎 Casual bettor', desc: 'Bet occasionally for fun' },
        { value: 'regular', label: '🏈 Regular bettor', desc: 'Bet multiple times per week' },
        { value: 'professional', label: '🎆 Serious bettor', desc: 'Advanced strategies and bankroll management' }
      ]
    },
    {
      id: 'platforms',
      title: 'Which platforms do you currently use?',
      icon: <Gamepad2 className="w-8 h-8" />,
      multiple: true,
      options: [
        { value: 'draftkings', label: '👑 DraftKings' },
        { value: 'fanduel', label: '⭐ FanDuel' },
        { value: 'betmgm', label: '🦁 BetMGM' },
        { value: 'caesars', label: '🏛️ Caesars' },
        { value: 'underdog', label: '🐕 Underdog Fantasy' },
        { value: 'prizepicks', label: '🎯 PrizePicks' },
        { value: 'fanatics', label: '⚡ Fanatics' },
        { value: 'none', label: '🆕 None yet' }
      ]
    },
    {
      id: 'fantasy',
      title: 'Do you play fantasy sports?',
      icon: <Users className="w-8 h-8" />,
      options: [
        { value: 'football', label: '🏈 Fantasy Football', desc: 'NFL fantasy leagues' },
        { value: 'basketball', label: '🏀 Fantasy Basketball', desc: 'NBA fantasy leagues' },
        { value: 'baseball', label: '⚾ Fantasy Baseball', desc: 'MLB fantasy leagues' },
        { value: 'multiple', label: '🏆 Multiple sports', desc: 'I play fantasy in several sports' },
        { value: 'no', label: '❌ Not interested', desc: 'I don\'t play fantasy sports' }
      ]
    },
    {
      id: 'goals',
      title: 'What are your main goals with Bankroll?',
      icon: <TrendingUp className="w-8 h-8" />,
      multiple: true,
      options: [
        { value: 'faster-withdrawals', 
          label: primaryPlatform ? `💸 Faster withdrawals on ${primaryPlatform}` : '💸 Faster withdrawals', 
          desc: 'Get winnings instantly' 
        },
        { value: 'earn-interest', label: '💰 Earn on balances', desc: 'Make money on idle funds' },
        { value: 'invest-dues', label: '📈 Invest fantasy dues', desc: 'Grow season-long investments' },
        { value: 'track-performance', label: '📊 Track performance', desc: 'Monitor wins and losses' },
        { value: 'manage-bankroll', label: '💳 Manage bankroll', desc: 'Better money management' }
      ]
    }
  ];

  const currentQ = questions[currentQuestion];
  const isMultiple = currentQ.multiple;
  
  const handleSelection = (value) => {
    if (isMultiple) {
      const current = formData.onboarding[currentQ.id] || [];
      const updated = current.includes(value) 
        ? current.filter(v => v !== value)
        : [...current, value];
      setFormData({
        ...formData,
        onboarding: { ...formData.onboarding, [currentQ.id]: updated }
      });
    } else {
      setFormData({
        ...formData,
        onboarding: { ...formData.onboarding, [currentQ.id]: value }
      });
    }
  };

  const canContinue = () => {
    const answer = formData.onboarding[currentQ.id];
    return isMultiple ? answer && answer.length > 0 : !!answer;
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onNext();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-white/80">
        <span>Question {currentQuestion + 1} of {questions.length}</span>
        <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% complete</span>
      </div>
      
      <div className="w-full bg-white/20 rounded-full h-2">
        <div 
          className="bg-[#5B3A9B] h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4 text-[#5B3A9B]">
          {currentQ.icon}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {currentQ.title}
        </h2>
        {isMultiple && (
          <p className="text-white/80 text-sm">
            Select all that apply
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {currentQ.options.map((option) => {
          const isSelected = isMultiple 
            ? (formData.onboarding[currentQ.id] || []).includes(option.value)
            : formData.onboarding[currentQ.id] === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => handleSelection(option.value)}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${isSelected 
                  ? 'bg-[#5B3A9B]/20 border-[#5B3A9B] text-white' 
                  : 'bg-white/10 border-white/20 text-white/90 hover:bg-white/20 hover:border-white/40'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{option.label}</div>
                  {option.desc && (
                    <div className="text-sm text-white/70 mt-1">{option.desc}</div>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-5 h-5 text-[#5B3A9B]" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={handleBack}
          className="flex-1 px-6 py-3 bg-white/20 text-white rounded-lg font-medium transition-all duration-200 hover:bg-white/30"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canContinue()}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
            ${canContinue()
              ? 'bg-[#5B3A9B] hover:bg-[#4A2F82] text-white shadow-lg' 
              : 'bg-white/20 text-white/50 cursor-not-allowed'
            }`}
        >
          {currentQuestion < questions.length - 1 ? 'Next' : 'Continue'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Step 4: Connect Accounts (Optional)
const ConnectAccountsStep = ({ formData, setFormData, onComplete, onBack }) => {
  const [connectedAccounts, setConnectedAccounts] = useState([]);

  const accounts = [
    { id: 'venmo', name: 'Venmo', icon: '💰', bonus: 1, placeholder: '@username' },
    { id: 'sleeper', name: 'Sleeper', icon: '🏈', bonus: 1, placeholder: 'Sleeper username' },
    { id: 'espn', name: 'ESPN Fantasy', icon: '📊', bonus: 1, placeholder: 'ESPN username' },
    { id: 'instagram', name: 'Instagram', icon: '📸', bonus: 1, placeholder: '@handle' }
  ];

  const totalBonus = connectedAccounts.length + 5; // Base $5 + $1 per connection

  const handleAccountInput = (accountId, value) => {
    setFormData({
      ...formData,
      [accountId]: value
    });
    
    if (value && !connectedAccounts.includes(accountId)) {
      setConnectedAccounts([...connectedAccounts, accountId]);
    } else if (!value && connectedAccounts.includes(accountId)) {
      setConnectedAccounts(connectedAccounts.filter(id => id !== accountId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4 text-[#5B3A9B]">
          <DollarSign className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Earn bonus money
        </h2>
        <p className="text-white/80">
          Connect your accounts to earn up to $9 in bonus funds
        </p>
      </div>

      {/* Bonus Counter */}
      <div className="bg-[#5B3A9B]/20 border border-[#5B3A9B]/50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-white">${totalBonus}</div>
        <div className="text-white/80 text-sm">Total bonus earned</div>
      </div>

      {/* Account Connections */}
      <div className="space-y-4">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{account.icon}</span>
                <div>
                  <div className="font-medium text-white">{account.name}</div>
                  <div className="text-sm text-white/70">+${account.bonus} bonus</div>
                </div>
              </div>
              {connectedAccounts.includes(account.id) && (
                <Check className="w-5 h-5 text-green-400" />
              )}
            </div>
            <input
              type="text"
              value={formData[account.id] || ''}
              onChange={(e) => handleAccountInput(account.id, e.target.value)}
              className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
                text-white placeholder-white/60 transition-all"
              placeholder={account.placeholder}
            />
          </div>
        ))}
      </div>

      {/* Skip Option */}
      <div className="text-center">
        <button
          onClick={onComplete}
          className="text-white/70 hover:text-white transition-colors text-sm underline"
        >
          Skip for now
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-white/20 text-white rounded-lg font-medium transition-all duration-200 hover:bg-white/30"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          className="flex-1 px-6 py-3 bg-[#5B3A9B] hover:bg-[#4A2F82] text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
};

// Progress Indicator
const ProgressIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            index < currentStep
              ? 'bg-[#5B3A9B]'
              : index === currentStep
              ? 'bg-[#5B3A9B]/50'
              : 'bg-white/20'
          }`}
        />
      ))}
    </div>
  );
};

// Main Component
const SignUpForm = () => {
  const navigate = useNavigate();
  const { validateSignupStep1 } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    username: '',
    phoneNumber: '',
    birthday: '',
    onboarding: {},
    venmo: '',
    sleeper: '',
    espn: '',
    instagram: ''
  });

  const steps = [
    { component: BasicInfoStep, title: 'Basic Info' },
    { component: PersonalDetailsStep, title: 'Personal Details' },
    { component: OnboardingStep, title: 'Tell us about yourself' },
    { component: ConnectAccountsStep, title: 'Connect Accounts' }
  ];

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // TODO: Replace with Supabase authentication and user creation
      console.log('Creating user with data:', formData);
      
      // For now, just navigate to success
      navigate('/platforms');
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'Failed to create account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

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
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg">
            {/* Progress Indicator */}
            <ProgressIndicator currentStep={currentStep} totalSteps={steps.length} />

            {/* Form Container */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white">Creating your account...</p>
                </div>
              ) : (
                <CurrentStepComponent
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  onNext={handleNext}
                  onBack={handleBack}
                  onComplete={handleComplete}
                />
              )}
            </div>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-white/80">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-white font-semibold hover:underline transition-all"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;