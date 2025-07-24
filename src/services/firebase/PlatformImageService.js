import StorageService from './StorageService';

class PlatformImageService {
  static urlCache = new Map();
  static inProgressFetches = new Map();
  static fallbackUrls = new Map();
  static errorCount = new Map();

  static async getImageUrl(imageName) {
    if (!imageName) {
      console.error('No image name provided to PlatformImageService.getImageUrl');
      return null;
    }

    // Check cache first
    const cachedUrl = this.urlCache.get(imageName);
    if (cachedUrl) {
      return cachedUrl; // Skip validation to improve performance
    }

    // Check if there's already a fetch in progress
    if (this.inProgressFetches.has(imageName)) {
      try {
        return await this.inProgressFetches.get(imageName);
      } catch (error) {
        this.inProgressFetches.delete(imageName);
      }
    }

    // Optimize by focusing on direct path first as the main approach
    const fetchPromise = this._fetchOptimizedImageUrl(imageName);
    this.inProgressFetches.set(imageName, fetchPromise);

    try {
      const url = await fetchPromise;
      if (url) {
        this.urlCache.set(imageName, url);
        // Reset error count on success
        this.errorCount.delete(imageName);
        return url;
      }
      // If we get here, no image was found - use fallback
      return this._getDefaultPlaceholder(imageName);
    } catch (error) {
      // Track error count for this image
      const currentCount = this.errorCount.get(imageName) || 0;
      this.errorCount.set(imageName, currentCount + 1);
      
      // Only log errors after multiple failures to reduce console noise
      if (currentCount > 2) {
        console.error(`Persistent error loading image ${imageName}:`, error);
      }
      
      return this._getDefaultPlaceholder(imageName);
    } finally {
      this.inProgressFetches.delete(imageName);
    }
  }

  static async _fetchOptimizedImageUrl(imageName) {
    try {
      // First, check for direct URLs (if image name starts with http or /)
      if (imageName.startsWith('http') || imageName.startsWith('/')) {
        return imageName;
      }
      
      // Check for image in public directory first (main path)
      const publicUrl = `/images/${imageName}`;
      
      // Also check for platform logos in a dedicated folder
      const platformLogoUrl = `/images/platform-logos/${imageName}`;
      
      // Try local paths first using a Promise race to use whichever resolves first
      try {
        // Set shorter timeout for faster user experience
        return await Promise.race([
          this._checkImageExists(publicUrl, 800),
          this._checkImageExists(platformLogoUrl, 800),
          // Set a reasonable timeout
          new Promise((_, reject) => setTimeout(() => reject(new Error('Local image timeout')), 1000))
        ]);
      } catch (e) {
        // Images not found locally, we'll try Firebase next
        // Only log on development or for persistent errors
        if (import.meta.env.DEV) {
          // console.log(`Local images not found for ${imageName}, trying Firebase...`);
        }
      }
      
      // Try Firebase Storage with improved error handling
      try {
        const logoUrl = await Promise.race([
          StorageService.getStaticAssetUrl('platform-logos', imageName),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 3000))
        ]);
        
        if (logoUrl) return logoUrl;
      } catch (e) {
        // Firebase storage failed or timed out - only log in development
        if (import.meta.env.DEV) {
          console.warn(`Firebase storage issue for ${imageName}:`, e.message || 'Unknown error');
        }
      }
      
      // Quick check for a few common extensions as last resort
      const baseName = imageName.split('.')[0].toLowerCase();
      const extensions = ['.png', '.jpg', '.webp', '.jpeg'];
      
      // Try with different extensions
      for (const ext of extensions) {
        if (imageName.toLowerCase().endsWith(ext)) continue;
        
        const fullImageName = `${baseName}${ext}`;
        // Check both paths
        const directPath = `/images/${fullImageName}`;
        const logoPath = `/images/platform-logos/${fullImageName}`;
        
        try {
          // Try both paths in race condition
          const foundUrl = await Promise.race([
            this._checkImageExists(directPath, 600),
            this._checkImageExists(logoPath, 600),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Extension check timeout')), 800))
          ]);
          
          if (foundUrl) return foundUrl;
        } catch (e) {
          // Continue to next extension
        }
      }
      
      // Last attempt: Try loading directly from Firebase with specific extensions
      for (const ext of extensions) {
        if (imageName.toLowerCase().endsWith(ext)) continue;
        
        const fullImageName = `${baseName}${ext}`;
        try {
          const fbUrl = await StorageService.getStaticAssetUrl('platform-logos', fullImageName);
          if (fbUrl) return fbUrl;
        } catch (e) {
          // Silently continue
        }
      }
      
