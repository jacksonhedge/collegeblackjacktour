import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getCollegeLogo } from '../data/collegeImages';
import CollegeAvatar from './CollegeAvatar';

const TEXAS_COLLEGES = [
  'texas-tech-red-raiders',
  'texas-longhorns',
  'texas-am-university',
  'baylor-bears'
];

const TournamentCollegeList = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const collegesData = {};
        
        // Fetch data for each Texas college
        for (const collegeId of TEXAS_COLLEGES) {
          // Get college data
          const collegeRef = collection(db, 'colleges', collegeId, 'fraternities');
          const fraternitySnapshot = await getDocs(collegeRef);
          
          const fraternities = fraternitySnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter(frat => frat.id !== 'placeholder'); // Filter out placeholder entries

          // Get college name in proper format
          const collegeName = collegeId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          
          // Get college document to check for custom logo
          const collegeDoc = await getDocs(collection(db, 'colleges'));
          const collegeData = collegeDoc.docs.find(doc => doc.id === collegeId)?.data() || {};

          collegesData[collegeId] = {
            id: collegeId,
            name: collegeName,
            logoUrl: collegeData.logoUrl,
            fraternities,
            fraternityCount: fraternities.length
          };
        }

        setColleges(Object.values(collegesData));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching colleges:', err);
        setError('Failed to load colleges');
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading colleges...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Texas Colleges</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {colleges.map((college) => (
          <div
            key={college.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
          >
            <div className="h-48 bg-gray-100 flex items-center justify-center p-4">
              <CollegeAvatar
                name={college.name}
                className="w-32 h-32"
                logoUrl={college.logoUrl}
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">{college.name}</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Total Fraternities:</span>
                  <span className="text-sm font-bold text-blue-600">{college.fraternityCount}</span>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Fraternities:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {college.fraternities.map((fraternity) => (
                      <div
                        key={fraternity.id}
                        className="bg-gray-50 p-2 rounded text-center"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {fraternity.letters || fraternity.id}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentCollegeList;
