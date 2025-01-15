import React from 'react';
import { SAMPLE_FRATERNITIES } from './firebase/fraternityData';

// Schools data
const texasSchools = [
  "University of Texas, Austin",
  "Texas A&M University",
  "Texas Tech University",
  "Baylor University",
  "Texas Christian University",
  "University of Houston",
  "Southern Methodist University"
];

const alabamaSchools = [
  "University of Alabama",
  "Auburn University",
  "University of Alabama at Birmingham",
  "University of South Alabama",
  "Troy University",
  "Alabama State University",
  "Jacksonville State University",
  "University of North Alabama",
  "Samford University",
  "University of Montevallo",
  "University of West Alabama",
  "Alabama A&M University"
];

// Get all fraternities from selected schools
const getSelectedFraternities = () => {
  const selectedSchools = [...texasSchools, ...alabamaSchools];
  const allFraternities = [];
  
  selectedSchools.forEach(school => {
    if (SAMPLE_FRATERNITIES[school]) {
      SAMPLE_FRATERNITIES[school].forEach(frat => {
        allFraternities.push({
          name: frat.name,
          letters: frat.letters
        });
      });
    }
  });

  return allFraternities;
};

const LandingPage = () => {
  const fraternities = getSelectedFraternities();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500 animate-gradient-xy pt-16">
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-7xl md:text-9xl font-black text-white tracking-widest animate-float drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
          COMING SOON
        </h1>
      </div>

      {/* Ticker Tape */}
      <div className="absolute bottom-0 w-full bg-black/30 backdrop-blur-lg py-10">
        <div className="ticker-container overflow-hidden">
          <div className="flex space-x-28 animate-ticker">
            {/* Repeat the fraternities three times to ensure smooth looping */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-28 whitespace-nowrap">
                {fraternities.map((fraternity, index) => (
                  <div 
                    key={`${i}-${index}`} 
                    className="w-80 h-32 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-white shadow-lg text-center px-4 space-y-2 transition-all duration-300"
                  >
                    <div className="text-xl font-bold">{fraternity.letters}</div>
                    <div className="text-sm opacity-80">{fraternity.name}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