      // If all else fails, return null and let the fallback handler create a placeholder
      return null;
    } catch (error) {
      console.error('Error in _fetchOptimizedImageUrl:', error);
      return null;
    }
  }
  
  // Helper method to check if an image exists
  static _checkImageExists(url, timeout = 1000) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Image not found: ${url}`));
      img.src = url;
      setTimeout(() => reject(new Error(`Image load timeout: ${url}`)), timeout);
    });
  }

  static _getDefaultPlaceholder(imageName) {
    // Check if we already have a fallback for this image
    if (this.fallbackUrls.has(imageName)) {
      return this.fallbackUrls.get(imageName);
    }

    // Extract platform name from filename
    const platformName = imageName.split('.')[0] // Remove extension
                               .replace(/[0-9]/g, '') // Remove numbers
                               .toLowerCase();
    
    // Get first letter and create a more distinctive placeholder
    const letter = platformName.charAt(0).toUpperCase();
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Get color based on first letter of platform name
    const colors = {
      a: '#ef4444', // Red
      b: '#3b82f6', // Blue
      c: '#8b5cf6', // Purple
      d: '#22c55e', // Green
      e: '#f97316', // Orange
      f: '#ef4444', // Red
      g: '#3b82f6', // Blue
      h: '#8b5cf6', // Purple
      i: '#22c55e', // Green
      j: '#f97316', // Orange
      k: '#ef4444', // Red
      l: '#3b82f6', // Blue
      m: '#8b5cf6', // Purple
      n: '#22c55e', // Green
      o: '#f97316', // Orange
      p: '#ef4444', // Red
      q: '#3b82f6', // Blue
      r: '#8b5cf6', // Purple
      s: '#22c55e', // Green
      t: '#f97316', // Orange
      u: '#ef4444', // Red
      v: '#3b82f6', // Blue
      w: '#8b5cf6', // Purple
      x: '#22c55e', // Green
      y: '#f97316', // Orange
      z: '#ef4444'  // Red
    };
    
    const firstLetter = platformName.charAt(0);
    const backgroundColor = colors[firstLetter] || '#3b82f6'; // Default to blue if letter not found
    
    // Clear any existing fallback for this image
    this.fallbackUrls.delete(imageName);
    
    // Draw gradient background for more visually appealing placeholder
    const gradient = ctx.createLinearGradient(0, 0, 100, 100);
    gradient.addColorStop(0, backgroundColor);
    gradient.addColorStop(1, this._adjustColor(backgroundColor, -30));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(50, 50, 45, 0, Math.PI * 2);
    ctx.fill();
    
    // Add platform name text (first 2 letters if name is long enough)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const displayText = platformName.length > 1 ? 
      `${platformName.charAt(0).toUpperCase()}${platformName.charAt(1)}` : 
      letter;
    ctx.fillText(displayText.substring(0, 2), 50, 50);
    
    // Add a subtle border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(50, 50, 42, 0, Math.PI * 2);
    ctx.stroke();
    
    const dataUrl = canvas.toDataURL();
    this.fallbackUrls.set(imageName, dataUrl);
    
    // Log generation of fallback
    console.log(`Generated fallback image for ${platformName} (${imageName})`);
    
    return dataUrl;
  }
  
  // Helper to adjust color brightness
  static _adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => 
      ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
    );
  }

  static async uploadPlatformImage(file, filename) {
    try {
      const uploadedUrl = await StorageService.uploadStaticAsset(file, 'platform-logos', filename);
      
      if (uploadedUrl) {
        // Update cache with new upload
        this.urlCache.set(filename, uploadedUrl);
        return uploadedUrl;
      }

      throw new Error('Failed to upload image');
    } catch (error) {
      console.error('Error uploading platform image:', error);
      throw error;
    }
  }

  static clearCache() {
    this.urlCache.clear();
    this.inProgressFetches.clear();
    this.fallbackUrls.clear();
    this.errorCount.clear();
  }

  static async loadAllImages() {
    try {
      // Import platforms data
      const { ALL_PLATFORMS } = await import('../../data/platforms.js');
      
      // Create an array of promises for loading all platform images
      const imagePromises = ALL_PLATFORMS.map(platform => 
        this.getImageUrl(platform.imageFile)
          .catch(error => {
            console.warn(`Failed to load image for ${platform.name}:`, error);
            return null;
          })
      );

      // Wait for all images to load
      const results = await Promise.allSettled(imagePromises);
      
      // Count successful loads
      const successCount = results.filter(
        result => result.status === 'fulfilled' && result.value
      ).length;

      console.log(`Successfully loaded ${successCount} of ${ALL_PLATFORMS.length} platform images`);
      
      return successCount > 0;
    } catch (error) {
      console.error('Error loading platform images:', error);
      return false;
    }
  }
}

export default PlatformImageService;
