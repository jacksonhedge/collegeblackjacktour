import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import CollegeMap from './CollegeMap';

// More accurate coordinates for colleges on US map
const collegeCoordinates = {
  // Northeast
  'Harvard University': { x: 1080, y: 145, state: 'Massachusetts' },
  'MIT': { x: 1082, y: 147, state: 'Massachusetts' },
  'Yale University': { x: 1070, y: 165, state: 'Connecticut' },
  'Princeton University': { x: 1050, y: 185, state: 'New Jersey' },
  'Columbia University': { x: 1055, y: 175, state: 'New York' },
  'Cornell University': { x: 1020, y: 150, state: 'New York' },
  'Penn State': { x: 1000, y: 180, state: 'Pennsylvania' },
  'University of Pennsylvania': { x: 1040, y: 190, state: 'Pennsylvania' },
  'University of Pittsburgh': { x: 980, y: 185, state: 'Pennsylvania' },
  'Pitt Panthers': { x: 980, y: 185, state: 'Pennsylvania' },
  
  // Southeast
  'Duke University': { x: 990, y: 280, state: 'North Carolina' },
  'University of North Carolina': { x: 985, y: 285, state: 'North Carolina' },
  'University of Virginia': { x: 980, y: 250, state: 'Virginia' },
  'Georgia Tech': { x: 920, y: 350, state: 'Georgia' },
  'University of Georgia': { x: 925, y: 355, state: 'Georgia' },
  'University of Florida': { x: 940, y: 450, state: 'Florida' },
  'Florida State University': { x: 920, y: 430, state: 'Florida' },
  'University of Miami': { x: 960, y: 490, state: 'Florida' },
  
  // Midwest
  'University of Michigan': { x: 850, y: 170, state: 'Michigan' },
  'Michigan State University': { x: 855, y: 175, state: 'Michigan' },
  'Ohio State University': { x: 880, y: 200, state: 'Ohio' },
  'Indiana University': { x: 840, y: 230, state: 'Indiana' },
  'Purdue University': { x: 835, y: 225, state: 'Indiana' },
  'University of Wisconsin': { x: 780, y: 155, state: 'Wisconsin' },
  'University of Illinois': { x: 800, y: 210, state: 'Illinois' },
  'Northwestern University': { x: 795, y: 190, state: 'Illinois' },
  
  // Texas
  'University of Texas': { x: 580, y: 420, state: 'Texas' },
  'Texas A&M University': { x: 600, y: 425, state: 'Texas' },
  'Texas Tech University': { x: 520, y: 380, state: 'Texas' },
  'Rice University': { x: 610, y: 440, state: 'Texas' },
  'SMU': { x: 590, y: 390, state: 'Texas' },
  'TCU': { x: 585, y: 395, state: 'Texas' },
  
  // West Coast
  'Stanford University': { x: 70, y: 260, state: 'California' },
  'UC Berkeley': { x: 65, y: 255, state: 'California' },
  'UCLA': { x: 90, y: 340, state: 'California' },
  'USC': { x: 92, y: 342, state: 'California' },
  'UC San Diego': { x: 95, y: 365, state: 'California' },
  'University of Washington': { x: 60, y: 100, state: 'Washington' },
  'University of Oregon': { x: 55, y: 150, state: 'Oregon' },
  
  // Mountain West
  'University of Colorado': { x: 450, y: 270, state: 'Colorado' },
  'Arizona State University': { x: 300, y: 360, state: 'Arizona' },
  'University of Arizona': { x: 310, y: 380, state: 'Arizona' },
  'University of Utah': { x: 350, y: 230, state: 'Utah' },
};

// State-specific map images and boundaries
const stateMapData = {
  'Texas': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Flag-map_of_Texas.svg/1000px-Flag-map_of_Texas.svg.png',
    bounds: { x: 400, y: 300, width: 300, height: 250 },
    collegeOffsets: {
      'University of Texas': { x: 180, y: 120 },
      'Texas A&M University': { x: 200, y: 125 },
      'Texas Tech University': { x: 120, y: 80 },
      'Rice University': { x: 210, y: 140 },
      'SMU': { x: 190, y: 90 },
      'TCU': { x: 185, y: 95 },
    }
  },
  'California': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/California_in_United_States.svg/2000px-California_in_United_States.svg.png',
    bounds: { x: 0, y: 150, width: 150, height: 300 },
    collegeOffsets: {
      'Stanford University': { x: 70, y: 110 },
      'UC Berkeley': { x: 65, y: 105 },
      'UCLA': { x: 90, y: 190 },
      'USC': { x: 92, y: 192 },
      'UC San Diego': { x: 95, y: 215 },
    }
  },
  'Florida': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Florida_in_United_States.svg/2000px-Florida_in_United_States.svg.png',
    bounds: { x: 850, y: 400, width: 150, height: 150 },
    collegeOffsets: {
      'University of Florida': { x: 90, y: 50 },
      'Florida State University': { x: 70, y: 30 },
      'University of Miami': { x: 110, y: 90 },
    }
  },
  'Massachusetts': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Massachusetts_in_United_States.svg/2000px-Massachusetts_in_United_States.svg.png',
    bounds: { x: 1020, y: 100, width: 100, height: 80 },
    collegeOffsets: {
      'Harvard University': { x: 60, y: 45 },
      'MIT': { x: 62, y: 47 },
    }
  },
};

