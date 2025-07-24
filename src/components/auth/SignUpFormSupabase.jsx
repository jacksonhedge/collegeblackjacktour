import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
  Calendar,
  Phone,
  Shield,
  AlertCircle,
  Gift
} from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import PhoneVerificationStep from './PhoneVerificationStep';
import DemoModeButton from './DemoModeButton';
import { referralService } from '../../services/ReferralService';
import { enhancedReferralService } from '../../services/EnhancedReferralService';

// Step 1: Email and First Name
const EmailNameStep = ({ formData, setFormData, errors, onNext }) => {
  const [localErrors, setLocalErrors] = React.useState({ email: '', firstName: '', lastName: '' });
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validateName = (name) => {
    return name.length >= 2 && /^[a-zA-Z\s'-]+$/.test(name);
  };
  
  const handleEmailChange = (value) => {
    setFormData({ ...formData, email: value });
    if (value && !validateEmail(value)) {
      setLocalErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    } else {
      setLocalErrors(prev => ({ ...prev, email: '' }));
    }
  };
  
  const handleFirstNameChange = (value) => {
    setFormData({ ...formData, firstName: value });
    if (value && !validateName(value)) {
      setLocalErrors(prev => ({ ...prev, firstName: 'Please enter a valid first name' }));
    } else {
      setLocalErrors(prev => ({ ...prev, firstName: '' }));
    }
  };
  
  const handleLastNameChange = (value) => {
    setFormData({ ...formData, lastName: value });
    if (value && !validateName(value)) {
      setLocalErrors(prev => ({ ...prev, lastName: 'Please enter a valid last name' }));
    } else {
      setLocalErrors(prev => ({ ...prev, lastName: '' }));
    }
  };
  
  const canProceed = formData.email && formData.firstName && formData.lastName &&
                    validateEmail(formData.email) && validateName(formData.firstName) && 
                    validateName(formData.lastName);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Let's get you started
        </h2>
        <p className="text-white/80">
          First, we'll need some basic information
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
            onChange={(e) => handleEmailChange(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
              text-white placeholder-white/60 transition-all"
            placeholder="your@email.com"
            required
            autoComplete="email"
          />
          {(errors.email || localErrors.email) && (
            <p className="mt-1 text-sm text-red-300">{errors.email || localErrors.email}</p>
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
              onChange={(e) => handleFirstNameChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
                text-white placeholder-white/60 transition-all"
              placeholder="First"
              required
              autoComplete="given-name"
            />
            {localErrors.firstName && (
              <p className="mt-1 text-sm text-red-300">{localErrors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Last name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleLastNameChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
                text-white placeholder-white/60 transition-all"
              placeholder="Last"
              required
              autoComplete="family-name"
            />
            {localErrors.lastName && (
              <p className="mt-1 text-sm text-red-300">{localErrors.lastName}</p>
            )}
          </div>
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

// Step 2: Username
const UsernameStep = ({ formData, setFormData, onNext, onBack }) => {
  const { checkUsernameAvailability } = useAuth();
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  // Check username availability with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (formData.username && formData.username.length > 1) {
        setCheckingUsername(true);
        try {
          const fullUsername = formData.username.startsWith('#') 
            ? formData.username 
            : `#${formData.username}`;
          const available = await checkUsernameAvailability(fullUsername);
          setUsernameAvailable(available);
        } catch (error) {
          console.error('Error checking username:', error);
          setUsernameAvailable(null);
        } finally {
          setCheckingUsername(false);
        }
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.username, checkUsernameAvailability]);

  const canProceed = formData.username && usernameAvailable === true;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Choose your username
        </h2>
        <p className="text-white/80">
          This is how other users will find and pay you
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
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                setFormData({ ...formData, username: value });
              }}
              className="w-full pl-8 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
                text-white placeholder-white/60 transition-all"
              placeholder="Choose a unique username"
              required
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">#</span>
            {checkingUsername && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white block"></span>
              </span>
            )}
            {!checkingUsername && usernameAvailable !== null && formData.username && (
              <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                usernameAvailable ? 'text-green-400' : 'text-red-400'
              }`}>
                {usernameAvailable ? <Check className="w-5 h-5" /> : '✗'}
              </span>
            )}
          </div>
          {!checkingUsername && usernameAvailable === false && (
            <p className="mt-1 text-sm text-red-300">Username is already taken</p>
          )}
          {!checkingUsername && usernameAvailable === true && (
            <p className="mt-1 text-sm text-green-300">Username is available</p>
          )}
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-sm text-white/80">
            💡 Username tips:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            <li>• Keep it short and memorable</li>
            <li>• You can use letters, numbers, and underscores</li>
            <li>• This cannot be changed later</li>
          </ul>
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

// Step 3: Password and Agreements
const PasswordAgreementsStep = ({ formData, setFormData, onNext, onBack }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState({
    ageVerification: false,
    notifications: false,
    dwollaTerms: false
  });

  const isPasswordValid = (password) => {
    return (
      password.length >= 8 &&
      password.length <= 16 &&
      /[A-Z]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };

  const canProceed = formData.password && 
                    formData.confirmPassword &&
                    isPasswordValid(formData.password) &&
                    formData.password === formData.confirmPassword &&
                    agreeTerms.ageVerification &&
                    agreeTerms.notifications &&
                    agreeTerms.dwollaTerms;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Secure your account
        </h2>
        <p className="text-white/80">
          Create a strong password and review our terms
        </p>
      </div>

      <div className="space-y-4">
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

        {/* Terms and Agreements */}
        <div className="space-y-3 border-t border-white/20 pt-4">
          <h3 className="text-sm font-medium text-white/90 mb-3">Please confirm the following:</h3>
          
          {/* Age Verification */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={agreeTerms.ageVerification}
                onChange={(e) => setAgreeTerms({ ...agreeTerms, ageVerification: e.target.checked })}
                className="w-5 h-5 bg-white/20 border-2 border-white/40 rounded text-[#5B3A9B] 
                  focus:ring-2 focus:ring-[#5B3A9B] focus:ring-offset-0 focus:ring-offset-transparent
                  checked:bg-[#5B3A9B] checked:border-[#5B3A9B] transition-all"
              />
            </div>
            <span className="text-sm text-white/80 group-hover:text-white transition-colors">
              I certify that I am 18 years of age or older
            </span>
          </label>

          {/* Notifications and Waitlist */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={agreeTerms.notifications}
                onChange={(e) => setAgreeTerms({ ...agreeTerms, notifications: e.target.checked })}
                className="w-5 h-5 bg-white/20 border-2 border-white/40 rounded text-[#5B3A9B] 
                  focus:ring-2 focus:ring-[#5B3A9B] focus:ring-offset-0 focus:ring-offset-transparent
                  checked:bg-[#5B3A9B] checked:border-[#5B3A9B] transition-all"
              />
            </div>
            <span className="text-sm text-white/80 group-hover:text-white transition-colors">
              I agree to receive notifications and join the SideBet waitlist. 
              By checking this box, I accept the{' '}
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); window.open('https://bankroll.live/terms', '_blank'); }}
                className="text-[#5B3A9B] hover:text-[#4A2F82] underline"
              >
                Terms of Service
              </a>
              {' '}and learn more about SideBet at{' '}
              <a 
                href="https://hedgepayments.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#5B3A9B] hover:text-[#4A2F82] underline"
              >
                hedgepayments.com
              </a>
            </span>
          </label>

          {/* Dwolla Terms */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={agreeTerms.dwollaTerms}
                onChange={(e) => setAgreeTerms({ ...agreeTerms, dwollaTerms: e.target.checked })}
                className="w-5 h-5 bg-white/20 border-2 border-white/40 rounded text-[#5B3A9B] 
                  focus:ring-2 focus:ring-[#5B3A9B] focus:ring-offset-0 focus:ring-offset-transparent
                  checked:bg-[#5B3A9B] checked:border-[#5B3A9B] transition-all"
              />
            </div>
            <span className="text-sm text-white/80 group-hover:text-white transition-colors">
              I agree to the Dwolla{' '}
              <a 
                href="https://www.dwolla.com/legal/tos/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#5B3A9B] hover:text-[#4A2F82] underline"
              >
                Terms of Service
              </a>
              {' '}and{' '}
              <a 
                href="https://www.dwolla.com/legal/privacy/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#5B3A9B] hover:text-[#4A2F82] underline"
              >
                Privacy Policy
              </a>
            </span>
          </label>
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
          onClick={() => {
            // Store agreements in formData before proceeding
            setFormData(prev => ({
              ...prev,
              agreements: {
                ageVerified: agreeTerms.ageVerification,
                notificationsEnabled: agreeTerms.notifications,
                sideBetWaitlist: agreeTerms.notifications, // Same as notifications checkbox
                dwollaTermsAccepted: agreeTerms.dwollaTerms
              }
            }));
            onNext();
          }}
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

// Step 4: PIN Setup
const PINSetupStep = ({ formData, setFormData, onNext, onBack }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [step, setStep] = useState('create'); // 'create' or 'confirm'
  const [error, setError] = useState('');
  const pinRefs = useRef([]);
  const confirmPinRefs = useRef([]);

  const handlePinChange = (index, value, isPinConfirm = false) => {
    const refs = isPinConfirm ? confirmPinRefs : pinRefs;
    const setter = isPinConfirm ? setConfirmPin : setPin;
    const currentPin = isPinConfirm ? confirmPin : pin;

    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 4).split('');
      const newPin = [...currentPin];
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newPin[index + i] = digit;
        }
      });
      setter(newPin);
      
      const nextEmptyIndex = newPin.findIndex((digit, i) => i >= index && !digit);
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 3;
      refs.current[focusIndex]?.focus();
    } else if (/^\d$/.test(value)) {
      const newPin = [...currentPin];
      newPin[index] = value;
      setter(newPin);
      
      if (index < 3) {
        refs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e, isPinConfirm = false) => {
    const refs = isPinConfirm ? confirmPinRefs : pinRefs;
    const setter = isPinConfirm ? setConfirmPin : setPin;
    const currentPin = isPinConfirm ? confirmPin : pin;

    if (e.key === 'Backspace' && !currentPin[index] && index > 0) {
      refs.current[index - 1]?.focus();
      const newPin = [...currentPin];
      newPin[index - 1] = '';
      setter(newPin);
    }
  };

  const isPinComplete = (pinArray) => pinArray.every(digit => digit !== '');

  const handleContinue = () => {
    if (step === 'create') {
      if (!isPinComplete(pin)) {
        setError('Please enter all 4 digits');
        return;
      }
      setStep('confirm');
      setError('');
      setTimeout(() => confirmPinRefs.current[0]?.focus(), 100);
    } else {
      if (!isPinComplete(confirmPin)) {
        setError('Please enter all 4 digits');
        return;
      }
      if (pin.join('') !== confirmPin.join('')) {
        setError('PINs do not match');
        return;
      }
      // Store PIN in formData and proceed
      setFormData({ ...formData, pin: pin.join('') });
      onNext();
    }
  };

  const handleSkip = () => {
    setFormData({ ...formData, pin: null });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#5B3A9B]/20 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-[#5B3A9B]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {step === 'create' ? 'Create a quick PIN' : 'Confirm your PIN'}
        </h2>
        <p className="text-white/80">
          {step === 'create' 
            ? 'Use this PIN for faster login on trusted devices' 
            : 'Enter your PIN again to confirm'}
        </p>
      </div>

      <div>
        <div className="flex justify-center gap-2 mb-4">
          {(step === 'create' ? pin : confirmPin).map((digit, index) => (
            <input
              key={index}
              ref={el => (step === 'create' ? pinRefs : confirmPinRefs).current[index] = el}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength="1"
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value, step === 'confirm')}
              onKeyDown={(e) => handleKeyDown(index, e, step === 'confirm')}
              className={`w-12 h-14 text-center text-2xl font-semibold border-2 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
                transition-all ${
                  digit ? 'border-[#5B3A9B] bg-white text-gray-900' : 'border-gray-300 bg-white text-gray-900'
                }`}
              autoFocus={index === 0 && step === 'create'}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {step === 'create' && (
          <p className="text-center text-sm text-white/60">
            You can use your PIN instead of password on this device
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={step === 'create' ? onBack : () => { setStep('create'); setError(''); }}
          className="flex-1 px-4 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
        >
          Back
        </button>
        
        {step === 'create' && (
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            Skip for now
          </button>
        )}
        
        <button
          onClick={handleContinue}
          disabled={!isPinComplete(step === 'create' ? pin : confirmPin)}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all
            ${isPinComplete(step === 'create' ? pin : confirmPin)
              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
              : 'bg-white/20 text-white/50 cursor-not-allowed'
            }`}
        >
          {step === 'create' ? 'Continue' : 'Set PIN'}
        </button>
      </div>
    </div>
  );
};

// Step 5: Phone Number Entry
const PhoneNumberStep = ({ formData, setFormData, onNext, onBack }) => {
  const [phoneError, setPhoneError] = useState('');

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 6) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 3) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }
    
    return formatted;
  };

  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phoneNumber: formatted });
    
    if (formatted && !validatePhoneNumber(formatted)) {
      setPhoneError('Please enter a valid 10-digit phone number');
    } else {
      setPhoneError('');
    }
  };

  const canProceed = formData.phoneNumber && validatePhoneNumber(formData.phoneNumber) && !phoneError;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#5B3A9B]/20 rounded-full flex items-center justify-center">
            <Phone className="w-8 h-8 text-[#5B3A9B]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Add your phone number
        </h2>
        <p className="text-white/80">
          Phone verification is optional - you can verify later in settings
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Phone number
          </label>
          <div className="relative">
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
                text-white placeholder-white/60 transition-all"
              placeholder="(555) 123-4567"
              required
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">+1</span>
          </div>
          {phoneError && (
            <p className="mt-1 text-sm text-red-300">{phoneError}</p>
          )}
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-sm text-white/80">
            🔒 Your phone number will be used for:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            <li>• Account security and recovery</li>
            <li>• Important account notifications</li>
            <li>• Future verification (when you're ready)</li>
          </ul>
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

// Step 6: Onboarding Questions
const OnboardingStep = ({ formData, setFormData, onNext, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const questions = [
    {
      id: 'experience',
      title: 'What\'s your sports betting experience?',
      icon: <TrendingUp className="w-8 h-8" />,
      multiple: false,
      options: [
        { value: 'beginner', label: 'Beginner', desc: 'New to sports betting' },
        { value: 'casual', label: 'Casual', desc: 'Bet occasionally for fun' },
        { value: 'regular', label: 'Regular', desc: 'Bet weekly or more' },
        { value: 'professional', label: 'Professional', desc: 'Take it very seriously' }
      ]
    },
    {
      id: 'platforms',
      title: 'Which apps do you use?',
      icon: <Gamepad2 className="w-8 h-8" />,
      multiple: true,
      options: [
        { value: 'draftkings', label: 'DraftKings' },
        { value: 'fanduel', label: 'FanDuel' },
        { value: 'betmgm', label: 'BetMGM' },
        { value: 'caesars', label: 'Caesars' },
        { value: 'pointsbet', label: 'PointsBet' },
        { value: 'prizepicks', label: 'PrizePicks' },
        { value: 'underdog', label: 'Underdog Fantasy' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'sports',
      title: 'What sports do you bet on?',
      icon: <Target className="w-8 h-8" />,
      multiple: true,
      options: [
        { value: 'nfl', label: 'NFL Football' },
        { value: 'nba', label: 'NBA Basketball' },
        { value: 'mlb', label: 'MLB Baseball' },
        { value: 'nhl', label: 'NHL Hockey' },
        { value: 'ncaaf', label: 'College Football' },
        { value: 'ncaab', label: 'College Basketball' },
        { value: 'soccer', label: 'Soccer' },
        { value: 'other', label: 'Other Sports' }
      ]
    },
    {
      id: 'goals',
      title: 'What\'s your main goal?',
      icon: <Target className="w-8 h-8" />,
      multiple: false,
      options: [
        { value: 'fun', label: 'Have fun', desc: 'Entertainment and social' },
        { value: 'profit', label: 'Make profit', desc: 'Consistent winnings' },
        { value: 'bonuses', label: 'Maximize bonuses', desc: 'Get the most value' },
        { value: 'learn', label: 'Learn and improve', desc: 'Become a better bettor' }
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

// Step 7: Connect Accounts (Optional)
const ConnectAccountsStep = ({ formData, setFormData, onComplete, onBack }) => {
  const [connectedAccounts, setConnectedAccounts] = useState([]);

  const accounts = [
    { id: 'venmo', name: 'Venmo', icon: '💰', bonus: 1, placeholder: '@username' },
    { id: 'sleeper', name: 'Sleeper', icon: '🏈', bonus: 1, placeholder: 'Sleeper username' },
    { id: 'espn', name: 'ESPN Fantasy', icon: '📊', bonus: 1, placeholder: 'ESPN username' },
    { id: 'instagram', name: 'Instagram', icon: '📸', bonus: 1, placeholder: '@handle' }
  ];

  const totalBonus = connectedAccounts.length + 25; // Base $25 + $1 per connection

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
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent 
                text-white placeholder-white/60 transition-all"
              placeholder={account.placeholder}
            />
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-white/20 text-white rounded-lg font-medium transition-all duration-200 hover:bg-white/30"
        >
          Back
        </button>
        <button
          onClick={() => {
            onComplete();
            // Navigate to dashboard after completion
            onComplete();
          }}
          className="flex-1 px-6 py-3 bg-[#5B3A9B] hover:bg-[#4A2F82] text-white rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
        >
          Complete & Start
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <p className="text-center text-sm text-white/60">
        You can skip this step and connect accounts later
      </p>
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
const SignUpFormSupabase = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { validateSignupStep1, completeSignup, sendVerificationCode, verifyPhone, updateUserData, currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [referralCode, setReferralCode] = useState('');
  const [referralBonus, setReferralBonus] = useState(false);
  const [referralCodeInfo, setReferralCodeInfo] = useState(null);
  
  // Check for referral code and invite in URL on mount
  useEffect(() => {
    const ref = searchParams.get('ref');
    const invite = searchParams.get('invite');
    
    if (ref) {
      setReferralCode(ref);
      setReferralBonus(true);
      
      // Get code information
      const fetchCodeInfo = async () => {
        const codeData = await enhancedReferralService.getReferralCode(ref);
        if (codeData) {
          setReferralCodeInfo(codeData);
        }
      };
      fetchCodeInfo();
    }
    
    // Check for invite code in URL or redirect params
    if (invite || searchParams.get('redirect')?.includes('/invite/')) {
      // Store invite info for later
      const inviteCode = invite || searchParams.get('redirect')?.split('/invite/')[1];
      if (inviteCode) {
        // We'll handle this after signup completes
        console.log('Signup initiated from invite:', inviteCode);
      }
    }
  }, [searchParams]);
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    username: '',
    pin: null,
    phoneNumber: '',
    birthday: '',
    onboarding: {},
    venmo: '',
    sleeper: '',
    espn: '',
    instagram: '',
    agreements: {
      ageVerified: false,
      notificationsEnabled: false,
      sideBetWaitlist: false,
      dwollaTermsAccepted: false
    }
  });

  const steps = [
    { component: EmailNameStep, title: 'Basic Info' },
    { component: UsernameStep, title: 'Username' },
    { component: PasswordAgreementsStep, title: 'Password' },
    { component: PINSetupStep, title: 'Quick Access PIN' },
    { component: PhoneNumberStep, title: 'Phone Number' },
    { component: OnboardingStep, title: 'Tell us about yourself' },
    { component: ConnectAccountsStep, title: 'Connect Accounts' }
  ];

  const handleNext = async () => {
    setErrors({});
    
    if (currentStep === 0) {
      // Validate email availability
      setLoading(true);
      try {
        await validateSignupStep1(formData.email, formData.password || 'TempPassword123!');
        setCurrentStep(currentStep + 1);
      } catch (error) {
        // Provide user-friendly error messages
        let userError = error.message;
        if (error.message?.includes('already registered')) {
          userError = 'This email is already registered. Please log in or use a different email.';
        } else if (error.message?.includes('invalid email')) {
          userError = 'Please enter a valid email address.';
        }
        setErrors({ email: userError });
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 1 || currentStep === 2 || currentStep === 3 || currentStep === 4 || currentStep === 5) {
      // Username, Password/Agreements, PIN, Phone, and Onboarding steps - just move to next
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 6) {
      // Phone number step - create account and complete signup
      setLoading(true);
      try {
        // Create the user account
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username.startsWith('#') ? formData.username : `#${formData.username}`,
          phoneNumber: formData.phoneNumber.replace(/\D/g, ''), // Clean phone number
          pin: formData.pin, // Include PIN
          notificationPreferences: {
            email: formData.agreements.notificationsEnabled,
            inApp: formData.agreements.notificationsEnabled,
            sms: false // Can be updated later
          }
        };
        
        const { user } = await completeSignup(userData);
        
        // TODO: Add to SideBet waitlist if formData.agreements.sideBetWaitlist is true
        
        // Continue to onboarding questions
        setCurrentStep(currentStep + 1);
      } catch (error) {
        // Provide user-friendly error messages
        let userError = 'Failed to create account. Please try again.';
        if (error.message?.includes('already exists')) {
          userError = 'An account with this information already exists.';
        } else if (error.message?.includes('network')) {
          userError = 'Network error. Please check your connection and try again.';
        } else if (error.message?.includes('Too many requests')) {
          userError = 'Too many attempts. Please wait a few minutes and try again.';
        }
        setErrors({ general: userError });
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePhoneVerified = async (code) => {
    const cleanPhone = `+1${formData.phoneNumber.replace(/\D/g, '')}`;
    await verifyPhone(cleanPhone, code);
    // Navigate to wallet or next steps
    navigate('/wallet');
  };

  const handleResendCode = async () => {
    const cleanPhone = `+1${formData.phoneNumber.replace(/\D/g, '')}`;
    await sendVerificationCode(cleanPhone);
  };

  const handleSkipVerification = () => {
    // Skip phone verification and go to wallet
    navigate('/wallet');
  };

  const handleComplete = async () => {
    // Save onboarding data and social accounts
    try {
      setLoading(true);
      
      // Update user profile with onboarding data
      if (currentUser?.id) {
        await updateUserData(currentUser.id, {
          onboarding_data: formData.onboarding,
          venmo_username: formData.venmo,
          sleeper_username: formData.sleeper,
          espn_username: formData.espn,
          instagram_username: formData.instagram
        });
        
        // Apply referral code if present
        if (referralCode) {
          // Use enhanced referral service for better code type handling
          const result = await enhancedReferralService.applyReferralCode(
            currentUser.id, 
            referralCode,
            window.location.hostname, // IP will be captured server-side
            navigator.userAgent
          );
          
          if (result.success) {
            console.log(`Applied ${result.code_type} code: ${referralCode}${result.is_permanent ? ' (permanent)' : ''}`);
          } else {
            console.error('Failed to apply referral code:', result.message);
          }
        }
        
        // Check for pending group invite
        const pendingInvite = localStorage.getItem('pendingInvite');
        if (pendingInvite) {
          try {
            const inviteData = JSON.parse(pendingInvite);
            // Check if invite is still recent (within 24 hours)
            if (inviteData.timestamp && Date.now() - inviteData.timestamp < 24 * 60 * 60 * 1000) {
              // Clear the pending invite
              localStorage.removeItem('pendingInvite');
              // Navigate to the invite page to complete joining
              navigate(`/invite/${inviteData.inviteCode}`);
              return;
            }
          } catch (e) {
            console.error('Error parsing pending invite:', e);
            localStorage.removeItem('pendingInvite');
          }
        }
      }
      
      // Navigate to wallet if no pending invite
      navigate('/wallet');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      // Navigate anyway
      navigate('/wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoData) => {
    setFormData(demoData);
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Demo Mode Button - Only in development */}
      <DemoModeButton onFillDemo={handleDemoFill} />
      
      {/* Casino Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/images/casino-background.jpg)',
          filter: 'brightness(0.3) blur(2px)'
        }}
      ></div>
      
      {/* Dark Overlay for better readability */}
      <div className="fixed inset-0 bg-black/50"></div>
      
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
            {/* Referral Bonus Banner */}
            {referralBonus && (
              <div className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <p className="font-semibold">
                      {referralCodeInfo?.code_type === 'affiliate' ? 'Exclusive Partner Offer!' :
                       referralCodeInfo?.code_type === 'promotional' ? 'Special Promotion!' :
                       'Special Referral Bonus!'}
                    </p>
                    <p className="text-sm opacity-90">
                      {referralCodeInfo?.description || 
                       (referralCodeInfo?.fixed_bonus > 0 ? `You'll get an extra $${referralCodeInfo.fixed_bonus} bonus when you sign up` :
                        'Exclusive benefits applied to your account')}
                    </p>
                  </div>
                </div>
                {referralCodeInfo?.fixed_bonus > 0 && (
                  <div className="text-white font-bold text-lg">+${referralCodeInfo.fixed_bonus}</div>
                )}
              </div>
            )}

            {/* Progress Indicator */}
            <ProgressIndicator currentStep={currentStep} totalSteps={steps.length} />

            {/* Card Container */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
              <CurrentStepComponent
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                onNext={handleNext}
                onBack={handleBack}
                onComplete={handleComplete}
                onPhoneVerified={handlePhoneVerified}
                onResendCode={handleResendCode}
                onSkip={handleSkipVerification}
              />
            </div>

            {/* Error Display */}
            {errors.general && (
              <div className="mt-4 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm text-center">{errors.general}</p>
              </div>
            )}

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl z-50">
                <div className="flex flex-col items-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  <p className="text-white text-sm">Creating your account...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-sm text-white/60">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-white/80 hover:text-white underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-white/80 hover:text-white underline">Privacy Policy</a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default SignUpFormSupabase;