import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, RefreshCw } from 'lucide-react';

const PhoneVerificationStep = ({ phoneNumber, onVerified, onBack, onResend, onSkip }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  // Handle input change
  const handleChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(''); // Clear error on input

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newCode.every(digit => digit) && newCode.join('').length === 6) {
      handleVerify(newCode.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(newCode);
    
    // Focus last input or next empty input
    const nextEmptyIndex = newCode.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if complete
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  // Handle verification
  const handleVerify = async (verificationCode) => {
    setLoading(true);
    setError('');
    
    try {
      await onVerified(verificationCode);
    } catch (error) {
      setError(error.message || 'Invalid verification code');
      // Clear code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Handle resend
  const handleResend = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(60);
    setError('');
    
    try {
      await onResend();
      // Success message could be shown here
    } catch (error) {
      setError(error.message || 'Failed to resend code');
    }
  };

  // Resend timer
  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#5B3A9B]/20 rounded-full flex items-center justify-center">
            <Phone className="w-8 h-8 text-[#5B3A9B]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Verify your phone number
        </h2>
        <p className="text-white/80">
          We sent a 6-digit code to
        </p>
        <p className="text-white font-medium mt-1">
          {formatPhoneNumber(phoneNumber)}
        </p>
      </div>

      {/* Code Input */}
      <div>
        <label className="block text-sm font-medium text-white/90 mb-3 text-center">
          Enter verification code
        </label>
        <div className="flex gap-2 justify-center">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              pattern="[0-9]"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={loading}
              className={`
                w-12 h-14 text-center text-xl font-semibold
                bg-white/20 backdrop-blur-sm border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-[#5B3A9B] focus:border-transparent
                text-white placeholder-white/40 transition-all
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                ${error ? 'border-red-400' : 'border-white/30'}
              `}
              placeholder="·"
            />
          ))}
        </div>
        
        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm text-red-300 text-center">
            {error}
          </p>
        )}
      </div>

      {/* Resend Code */}
      <div className="text-center">
        <p className="text-white/70 text-sm">
          Didn't receive a code?{' '}
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-white font-medium hover:underline transition-all inline-flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Resend code
            </button>
          ) : (
            <span className="text-white/50">
              Resend in {resendTimer}s
            </span>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-white/20 text-white rounded-lg font-medium 
            transition-all duration-200 hover:bg-white/30 disabled:opacity-50 
            disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={() => handleVerify(code.join(''))}
          disabled={loading || code.some(digit => !digit)}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200
            ${code.every(digit => digit) && !loading
              ? 'bg-[#5B3A9B] hover:bg-[#4A2F82] text-white shadow-lg' 
              : 'bg-white/20 text-white/50 cursor-not-allowed'
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></span>
              Verifying...
            </span>
          ) : (
            'Verify'
          )}
        </button>
      </div>

      {/* Skip option */}
      <div className="text-center">
        <button
          onClick={onSkip}
          className="text-white/70 hover:text-white text-sm underline transition-colors"
        >
          Skip for now (you can verify later)
        </button>
      </div>

      {/* Help text */}
      <p className="text-center text-white/60 text-xs">
        By verifying your phone number, you agree to receive SMS messages from Bankroll.
        Message and data rates may apply.
      </p>
    </div>
  );
};

export default PhoneVerificationStep;