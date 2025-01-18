import { adminDb, adminStorage } from './admin.js';
import { collegeNames } from './collegeNames.js';
import { COLLEGE_IMAGES } from '../data/collegeImages.js';

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


// Helper function to convert college name to a valid document ID
const createCollegeId = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

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

        // Initialize empty fraternities collection
        console.log(`Creating empty fraternities collection for ${name}`);

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
