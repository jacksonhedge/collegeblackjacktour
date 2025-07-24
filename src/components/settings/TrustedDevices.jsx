import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Tablet, Trash2, Shield, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { trustedDeviceService } from '../../services/supabase/pinAuth';
import { getDeviceFingerprint } from '../../utils/deviceFingerprint';

const TrustedDevices = () => {
  const { currentUser } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingDevice, setRemovingDevice] = useState(null);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadDevices();
      // Get current device ID
      const deviceInfo = getDeviceFingerprint();
      setCurrentDeviceId(deviceInfo.deviceId);
    }
  }, [currentUser]);

  const loadDevices = async () => {
    try {
      const trustedDevices = await trustedDeviceService.getTrustedDevices(currentUser.id);
      setDevices(trustedDevices);
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId) => {
    if (!window.confirm('Are you sure you want to remove this device? You\'ll need to enter your password next time you sign in from this device.')) {
      return;
    }

    setRemovingDevice(deviceId);
    try {
      await trustedDeviceService.removeTrustedDevice(currentUser.id, deviceId);
      await loadDevices();
    } catch (error) {
      console.error('Error removing device:', error);
      alert('Failed to remove device. Please try again.');
    } finally {
      setRemovingDevice(null);
    }
  };

  const handleRemoveAllDevices = async () => {
    if (!window.confirm('Are you sure you want to remove ALL trusted devices? You\'ll need to enter your password on all devices next time you sign in.')) {
      return;
    }

    setLoading(true);
    try {
      await trustedDeviceService.removeAllTrustedDevices(currentUser.id);
      await loadDevices();
    } catch (error) {
      console.error('Error removing all devices:', error);
      alert('Failed to remove devices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Trusted Devices</h2>
              <p className="text-sm text-gray-600">
                Manage devices that can use PIN for quick sign-in
              </p>
            </div>
          </div>
          
          {devices.length > 0 && (
            <button
              onClick={handleRemoveAllDevices}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Remove All
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {devices.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No trusted devices</p>
            <p className="text-sm text-gray-500 mt-1">
              Trust a device after signing in to enable PIN access
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className={`border rounded-lg p-4 ${
                  device.device_id === currentDeviceId
                    ? 'border-purple-200 bg-purple-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-gray-600 mt-1">
                      {getDeviceIcon(device.device_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {device.device_name}
                        </h3>
                        {device.device_id === currentDeviceId && (
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                            Current Device
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-1 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last used {formatDate(device.last_used_at)}
                          </span>
                          {device.ip_address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {device.ip_address}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Added {new Date(device.trusted_at).toLocaleDateString()} • 
                          Expires {new Date(device.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveDevice(device.device_id)}
                    disabled={removingDevice === device.device_id}
                    className={`text-gray-400 hover:text-red-600 transition-colors
                      ${removingDevice === device.device_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Remove device"
                  >
                    {removingDevice === device.device_id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-400"></div>
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">About Trusted Devices</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Trusted devices can sign in with your PIN instead of password</li>
            <li>• Devices are automatically removed after 30 days of inactivity</li>
            <li>• You can remove a device at any time from this page</li>
            <li>• We recommend only trusting your personal devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrustedDevices;