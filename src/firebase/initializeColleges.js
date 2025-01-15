import { adminDb, adminStorage } from './admin.js';
import { collegeNames } from './collegeNames.js';

const CONFERENCE_IDENTIFIERS = [
  'America-East-Conference',
  'Atlantic-10-Conference',
  'Atlantic-Sun-Conference-ASUN',
  'Big-East-Conference',
  'Big-Sky-Conference',
  'Big-South-Conference',
  'Big_12_Conference',
  'Big_Ten_Conference',
  'Colonial-Athletic-Association',
  'Ivy-League',
  'Metro-Atlantic-Athletic-Conference-MAAC',
  'Mid-American_Conference',
  'Missouri-Valley-Conference',
  'Mountain_West_Conference',
  'Pac-12',
  'Patriot-League-Conference',
  'Southeastern_Conference',
  'Southern-Conference',
  'Southland-Conference',
  'Summit-League',
  'Sun_Belt_Conference_2020',
  'West-Coast-Conference',
  'Western-Athletic-Conference'
];

const COLLEGE_IMAGES = [
  'Abilene-Christian-Wildcats-logo.png',
  'Air_Force_Falcons_logo.png',
  'Akron_Zips_logo.png',
  'Alabama_Crimson_Tide_logo.png',
  'Albany-Great-Danes-logo.png',
  'American-Eagles-logo.png',
  'Appalachian_State_Mountaineers_logo.png',
  'Arizona_State_Sun_Devils_logo.png',
  'Arizona_Wildcats_logo.png',
  'Arkansas_Razorbacks_logo.png',
  'Arkansas_State_Red_Wolves_logo.png',
  'Army_West_Point_Black_Knights_logo.png',
  'Auburn_Tigers_logo.png',
  'Austin-Peay-Governors-logo.png',
  'BYU_Cougars_logo.png',
  'Ball_State_Cardinals_logo.png',
  'Baylor_Bears_logo.png',
  'Bellarmine-Knights-logo.png',
  'Belmont-Bruins-logo.png',
  'Binghamton-Bearcats-logo.png',
  'Boise_State_Broncos_Logo.png',
  'Boston-University-Terriers-logo.png',
  'Boston_College_Eagles_logo.png',
  'Bowling_Green_Falcons_logo.png',
  'Bradley-Braves-logo.png',
  'Brown-Bears-logo.png',
  'Bryant-Bulldogs-logo.png',
  'Bucknell-Bison-logo.png',
  'Buffalo_Bulls_logo.png',
  'Butler-Bulldogs-logo.png',
  'California-Baptist-Lancers-logo.png',
  'California_Golden_Bears_logo.png',
  'Campbell-Fighting-Camels-logo.png',
  'Canisius-Golden-Griffins-logo.png',
  'Central-Arkansas-Bears-logo.png',
  'Central_Michigan_Chippewas_logo.png',
  'Charleston-Southern-Buccaneers-logo.png',
  'Chattanooga-Mocs-logo.png',
  'Cincinnati_Bearcats_logo.png',
  'Citadel-Bulldogs-logo.png',
  'Clemson_Tigers_logo.png',
  'Coastal_Carolina_Chanticleers_logo.png',
  'Colgate-Raiders-logo.png',
  'College-of-Charleston-Cougars-logo.png',
  'Colorado_Buffaloes_logo.png',
  'Colorado_State_Rams_logo.png',
  'Columbia-Lions-logo.png',
  'Connecticut_Huskies_logo.png',
  'Cornell-Big-Red-logo.png',
  'Creighton-Bluejays-logo.png',
  'Dartmouth-Big-Green-logo.png',
  'Davidson-Wildcats-logo.png',
  'Dayton-Flyers-logo.png',
  'DePaul-Blue-Demons-logo.png',
  'Delaware-Fightin-Blue-Hens-logo.png',
  'Denver-Pioneers-logo.png',
  'Drake-Bulldogs-logo.png',
  'Drexel-Dragons-logo.png',
  'Duke_Blue_Devils_logo.png',
  'Duquesne-Dukes-logo.png',
  'East-Tennessee-State-Buccaneers-logo.png',
  'Eastern-Kentucky-Colonels-logo.png',
  'Eastern-Washington-Eagles-logo.png',
  'Eastern_Michigan_Eagles_logo.png',
  'Elon-Phoenix-logo.png',
  'Evansville-Purple-Aces-logo.png',
  'Fairfield-Stags-logo.png',
  'Florida-Gulf-Coast-Eagles-logo.png',
  'Florida_Gators_logo.png',
  'Florida_State_Seminoles_logo.png',
  'Fordham-Rams-logo.png',
  'Fresno_State_Bulldogs_logo.png',
  'Furman-Paladins-logo-1.png',
  'Gardner-Webb-Runnin-Bulldogs-logo.png',
  'George-Mason-Patriots-logo.png',
  'George-Washington-Colonials-logo.png',
  'Georgetown-Hoyas-logo.png',
  'Georgia_Bulldogs_logo.png',
  'Georgia_Southern_Eagles_logo.png',
  'Georgia_State_Panthers_logo.png',
  'Georgia_Tech_Yellow_Jackets_logo.png',
  'Gonzaga-Bulldogs-logo.png',
  'Grand-Canyon-Antelopes-logo.png',
  'Hampton-Pirates-logo.png',
  'Harvard-Crimson-logo.png',
  'Hawaii_Rainbow_Warriors_logo.png',
  'High-Point-Panthers-logo.png',
  'Hofstra-Pride-logo.png',
  'Holy-Cross-Crusaders-logo.png',
  'Houston-Baptist-Huskies-logo.png',
  'Houston_Cougars_logo.png',
  'Idaho-State-Bengals-logo.png',
  'Idaho-Vandals-logo.png',
  'Illinois-Chicago-UIC-Flames-logo.png',
  'Illinois-State-Redbirds-logo.png',
  'Illinois_Fighting_Illini_logo.png',
  'Incarnate-Word-Cardinals-logo.png',
  'Indiana-State-Sycamores-logo.png',
  'Indiana_Hoosiers_logo.png',
  'Iona-Gaels-logo.png',
  'Iowa_Hawkeyes_logo.png',
  'Iowa_State_Cyclones_logo.png',
  'Jacksonville-Dolphins-logo.png',
  'James_Madison_Dukes_logo.png',
  'Kansas-City-UMKC-Roos-logo.png',
  'Kansas_Jayhawks_logo.png',
  'Kansas_State_Wildcats_logo.png',
  'Kent_State_Golden_Flashes.png',
  'Kentucky_Wildcats_logo.png',
  'LSU_Tigers.png',
  'La-Salle-Explorers-logo.png',
  'Lafayette-Leopards-logo.png',
  'Lamar-Cardinals-logo.png',
  'Lehigh-Mountain-Hawks-logo.png',
  'Lipscomb-Bisons-logo.png',
  'Longwood-Lancers-logo.png',
  'Louisiana-Lafayette_Ragin_Cajuns_logo.png',
  'Louisiana-Monroe_Warhawks_logo.png',
  'Louisville_Cardinals_logo.png',
  'Loyola-Chicago-Ramblers-logo.png',
  'Loyola-Marymount-Lions-logo.png',
  'Loyola-University-Maryland-Greyhounds-logo.png',
  'Maine-Black-Bears-logo.png',
  'Manhattan-Jaspers-logo.png',
  'Marist-Red-Foxes-logo.png',
  'Marquette-Golden-Eagles-logo.png',
  'Marshall_Thundering_Herd_logo.png',
  'Maryland_Terrapins_logo.png',
  'McNeese-State-Cowboys-logo.png',
  'Mercer-Bears-logo.png',
  'Miami_Hurricanes_logo.png',
  'Miami_OH_Redhawks_logo.png',
  'Michigan_State_Spartans_logo.png',
  'Michigan_Wolverines_logo.png',
  'Minnesota_Golden_Gophers_logo.png',
  'Mississippi_State_Bulldogs_logo.png',
  'Missouri-State-Bears-logo.png',
  'Missouri_Tigers_logo.png',
  'Monmouth-Hawks-logo.png',
  'Montana-Grizzlies-logo.png',
  'Montana-State-Bobcats-logo.png',
  'Mount-St.-Marys-Mountaineers-logo.png',
  'Murray-State-Racers-logo.png',
  'Navy_Midshipmen_logo.png',
  'Nebraska-Omaha-Mavericks-logo.png',
  'Nebraska_Cornhuskers_logo.png',
  'Nevada_Wolf_Pack_logo.png',
  'New-Hampshire-Wildcats-logo.png',
  'New-Jersey-Institute-of-Technology-NJIT-Highlanders-logo.png',
  'New-Orleans-Privateers-logo.png',
  'New_Mexico_Lobos_logo.png',
  'Niagara-Purple-Eagles-logo.png',
  'Nicholls-State-Colonels-logo.png',
  'North-Alabama-Lions-logo.png',
  'North-Carolina-AT-Aggies-logo.png',
  'North-Dakota-Fighting-Hawks-logo.png',
  'North-Dakota-State-Bison-logo.png',
  'North-Florida-Ospreys-logo.png',
  'North_Carolina_State_Wolfpack_logo.png',
  'North_Carolina_Tar_Heels_logo.png',
  'Northeastern-Huskies-logo.png',
  'Northern-Arizona-Lumberjacks-logo.png',
  'Northern-Colorado-Bears-logo.png',
  'Northern-Iowa-Panthers-logo.png',
  'Northern_Illinois_Huskies.png',
  'Northwestern-State-Demons-logo.png',
  'Northwestern_Wildcats_logo.png',
  'Notre_Dame_Fighting_Irish_logo.png',
  'Ohio_Bobcats_logo.png',
  'Ohio_State_Buckeyes_logo.png',
  'Oklahoma_Sooners_logo.png',
  'Oklahoma_State_Cowboys_logo.png',
  'Old_Dominion_Monarchs_logo.png',
  'Ole_Miss_Rebels_logo.png',
  'Oral-Roberts-Golden-Eagles-logo.png',
  'Oregon_Ducks_logo.png',
  'Oregon_State_Beavers_logo.png',
  'Pacific-Tigers-logo.png',
  'Penn-Quakers-logo.png',
  'Penn_State_Nittany_Lions_logo.png',
  'Pepperdine-Waves-logo.png',
  'Pitt_Panthers_logo.png',
  'Portland-Pilots-logo.png',
  'Portland-State-Vikings-logo.png',
  'Presbyterian-Blue-Hose-logo.png',
  'Princeton-Tigers-logo.png',
  'Providence-Friars-logo.png',
  'Purdue_Boilermakers_logo.png',
  'Queens-University-of-Charlotte-Royals-logo.png',
  'Quinnipiac-Bobcats-logo.png',
  'Radford-Highlanders-logo.png',
  'Rhode-Island-Rams-logo.png',
  'Richmond-Spiders-logo.png',
  'Rider-Broncs-logo.png',
  'Rutgers_Scarlet_Knights_logo.png',
  'SMU_Mustang_logo.png',
  'Sacramento-State-Hornets-logo.png',
  'Saint-Josephs-Hawks-logo.png',
  'Saint-Louis-Billikens-logo.png',
  'Saint-Marys-College-Gaels-logo.png',
  'Saint-Peters-Peacocks-logo.png',
  'Samford-Bulldogs-logo.png',
  'San-Diego-Toreros-logo.png',
  'San-Francisco-Dons-logo.png',
  'San_Diego_State_Aztecs_logo.png',
  'San_Jose_State_Spartans_logo.png',
  'Santa-Clara-Broncos-logo.png',
  'Seattle-Redhawks-logo.png',
  'Seton-Hall-Pirates-logo.png',
  'Siena-Saints-logo.png',
  'South-Carolina-Upstate-Spartans-logo.png',
  'South-Dakota-Coyotes-logo.png',
  'South-Dakota-State-Jackrabbits-logo.png',
  'South_Alabama_Jaguars_logo.png',
  'South_Carolina_Gamecocks_logo.png',
  'Southeastern-Louisiana-Lions-logo.png',
  'Southern-Illinois-Salukis-logo.png',
  'Southern-Utah-Thunderbirds-logo.png',
  'Southern_Miss_Golden_Eagles_logo.png',
  'St.-Bonaventure-Bonnies-logo.png',
  'St.-Johns-Red-Storm-logo.png',
  'St.-Thomas-Tommies-logo.png',
  'Stanford_Cardinal_logo.png',
  'Stephen-F.-Austin-Lumberjacks-logo.png',
  'Stetson-Hatters-logo.png',
  'Stony-Brook-Seawolves-logo.png',
  'Syracuse_Orange_logo.png',
  'TCU_Horned_Frogs_logo.png',
  'Tarleton-State-Texans-logo.png',
  'Tennessee_Volunteers_logo.png',
  'Texas-AM-Commerce-Lions-logo.png',
  'Texas-AM-Corpus-Christi-Islanders-logo.png',
  'Texas-Rio-Grande-Valley-UTRGV-Vaqueros-logo.png',
  'Texas_AM_University_logo.png',
  'Texas_Longhorns_logo.png',
  'Texas_State_Bobcats_logo.png',
  'Texas_Tech_Red_Raiders_logo.png',
  'Toledo_Rockets_logo.png',
  'Towson-Tigers-logo.png',
  'Troy_Trojans_logo.png',
  'UCF_Knights_logo.png',
  'UCLA.png',
  'UMass-Lowell-River-Hawks-logo.png',
  'UMass_Amherst_Minutemen_logo.png',
  'UNC-Asheville-Bulldogs-logo.png',
  'UNC-Wilmington-Seahawks-logo.png',
  'UNCG-Spartans-logo.png',
  'UNLV_Rebels_logo.png',
  'USC_Trojans_logo.png',
  'UT-Arlington-Mavericks-logo.png',
  'University-of-Maryland-Baltimore-County-UMBC-Retrievers-logo.png',
  'Utah-Tech-Trailblazers-logo.png',
  'Utah-Valley-Wolverines-logo.png',
  'Utah_State_Aggies_logo.png',
  'Utah_Utes_logo.png',
  'VCU-Rams-logo.png',
  'VMI-Keydets-logo.png',
  'Valparaiso-Beacons-logo.png',
  'Vanderbilt_Commodores_logo.png',
  'Vermont-Catamounts-logo.png',
  'Villanova-Wildcats-logo.png',
  'Virginia_Cavaliers_logo.png',
  'Virginia_Tech_Hokies_logo.png',
  'Wake_Forest_Demon_Deacons_logo.png',
  'Washington_Huskies_logo.png',
  'Washington_State_Cougars_logo.png',
  'Weber-State-Wildcats-logo.png',
  'West_Virginia_Mountaineers_logo.png',
  'Western-Carolina-Catamounts-logo.png',
  'Western-Illinois-Leathernecks-logo.png',
  'Western_Michigan_Broncos_logo.png',
  'William-Mary-Tribe-logo.png',
  'Winthrop-Eagles-logo.png',
  'Wisconsin_Badgers_logo.png',
  'Wofford-Terriers-logo.png',
  'Wyoming_Cowboys_logo.png',
  'Xavier-Musketeers-logo.png',
  'Yale-Bulldogs-logo.png'
];

// Helper function to convert college name to a valid document ID
const createCollegeId = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

import { SAMPLE_FRATERNITIES } from './fraternityData.js';

console.log('Starting college initialization...');
console.log(`Total colleges to process: ${COLLEGE_IMAGES.length}`);
console.log('College names available:', collegeNames.length);

export const initializeColleges = async () => {
  console.log('Initializing colleges...');
  try {
    // First, clear existing data
    console.log('Clearing existing college data...');
    const collegesRef = adminDb.collection('colleges');
    const snapshot = await collegesRef.get();
    console.log(`Found ${snapshot.docs.length} existing colleges to delete`);
    const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    console.log('Successfully cleared existing college data');

    // Process colleges
    for (const imageName of COLLEGE_IMAGES) {
      try {
        // Skip conference images
        // Skip conference images but log them
        const matchingConference = CONFERENCE_IDENTIFIERS.find(conf => 
          imageName.toLowerCase().includes(conf.toLowerCase())
        );
        if (matchingConference) {
          console.log(`Skipping conference image: ${imageName} (${matchingConference})`);
          continue;
        }
        console.log(`Processing image: ${imageName}`);

        // Get the normalized name from the image file
        const normalizedImageName = imageName
          .replace(/_/g, ' ')
          .replace(/\.(png|jpg|jpeg)$/i, '')
          .replace(/logo$/i, '')
          .replace(/-/g, ' ')
          .trim();

        // Find the matching college name from our list with more flexible matching
        let name = null;
        const matchingNames = collegeNames.filter(collegeName => {
          const normalizedCollegeName = createCollegeId(collegeName);
          const normalizedImage = createCollegeId(normalizedImageName);
          
          // Try exact match first
          if (normalizedCollegeName === normalizedImage) {
            return true;
          }
          
          // Try partial matches
          const collegeWords = normalizedCollegeName.split(/-+/).filter(w => w.length > 2);
          const imageWords = normalizedImage.split(/-+/).filter(w => w.length > 2);
          
          // Check if all significant words from either name are present in the other
          const collegeWordsMatch = collegeWords.some(word => 
            imageWords.some(imgWord => imgWord.includes(word) || word.includes(imgWord))
          );
          const imageWordsMatch = imageWords.some(word => 
            collegeWords.some(colWord => colWord.includes(word) || word.includes(colWord))
          );
          
          const matches = collegeWordsMatch && imageWordsMatch;
          if (matches) {
            console.log(`Found potential match: ${collegeName} for ${normalizedImageName}`);
          }
          return matches;
        });

        if (matchingNames.length > 1) {
          console.log(`Multiple matches found for ${imageName}: ${matchingNames.join(', ')}`);
          name = matchingNames[0]; // Use the first match
        } else if (matchingNames.length === 1) {
          name = matchingNames[0];
        }

        if (!name) {
          console.log(`No matching college name found for image: ${imageName}`);
          continue;
        }

        const id = createCollegeId(name);
        // Construct the Firebase Storage URL with proper encoding
        // Get the download URL from Firebase Storage
        const logoRef = adminStorage.bucket().file(`college-logos/${imageName}`);
        const [signedUrl] = await logoRef.getSignedUrl({
          action: 'read',
          expires: '03-01-2500' // Far future expiration
        });
        const logoUrl = signedUrl;
        console.log(`Processing college: ${name}`);
        console.log(`Setting URL for ${name}: ${logoUrl}`);

        // Add college to Firestore with error handling
        try {
          await adminDb.collection('colleges').doc(id).set({
            name,
            logoUrl
          });
          console.log(`Successfully added college to Firestore: ${name}`);
        } catch (error) {
          console.error(`Error adding college to Firestore: ${name}`, error);
          continue;
        }

        // Initialize fraternities collection with error handling
        try {
          const fraternitiesRef = adminDb.collection('colleges').doc(id).collection('fraternities');
          const fraternities = SAMPLE_FRATERNITIES[name] || [];
          
          if (fraternities.length > 0) {
            console.log(`Adding ${fraternities.length} fraternities for ${name}`);
            for (const frat of fraternities) {
              const fratId = createCollegeId(frat.name);
              await fraternitiesRef.doc(fratId).set({
                ...frat,
                joinDate: new Date()
              });
            }
          } else {
            console.log(`Adding placeholder fraternity for ${name}`);
            await fraternitiesRef.doc('placeholder').set({
              name: 'No fraternities yet',
              letters: 'N/A',
              active: false,
              joinDate: new Date()
            });
          }
        } catch (error) {
          console.error(`Error initializing fraternities for ${name}:`, error);
        }

        console.log(`Successfully processed college: ${name}`);
      } catch (error) {
        console.error(`Error processing college ${imageName}:`, error);
      }
    }

    console.log('Successfully initialized colleges and fraternities');
  } catch (error) {
    console.error('Error initializing colleges:', error);
    throw error;
  }
};
