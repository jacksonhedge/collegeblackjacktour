import React, { useState, useRef, useEffect } from 'react';
import { Shield, AlertCircle, Smartphone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pinAuthService, trustedDeviceService } from '../../services/supabase/pinAuth';
import { getDeviceFingerprint } from '../../utils/deviceFingerprint';
import { supabase } from '../../services/supabase/config';

const PINLogin = ({ email, onBack, onSuccess, onPasswordLogin }) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [deviceInfo, setDeviceInfo] = useState(null);
  
  const pinRefs = useRef([]);

  useEffect(() => {
    // Get device info on mount
    const info = getDeviceFingerprint();
    setDeviceInfo(info);
  }, []);

  // Handle PIN input
  const handlePinChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 4).split('');
      const newPin = [...pin];
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newPin[index + i] = digit;
        }
      });
      setPin(newPin);
      
      // Check if PIN is complete
      if (newPin.filter(d => d).length >= 4) {
        handlePinSubmit(newPin);
      } else {
        // Focus on next empty field
        const nextEmptyIndex = newPin.findIndex((digit, i) => i >= index && !digit);
        const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 3;
        pinRefs.current[focusIndex]?.focus();
      }
    } else if (/^\d$/.test(value)) {
      // Single digit input
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      
      // Check if PIN is complete (at least 4 digits)
      const filledDigits = newPin.filter(d => d).length;
      if (filledDigits >= 4 && index === filledDigits - 1) {
        handlePinSubmit(newPin);
      } else if (index < 3) {
        // Auto-focus next field
        pinRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
      const newPin = [...pin];
      newPin[index - 1] = '';
      setPin(newPin);
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 4);
    
    if (digits.length >= 4) {
      const newPin = digits.padEnd(4, '').split('').slice(0, 4);
      setPin(newPin);
      handlePinSubmit(newPin);
    }
  };

  // Submit PIN
  const handlePinSubmit = async (pinToSubmit = pin) => {
    const pinString = pinToSubmit.join('').slice(0, 4);
    
    if (pinString.length < 4) {
      setError('Please enter at least 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, get the user ID from email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      // Verify PIN
      const pinVerified = await pinAuthService.verifyPIN(userData.id, pinString, deviceInfo?.deviceId);
      
      if (pinVerified) {
        // PIN is correct, call the success callback
        // The parent component should handle the actual login
        onSuccess(userData.id);
      } else {
        throw new Error('Invalid PIN');
      }
    } catch (error) {
      console.error('PIN login error:', error);
      setError(error.message || 'Invalid PIN');
      setAttempts(prev => prev + 1);
      
      // Clear PIN on error
      setPin(['', '', '', '']);
      pinRefs.current[0]?.focus();
      
      // Shake animation
      const container = document.getElementById('pin-container');
      if (container) {
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 500);
      }

      // Force password login after 3 attempts
      if (attempts >= 2) {
        setTimeout(() => {
          onPasswordLogin();
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
        <p className="mt-2 text-gray-600">Enter your PIN to continue</p>
        {email && (
          <p className="mt-1 text-sm text-gray-500">{email}</p>
        )}
      </div>

      {/* Device info */}
      {deviceInfo && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Smartphone className="w-4 h-4" />
          <span>{deviceInfo.deviceName}</span>
        </div>
      )}

      {/* PIN Input */}
      <div id="pin-container" className="pin-container">
        <div className="flex justify-center gap-2 mb-4">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={el => pinRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength="1"
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={loading}
              className={`w-12 h-14 text-center text-2xl font-semibold border-2 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                transition-all ${
                  digit ? 'border-purple-600 bg-purple-50' : 'border-gray-300 bg-white'
                } ${loading ? 'opacity-50' : ''}`}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {attempts > 0 && attempts < 3 && (
          <p className="text-center text-sm text-gray-600">
            {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={onPasswordLogin}
          className="w-full text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          Use password instead
        </button>

        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-700 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Use a different account
        </button>
      </div>

      <style jsx>{`
        .shake {
          animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default PINLogin;