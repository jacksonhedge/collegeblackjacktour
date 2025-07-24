import React, { useState, useEffect } from 'react';
import { Shield, Edit3, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { pinAuthService } from '../../services/supabase/pinAuth';
import PINSetup from '../auth/PINSetup';

const PINManagement = () => {
  const { currentUser } = useAuth();
  const [hasPin, setHasPin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [removingPin, setRemovingPin] = useState(false);

  useEffect(() => {
    if (currentUser) {
      checkPinStatus();
    }
  }, [currentUser]);

  const checkPinStatus = async () => {
    try {
      const pinExists = await pinAuthService.hasPIN(currentUser.id);
      setHasPin(pinExists);
    } catch (error) {
      console.error('Error checking PIN status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePin = async () => {
    if (!window.confirm('Are you sure you want to remove your PIN? You won\'t be able to use quick PIN login on trusted devices.')) {
      return;
    }

    setRemovingPin(true);
    try {
      await pinAuthService.removePIN(currentUser.id);
      setHasPin(false);
    } catch (error) {
      console.error('Error removing PIN:', error);
      alert('Failed to remove PIN. Please try again.');
    } finally {
      setRemovingPin(false);
    }
  };

  const handlePinSetupComplete = () => {
    setShowPinSetup(false);
    checkPinStatus();
  };

  const handlePinSetupSkip = () => {
    setShowPinSetup(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (showPinSetup) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <PINSetup 
          onComplete={handlePinSetupComplete}
          onSkip={handlePinSetupSkip}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">PIN Security</h2>
            <p className="text-sm text-gray-600">
              Manage your quick access PIN for trusted devices
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {hasPin ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">PIN is active</p>
                  <p className="text-sm text-gray-600">
                    You can sign in quickly on trusted devices
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowPinSetup(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white 
                  rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Change PIN
              </button>
              
              <button
                onClick={handleRemovePin}
                disabled={removingPin}
                className={`flex items-center justify-center gap-2 px-4 py-2 border border-red-300 
                  text-red-600 rounded-lg hover:bg-red-50 transition-colors
                  ${removingPin ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {removingPin ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Remove PIN
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">PIN Security Tips</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Never share your PIN with anyone</li>
                <li>• Use a unique PIN that's not your birthday or common numbers</li>
                <li>• Change your PIN regularly for better security</li>
                <li>• Your PIN is encrypted and stored securely</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Set up a PIN for quick access
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create a PIN to sign in quickly on trusted devices without entering your password
            </p>
            <button
              onClick={() => setShowPinSetup(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white 
                rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Set Up PIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PINManagement;