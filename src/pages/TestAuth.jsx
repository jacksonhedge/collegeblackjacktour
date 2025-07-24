import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { trustedDeviceService, pinAuthService } from '../services/supabase/pinAuth';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
import { supabase } from '../services/supabase/config';
import { toast } from 'react-hot-toast';
import { Shield, Smartphone, Key, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';

const TestAuth = () => {
  const { currentUser } = useAuth();
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [hasPIN, setHasPIN] = useState(false);
  const [isCurrentDeviceTrusted, setIsCurrentDeviceTrusted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthInfo();
  }, [currentUser]);

  const loadAuthInfo = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get device info
      const info = getDeviceFingerprint();
      setDeviceInfo(info);

      // Check if current device is trusted
      const isTrusted = await trustedDeviceService.isDeviceTrusted(currentUser.id, info.deviceId);
      setIsCurrentDeviceTrusted(isTrusted);

      // Check if user has PIN
      const userHasPIN = await pinAuthService.hasPIN(currentUser.id);
      setHasPIN(userHasPIN);

      // Get all trusted devices
      const { data: devices } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_active', true);

      setTrustedDevices(devices || []);
    } catch (error) {
      console.error('Error loading auth info:', error);
      toast.error('Failed to load authentication info');
    } finally {
      setLoading(false);
    }
  };

  const trustCurrentDevice = async () => {
    try {
      const result = await trustedDeviceService.trustDevice(currentUser.id, deviceInfo);
      if (result) {
        toast.success('Device trusted successfully!');
        await loadAuthInfo();
      }
    } catch (error) {
      console.error('Error trusting device:', error);
      toast.error('Failed to trust device');
    }
  };

  const removeTrustedDevice = async (deviceId) => {
    try {
      const { error } = await supabase
        .from('trusted_devices')
        .update({ is_active: false })
        .eq('device_id', deviceId)
        .eq('user_id', currentUser.id);

      if (!error) {
        toast.success('Device removed');
        await loadAuthInfo();
      }
    } catch (error) {
      console.error('Error removing device:', error);
      toast.error('Failed to remove device');
    }
  };

  const clearPIN = async () => {
    try {
      const { error } = await supabase
        .from('user_pins')
        .delete()
        .eq('user_id', currentUser.id);

      if (!error) {
        toast.success('PIN cleared');
        await loadAuthInfo();
      }
    } catch (error) {
      console.error('Error clearing PIN:', error);
      toast.error('Failed to clear PIN');
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-300">Please log in to test authentication features</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-8">Authentication Testing</h1>

      {/* Current User Info */}
      <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Current User</h2>
        <div className="space-y-2 text-gray-300">
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>User ID:</strong> {currentUser.id}</p>
          <p className="flex items-center gap-2">
            <strong>Has PIN:</strong> 
            {hasPIN ? (
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-4 h-4" /> Yes
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400">
                <XCircle className="w-4 h-4" /> No
              </span>
            )}
          </p>
        </div>
        <div className="mt-4 flex gap-3">
          {!hasPIN ? (
            <Button
              onClick={() => window.location.href = '/setup-pin'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Key className="w-4 h-4 mr-2" />
              Set Up PIN
            </Button>
          ) : (
            <Button
              onClick={clearPIN}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500/10"
            >
              Clear PIN
            </Button>
          )}
        </div>
      </div>

      {/* Current Device Info */}
      <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Current Device</h2>
        {deviceInfo && (
          <div className="space-y-2 text-gray-300">
            <p><strong>Device ID:</strong> <code className="text-xs">{deviceInfo.deviceId}</code></p>
            <p><strong>Device Name:</strong> {deviceInfo.deviceName}</p>
            <p><strong>Device Type:</strong> {deviceInfo.deviceType}</p>
            <p><strong>Browser:</strong> {deviceInfo.browserName}</p>
            <p><strong>OS:</strong> {deviceInfo.osName}</p>
            <p className="flex items-center gap-2">
              <strong>Trusted:</strong> 
              {isCurrentDeviceTrusted ? (
                <span className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-4 h-4" /> Yes
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-400">
                  <XCircle className="w-4 h-4" /> No
                </span>
              )}
            </p>
          </div>
        )}
        {!isCurrentDeviceTrusted && (
          <Button
            onClick={trustCurrentDevice}
            className="mt-4 bg-purple-600 hover:bg-purple-700"
          >
            <Shield className="w-4 h-4 mr-2" />
            Trust This Device
          </Button>
        )}
      </div>

      {/* Trusted Devices */}
      <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Trusted Devices</h2>
        {trustedDevices.length === 0 ? (
          <p className="text-gray-400">No trusted devices</p>
        ) : (
          <div className="space-y-3">
            {trustedDevices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">{device.device_name}</p>
                    <p className="text-sm text-gray-400">
                      Added: {new Date(device.created_at).toLocaleDateString()}
                    </p>
                    {device.device_id === deviceInfo?.deviceId && (
                      <p className="text-xs text-purple-400 mt-1">This device</p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => removeTrustedDevice(device.device_id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Testing Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-3">Testing PIN Login</h3>
        <ol className="space-y-2 text-blue-200 list-decimal list-inside">
          <li>Set up a PIN if you haven't already</li>
          <li>Trust this device</li>
          <li>Log out and log back in</li>
          <li>After entering your email, you should see the PIN login option</li>
          <li>Enter your 4-digit PIN to log in quickly</li>
        </ol>
        
        <div className="mt-4 p-3 bg-blue-900/30 rounded">
          <p className="text-sm text-blue-200">
            <strong>Note:</strong> PIN login only appears on trusted devices where you've previously logged in with your password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;