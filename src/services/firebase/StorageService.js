import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

class StorageService {
  static cache = new Map();
  // Track recent failures to avoid repeated requests to the same failing resources
  static failureCache = new Map();

  static async getStaticAssetUrl(folder, filename) {
    if (!filename) return null;
    
    const cacheKey = `${folder}/${filename}`;
    
    // Return cached URL if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Skip if we've recently failed to load this resource (prevents repeated failures)
    if (this.failureCache.has(cacheKey)) {
      const failureTime = this.failureCache.get(cacheKey);
      // Only retry after 5 minutes to avoid hammering the server
      if (Date.now() - failureTime < 5 * 60 * 1000) {
        return null;
      }
      // Clear the failure entry to allow a retry
      this.failureCache.delete(cacheKey);
    }

    try {
      const storage = getStorage();
      let url = null;
      let lastError = null;
      
      // Define possible paths to try in order of preference
      const paths = [
        // Try local public directory first (most efficient)
        filename.startsWith('/') ? filename : `/images/${folder}/${filename}`,
        // For direct Firebase Storage paths:
        `${folder}/${filename}`,
        `static/${folder}/${filename}`,
        // Legacy paths that might exist in your storage:
        `images/${filename}`,
        `images/${folder}/${filename}`
      ];
      
      // Check if local file exists
      for (const localPath of [paths[0]]) {
        try {
          // Only attempt local path check in browser environment
          if (typeof window !== 'undefined') {
            // Use fetch with HEAD request to check if file exists locally
            const response = await fetch(localPath, { method: 'HEAD', cache: 'no-cache' });
            if (response.ok) {
              // Cache and return the successful local URL
              this.cache.set(cacheKey, localPath);
              return localPath;
            }
          }
        } catch (e) {
          // Silently continue to Firebase paths if local fetch fails
        }
      }
      
      // Try each Firebase Storage path until one works
      for (const path of paths.slice(1)) {
        try {
          // Set a timeout for the Firebase request to prevent long hanging requests
          const firebaseRef = ref(storage, path);
          
          // Create a promise with timeout
          url = await Promise.race([
            getDownloadURL(firebaseRef),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Firebase storage timeout')), 5000)
            )
          ]);
          
          if (url) {
            // Cache the successful URL
            this.cache.set(cacheKey, url);
            return url;
          }
        } catch (err) {
          // Store the error but keep trying other paths
          lastError = err;
          
          // Check for specific errors that indicate we should stop trying
          if (
            err.code === 'storage/object-not-found' || 
            err.code === 'storage/unauthorized' || 
            err.code === 'storage/canceled'
          ) {
            // Skip to next path without additional logging
            continue;
          }
          
          // For 412 Precondition Failed errors, try to handle CORS issues
          if (err.status === 412 || (err.serverResponse && err.serverResponse.status === 412)) {
            continue; // Try next path
          }
        }
      }
      
      // If we got here, all paths failed
      if (lastError) {
        // Don't log for common expected failures to reduce console noise
        if (lastError.code !== 'storage/object-not-found') {
          console.warn(`Firebase Storage access issue for ${folder}/${filename}: ${lastError.code || lastError.message}`);
        }
        
        // Cache this failure for 5 minutes to avoid repeated failed requests
        this.failureCache.set(cacheKey, Date.now());
      }
      
      return null;
    } catch (error) {
      // General error in the storage service itself
      console.warn(`Storage service error for ${folder}/${filename}: ${error.message}`);
      // Cache the failure to prevent repeated failures
      this.failureCache.set(cacheKey, Date.now());
      return null;
    }
  }

  static async uploadStaticAsset(file, folder, filename) {
    if (!file) return null;

    try {
      const storage = getStorage();
      const fileExtension = file.name.split('.').pop();
      const uniqueFilename = filename || `${uuidv4()}.${fileExtension}`;
      
      // For platform logos, upload to both possible paths to ensure compatibility
      if (folder === 'platform-logos') {
        // Upload to direct path
        const directRef = ref(storage, `${folder}/${uniqueFilename}`);
        await uploadBytes(directRef, file);
        const directUrl = await getDownloadURL(directRef);
        
        try {
          // Also try to upload to static path for backwards compatibility
          const staticRef = ref(storage, `static/${folder}/${uniqueFilename}`);
          await uploadBytes(staticRef, file);
        } catch (err) {
          // Ignore errors on secondary upload - the primary one succeeded
          console.log(`Note: Secondary upload path failed, but primary succeeded: ${err.message}`);
        }
        
        // Cache the URL that worked
        this.cache.set(`${folder}/${uniqueFilename}`, directUrl);
        return directUrl;
      } else {
        // For other folders, use the normal path
        const fileRef = ref(storage, `${folder}/${uniqueFilename}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        
        // Cache the URL
        this.cache.set(`${folder}/${uniqueFilename}`, url);
        return url;
      }
    } catch (error) {
      console.error(`Failed to upload file to ${folder}:`, error);
      throw error;
    }
  }

  static async uploadProfileImage(file, userId) {
    return this.uploadStaticAsset(file, `profile-images/${userId}`, `${Date.now()}`);
  }

  static clearCache() {
    this.cache.clear();
    this.failureCache.clear();
  }
}

export default StorageService;
