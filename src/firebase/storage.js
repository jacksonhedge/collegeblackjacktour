import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from './config';

/**
 * Gets the download URL for a college image
 * @param {string} imagePath - The path to the image in storage
 * @returns {Promise<string>} The download URL of the image
 */
export const getCollegeImageURL = async (collegeName) => {
  try {
    // Try different file name patterns
    const patterns = [];

    // Special cases first
    if (collegeName === 'UCLA Bruins') {
      patterns.push('UCLA.png');
    } else if (collegeName.includes('Texas A&M')) {
      patterns.push('Texas_AM_University_logo.png');
    } else if (collegeName.includes('UMass')) {
      patterns.push('UMass_Amherst_Minutemen_logo.png');
    } else if (collegeName.includes('LSU')) {
      patterns.push('LSU_Tigers.png');
    } else if (collegeName.includes('Kent State')) {
      patterns.push('Kent_State_Golden_Flashes.png');
    } else if (collegeName.includes('Ohio Bobcats')) {
      patterns.push('Ohio_Bobcats_logo.png');
    } else if (collegeName.includes('Northern Illinois')) {
      patterns.push('Northern_Illinois_Huskies.png');
    } else if (collegeName.includes('UMBC')) {
      patterns.push('University-of-Maryland-Baltimore-County-UMBC-Retrievers-logo.png');
    } else if (collegeName.includes('NJIT')) {
      patterns.push('New-Jersey-Institute-of-Technology-NJIT-Highlanders-logo.png');
    } else if (collegeName.includes('VCU')) {
      patterns.push('VCU-Rams-logo.png');
    } else if (collegeName.includes('UIC')) {
      patterns.push('Illinois-Chicago-UIC-Flames-logo.png');
    } else if (collegeName.includes('UNCG')) {
      patterns.push('UNCG-Spartans-logo.png');
    } else if (collegeName.includes('UNLV')) {
      patterns.push('UNLV_Rebels_logo.png');
    } else if (collegeName.includes('USC')) {
      patterns.push('USC_Trojans_logo.png');
    } else if (collegeName.includes('SMU')) {
      patterns.push('SMU_Mustang_logo.png');
    } else if (collegeName.includes('TCU')) {
      patterns.push('TCU_Horned_Frogs_logo.png');
    } else if (collegeName.includes('UCF')) {
      patterns.push('UCF_Knights_logo.png');
    } else if (collegeName.includes('William & Mary')) {
      patterns.push('William-Mary-Tribe-logo.png');
    } else if (collegeName.includes('St. Bonaventure')) {
      patterns.push('St.-Bonaventure-Bonnies-logo.png');
    } else if (collegeName.includes('Saint Joseph\'s')) {
      patterns.push('Saint-Josephs-Hawks-logo.png');
    } else if (collegeName.includes('Saint Louis')) {
      patterns.push('Saint-Louis-Billikens-logo.png');
    } else if (collegeName.includes('Saint Peter\'s')) {
      patterns.push('Saint-Peters-Peacocks-logo.png');
    } else if (collegeName.includes('Mount St. Mary\'s')) {
      patterns.push('Mount-St.-Marys-Mountaineers-logo.png');
    } else if (collegeName.includes('UT Arlington')) {
      patterns.push('UT-Arlington-Mavericks-logo.png');
    } else if (collegeName.includes('Utah Tech')) {
      patterns.push('Utah-Tech-Trailblazers-logo.png');
    } else if (collegeName.includes('Utah Valley')) {
      patterns.push('Utah-Valley-Wolverines-logo.png');
    } else if (collegeName.includes('UT Rio Grande')) {
      patterns.push('Texas-Rio-Grande-Valley-UTRGV-Vaqueros-logo.png');
    } else if (collegeName.includes('UNC Asheville')) {
      patterns.push('UNC-Asheville-Bulldogs-logo.png');
    } else if (collegeName.includes('UNC Wilmington')) {
      patterns.push('UNC-Wilmington-Seahawks-logo.png');
    } else if (collegeName.includes('South Carolina Upstate')) {
      patterns.push('South-Carolina-Upstate-Spartans-logo.png');
    } else if (collegeName.includes('Cal Baptist')) {
      patterns.push('California-Baptist-Lancers-logo.png');
    } else if (collegeName.includes('Charleston Southern')) {
      patterns.push('Charleston-Southern-Buccaneers-logo.png');
    } else if (collegeName.includes('College of Charleston')) {
      patterns.push('College-of-Charleston-Cougars-logo.png');
    } else if (collegeName.includes('Stephen F. Austin')) {
      patterns.push('Stephen-F.-Austin-Lumberjacks-logo.png');
    } else if (collegeName.includes('Loyola Maryland')) {
      patterns.push('Loyola-University-Maryland-Greyhounds-logo.png');
    } else if (collegeName.includes('Loyola Marymount')) {
      patterns.push('Loyola-Marymount-Lions-logo.png');
    } else if (collegeName.includes('Loyola Chicago')) {
      patterns.push('Loyola-Chicago-Ramblers-logo.png');
    } else if (collegeName.includes('Sacramento State')) {
      patterns.push('Sacramento-State-Hornets-logo.png');
    } else if (collegeName.includes('San Diego State')) {
      patterns.push('San_Diego_State_Aztecs_logo.png');
    } else if (collegeName.includes('San Jose State')) {
      patterns.push('San_Jose_State_Spartans_logo.png');
    } else if (collegeName.includes('Boise State')) {
      patterns.push('Boise_State_Broncos_Logo.png');
    } else if (collegeName.includes('Fresno State')) {
      patterns.push('Fresno_State_Bulldogs_logo.png');
    } else if (collegeName.includes('Michigan State')) {
      patterns.push('Michigan_State_Spartans_logo.png');
    } else if (collegeName.includes('Mississippi State')) {
      patterns.push('Mississippi_State_Bulldogs_logo.png');
    } else if (collegeName.includes('North Carolina State')) {
      patterns.push('North_Carolina_State_Wolfpack_logo.png');
    } else if (collegeName.includes('Oklahoma State')) {
      patterns.push('Oklahoma_State_Cowboys_logo.png');
    } else if (collegeName.includes('Oregon State')) {
      patterns.push('Oregon_State_Beavers_logo.png');
    } else if (collegeName.includes('Penn State')) {
      patterns.push('Penn_State_Nittany_Lions_logo.png');
    } else if (collegeName.includes('Washington State')) {
      patterns.push('Washington_State_Cougars_logo.png');
    } else if (collegeName.includes('San Francisco')) {
      patterns.push('San-Francisco-Dons-logo.png');
    } else if (collegeName.includes('San Diego')) {
      patterns.push('San-Diego-Toreros-logo.png');
    } else if (collegeName.includes('Santa Clara')) {
      patterns.push('Santa-Clara-Broncos-logo.png');
    } else if (collegeName.includes('St. John\'s')) {
      patterns.push('St.-Johns-Red-Storm-logo.png');
    } else if (collegeName.includes('St. Thomas')) {
      patterns.push('St.-Thomas-Tommies-logo.png');
    } else if (collegeName.includes('Boston University')) {
      patterns.push('Boston-University-Terriers-logo.png');
    } else if (collegeName.includes('Boston College')) {
      patterns.push('Boston_College_Eagles_logo.png');
    } else if (collegeName.includes('North Dakota State')) {
      patterns.push('North-Dakota-State-Bison-logo.png');
    } else if (collegeName.includes('South Dakota State')) {
      patterns.push('South-Dakota-State-Jackrabbits-logo.png');
    } else if (collegeName.includes('North Dakota')) {
      patterns.push('North-Dakota-Fighting-Hawks-logo.png');
    } else if (collegeName.includes('South Dakota')) {
      patterns.push('South-Dakota-Coyotes-logo.png');
    } else if (collegeName.includes('Western Illinois')) {
      patterns.push('Western-Illinois-Leathernecks-logo.png');
    } else if (collegeName.includes('Eastern Illinois')) {
      patterns.push('Eastern-Illinois-Panthers-logo.png');
    } else if (collegeName.includes('Northern Iowa')) {
      patterns.push('Northern-Iowa-Panthers-logo.png');
    } else if (collegeName.includes('Southern Illinois')) {
      patterns.push('Southern-Illinois-Salukis-logo.png');
    } else if (collegeName.includes('Eastern Washington')) {
      patterns.push('Eastern-Washington-Eagles-logo.png');
    } else if (collegeName.includes('Eastern Michigan')) {
      patterns.push('Eastern_Michigan_Eagles_logo.png');
    } else if (collegeName.includes('Eastern Kentucky')) {
      patterns.push('Eastern-Kentucky-Colonels-logo.png');
    } else if (collegeName.includes('Western Kentucky')) {
      patterns.push('Western_Kentucky_Hilltoppers_logo.png');
    } else if (collegeName.includes('Western Michigan')) {
      patterns.push('Western_Michigan_Broncos_logo.png');
    } else if (collegeName.includes('Western Carolina')) {
      patterns.push('Western-Carolina-Catamounts-logo.png');
    } else if (collegeName.includes('Northern Arizona')) {
      patterns.push('Northern-Arizona-Lumberjacks-logo.png');
    } else if (collegeName.includes('Northern Colorado')) {
      patterns.push('Northern-Colorado-Bears-logo.png');
    } else if (collegeName.includes('Southern Utah')) {
      patterns.push('Southern-Utah-Thunderbirds-logo.png');
    } else if (collegeName.includes('Southern Miss')) {
      patterns.push('Southern_Miss_Golden_Eagles_logo.png');
    } else if (collegeName.includes('Georgia Southern')) {
      patterns.push('Georgia_Southern_Eagles_logo.png');
    } else if (collegeName.includes('Georgia State')) {
      patterns.push('Georgia_State_Panthers_logo.png');
    } else if (collegeName.includes('Idaho State')) {
      patterns.push('Idaho-State-Bengals-logo.png');
    } else if (collegeName.includes('Illinois State')) {
      patterns.push('Illinois-State-Redbirds-logo.png');
    } else if (collegeName.includes('Indiana State')) {
      patterns.push('Indiana-State-Sycamores-logo.png');
    } else if (collegeName.includes('Montana State')) {
      patterns.push('Montana-State-Bobcats-logo.png');
    } else if (collegeName.includes('Montana')) {
      patterns.push('Montana-Grizzlies-logo.png');
    } else if (collegeName.includes('Stony Brook')) {
      patterns.push('Stony-Brook-Seawolves-logo.png');
    } else if (collegeName.includes('Oral Roberts')) {
      patterns.push('Oral-Roberts-Golden-Eagles-logo.png');
    } else if (collegeName.includes('Gardner Webb')) {
      patterns.push('Gardner-Webb-Runnin-Bulldogs-logo.png');
    } else if (collegeName.includes('High Point')) {
      patterns.push('High-Point-Panthers-logo.png');
    } else if (collegeName.includes('Houston Baptist')) {
      patterns.push('Houston-Baptist-Huskies-logo.png');
    } else if (collegeName.includes('Incarnate Word')) {
      patterns.push('Incarnate-Word-Cardinals-logo.png');
    } else if (collegeName.includes('Jacksonville State')) {
      patterns.push('Jacksonville-State-Gamecocks-logo.png');
    } else if (collegeName.includes('Jacksonville')) {
      patterns.push('Jacksonville-Dolphins-logo.png');
    } else if (collegeName.includes('James Madison')) {
      patterns.push('James_Madison_Dukes_logo.png');
    } else if (collegeName.includes('Kennesaw State')) {
      patterns.push('Kennesaw-State-Owls-logo.png');
    } else if (collegeName.includes('Lafayette')) {
      patterns.push('Lafayette-Leopards-logo.png');
    } else if (collegeName.includes('Lehigh')) {
      patterns.push('Lehigh-Mountain-Hawks-logo.png');
    } else if (collegeName.includes('Longwood')) {
      patterns.push('Longwood-Lancers-logo.png');
    } else if (collegeName.includes('Manhattan')) {
      patterns.push('Manhattan-Jaspers-logo.png');
    } else if (collegeName.includes('Marist')) {
      patterns.push('Marist-Red-Foxes-logo.png');
    } else if (collegeName.includes('Mercer')) {
      patterns.push('Mercer-Bears-logo.png');
    } else if (collegeName.includes('Monmouth')) {
      patterns.push('Monmouth-Hawks-logo.png');
    } else if (collegeName.includes('Nicholls')) {
      patterns.push('Nicholls-State-Colonels-logo.png');
    } else if (collegeName.includes('Niagara')) {
      patterns.push('Niagara-Purple-Eagles-logo.png');
    } else if (collegeName.includes('Pacific')) {
      patterns.push('Pacific-Tigers-logo.png');
    } else if (collegeName.includes('Portland State')) {
      patterns.push('Portland-State-Vikings-logo.png');
    } else if (collegeName.includes('Portland')) {
      patterns.push('Portland-Pilots-logo.png');
    } else if (collegeName.includes('Presbyterian')) {
      patterns.push('Presbyterian-Blue-Hose-logo.png');
    } else if (collegeName.includes('Princeton')) {
      patterns.push('Princeton-Tigers-logo.png');
    } else if (collegeName.includes('Providence')) {
      patterns.push('Providence-Friars-logo.png');
    } else if (collegeName.includes('Quinnipiac')) {
      patterns.push('Quinnipiac-Bobcats-logo.png');
    } else if (collegeName.includes('Radford')) {
      patterns.push('Radford-Highlanders-logo.png');
    } else if (collegeName.includes('Rider')) {
      patterns.push('Rider-Broncs-logo.png');
    } else if (collegeName.includes('Samford')) {
      patterns.push('Samford-Bulldogs-logo.png');
    } else if (collegeName.includes('Siena')) {
      patterns.push('Siena-Saints-logo.png');
    } else if (collegeName.includes('Southeast Missouri')) {
      patterns.push('Southeast-Missouri-State-Redhawks-logo.png');
    } else if (collegeName.includes('Tennessee Martin')) {
      patterns.push('Tennessee-Martin-Skyhawks-logo.png');
    } else if (collegeName.includes('Tennessee State')) {
      patterns.push('Tennessee-State-Tigers-logo.png');
    } else if (collegeName.includes('Tennessee Tech')) {
      patterns.push('Tennessee-Tech-Golden-Eagles-logo.png');
    } else if (collegeName.includes('Tennessee')) {
      patterns.push('Tennessee_Volunteers_logo.png');
    } else if (collegeName.includes('Towson')) {
      patterns.push('Towson-Tigers-logo.png');
    } else if (collegeName.includes('Valparaiso')) {
      patterns.push('Valparaiso-Beacons-logo.png');
    } else if (collegeName.includes('Vanderbilt')) {
      patterns.push('Vanderbilt_Commodores_logo.png');
    } else if (collegeName.includes('Vermont')) {
      patterns.push('Vermont-Catamounts-logo.png');
    } else if (collegeName.includes('Villanova')) {
      patterns.push('Villanova-Wildcats-logo.png');
    } else if (collegeName.includes('Virginia Tech')) {
      patterns.push('Virginia_Tech_Hokies_logo.png');
    } else if (collegeName.includes('Virginia')) {
      patterns.push('Virginia_Cavaliers_logo.png');
    } else if (collegeName.includes('Wagner')) {
      patterns.push('Wagner-Seahawks-logo.png');
    } else if (collegeName.includes('Wake Forest')) {
      patterns.push('Wake_Forest_Demon_Deacons_logo.png');
    } else if (collegeName.includes('Washington')) {
      patterns.push('Washington_Huskies_logo.png');
    } else if (collegeName.includes('Weber State')) {
      patterns.push('Weber-State-Wildcats-logo.png');
    } else if (collegeName.includes('Winthrop')) {
      patterns.push('Winthrop-Eagles-logo.png');
    } else if (collegeName.includes('Wisconsin')) {
      patterns.push('Wisconsin_Badgers_logo.png');
    } else if (collegeName.includes('Wofford')) {
      patterns.push('Wofford-Terriers-logo.png');
    } else if (collegeName.includes('Wyoming')) {
      patterns.push('Wyoming_Cowboys_logo.png');
    } else if (collegeName.includes('Xavier')) {
      patterns.push('Xavier-Musketeers-logo.png');
    } else if (collegeName.includes('Yale')) {
      patterns.push('Yale-Bulldogs-logo.png');
    } else {
      // Handle conference names
      if (collegeName.includes('Conference')) {
        // Common conference patterns
        const conferencePatterns = [
          // Conference-specific patterns
          ...(collegeName.includes('America East') ? ['America-East-Conference-logo.png'] : []),
          ...(collegeName.includes('Atlantic 10') ? ['Atlantic-10-Conference-logo.png'] : []),
          ...(collegeName.includes('Atlantic Sun') ? ['Atlantic-Sun-Conference-ASUN-logo.png'] : []),
          ...(collegeName.includes('Big East') ? ['Big-East-Conference-logo.png'] : []),
          ...(collegeName.includes('Big Sky') ? ['Big-Sky-Conference-logo.png'] : []),
          ...(collegeName.includes('Big South') ? ['Big-South-Conference-logo.png'] : []),
          ...(collegeName.includes('Big Ten') ? ['Big_Ten_Conference_logo.png'] : []),
          ...(collegeName.includes('Big 12') ? ['Big_12_Conference_logo.png'] : []),
          ...(collegeName.includes('Colonial Athletic') ? ['Colonial-Athletic-Association-logo.png'] : []),
          ...(collegeName.includes('Conference USA') ? ['Conference-USA-logo.png'] : []),
          ...(collegeName.includes('Horizon League') ? ['Horizon-League-logo.png'] : []),
          ...(collegeName.includes('Ivy League') ? ['Ivy-League-logo.png'] : []),
          ...(collegeName.includes('Metro Atlantic') ? ['Metro-Atlantic-Athletic-Conference-MAAC-logo.png'] : []),
          ...(collegeName.includes('Mid-American') ? ['Mid-American_Conference_logo.png'] : []),
          ...(collegeName.includes('Missouri Valley') ? ['Missouri-Valley-Conference-logo.png'] : []),
          ...(collegeName.includes('Mountain West') ? ['Mountain_West_Conference_logo.png'] : []),
          ...(collegeName.includes('Northeast') ? ['Northeast-Conference-logo.png'] : []),
          ...(collegeName.includes('Ohio Valley') ? ['Ohio-Valley-Conference-logo.png'] : []),
          ...(collegeName.includes('Pac-12') ? ['Pac-12_logo.png'] : []),
          ...(collegeName.includes('Patriot League') ? ['Patriot-League-Conference-logo-480x480.png'] : []),
          ...(collegeName.includes('Southeastern') ? ['Southeastern_Conference_logo.png'] : []),
          ...(collegeName.includes('Southern') ? ['Southern-Conference-logo-1.png'] : []),
          ...(collegeName.includes('Southland') ? ['Southland-Conference-logo.png'] : []),
          ...(collegeName.includes('Summit League') ? ['Summit-League-logo.png'] : []),
          ...(collegeName.includes('Sun Belt') ? ['Sun_Belt_Conference_2020_logo.png'] : []),
          ...(collegeName.includes('West Coast') ? ['West-Coast-Conference-logo.png'] : []),
          ...(collegeName.includes('Western Athletic') ? ['Western-Athletic-Conference-logo.png'] : []),

          // Generic patterns for any other conferences
          collegeName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-') + '-logo.png',
          collegeName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') + '_logo.png',
          collegeName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/Conference/g, '').trim().replace(/\s+/g, '-') + '-Conference-logo.png'
        ].filter(Boolean); // Remove null values
        
        patterns.push(...conferencePatterns);
      }

      // Get base name and mascot
      const parts = collegeName.split(' ');
      const mascot = parts[parts.length - 1];
      const baseName = parts.slice(0, -1).join(' ');

      // Try various patterns for the college name
      const basePatterns = [
        // Full name patterns
        [collegeName, '-logo.png'],
        [collegeName, '_logo.png'],
        
        // Base name patterns
        [baseName, '-logo.png'],
        [baseName, '_logo.png'],
        
        // Base name with mascot patterns
        [baseName + ' ' + mascot, '-logo.png'],
        [baseName + ' ' + mascot, '_logo.png'],
        
        // Without "University" if present
        ...(baseName.includes('University') ? [
          [baseName.replace('University', '').trim(), '-logo.png'],
          [baseName.replace('University', '').trim(), '_logo.png']
        ] : []),
        
        // Without "State" if present
        ...(baseName.includes('State') ? [
          [baseName.replace('State', '').trim(), '-logo.png'],
          [baseName.replace('State', '').trim(), '_logo.png'],
          [baseName.replace('State', '').trim() + ' State', '-logo.png'],
          [baseName.replace('State', '').trim() + ' State', '_logo.png']
        ] : [])
      ];

      // Generate all possible patterns with different separators and cases
      basePatterns.forEach(([name, suffix]) => {
        // Standard case with hyphens
        patterns.push(
          name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-') + suffix
        );
        
        // Standard case with underscores
        patterns.push(
          name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') + suffix
        );
        
        // Try with mascot separated
        if (name.includes(mascot)) {
          patterns.push(
            name.replace(mascot, '').trim().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-') +
            '-' + mascot + suffix
          );
          patterns.push(
            name.replace(mascot, '').trim().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') +
            '_' + mascot + suffix
          );
        }
      });
    }

    // Try each pattern until one works
    for (const pattern of patterns) {
      try {
        const imageRef = ref(storage, pattern);
        const downloadURL = await getDownloadURL(imageRef);
        return downloadURL;
      } catch (error) {
        continue; // Try next pattern if this one fails
      }
    }

    console.error('Error getting college image URL: No matching patterns found');
    return null;
  } catch (error) {
    console.error('Error getting college image URL:', error);
    return null;
  }
};

