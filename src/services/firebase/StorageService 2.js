import { storage } from './config.ts';
import { ref, uploadBytes, getDownloadURL, StorageReference } from 'firebase/storage';

interface UrlCacheInterface {
  memoryCache: Map<string, string>;
  inProgressFetches: Map<string, Promise<string | null>>;
  saveTimeout?: NodeJS.Timeout;
}

// Cache management with memory-first, localStorage-backup approach
class UrlCache implements UrlCacheInterface {
  memoryCache: Map<string, string>;
  inProgressFetches: Map<string, Promise<string | null>>;
  saveTimeout?: NodeJS.Timeout;

  constructor() {
    this.memoryCache = new Map();
    this.inProgressFetches = new Map();
    this.loadFromStorage();
  }

  loadFromStorage(): void {
    try {
      const cached = localStorage.getItem('staticAssetUrlCache');
      if (cached) {
        const entries = JSON.parse(cached) as [string, string][];
        entries.forEach(([key, value]) => this.memoryCache.set(key, value));
      }
    } catch (error) {
      console.warn('Failed to load URL cache from storage:', error);
    }
  }

  saveToStorage(): void {
    try {
      localStorage.setItem(
        'staticAssetUrlCache',
        JSON.stringify(Array.from(this.memoryCache.entries()))
      );
    } catch (error) {
      console.warn('Failed to save URL cache to storage:', error);
    }
  }

  get(key: string): string | undefined {
    return this.memoryCache.get(key);
  }

  set(key: string, value: string): void {
    this.memoryCache.set(key, value);
    // Debounce storage saves to prevent excessive writes
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveToStorage(), 1000);
  }

  has(key: string): boolean {
    return this.memoryCache.has(key);
  }

  clear(): void {
    this.memoryCache.clear();
    this.inProgressFetches.clear();
    localStorage.removeItem('staticAssetUrlCache');
  }
}

const urlCache = new UrlCache();

interface FileMetadata {
  contentType: string;
  cacheControl: string;
  customMetadata: {
    category: string;
    uploadedAt: string;
  };
}

class StorageService {
  static async getStaticAssetUrl(category: string, filename: string): Promise<string | null> {
    const cacheKey = `${category}/${filename}`;

    // Check memory cache first
    const cachedUrl = urlCache.get(cacheKey);
    if (cachedUrl) {
      try {
        // Verify cached URL is still valid
        const response = await fetch(cachedUrl, { method: 'HEAD', cache: 'force-cache' });
        if (response.ok) {
          return cachedUrl;
        }
      } catch (error) {
        // Cache entry is invalid, remove it
        urlCache.memoryCache.delete(cacheKey);
      }
    }

    // For platform logos, serve directly from public directory
    if (category === 'platform-logos') {
      const publicUrl = `/images/${filename}`;
      try {
        const response = await fetch(publicUrl, { method: 'HEAD', cache: 'force-cache' });
        if (response.ok) {
          urlCache.set(cacheKey, publicUrl);
          return publicUrl;
        }
      } catch (error) {
        console.warn(`Failed to load from public directory: ${publicUrl}`, error);
      }

      // Try lowercase filename as fallback
      const lowercaseUrl = `/images/${filename.toLowerCase()}`;
      try {
        const response = await fetch(lowercaseUrl, { method: 'HEAD', cache: 'force-cache' });
        if (response.ok) {
          urlCache.set(cacheKey, lowercaseUrl);
          return lowercaseUrl;
        }
      } catch (error) {
        console.warn(`Failed to load from public directory (lowercase): ${lowercaseUrl}`, error);
      }
    }

    // For other categories, try Firebase Storage
    if (storage) {
      try {
        const path = `${category}/${filename}`;
        const fileRef = ref(storage, path);
        const url = await getDownloadURL(fileRef);
        if (url) {
          urlCache.set(cacheKey, url);
          return url;
        }
      } catch (error) {
        console.warn(`Failed to fetch from Firebase Storage: ${category}/${filename}`, error);
      }
    }

    console.error(`All attempts to load image failed: ${category}/${filename}`);
    return null;
  }

  static async uploadStaticAsset(
    file: File,
    category: string,
    filename: string
  ): Promise<string | null> {
    if (!storage || !file || !category || !filename) {
      throw new Error('Missing required parameters for upload');
    }

    const fileRef = ref(storage, `${category}/${filename}`);
    const metadata = {
      contentType: file.type,
      cacheControl: 'public,max-age=31536000',
      customMetadata: {
        category,
        uploadedAt: new Date().toISOString()
      }
    };

    try {
      const snapshot = await uploadBytes(fileRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      if (downloadURL) {
        const cacheKey = `${category}/${filename}`;
        urlCache.set(cacheKey, downloadURL);
      }
      
      return downloadURL;
    } catch (error: unknown) {
      console.error('Upload failed:', error);
      if (error instanceof Error) {
        throw new Error(`Upload failed: ${error.message}`);
      }
      throw new Error('Upload failed: Unknown error');
    }
  }

  static clearCache() {
    urlCache.clear();
  }
}

export default StorageService;
