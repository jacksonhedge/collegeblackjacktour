import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app, db } from './config.js';

// Helper function to get Greek letters
function getGreekLetters(name) {
  const greekMap = {
    'Alpha': 'Α',
    'Beta': 'Β',
    'Gamma': 'Γ',
    'Delta': 'Δ',
    'Epsilon': 'Ε',
    'Zeta': 'Ζ',
    'Eta': 'Η',
    'Theta': 'Θ',
    'Iota': 'Ι',
    'Kappa': 'Κ',
    'Lambda': 'Λ',
    'Mu': 'Μ',
    'Nu': 'Ν',
    'Xi': 'Ξ',
    'Omicron': 'Ο',
    'Pi': 'Π',
    'Rho': 'Ρ',
    'Sigma': 'Σ',
    'Tau': 'Τ',
    'Upsilon': 'Υ',
    'Phi': 'Φ',
    'Chi': 'Χ',
    'Psi': 'Ψ',
    'Omega': 'Ω'
  };

  // Special cases
  if (name === "FIJI") return "ΦΓΔ";
  if (name === "SAE") return "ΣΑΕ";
  if (name === "PIKE" || name === "Pi Kappa Alpha") return "ΠΚΑ";
  if (name === "Sig Ep") return "ΣΦΕ";
  if (name === "DU") return "ΔΥ";
  if (name === "ATO") return "ΑΤΩ";
  if (name === "TKE") return "ΤΚΕ";
  if (name === "ZBT") return "ΖΒΤ";
  if (name === "DKE") return "ΔΚΕ";
  if (name === "AEPi") return "ΑΕΠ";
  if (name === "D Sig" || name === "Delta Sig") return "ΔΣ";
  if (name === "Sammy") return "ΣΑΜ";

  // For standard format names, convert each word
  const words = name.split(' ');
  let letters = '';
  for (const word of words) {
    if (greekMap[word]) {
      letters += greekMap[word];
    }
  }
  return letters || name; // Return original name if no Greek letters found
}