/**
 * Gets the download URL for a conference image
 * @param {string} imagePath - The path to the image in storage
 * @returns {Promise<string>} The download URL of the image
 */
export const getConferenceImageURL = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error getting conference image URL:', error);
    return null; // Return null instead of throwing to handle missing images gracefully
  }
};


/**
 * Uploads a tournament image to Firebase Storage
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The download URL of the uploaded image
 */
export const uploadTournamentImage = async (file) => {
  try {
    // Create a unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    
    // Create a reference to the file location
    const fileRef = ref(storage, `tournaments/${uniqueFilename}`);
    
    // Upload the file
    await uploadBytes(fileRef, file);
    
    // Get and return the download URL
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading tournament image:', error);
    throw new Error('Failed to upload tournament image');
  }
};

/**
 * Gets the download URL for a tournament image
 * @param {string} imagePath - The path to the image in storage
 * @returns {Promise<string>} The download URL of the image
 */
export const getTournamentImageURL = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error getting tournament image URL:', error);
    return null; // Return null instead of throwing to handle missing images gracefully
  }
};

/**
 * Deletes a tournament image from storage
 * @param {string} imagePath - The path to the image in storage
 * @returns {Promise<void>}
 */
export const deleteTournamentImage = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting tournament image:', error);
    throw new Error('Failed to delete tournament image');
  }
};

/**
 * Helper function to generate a unique filename for uploaded images
 * @param {string} originalFilename - The original filename
 * @returns {string} A unique filename
 */
export const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};
