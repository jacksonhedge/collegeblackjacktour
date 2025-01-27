import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from './config';
import { CONFERENCE_DATA } from './conferenceData';

/**
 * @typedef {Object.<string, string>} ConferenceMap
 * @typedef {Object.<string, string>} SpecialCases
 * @typedef {Object.<string, RegExp>} ConferencePatterns
 */

/**
 * Uploads a tournament image to Firebase Storage
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The download URL of the uploaded image
 */
export const uploadTournamentImage = async (file) => {
  try {
    const filename = `${Date.now()}-${file.name}`;
    const imageRef = ref(storage, `tournament-images/${filename}`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error('Error uploading tournament image:', error);
    throw error;
  }
};

/**
 * Gets the download URL for a tournament image
 * @param {string} imagePath - The path to the image in storage
 * @returns {Promise<string>} The download URL of the image
 */
export const getTournamentImageURL = async (imagePath) => {
  try {
    const imageRef = ref(storage, `tournament-images/${imagePath}`);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error(`Error getting tournament image URL for ${imagePath}:`, error);
    // Return default tournament image
    const defaultRef = ref(storage, 'tournament-images/default.jpg');
    return await getDownloadURL(defaultRef);
  }
};

/**
 * Gets the download URL for a college image
 * @param {string} imagePath - The path to the image in storage
 * @returns {Promise<string>} The download URL of the image
 */
// Cache for storing successful URL lookups
const urlCache = new Map();

export const getCollegeImageURL = async (collegeName) => {
  // Check cache first
  if (urlCache.has(collegeName)) {
    return urlCache.get(collegeName);
  }

  // Helper function to cache and return URL
  const cacheAndReturn = (url) => {
    urlCache.set(collegeName, url);
    return url;
  };

  // Helper function to try a path
  const tryPath = async (path) => {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return path;
      }
    } catch (err) {
      // Silently fail and try next path
    }
    return null;
  };

  try {
    // Helper function to get conference abbreviation
    const getConferenceAbbrev = (fullName) => {
      const abbrevMap = {
        'Atlantic Coast Conference': 'ACC',
        'Big Ten Conference': 'BIG 10',
        'Big 12 Conference': 'BIG 12',
        'Southeastern Conference': 'SEC',
        'Atlantic 10 Conference': 'A10',
        'Western Athletic Conference': 'WAC',
        'West Coast Conference': 'WCC',
        'Mountain West Conference': 'MW',
        'Mid-American Conference': 'MAC',
        'America East Conference': 'AEC',
        'Atlantic Sun Conference (ASUN)': 'ASUN',
        'Big East Conference': 'BIG EAST',
        'Big Sky Conference': 'BIG SKY',
        'Big South Conference': 'BIG SOUTH',
        'Colonial Athletic Association': 'CAA',
        'Ivy League': 'IVY',
        'Metro Atlantic Athletic Conference (MAAC)': 'MAAC',
        'Missouri Valley Conference': 'Missouri Valley',
        'Pac-12 Conference': 'PAC - 12',
        'Patriot League Conference': 'Patriot League',
        'Sun Belt Conference': 'SBC',
        'Southland Conference': 'SLC',
        'Southern Conference': 'SOCON',
        'Summit League': 'SUMMIT'
      };
      return abbrevMap[fullName] || fullName;
    };

    // Find conference from CONFERENCE_DATA
    let conference = null;
    
    // Normalize input name for different matching strategies
    const normalizedLower = collegeName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const normalizedUpper = collegeName.toUpperCase();

    // Build lookup maps if not already built
    if (!global.schoolConferenceMap) {
      global.schoolConferenceMap = new Map();
      global.specialCasesMap = new Map([
        ['UCLA BRUINS', 'college-logos/BIG 10/UCLA.png'],
        ['TEXAS A&M', 'college-logos/SEC/Texas_AM_University_logo.png'],
        ['UMASS', 'college-logos/A10/UMass_Amherst_Minutemen_logo.png'],
        ['NC STATE', 'college-logos/ACC/North_Carolina_State_Wolfpack_logo.png'],
        ['UCF', 'college-logos/BIG 12/UCF_Knights_logo.png'],
        ['USC', 'college-logos/BIG 10/USC_Trojans_logo.png'],
        ['LSU', 'college-logos/SEC/LSU_Tigers_logo.png'],
        ['TCU', 'college-logos/BIG 12/TCU_Horned_Frogs_logo.png'],
        ['BYU', 'college-logos/BIG 12/BYU_Cougars_logo.png'],
        ['VCU', 'college-logos/A10/VCU_Rams_logo.png'],
        ['UNC', 'college-logos/ACC/North_Carolina_Tar_Heels_logo.png'],
        ['CAROLINA', 'college-logos/ACC/North_Carolina_Tar_Heels_logo.png'],
        ['BC', 'college-logos/ACC/Boston_College_Eagles_logo.png'],
        ['GT', 'college-logos/ACC/Georgia_Tech_Yellow_Jackets_logo.png'],
        ['TAMU', 'college-logos/SEC/Texas_AM_University_logo.png'],
        ['ASU', 'college-logos/BIG 12/Arizona_State_Sun_Devils_logo.png'],
        ['OSU', 'college-logos/BIG 12/Oklahoma_State_Cowboys_logo.png'],
        ['UVA', 'college-logos/ACC/Virginia_Cavaliers_logo.png'],
        ['VT', 'college-logos/ACC/Virginia_Tech_Hokies_logo.png'],
        ['PSU', 'college-logos/BIG 10/Penn_State_Nittany_Lions_logo.png'],
        ['MSU', 'college-logos/BIG 10/Michigan_State_Spartans_logo.png'],
        ['OLE MISS', 'college-logos/SEC/Mississippi_logo.png'],
        ['MISS STATE', 'college-logos/SEC/Mississippi_State_logo.png'],
        ['PITT', 'college-logos/ACC/Pitt_Panthers_logo.png'],
        ['CUSE', 'college-logos/ACC/Syracuse_Orange_logo.png'],
        ['ZONA', 'college-logos/BIG 12/Arizona_Wildcats_logo.png'],
        ['CINCY', 'college-logos/BIG 12/Cincinnati_Bearcats_logo.png'],
        ['WAZZU', 'college-logos/BIG 10/Washington_Huskies_logo.png'],
        ['GMU', 'college-logos/A10/George_Mason_Patriots_logo.png'],
        ['GW', 'college-logos/A10/George_Washington_Colonials_logo.png']
      ]);

      // Build conference map
      for (const [confName, schools] of Object.entries(CONFERENCE_DATA)) {
        const confAbbrev = getConferenceAbbrev(confName);
        schools.forEach(school => {
          const normalizedSchool = school
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          global.schoolConferenceMap.set(normalizedSchool, confAbbrev);
        });
      }
    }

    // Try special cases first
    for (const [pattern, path] of global.specialCasesMap) {
      if (normalizedUpper === pattern || normalizedUpper.includes(pattern)) {
        const result = await tryPath(path);
        if (result) {
          return cacheAndReturn(result);
        }
      }
    }

    // Try exact match for conference
    conference = global.schoolConferenceMap.get(normalizedLower);

    // If no conference found, try to match from name
    if (!conference) {
      /** @type {ConferencePatterns} */
      const conferencePatterns = {
        'ACC': /\b(ACC|Atlantic Coast)\b/i,
        'BIG 10': /\b(Big Ten|B1G)\b/i,
        'BIG 12': /\bBig 12\b/i,
        'SEC': /\b(SEC|Southeastern)\b/i,
        'A10': /\b(A-?10|Atlantic 10)\b/i,
        'WAC': /\bWAC\b/i,
        'WCC': /\bWCC\b/i
      };

      for (const [abbrev, pattern] of Object.entries(conferencePatterns)) {
        if (pattern.test(collegeName)) {
          conference = abbrev;
          break;
        }
      }
    }

    if (conference) {
      // Format the name consistently
      const formattedName = collegeName
        .replace(/[^a-zA-Z0-9\s&]/g, '')  // Remove special chars except & and spaces
        .replace(/&/g, 'and')             // Replace & with 'and'
        .split(' ')
        .map(word => word.toLowerCase() === 'a&m' ? 'AM' : word) // Handle A&M case
        .join('_');                       // Join with underscores

      // Try only the most common path patterns
      const paths = [
        `/college-logos/${conference}/${formattedName}_logo.png`,
        `/college-logos/${conference}/${formattedName}.png`
      ];

      // Try each path
      for (const path of paths) {
        const result = await tryPath(path);
        if (result) {
          return cacheAndReturn(result);
        }
      }
    }

    // If no logo found, return default
    return cacheAndReturn('/default-college-logo.svg');
  } catch (error) {
    console.error(`Error getting logo URL for ${collegeName}:`, error);
    return cacheAndReturn('/default-college-logo.svg');
  }

};