const CollegeMapContainer = ({ showStateSelector = false }) => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Start with sample data for immediate display
    const sampleColleges = [
      {
        id: '1',
        name: 'Harvard University',
        location: 'Cambridge, MA',
        state: 'Massachusetts',
        coordinates: collegeCoordinates['Harvard University'] || { x: 1080, y: 145 },
        logoUrl: '',
        fraternities: [
          { name: 'Alpha Delta Phi', memberCount: 45 },
          { name: 'Sigma Chi', memberCount: 52 },
        ]
      },
      {
        id: '2',
        name: 'Stanford University',
        location: 'Stanford, CA',
        state: 'California',
        coordinates: collegeCoordinates['Stanford University'] || { x: 70, y: 260 },
        logoUrl: '',
        fraternities: [
          { name: 'Kappa Sigma', memberCount: 58 },
          { name: 'Delta Tau Delta', memberCount: 43 },
        ]
      },
      {
        id: '3',
        name: 'University of Texas',
        location: 'Austin, TX',
        state: 'Texas',
        coordinates: collegeCoordinates['University of Texas'] || { x: 580, y: 420 },
        logoUrl: '',
        fraternities: [
          { name: 'Phi Delta Theta', memberCount: 67 },
          { name: 'Beta Theta Pi', memberCount: 54 },
        ]
      },
      {
        id: '4',
        name: 'Texas Tech University',
        location: 'Lubbock, TX',
        state: 'Texas',
        coordinates: collegeCoordinates['Texas Tech University'] || { x: 520, y: 380 },
        logoUrl: '',
        fraternities: [
          { name: 'Kappa Alpha', memberCount: 48 },
          { name: 'Sigma Nu', memberCount: 55 },
        ]
      },
      {
        id: '5',
        name: 'University of Florida',
        location: 'Gainesville, FL',
        state: 'Florida',
        coordinates: collegeCoordinates['University of Florida'] || { x: 940, y: 450 },
        logoUrl: '',
        fraternities: [
          { name: 'Pi Kappa Alpha', memberCount: 62 },
          { name: 'Alpha Tau Omega', memberCount: 49 },
        ]
      },
    ];
    
    setColleges(sampleColleges);
    setLoading(false);
    
    // Then fetch real data
    fetchCollegeData();
  }, []);

  const fetchCollegeData = async () => {
    try {
      // Only try to fetch if db is available
      if (!db) {
        console.log('Database not initialized, using sample data');
        return;
      }
      
      const collegesSnapshot = await getDocs(collection(db, 'colleges'));
      const collegesData = [];
      
      for (const doc of collegesSnapshot.docs) {
        const collegeData = doc.data();
        const collegeName = collegeData.name;
        
        // Skip fetching fraternities for now to speed up loading
        const fraternities = [
          { name: 'Sample Fraternity 1', memberCount: Math.floor(Math.random() * 50) + 30 },
          { name: 'Sample Fraternity 2', memberCount: Math.floor(Math.random() * 50) + 30 },
        ];
        
        // Get coordinates or use random if not in our list
        const coordData = collegeCoordinates[collegeName];
        const coordinates = coordData ? { x: coordData.x, y: coordData.y } : {
          x: Math.random() * 1000 + 100,
          y: Math.random() * 400 + 100,
        };
        const state = coordData?.state || collegeData.state || 'Unknown';
        
        collegesData.push({
          id: doc.id,
          name: collegeName,
          location: collegeData.location || collegeData.state || 'Unknown Location',
          state,
          coordinates,
          logoUrl: collegeData.logoUrl || collegeData.logo || '',
          fraternities,
        });
      }
      
      if (collegesData.length > 0) {
        setColleges(collegesData);
      }
    } catch (error) {
      console.error('Error fetching college data:', error);
      setError('Using sample data');
    }
  };

  const handleCollegeClick = (college) => {
    setSelectedCollege(college);
  };

  // Get unique states from colleges
  const uniqueStates = [...new Set(colleges.map(c => c.state).filter(s => s && s !== 'Unknown'))].sort();
  
  // Filter colleges based on selected state
  const displayedColleges = selectedState 
    ? colleges.filter(c => c.state === selectedState)
    : colleges;

  // Adjust coordinates for state view
  const adjustedColleges = selectedState && stateMapData[selectedState]
    ? displayedColleges.map(college => {
        const stateData = stateMapData[selectedState];
        const offset = stateData.collegeOffsets[college.name];
        if (offset) {
          return {
            ...college,
            coordinates: {
              x: stateData.bounds.x + offset.x,
              y: stateData.bounds.y + offset.y
            }
          };
        }
        return college;
      })
    : displayedColleges;

  return (
    <>
      {/* State Selector */}
      {showStateSelector && (
        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Select State:</label>
          <select
            value={selectedState || ''}
            onChange={(e) => setSelectedState(e.target.value || null)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All States</option>
            {uniqueStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      )}
      
      <CollegeMap
        colleges={adjustedColleges}
        onCollegeClick={handleCollegeClick}
        loading={loading}
        selectedState={selectedState}
        stateMapData={stateMapData}
      />
      
      {/* College Details Modal */}
      {selectedCollege && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedCollege.name}</h2>
                <p className="text-gray-600">{selectedCollege.location}</p>
              </div>
              <button
                onClick={() => setSelectedCollege(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Fraternities</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedCollege.fraternities.map((frat, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span>{frat.name}</span>
                      <span className="text-sm text-gray-600">
                        {frat.memberCount} members
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CollegeMapContainer;