import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const FraternityList = ({ college, onBack }) => {
  const [fraternities, setFraternities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFraternities = async () => {
      try {
        const db = getFirestore();
        
        // Try both the normalized ID and the simple ID
        const simpleId = college.id.split('-').slice(0, -1).join('-'); // Remove mascot part
        
        // Try with normalized ID first
        let snapshot = await getDocs(collection(db, 'colleges', college.id, 'fraternities'));
        
        // If no results, try with simple ID
        if (snapshot.empty) {
          snapshot = await getDocs(collection(db, 'colleges', simpleId, 'fraternities'));
        }
        
        const fraternityList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort fraternities - scheduled ones first, then alphabetically by name
        const sortedFraternities = fraternityList.sort((a, b) => {
          // First prioritize scheduled fraternities
          if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
          if (a.status !== 'scheduled' && b.status === 'scheduled') return 1;
          
          // If both have the same scheduled status, sort alphabetically by name
          if (a.status === b.status) {
            return (a.name || '').localeCompare(b.name || '');
          }
          
          return 0;
        });
        
        setFraternities(sortedFraternities);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching fraternities:', err);
        setError('Failed to load fraternities');
        setLoading(false);
      }
    };

    fetchFraternities();
  }, [college.id]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6">
          <p>Loading fraternities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {college.name} Fraternities
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Browse fraternities
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-600 flex items-center"
        >
          <svg 
            className="w-4 h-4 mr-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          Back to Colleges
        </button>
      </div>
      <div className="border-t border-gray-200 p-6">
        {fraternities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {fraternities.map((fraternity) => (
              <div 
                key={fraternity.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-200"
              >
                <div className="text-center">
                  <h4 className={`text-xl font-bold mb-1 ${
                    fraternity.letters?.charAt(0) === 'Α' || fraternity.letters?.includes('Alpha') ? 'text-red-300' :
                    fraternity.letters?.charAt(0) === 'Β' || fraternity.letters?.includes('Beta') ? 'text-orange-300' :
                    fraternity.letters?.charAt(0) === 'Γ' || fraternity.letters?.includes('Gamma') ? 'text-yellow-300' :
                    fraternity.letters?.charAt(0) === 'Δ' || fraternity.letters?.includes('Delta') ? 'text-green-300' :
                    fraternity.letters?.charAt(0) === 'Ε' || fraternity.letters?.includes('Epsilon') ? 'text-purple-300' :
                    fraternity.letters?.charAt(0) === 'Ζ' || fraternity.letters?.includes('Zeta') ? 'text-red-300' :
                    fraternity.letters?.charAt(0) === 'Η' || fraternity.letters?.includes('Eta') ? 'text-orange-300' :
                    fraternity.letters?.charAt(0) === 'Θ' || fraternity.letters?.includes('Theta') ? 'text-yellow-300' :
                    fraternity.letters?.charAt(0) === 'Ι' || fraternity.letters?.includes('Iota') ? 'text-green-300' :
                    fraternity.letters?.charAt(0) === 'Κ' || fraternity.letters?.includes('Kappa') ? 'text-purple-300' :
                    fraternity.letters?.charAt(0) === 'Λ' || fraternity.letters?.includes('Lambda') ? 'text-red-300' :
                    fraternity.letters?.charAt(0) === 'Μ' || fraternity.letters?.includes('Mu') ? 'text-orange-300' :
                    fraternity.letters?.charAt(0) === 'Ν' || fraternity.letters?.includes('Nu') ? 'text-yellow-300' :
                    fraternity.letters?.charAt(0) === 'Ξ' || fraternity.letters?.includes('Xi') ? 'text-green-300' :
                    fraternity.letters?.charAt(0) === 'Ο' || fraternity.letters?.includes('Omicron') ? 'text-purple-300' :
                    fraternity.letters?.charAt(0) === 'Π' || fraternity.letters?.includes('Pi') ? 'text-red-300' :
                    fraternity.letters?.charAt(0) === 'Ρ' || fraternity.letters?.includes('Rho') ? 'text-orange-300' :
                    fraternity.letters?.charAt(0) === 'Σ' || fraternity.letters?.includes('Sigma') ? 'text-yellow-300' :
                    fraternity.letters?.charAt(0) === 'Τ' || fraternity.letters?.includes('Tau') ? 'text-green-300' :
                    fraternity.letters?.charAt(0) === 'Υ' || fraternity.letters?.includes('Upsilon') ? 'text-purple-300' :
                    fraternity.letters?.charAt(0) === 'Φ' || fraternity.letters?.includes('Phi') ? 'text-red-300' :
                    fraternity.letters?.charAt(0) === 'Χ' || fraternity.letters?.includes('Chi') ? 'text-orange-300' :
                    fraternity.letters?.charAt(0) === 'Ψ' || fraternity.letters?.includes('Psi') ? 'text-yellow-300' :
                    fraternity.letters?.charAt(0) === 'Ω' || fraternity.letters?.includes('Omega') ? 'text-green-300' :
                    'text-gray-900'
                  }`}>
                    {fraternity.letters}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {fraternity.name}
                  </p>
                  <div className="mt-2 space-y-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      fraternity.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {fraternity.active ? 'Active' : 'Inactive'}
                    </span>
                    {fraternity.status === 'scheduled' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No fraternities found for this college
          </div>
        )}
      </div>
    </div>
  );
};

export default FraternityList;