const collegeData = {
  'william-and-mary-tribe': [
    "Theta Delta Chi", "Sigma Pi", "Sigma Chi", "Sig Ep", "SAE", "Psi Upsilon",
    "Pi Kappa Alpha", "Kappa Delta Rho", "Kappa Alpha Order", "FIJI", "Delta Chi",
    "Beta Theta Pi", "Alpha Sigma Phi", "AEPi"
  ],
  'virginia-tech-hokies': [
    "ZBT", "Triangle", "TKE", "Theta Delta Chi", "Theta Chi", "Sigma Tau Gamma",
    "Sigma Phi Delta", "Sigma Nu", "Sig Ep", "Pi Kappa Alpha", "Phi Sigma Kappa",
    "Phi Kappa Tau", "Phi Kappa Psi", "Kappa Delta Rho", "Kappa Alpha Order", "FIJI",
    "DKE", "Delta Upsilon", "Delta Sigma Phi", "Delta Chi", "Beta Theta Pi", "ATO",
    "Alpha Gamma Rho", "AEPi"
  ],
  'texas-longhorns': [
    "TKE", "Theta Chi", "Sigma Chi", "Sammy", "SAE", "Pike", "Phi Kappa Tau",
    "Phi Kappa Sigma", "Omega Phi Gamma", "Lambda Phi Epsilon", "Lambda Chi Alpha",
    "Lambda Beta", "Kappa Sigma", "Gamma Beta", "DU", "Delta Epsilon", "D Sig",
    "Beta Theta Pi", "AEPi"
  ],
  'georgia-bulldogs': [
    "Theta Chi", "Tau Epsilon Phi", "Sigma Pi", "Sigma Phi Epsilon", "Sigma Nu",
    "Sigma Chi", "SAE", "Pi Kappa Phi", "Pi Kappa Alpha", "Phi Kappa Theta",
    "Phi Kappa Tau", "Phi Delta Theta", "Lambda Chi Alpha", "Kappa Sigma",
    "Kappa Alpha Order", "FIJI", "Delta Tau Delta", "Delta Sigma Phi",
    "Delta Kappa Epsilon", "Chi Psi", "Chi Phi", "Beta Upsilon Chi",
    "Beta Theta Pi", "ATO", "Alpha Sigma Phi", "Alpha Gamma Rho", "AEPi"
  ],
  'florida-gulf-coast-eagles': [
    "Sigma Chi", "Sig Ep", "Pi Kappa Phi", "Pi Kappa Alpha", "Phi Delta Theta",
    "Kappa Sigma", "Kappa Alpha Order", "Beta Theta Pi", "ATO"
  ],
  'james-madison-dukes': [
    "TKE", "Sigma Nu", "Sig Ep", "Pi Kappa Phi", "Pi Kappa Alpha",
    "Lambda Chi Alpha", "Kappa Sigma", "Kappa Delta Rho", "Kappa Alpha Order",
    "FIJI", "DU", "Delta Tau Delta", "Delta Sigma Phi", "Beta Theta Pi",
    "Alpha Sigma Phi", "AEPi", "Acacia"
  ],
  'old-dominion-monarchs': [
    "Theta Chi", "Sig Ep", "Pi Kappa Phi", "Pi Kappa Alpha", "Phi Delta Theta",
    "Kappa Sigma", "Kappa Delta Rho", "Kappa Alpha Order", "FIJI",
    "Alpha Kappa Lambda"
  ],
  'southern-methodist-mustangs': [
    "Sigma Nu", "Sigma Chi", "Phi Delta Theta", "Kappa Sigma", "Delta Sig",
    "Beta Upsilon Chi", "Beta Theta Pi", "AEPi"
  ],
  'florida-gators': [
    "ZBT", "Theta Chi", "TEP", "Sigma Nu", "Sigma Chi", "Sammy", "SAE",
    "Pi Kappa Phi", "Pi Kappa Alpha", "Phi Kappa Tau", "Phi Delta Theta",
    "Lambda Chi Alpha", "Kappa Sigma", "Kappa Alpha Order", "Delta Tau Delta",
    "Delta Sigma Phi", "Chi Phi", "Beta Theta Pi", "ATO", "Alpha Gamma Rho", "AEPi"
  ],
  'florida-state-seminoles': [
    "ZBT", "TKE", "Theta Chi", "Sigma Rho", "Sigma Lambda Beta", "Sigma Chi",
    "Sig Ep", "SAE", "Pi Lambda Phi", "Pi Kappa Psi", "Pi Kappa Alpha",
    "Phi Beta Sigma", "Kappa Sigma", "Kappa Alpha Order", "FIJI",
    "Delta Sigma Phi", "Delta Chi", "Chi Phi", "Beta Theta Pi", "Alpha Delta Phi"
  ],
  'georgia-tech-yellow-jackets': [
    "TKE", "Theta Xi", "Theta Chi", "Sigma Phi Epsilon", "Sigma Nu", "Sigma Chi",
    "SAE", "Pi Kappa Phi", "Pi Kappa Alpha", "Phi Kappa Sigma", "Phi Delta Theta",
    "Lambda Chi Alpha", "Kappa Sigma", "Kappa Alpha Order", "FIJI", "DU",
    "Delta Chi", "Chi Phi", "Beta Theta Pi", "ATO", "AEPi"
  ],
  'georgia-state-panthers': [
    "Pi Kappa Alpha", "Phi Kappa Pi", "ATO", "AEPi"
  ],
  'georgia-southern-eagles': [
    "TKE", "Theta Xi", "Sigma Nu", "Sigma Chi", "SAE", "Pi Kappa Phi",
    "Pi Kappa Alpha", "Phi Sigma Kappa", "Phi Delta Theta", "Kappa Sigma",
    "Kappa Alpha Order", "Delta Chi", "Beta Upsilon Chi", "ATO", "Alpha Sigma Phi"
  ],
  'george-mason-patriots': [
    "TKE", "Theta Xi", "Theta Chi", "Sigma Chi", "Pi Kappa Phi", "Pi Kappa Alpha",
    "Phi Sigma Kappa", "Phi Kappa Sigma", "Phi Delta Theta", "Kappa Sigma",
    "Kappa Alpha Order", "Kappa Alpha Mu", "Delta Chi", "Chi Psi", "Beta Theta Pi",
    "Alpha Sigma Phi", "AEPi"
  ],
  'houston-cougars': [
    "TKE", "Sigma Pi", "Sigma Phi Epsilon", "Sigma Nu", "Sigma Chi", "SAE",
    "Pi Kappa Phi", "Phi Kappa Sigma", "Kappa Sigma", "Kappa Phi", "Gamma Beta",
    "Alpha Sigma Phi", "AEPi"
  ],
  'jacksonville-dolphins': [
    "Sigma Nu", "Sigma Chi", "PIKE", "Kappa Sigma"
  ],
  'kennesaw-state-owls': [
    "TKE", "Theta Xi", "Theta Chi", "Sigma Pi", "Sigma Nu", "SAE", "Pi Kappa Phi",
    "Kappa Alpha Order", "Delta Tau Delta", "Delta Sigma", "Delta Chi", "BYX",
    "Beta Theta", "ATO", "AEPi"
  ],
  'kent-state-golden-flashes': [
    "TKE", "Sigma Nu", "Sigma Chi", "Sig Ep", "Pi Kappa Alpha", "Phi Sigma Kappa",
    "Phi Kappa Tau", "Phi Delta Theta", "FIJI", "Delta Tau Delta", "Delta Chi",
    "ATO", "Alpha Sigma Phi", "AEPi"
  ],
  'mercer-bears': [
    "Sigma Nu", "SAE", "Pi Kappa Phi", "Phi Delta Theta", "Lambda Chi Alpha",
    "Kappa Alpha Order", "ATO"
  ],
  'miami-oh-redhawks': [
    "TKE", "Sigma Chi", "Sig Ep", "Pi Kappa Phi", "Pi Kappa Alpha", "Phi Kappa Tau",
    "Phi Kappa Psi", "Lambda Chi Alpha", "Kappa Sigma", "Kappa Alpha Order", "FIJI",
    "DU", "DKE", "Delta Sigma Phi", "Delta Chi", "Chi Psi", "Beta Theta Pi",
    "Alpha Sigma Phi", "Alpha Delta Phi", "Alpha Chi Rho", "AEPi"
  ],
  'bowling-green-falcons': [
    "TKE", "Theta Chi", "Sigma Nu", "Sigma Chi", "Sig Ep", "SAE", "Phi Mu Alpha",
    "Kappa Sigma", "Kappa Alpha Order", "ATO", "Alpha Sigma Phi"
  ],
  'baylor-bears': [
    "Sigma Nu", "Sig Ep", "SAE", "Lambda Phi Epsilon", "Kappa Sig", "KAO",
    "Fiji", "DTD", "ATO"
  ],
  'akron-zips': [
    "TKE", "Sigma Nu", "SAE", "Phi Kappa Psi", "Phi Delta Theta",
    "Lambda Chi Alpha", "Kappa Sigma"
  ],
  'cincinnati-bearcats': [
    "TKE", "Theta Chi", "Sigma Tau Gamma", "Sigma Kappa", "Sigma Chi",
    "Sigma Alpha Mu", "Sig Ep", "SAE", "Pi Lambda Phi", "Pi Kappa Phi",
    "Pi Kappa Alpha", "Phi Kappa Tau", "Phi Delta Theta", "Lambda Chi",
    "Kappa Sigma", "Delta Tau Delta", "Beta Theta Pi", "AEPi"
  ],
  'dayton-flyers': [
    "Sigma Kappa", "SAE", "Pi Kappa Phi", "Phi Tau", "Phi Kappa Psi"
  ],
  'fau-owls': [
    "Theta Chi", "Sigma Chi", "Pi Kappa Phi", "Pi Kappa Alpha", "Phi Delta Theta",
    "Phi Beta Sigma", "Kappa Sigma", "Delta Tau Delta", "Beta Theta Pi", "ATO", "AEPi"
  ],
  'ohio-bobcats': [
    "TKE", "Theta Chi", "SAE", "Pi Kappa Alpha", "Phi Kappa Psi", "Phi Delta",
    "Kappa Sigma", "Beta Theta Pi", "AEPi", "Acacia"
  ],
  'texas-tech-red-raiders': [
    "Triangle", "TKE", "Sig Nu", "SAE", "Pike", "Phi Kappa Psi", "Lambda Chi",
    "Kappa Sig", "KAO", "Fiji", "Delta Chi", "Chi Psi", "BYC", "Beta", "ATO", "AGR"
  ],
  'tcu-horned-frogs': [
    "Sigma Chi", "Sig Nu", "Sig Ep", "Pi Kapp", "Phi Kappa Sigma", "Phi Delt",
    "Lambda", "Kappa Sigma", "Fiji", "DTD", "Beta Theta Pi"
  ],
  'toledo-rockets': [
    "Theta Chi", "Sig Ep", "SAE", "Pi Kappa Phi", "Pi Kappa Alpha",
    "Phi Kappa Psi", "Kappa Delta Rho", "FIJI", "Alpha Sigma Phi"
  ]
};

async function addFraternities() {
  try {
    for (const [collegeId, fraternities] of Object.entries(collegeData)) {
      console.log(`Adding fraternities for college: ${collegeId}`);
      
      for (const fratName of fraternities) {
        const fraternityRef = collection(db, 'colleges', collegeId, 'fraternities');
        
        const fratData = {
          name: fratName,
          letters: getGreekLetters(fratName),
          active: true,
          joinDate: new Date(),
          createdAt: new Date()
        };
        
        const docRef = await addDoc(fraternityRef, fratData);
        console.log(`Added ${fratName} (${fratData.letters}) to ${collegeId} with ID: ${docRef.id}`);
      }
    }
    
    console.log('All fraternities added successfully');
  } catch (error) {
    console.error('Error adding fraternities:', error);
  }
}

// Execute the function
addFraternities();
