import { v4 as uuidv4 } from 'uuid';

/**
 * Device fingerprinting utility for trusted device recognition
 * Combines multiple browser/device characteristics to create a unique identifier
 */

// Get browser information
const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  // Detect browser
  if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Edg') > -1) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
  }
  
  return { browserName, browserVersion };
};

// Get OS information
const getOSInfo = () => {
  const ua = navigator.userAgent;
  let osName = 'Unknown';
  let osVersion = 'Unknown';
  
  if (ua.indexOf('Windows NT') > -1) {
    osName = 'Windows';
    const version = ua.match(/Windows NT (\d+\.\d+)/)?.[1];
    osVersion = version ? `NT ${version}` : 'Unknown';
  } else if (ua.indexOf('Mac OS X') > -1) {
    osName = 'macOS';
    osVersion = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
  } else if (ua.indexOf('Android') > -1) {
    osName = 'Android';
    osVersion = ua.match(/Android (\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    osName = 'iOS';
    osVersion = ua.match(/OS (\d+[._]\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
  } else if (ua.indexOf('Linux') > -1) {
    osName = 'Linux';
  }
  
  return { osName, osVersion };
};

// Get device type
const getDeviceType = () => {
  const ua = navigator.userAgent;
  
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
};

// Get screen information
const getScreenInfo = () => {
  return {
    width: window.screen.width,
    height: window.screen.height,
    pixelRatio: window.devicePixelRatio || 1,
    colorDepth: window.screen.colorDepth,
    orientation: window.screen.orientation?.type || 'unknown'
  };
};

// Get timezone
const getTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Unknown';
  }
};

// Get language
const getLanguage = () => {
  return navigator.language || navigator.userLanguage || 'Unknown';
};

// Check for common browser features
const getBrowserFeatures = () => {
  return {
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1',
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    platform: navigator.platform || 'Unknown'
  };
};

// Generate a stable device ID based on fingerprint
const generateDeviceId = (fingerprint) => {
  // Create a stable hash from the fingerprint data
  const data = JSON.stringify({
    screen: fingerprint.screen,
    timezone: fingerprint.timezone,
    language: fingerprint.language,
    platform: fingerprint.features.platform,
    hardwareConcurrency: fingerprint.features.hardwareConcurrency
  });
  
  // Simple hash function for demo - in production, use a proper hashing library
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Combine with stored device ID from localStorage for persistence
  const storedId = localStorage.getItem('bankroll_device_id');
  if (storedId) {
    return storedId;
  }
  
  const newId = `${Math.abs(hash)}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('bankroll_device_id', newId);
  return newId;
};

// Main fingerprinting function
export const getDeviceFingerprint = () => {
  const browserInfo = getBrowserInfo();
  const osInfo = getOSInfo();
  const deviceType = getDeviceType();
  const screen = getScreenInfo();
  const timezone = getTimezone();
  const language = getLanguage();
  const features = getBrowserFeatures();
  
  const fingerprint = {
    browser: browserInfo,
    os: osInfo,
    deviceType,
    screen,
    timezone,
    language,
    features,
    userAgent: navigator.userAgent
  };
  
  const deviceId = generateDeviceId(fingerprint);
  
  return {
    deviceId,
    deviceName: `${browserInfo.browserName} on ${osInfo.osName}`,
    deviceType,
    browserName: browserInfo.browserName,
    osName: osInfo.osName,
    fingerprint
  };
};

// Check if the current device matches a stored fingerprint
export const isDeviceMatch = (storedFingerprint, tolerance = 0.8) => {
  const currentFingerprint = getDeviceFingerprint().fingerprint;
  
  // Compare key features
  const features = [
    storedFingerprint.timezone === currentFingerprint.timezone,
    storedFingerprint.language === currentFingerprint.language,
    storedFingerprint.screen.width === currentFingerprint.screen.width,
    storedFingerprint.screen.height === currentFingerprint.screen.height,
    storedFingerprint.features.platform === currentFingerprint.features.platform,
    storedFingerprint.browser.browserName === currentFingerprint.browser.browserName,
    storedFingerprint.os.osName === currentFingerprint.os.osName
  ];
  
  const matchScore = features.filter(Boolean).length / features.length;
  return matchScore >= tolerance;
};

// Get device name suggestion
export const getDeviceName = () => {
  const { browserName, osName, deviceType } = getDeviceFingerprint();
  const deviceEmoji = deviceType === 'mobile' ? '📱' : deviceType === 'tablet' ? '📱' : '💻';
  return `${deviceEmoji} ${browserName} on ${osName}`;
};