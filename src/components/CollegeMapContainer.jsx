import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import CollegeMap from './CollegeMap';

// Sample coordinates for popular colleges (you can expand this)
const collegeCoordinates = {
  'Harvard University': { x: 1050, y: 150 },
  'MIT': { x: 1055, y: 155 },
  'Yale University': { x: 1040, y: 170 },
  'Princeton University': { x: 1020, y: 190 },
  'Stanford University': { x: 100, y: 250 },
  'UC Berkeley': { x: 95, y: 245 },
  'UCLA': { x: 120, y: 320 },
  'University of Texas': { x: 600, y: 450 },
  'University of Michigan': { x: 800, y: 180 },
  'Duke University': { x: 950, y: 300 },
  'University of Florida': { x: 900, y: 480 },
  'Ohio State University': { x: 850, y: 220 },
  'Penn State': { x: 950, y: 200 },
  'University of Virginia': { x: 960, y: 260 },
  'Georgia Tech': { x: 880, y: 380 },
  'University of Washington': { x: 80, y: 120 },
  'Arizona State University': { x: 250, y: 380 },
  'University of Colorado': { x: 450, y: 280 },
  'University of Wisconsin': { x: 750, y: 160 },
  'Indiana University': { x: 820, y: 240 },
};

const CollegeMapContainer = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState(null);

  useEffect(() => {
    fetchCollegeData();
  }, []);

  const fetchCollegeData = async () => {
    try {
      setLoading(true);
      
      // Fetch colleges
      const collegesSnapshot = await getDocs(collection(db, 'colleges'));
      const collegesData = [];
      
      for (const doc of collegesSnapshot.docs) {
        const collegeData = doc.data();
        const collegeName = collegeData.name;
        
        // Fetch fraternities for this college
        const fraternitiesSnapshot = await getDocs(
          collection(db, 'colleges', doc.id, 'fraternities')
        );
        
        const fraternities = fraternitiesSnapshot.docs.map(fratDoc => ({
          name: fratDoc.data().name || 'Unknown Fraternity',
          memberCount: fratDoc.data().memberCount || Math.floor(Math.random() * 100) + 20,
        }));
        
        // Get coordinates or use random if not in our list
        const coordinates = collegeCoordinates[collegeName] || {
          x: Math.random() * 1000 + 100,
          y: Math.random() * 400 + 100,
        };
        
        collegesData.push({
          id: doc.id,
          name: collegeName,
          location: collegeData.location || collegeData.state || 'Unknown Location',
          coordinates,
          logoUrl: collegeData.logoUrl || collegeData.logo || '',
          fraternities,
        });
      }
      
      setColleges(collegesData);
    } catch (error) {
      console.error('Error fetching college data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollegeClick = (college) => {
    setSelectedCollege(college);
  };

  return (
    <>
      <CollegeMap
        colleges={colleges}
        onCollegeClick={handleCollegeClick}
        loading={loading}
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