import { supabase } from './config';
import bcrypt from 'bcryptjs';

/**
 * PIN Authentication Service
 * Handles PIN creation, verification, and trusted device management
 */

// PIN Management
export const pinAuthService = {
  // Create or update user PIN
  async setupPIN(userId, pin) {
    try {
      // Validate PIN
      if (!/^\d{4}$/.test(pin)) {
        throw new Error('PIN must be exactly 4 digits');
      }

      // Generate salt and hash PIN
      const salt = await bcrypt.genSalt(10);
      const pinHash = await bcrypt.hash(pin, salt);

      // Check if user already has a PIN
      const { data: existingPin } = await supabase
        .from('user_pins')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingPin) {
        // Update existing PIN
        const { error } = await supabase
          .from('user_pins')
          .update({
            pin_hash: pinHash,
            salt: salt,
            failed_attempts: 0,
            locked_until: null,
            pin_set_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) throw error;

        // Log the action
        await this.logAction(userId, 'pin_changed', { success: true });
      } else {
        // Create new PIN
        const { error } = await supabase
          .from('user_pins')
          .insert({
            user_id: userId,
            pin_hash: pinHash,
            salt: salt
          });

        if (error) throw error;

        // Log the action
        await this.logAction(userId, 'pin_created', { success: true });
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting up PIN:', error);
      throw error;
    }
  },

  // Verify PIN
  async verifyPIN(userId, pin, deviceId = null) {
    try {
      // Get user's PIN data
      const { data: userPin, error } = await supabase
        .from('user_pins')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !userPin) {
        throw new Error('PIN not set up');
      }

      // Check if account is locked
      if (userPin.locked_until && new Date(userPin.locked_until) > new Date()) {
        const minutesLeft = Math.ceil((new Date(userPin.locked_until) - new Date()) / 60000);
        throw new Error(`Account locked. Try again in ${minutesLeft} minutes`);
      }

      // Verify PIN
      const isValid = await bcrypt.compare(pin, userPin.pin_hash);

      if (isValid) {
        // Reset failed attempts
        await supabase
          .from('user_pins')
          .update({
            failed_attempts: 0,
            locked_until: null,
            last_attempt_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        // Log successful attempt
        await this.logPINAttempt(userId, deviceId, 'success');
        await this.logAction(userId, 'pin_login_success', { deviceId });

        return { success: true };
      } else {
        // Increment failed attempts
        const newFailedAttempts = userPin.failed_attempts + 1;
        const updates = {
          failed_attempts: newFailedAttempts,
          last_attempt_at: new Date().toISOString()
        };

        // Lock account after 3 failed attempts
        if (newFailedAttempts >= 3) {
          updates.locked_until = new Date(Date.now() + 15 * 60000).toISOString(); // 15 minutes
          await this.logPINAttempt(userId, deviceId, 'locked');
        }

        await supabase
          .from('user_pins')
          .update(updates)
          .eq('user_id', userId);

        // Log failed attempt
        await this.logPINAttempt(userId, deviceId, 'failure');
        await this.logAction(userId, 'pin_login_failed', { 
          deviceId, 
          attempts: newFailedAttempts 
        });

        throw new Error(`Invalid PIN. ${3 - newFailedAttempts} attempts remaining`);
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      throw error;
    }
  },

  // Check if user has PIN set up
  async hasPIN(userId) {
    try {
      const { data, error } = await supabase
        .from('user_pins')
        .select('id')
        .eq('user_id', userId)
        .single();

      return !!data && !error;
    } catch (error) {
      console.error('Error checking PIN status:', error);
      return false;
    }
  },

  // Remove PIN
  async removePIN(userId) {
    try {
      const { error } = await supabase
        .from('user_pins')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      await this.logAction(userId, 'pin_removed', { success: true });
      return { success: true };
    } catch (error) {
      console.error('Error removing PIN:', error);
      throw error;
    }
  },

  // Log PIN attempt
  async logPINAttempt(userId, deviceId, attemptType) {
    try {
      await supabase
        .from('pin_attempt_logs')
        .insert({
          user_id: userId,
          device_id: deviceId,
          attempt_type: attemptType,
          ip_address: await this.getIPAddress(),
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error logging PIN attempt:', error);
    }
  },

  // Log action to audit log
  async logAction(userId, action, details) {
    try {
      await supabase
        .from('user_audit_log')
        .insert({
          user_id: userId,
          action: action,
          details: details
        });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  },

  // Get IP address (simplified - in production use a proper service)
  async getIPAddress() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }
};

// Trusted Device Management
export const trustedDeviceService = {
  // Add trusted device
  async trustDevice(userId, deviceInfo) {
    try {
      const { error } = await supabase
        .from('trusted_devices')
        .insert({
          user_id: userId,
          device_id: deviceInfo.deviceId,
          device_name: deviceInfo.deviceName,
          device_type: deviceInfo.deviceType,
          browser_name: deviceInfo.browserName,
          os_name: deviceInfo.osName,
          device_fingerprint: deviceInfo.fingerprint,
          ip_address: await pinAuthService.getIPAddress()
        });

      if (error) {
        // If device already exists, update it
        if (error.code === '23505') { // Unique constraint violation
          const { error: updateError } = await supabase
            .from('trusted_devices')
            .update({
              device_name: deviceInfo.deviceName,
              device_fingerprint: deviceInfo.fingerprint,
              last_used_at: new Date().toISOString(),
              is_active: true,
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            })
            .eq('user_id', userId)
            .eq('device_id', deviceInfo.deviceId);

          if (updateError) throw updateError;
        } else {
          throw error;
        }
      }

      await pinAuthService.logAction(userId, 'device_trusted', { 
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName 
      });

      return { success: true };
    } catch (error) {
      console.error('Error trusting device:', error);
      throw error;
    }
  },

  // Check if device is trusted
  async isDeviceTrusted(userId, deviceId) {
    try {
      const { data, error } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('user_id', userId)
        .eq('device_id', deviceId)
        .eq('is_active', true)
        .single();

      if (error || !data) return false;

      // Check if device has expired
      if (new Date(data.expires_at) < new Date()) {
        return false;
      }

      // Update last used timestamp
      await supabase
        .from('trusted_devices')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', data.id);

      return true;
    } catch (error) {
      console.error('Error checking trusted device:', error);
      return false;
    }
  },

  // Get user's trusted devices
  async getTrustedDevices(userId) {
    try {
      const { data, error } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_used_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting trusted devices:', error);
      throw error;
    }
  },

  // Remove trusted device
  async removeTrustedDevice(userId, deviceId) {
    try {
      const { error } = await supabase
        .from('trusted_devices')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('device_id', deviceId);

      if (error) throw error;

      await pinAuthService.logAction(userId, 'device_removed', { deviceId });

      return { success: true };
    } catch (error) {
      console.error('Error removing trusted device:', error);
      throw error;
    }
  },

  // Remove all trusted devices
  async removeAllTrustedDevices(userId) {
    try {
      const { error } = await supabase
        .from('trusted_devices')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) throw error;

      await pinAuthService.logAction(userId, 'all_devices_removed', { success: true });

      return { success: true };
    } catch (error) {
      console.error('Error removing all trusted devices:', error);
      throw error;
    }
  }
};