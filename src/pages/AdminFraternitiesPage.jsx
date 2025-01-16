import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import FraternityForm from '../components/FraternityForm';

const AdminFraternitiesPage = () => {
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [fraternities, setFraternities] = useState([]);
  const [selectedFraternity, setSelectedFraternity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to normalize college name (same as in initializeColleges.js)
  const createCollegeId = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const db = getFirestore();
        const collegesRef = collection(db, 'colleges');
        // Don't sort by name since some colleges might not have it in their data
        const snapshot = await getDocs(collegesRef);
        console.log('DEBUG - All college documents:', snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        })));
        const collegeList = snapshot.docs.map(doc => {
          const data = doc.data();
          // Get the mascot from the ID
          const mascot = doc.id.split('-').slice(-1)[0]
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          return {
            id: doc.id,
            name: data.name || doc.id.split('-').slice(0, -1).join(' '),
            fullName: `${data.name || doc.id.split('-').slice(0, -1).join(' ')} ${mascot}`,
            ...data
          };
        });
        setColleges(collegeList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching colleges:', err);
        setError('Failed to load colleges');
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  useEffect(() => {
    const fetchFraternities = async () => {
      if (!selectedCollege) return;

      try {
        setLoading(true);
        const db = getFirestore();
        
        // Use the full college ID (including mascot)
        console.log('Selected college details:', {
          id: selectedCollege.id,
          name: selectedCollege.name,
          fullName: selectedCollege.fullName,
          rawData: selectedCollege
        });

        // First check if the college document exists
        const collegeRef = doc(db, 'colleges', selectedCollege.id);
        const collegeDoc = await getDoc(collegeRef);
        console.log('College document exists:', collegeDoc.exists(), 'Data:', collegeDoc.data());

        const fraternityRef = collection(db, 'colleges', selectedCollege.id, 'fraternities');
        console.log('Attempting to fetch fraternities from:', fraternityRef.path);
        
        const snapshot = await getDocs(fraternityRef);
        console.log('Fraternity snapshot:', snapshot.docs.length, 'documents found');
        
        const fraternityList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          ref: doc.ref
        }));
        
        console.log('Processed fraternity list:', fraternityList);
        
        setFraternities(fraternityList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching fraternities:', err);
        setError('Failed to load fraternities');
        setLoading(false);
      }
    };

    fetchFraternities();
  }, [selectedCollege]);

  const handleFraternityUpdate = (updatedFraternity) => {
    setFraternities(prev =>
      prev.map(f =>
        f.id === selectedFraternity.id ? { ...f, ...updatedFraternity } : f
      )
    );
    setSelectedFraternity(null);
  };

  if (loading && !selectedCollege) {
    return <div className="p-4">Loading colleges...</div>;
  }

  if (error && !selectedCollege) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Fraternities</h1>
          <p className="mt-2 text-sm text-gray-500">
            Select a college to manage its fraternities
          </p>
        </div>
        {selectedCollege && (
          <button
            onClick={async () => {
              const db = getFirestore();
              const collegeRef = doc(db, 'colleges', selectedCollege.id);
              const collegeDoc = await getDoc(collegeRef);
              alert(`College Document Debug:\nExists: ${collegeDoc.exists()}\nID: ${selectedCollege.id}\nData: ${JSON.stringify(collegeDoc.data(), null, 2)}`);
            }}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            Debug College Document
          </button>
        )}
      </div>

      <div className="mb-8">
        <label htmlFor="college" className="block text-sm font-medium text-gray-700">
          Select College
        </label>
        <select
          id="college"
          value={selectedCollege?.id || ''}
          onChange={(e) => {
            const college = colleges.find(c => c.id === e.target.value);
            console.log('DEBUG - College selected:', {
              selectedId: e.target.value,
              collegeFound: !!college,
              collegeDetails: college
            });
            setSelectedCollege(college);
            setFraternities([]);
            setSelectedFraternity(null);
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Select a college...</option>
          {[...colleges].sort((a, b) => a.fullName.localeCompare(b.fullName)).map((college) => (
            <option key={college.id} value={college.id}>
              {college.fullName || college.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCollege && loading && (
        <div className="text-center py-6">
          <p className="text-gray-500">Loading fraternities...</p>
          <p className="text-xs text-gray-400 mt-2">
            Checking: colleges/{selectedCollege.id}/fraternities
          </p>
        </div>
      )}
      {selectedCollege && !loading && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {fraternities.map((fraternity) => (
              <li key={fraternity.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedFraternity(fraternity)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-blue-600">
                        {fraternity.letters}
                      </div>
                      <div className="ml-4 text-sm text-gray-500">
                        {fraternity.name}
                      </div>
                    </div>
                    <div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        fraternity.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {fraternity.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {fraternity.presidentName || 'No president listed'}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {fraternity.joinDate ? new Date(fraternity.joinDate.seconds * 1000).toLocaleDateString() : 'No join date'}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {fraternities.length === 0 && !loading && (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-2">
                No fraternities found for this college
              </p>
              <p className="text-xs text-gray-400">
                Looking in: colleges/{selectedCollege.id}/fraternities
              </p>
            </div>
          )}
        </div>
      )}

      {selectedFraternity && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full">
            <FraternityForm
              fraternity={selectedFraternity}
              collegeId={selectedCollege.id}
              onClose={() => setSelectedFraternity(null)}
              onUpdate={handleFraternityUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFraternitiesPage;
