import React, { useState, useRef, useEffect } from 'react';
import { Shield, Check, AlertCircle, Smartphone } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { pinAuthService, trustedDeviceService } from '../../services/supabase/pinAuth';
import { getDeviceFingerprint, getDeviceName } from '../../utils/deviceFingerprint';

const PINSetup = ({ onComplete, onSkip }) => {
  const { currentUser } = useAuth();
  const [pin, setPin] = useState(['', '', '', '']);
  const [step, setStep] = useState('create'); // 'create', 'trust-device'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [trustDevice, setTrustDevice] = useState(true);
  const [deviceName, setDeviceName] = useState(getDeviceName());
  
  const pinRefs = useRef([]);

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
      
      // Focus on next empty field or last field
      const nextEmptyIndex = newPin.findIndex((digit, i) => i >= index && !digit);
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 3;
      pinRefs.current[focusIndex]?.focus();
    } else if (/^\d$/.test(value)) {
      // Single digit input
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      
      // Auto-focus next field
      if (index < 3) {
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
    
    if (digits.length > 0) {
      const newPin = digits.padEnd(4, '').split('').slice(0, 4);
      setPin(newPin);
      
      // Focus on the last filled digit or last field
      const lastFilledIndex = newPin.findLastIndex(digit => digit !== '');
      pinRefs.current[Math.min(lastFilledIndex + 1, 3)]?.focus();
    }
  };

  // Create PIN
  const handleCreatePIN = async () => {
    const pinString = pin.join('');

    if (pinString.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await pinAuthService.setupPIN(currentUser.id, pinString);
      setStep('trust-device');
    } catch (error) {
      setError(error.message || 'Failed to set up PIN');
    } finally {
      setLoading(false);
    }
  };

  // Handle device trust
  const handleDeviceTrust = async () => {
    if (!trustDevice) {
      onComplete();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const deviceInfo = getDeviceFingerprint();
      deviceInfo.deviceName = deviceName;
      
      await trustedDeviceService.trustDevice(currentUser.id, deviceInfo);
      onComplete();
    } catch (error) {
      setError(error.message || 'Failed to trust device');
      setLoading(false);
    }
  };

  // Check if PIN is complete
  const isPinComplete = (pinArray) => pinArray.filter(d => d).length >= 4;

  return (
    <div className="max-w-md mx-auto">
      {step === 'create' ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create Your PIN
            </h2>
            <p className="mt-2 text-gray-600">
              Set up a quick PIN for easy access on trusted devices
            </p>
          </div>

          {/* PIN Input */}
          <div>
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
                  onPaste={(e) => handlePaste(e)}
                  className={`w-12 h-14 text-center text-2xl font-semibold border-2 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                    transition-all ${
                      digit ? 'border-purple-600 bg-purple-50' : 'border-gray-300 bg-white'
                    }`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="text-sm text-gray-600 space-y-1">
              <p>• Use 4 digits for your PIN</p>
              <p>• Don't use easily guessable numbers (1234, 0000, etc.)</p>
              <p>• You'll use this to quickly sign in on trusted devices</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg 
                hover:bg-gray-50 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleCreatePIN}
              disabled={!isPinComplete(pin) || loading}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all
                ${isPinComplete(pin) && !loading
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              {loading ? 'Setting up...' : 'Create PIN'}
            </button>
          </div>
        </div>
      ) : (
        // Trust device step
        <div className="space-y-6">
          {/* Success Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">PIN Created Successfully!</h2>
            <p className="mt-2 text-gray-600">
              Would you like to trust this device for quick PIN access?
            </p>
          </div>

          {/* Device Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                  focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Device name"
              />
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded 
                  focus:ring-purple-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700">
                Trust this device for 30 days
              </span>
            </label>

            <p className="mt-3 text-xs text-gray-500">
              Trusted devices can use PIN instead of password. You can manage trusted devices in settings.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <button
            onClick={handleDeviceTrust}
            disabled={loading}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all
              ${!loading
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            {loading ? 'Saving...' : trustDevice ? 'Trust Device & Continue' : 'Continue Without Trusting'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PINSetup;