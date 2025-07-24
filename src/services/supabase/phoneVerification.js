import { supabase } from './config';

/**
 * Send a verification code to a phone number
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +14125551234)
 * @param {string} userId - The user's ID
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const sendVerificationCode = async (phoneNumber, userId) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-verification-code', {
      body: { phoneNumber, userId }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending verification code:', error);
    return {
      success: false,
      error: error.message || 'Failed to send verification code'
    };
  }
};

/**
 * Verify a phone number with a code
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} code - 6-digit verification code
 * @param {string} userId - The user's ID
 * @returns {Promise<{success: boolean, message?: string, data?: object, error?: string}>}
 */
export const verifyPhoneNumber = async (phoneNumber, code, userId) => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-phone', {
      body: { phoneNumber, code, userId }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error verifying phone:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify phone number'
    };
  }
};

/**
 * Check if a phone number is already verified for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<{verified: boolean, phoneNumber?: string}>}
 */
export const checkPhoneVerification = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('phone_numbers')
      .select('phone_number, verified')
      .eq('user_id', userId)
      .eq('verified', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return {
      verified: !!data,
      phoneNumber: data?.phone_number
    };
  } catch (error) {
    console.error('Error checking phone verification:', error);
    return { verified: false };
  }
};

/**
 * Get all phone numbers for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>}
 */
export const getUserPhoneNumbers = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    return [];
  }
};

/**
 * Set a phone number as primary
 * @param {string} userId - The user's ID
 * @param {string} phoneNumberId - The phone number record ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const setPrimaryPhoneNumber = async (userId, phoneNumberId) => {
  try {
    // First, unset all other phone numbers as primary
    await supabase
      .from('phone_numbers')
      .update({ is_primary: false })
      .eq('user_id', userId);

    // Then set the selected one as primary
    const { error } = await supabase
      .from('phone_numbers')
      .update({ is_primary: true })
      .eq('id', phoneNumberId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error setting primary phone:', error);
    return {
      success: false,
      error: error.message || 'Failed to set primary phone number'
    };
  }
};

/**
 * Delete a phone number
 * @param {string} userId - The user's ID
 * @param {string} phoneNumberId - The phone number record ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deletePhoneNumber = async (userId, phoneNumberId) => {
  try {
    const { error } = await supabase
      .from('phone_numbers')
      .delete()
      .eq('id', phoneNumberId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting phone number:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete phone number'
    };
  }
};