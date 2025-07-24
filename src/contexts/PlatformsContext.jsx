import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import PlatformImageService from '../services/firebase/PlatformImageService';
import locationService from '../services/LocationService';
import { ALL_PLATFORMS, PLATFORM_CATEGORIES } from '../data/platforms';

const PlatformsContext = createContext();

// Define custom category order
const categoryOrder = ['ALL', 'SWEEPS_CASINO', 'FANTASY', 'CASINO', 'SPORTS'];

export const categories = categoryOrder.map(id => ({
  id,
  label: id === 'SWEEPS_CASINO' ? 'SWEEPS CASINO' : id
}));

// Define priority platforms (featured and most important ones)
const PRIORITY_PLATFORMS = ['playstar', 'mcluck', 'pulsz', 'hellomillions'];

// Ensure image paths are correct
export const platforms = ALL_PLATFORMS.map(platform => ({
  ...platform,
  imageUrl: platform.imageFile ? `/images/${platform.imageFile}` : null,
  priority: PRIORITY_PLATFORMS.includes(platform.id)
}));

export function PlatformsProvider({ children, userLocation = null }) {
  const [platformImages, setPlatformImages] = useState({});
  const [imagesLoading, setImagesLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [filteredPlatforms, setFilteredPlatforms] = useState(platforms);
  const loadingRef = useRef(false);
  const imageUrlCache = useRef({});
  const updateTimeoutRef = useRef(null);
  const observerRef = useRef(null);

  // Debounced state update function
  const debouncedSetImagesLoaded = (count) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(() => {
      setImagesLoaded(count);
    }, 500); // Debounce for 500ms
  };

  // Function to load a single image
  const loadSingleImage = useCallback(async (platform) => {
    if (!platform.imageFile || imageUrlCache.current[platform.id]) {
      return imageUrlCache.current[platform.id] || null;
    }

    try {
      // Try direct path first - much faster than Firebase Storage
      const directUrl = `/images/${platform.imageFile}`;
      try {
        // Use createImageBitmap instead of fetch for faster loading and less network overhead
        const img = new Image();
        img.src = directUrl;
        
        // Wait briefly for the image to load
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          // Short timeout to prevent hanging
          setTimeout(reject, 1000);
        });
        
        // If we get here, the image loaded successfully
        imageUrlCache.current[platform.id] = directUrl;
        return directUrl;
      } catch (e) {
        // Image failed to load from public folder, use PlatformImageService
        const url = await PlatformImageService.getImageUrl(platform.imageFile);
        if (url) {
          imageUrlCache.current[platform.id] = url;
          return url;
        }
      }
    } catch (error) {
      console.error(`Failed to load image for ${platform.id}:`, error);
      return null;
    }
  }, []);

  // Initial load of priority platforms only
  useEffect(() => {
    const loadPriorityImages = async () => {
      if (loadingRef.current || initialLoadComplete) return;
      loadingRef.current = true;

      setImagesLoading(true);
      let loadedCount = 0;
      const imageUrls = { ...imageUrlCache.current };
      
      try {
        // Only load priority platforms initially
        const priorityPlatforms = platforms.filter(p => p.priority);
        
        // Load priority platforms concurrently
        const results = await Promise.allSettled(
          priorityPlatforms.map(async (platform) => {
            const url = await loadSingleImage(platform);
            if (url) {
              imageUrls[platform.id] = url;
              loadedCount++;
            }
            return { id: platform.id, url };
          })
        );
        
        // Update state with initial batch of images
        setPlatformImages(imageUrls);
        setImagesLoaded(loadedCount);
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error loading priority images:', error);
      } finally {
        setImagesLoading(false);
        loadingRef.current = false;
      }
    };

    loadPriorityImages();
    
    return () => {
      loadingRef.current = false;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [loadSingleImage]);

  // Load remaining platforms after initial render
  useEffect(() => {
    if (!initialLoadComplete) return;
    
    const loadRemainingImages = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      const imageUrls = { ...platformImages };
      const errors = { ...imageErrors };
      let loadedCount = Object.keys(imageUrls).length;
      const batchSize = 8; // Increased batch size for remaining images
      
      try {
        // Get non-priority platforms that haven't been loaded yet
        const remainingPlatforms = platforms.filter(
          p => !p.priority && !imageUrlCache.current[p.id]
        );

        // Process remaining platforms in batches
        for (let i = 0; i < remainingPlatforms.length; i += batchSize) {
          const batch = remainingPlatforms.slice(i, i + batchSize);
          
          // Load batch of images concurrently
          const batchResults = await Promise.allSettled(
            batch.map(async (platform) => {
              const url = await loadSingleImage(platform);
              if (url) {
                imageUrls[platform.id] = url;
                loadedCount++;
              } else {
                errors[platform.id] = true;
              }
              return { id: platform.id, url };
            })
          );
          
          // Update state more frequently
          setPlatformImages({ ...imageUrls });
          debouncedSetImagesLoaded(loadedCount);
          
          // Short delay between batches to prevent blocking the main thread
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      } catch (error) {
        console.warn('Error loading remaining images:', error);
      } finally {
        setPlatformImages(imageUrls);
        setImageErrors(errors);
        setImagesLoaded(loadedCount);
        setImagesLoading(false);
        loadingRef.current = false;
      }
    };
    
    // Use requestIdleCallback to load remaining images during idle time
    // This prevents blocking the main thread and initial page render
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => loadRemainingImages(), { timeout: 2000 });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(loadRemainingImages, 500);
    }
    
    return () => {
      loadingRef.current = false;
    };
  }, [initialLoadComplete, loadSingleImage, platformImages, imageErrors]);

  // Setup intersection observer for lazy loading images
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    
    // Create observer to detect when platform cards are visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const platformId = entry.target.dataset.platformId;
            if (platformId && !imageUrlCache.current[platformId]) {
              // Find the platform
              const platform = platforms.find(p => p.id === platformId);
              if (platform) {
                // Load the image when card comes into view
                loadSingleImage(platform).then(url => {
                  if (url) {
                    setPlatformImages(prev => ({
                      ...prev,
                      [platformId]: url
                    }));
                  }
                });
              }
            }
            // Stop observing once loaded
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px 0px' } // Start loading when within 200px of viewport
    );
    
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadSingleImage]);

  // Filter platforms based on user location
  useEffect(() => {
    if (!userLocation) {
      setFilteredPlatforms(platforms);
      return;
    }

    const availablePlatforms = platforms.filter(platform => 
      locationService.isPlatformAvailableInLocation(platform, userLocation)
    );
    
    setFilteredPlatforms(availablePlatforms);
    console.log(`Filtered platforms for ${userLocation.stateCode || userLocation.countryCode}:`, 
                availablePlatforms.length, 'of', platforms.length, 'available');
  }, [userLocation]);

  // Helper functions for location-specific data
  const getPlatformOffer = useCallback((platform) => {
    if (!userLocation || !platform.locationSpecificOffers) {
      return platform.promoOffer || null;
    }

    const stateCode = userLocation.stateCode;
    const locationOffer = platform.locationSpecificOffers[stateCode] || 
                         platform.locationSpecificOffers['default'];
    
    return locationOffer?.promoOffer || platform.promoOffer || null;
  }, [userLocation]);

  const getPlatformDisclaimer = useCallback((platform) => {
    if (!userLocation || !platform.locationSpecificOffers) {
      return locationService.getLocationDisclaimer(userLocation);
    }

    const stateCode = userLocation.stateCode;
    const locationOffer = platform.locationSpecificOffers[stateCode] || 
                         platform.locationSpecificOffers['default'];
    
    return locationOffer?.disclaimer || locationService.getLocationDisclaimer(userLocation);
  }, [userLocation]);

  const isPlatformAvailable = useCallback((platform) => {
    return locationService.isPlatformAvailableInLocation(platform, userLocation);
  }, [userLocation]);

  const value = {
    platforms: filteredPlatforms, // Use filtered platforms based on location
    allPlatforms: platforms, // Keep original unfiltered list available
    categories,
    platformImages,
    imagesLoading,
    imagesLoaded,
    imageErrors,
    totalPlatforms: platforms.length,
    availablePlatforms: filteredPlatforms.length,
    
    // Location-related functionality
    userLocation,
    getPlatformOffer,
    getPlatformDisclaimer,
    isPlatformAvailable,
    
    observeElement: (element, platformId) => {
      if (observerRef.current && element) {
        element.dataset.platformId = platformId;
        observerRef.current.observe(element);
      }
    }
  };

  return (
    <PlatformsContext.Provider value={value}>
      {children}
    </PlatformsContext.Provider>
  );
}

export function usePlatforms() {
  const context = useContext(PlatformsContext);
  if (context === undefined) {
    throw new Error('usePlatforms must be used within a PlatformsProvider');
  }
  return context;
}
