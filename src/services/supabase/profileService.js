import { supabase } from './config';
import { getRandomAvatar } from '../../data/defaultAvatars';

class ProfileService {
  /**
   * Initialize user profile with default avatar
   */
  async initializeUserProfile(userId) {
    try {
      // Check if user already has a profile
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingProfile) {
        return existingProfile;
      }

      // Assign random default avatar
      const defaultAvatar = getRandomAvatar();
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          avatar_id: defaultAvatar.id,
          avatar_type: 'default',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error initializing user profile:', error);
      throw error;
    }
  }

  /**
   * Upload custom profile picture
   */
  async uploadProfilePicture(userId, file) {
    try {
      // Validate file
      if (!file) throw new Error('No file provided');
      
      const fileExt = file.name.split('.').pop().toLowerCase();
      const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (!allowedTypes.includes(fileExt)) {
        throw new Error('Invalid file type. Please upload an image file.');
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 5MB.');
      }

      // Generate unique filename
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      // Update user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          avatar_url: publicUrl,
          avatar_type: 'custom',
          avatar_id: null,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) throw profileError;

      return {
        url: publicUrl,
        profile: profileData
      };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  /**
   * Delete custom profile picture
   */
  async deleteProfilePicture(userId) {
    try {
      // Get current profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('user_id', userId)
        .single();

      if (profile?.avatar_url) {
        // Extract file path from URL
        const urlParts = profile.avatar_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `avatars/${fileName}`;

        // Delete from storage
        await supabase.storage
          .from('profile-pictures')
          .remove([filePath]);
      }

      // Assign new random avatar
      const newAvatar = getRandomAvatar();

      // Update profile to use default avatar
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          avatar_url: null,
          avatar_type: 'default',
          avatar_id: newAvatar.id,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        return this.initializeUserProfile(userId);
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

export default new ProfileService();