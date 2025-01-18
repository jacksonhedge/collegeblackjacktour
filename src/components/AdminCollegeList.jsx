import React, { useState, useEffect } from 'react';
import { COLLEGE_IMAGES } from '../data/collegeImages';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import FraternityCard from './FraternityCard';
import AddFraternityForm from './AddFraternityForm';
import FraternityForm from './FraternityForm';
import CollegeAvatar from './CollegeAvatar';

const AdminCollegeList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConference, setSelectedConference] = useState('');
  const [colleges, setColleges] = useState([]);

  // Helper function to format college name from filename
  const formatCollegeName = (filename) => {
    return filename
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/logo\.png$/, '')
      .replace(/\.png$/, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  };

  // Conference mapping with exact abbreviations from directory
  const conferenceMap = {
    'A10': 'Atlantic 10',
    'ACC': 'Atlantic Coast Conference',
    'AEC': 'America East Conference',
    'ASUN': 'ASUN Conference',
    'BIG 10': 'Big Ten Conference',
    'BIG 12': 'Big 12 Conference',
    'BIG EAST': 'Big East Conference',
    'BIG SKY': 'Big Sky Conference',
    'BIG SOUTH': 'Big South Conference',
    'CAA': 'Colonial Athletic Association',
    'IVY': 'Ivy League',
    'MAAC': 'Metro Atlantic Athletic Conference',
    'MAC': 'Mid-American Conference',
    'Missouri Valley': 'Missouri Valley Conference',
    'MW': 'Mountain West Conference',
    'PAC - 12': 'Pac-12 Conference',
    'Patriot League': 'Patriot League',
    'SBC': 'Sun Belt Conference',
    'SEC': 'Southeastern Conference',
    'SLC': 'Southland Conference',
    'SOCON': 'Southern Conference',
    'SUMMIT': 'Summit League',
    'WAC': 'Western Athletic Conference',
    'WCC': 'West Coast Conference'
  };

  // Exact conference order from directory
  const conferenceOrder = [
    'A10',
    'ACC',
    'AEC',
    'ASUN',
    'BIG 10',
    'BIG 12',
    'BIG EAST',
    'BIG SKY',
    'BIG SOUTH',
    'CAA',
    'IVY',
    'MAAC',
    'MAC',
    'Missouri Valley',
    'MW',
    'PAC - 12',
    'Patriot League',
    'SBC',
    'SEC',
    'SLC',
    'SOCON',
    'SUMMIT',
    'WAC',
    'WCC'
  ];

  // Helper function to get abbreviated conference name
  const getAbbreviatedConference = (fullName) => {
    return Object.entries(conferenceMap).find(([abbr, full]) => full === fullName)?.[0] || fullName;
  };

  // Helper function to get full conference name
  const getFullConferenceName = (abbr) => {
    return conferenceMap[abbr] || abbr;
  };

  // Helper function to extract conference from path
  const getConference = (imageName) => {
    // Try to match conference from the image name
    for (const [key, value] of Object.entries(conferenceMap)) {
      if (imageName.includes(key)) {
        return value;
      }
    }
    return 'Unknown Conference';
  };

  // Get conferences in the correct order
  const abbreviatedConferences = conferenceOrder.map(abbr => ({
    abbr,
    full: conferenceMap[abbr] || abbr
  }));

  // Fetch colleges data
  const fetchColleges = async () => {
    try {
      const collegesRef = collection(db, 'colleges');
      const snapshot = await getDocs(collegesRef);
      const collegeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setColleges(collegeData);
    } catch (err) {
      console.error('Error fetching colleges:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchColleges();
  }, []);

  // Filter colleges based on search and conference
  const filteredColleges = COLLEGE_IMAGES.filter(image => {
    const name = formatCollegeName(image);
    // Check if we have updated conference data from Firestore
    const collegeDoc = colleges.find(c => c.name === name);
    const conference = collegeDoc ? collegeDoc.conference : getConference(image);
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesConference = !selectedConference || conference === selectedConference;
    return matchesSearch && matchesConference;
  });

  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedCollegeFraternities, setSelectedCollegeFraternities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFraternity, setEditingFraternity] = useState(null);
  const [loadingFraternities, setLoadingFraternities] = useState(false);
  const [editingConference, setEditingConference] = useState(false);
  const [savingConference, setSavingConference] = useState(false);

  // Helper function to create a valid Firestore ID
  const createCollegeId = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCollegeClick = async (imageName) => {
    const name = formatCollegeName(imageName);
    const conference = getConference(imageName);
    setSelectedCollege({ name, conference, imageName });
    setShowModal(true);
    setLoadingFraternities(true);
    
    try {
      // Check if college exists in Firestore
      const collegeId = createCollegeId(name);
      const collegeRef = doc(db, 'colleges', collegeId);
      const collegeDoc = await getDoc(collegeRef);
      
      // Get fraternities first to get accurate count
      const fraternitiesRef = collection(db, 'colleges', collegeId, 'fraternities');
      const fraternitiesSnapshot = await getDocs(fraternitiesRef);
      const fraternitiesData = fraternitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (!collegeDoc.exists()) {
        // Initialize college in Firestore if it doesn't exist
        await setDoc(collegeRef, {
          name,
          conference,
          logoPath: `/college-logos/${imageName}`,
          fraternityCount: fraternitiesData.length
        });
        await fetchColleges(); // Refresh colleges after adding new one
      } else {
        // Update selected college with actual data from Firestore
        setSelectedCollege(prev => ({
          ...prev,
          conference: collegeDoc.data().conference || conference
        }));
      }

      setSelectedCollegeFraternities(fraternitiesData);

      // Update fraternity count in Firestore
      await updateDoc(collegeRef, {
        fraternityCount: fraternitiesData.length
      });
      await fetchColleges(); // Refresh colleges to update the count in the UI
    } catch (err) {
      console.error('Error fetching fraternities:', err);
    } finally {
      setLoadingFraternities(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4 bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">All Available Colleges</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search colleges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Conference Filter */}
          <div className="w-full md:w-64">
            <select
              value={getAbbreviatedConference(selectedConference)}
              onChange={(e) => setSelectedConference(getFullConferenceName(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Conferences</option>
              {abbreviatedConferences.map(({ abbr, full }) => (
                <option key={abbr} value={abbr}>{abbr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Showing {filteredColleges.length} {filteredColleges.length === 1 ? 'college' : 'colleges'}
            {selectedConference && ` in ${selectedConference}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      </div>

      {/* College Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredColleges.map((image, index) => {
          const name = formatCollegeName(image);
          const collegeDoc = colleges.find(c => c.name === name);
          const conference = collegeDoc ? collegeDoc.conference : getConference(image);
          
          return (
            <div
              key={index}
              onClick={() => handleCollegeClick(image)}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 p-6 flex flex-col items-center h-52 cursor-pointer hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-1 relative"
            >
              <CollegeAvatar
                name={name}
                logoUrl={`/college-logos/${image}`}
                className="w-20 h-20 mb-4"
              />
              <h2 className="text-lg font-semibold text-gray-900 text-center line-clamp-2 mb-2">{name}</h2>
              <p className="text-sm text-gray-600">{getAbbreviatedConference(conference)}</p>
              <div className="absolute bottom-4 right-4 bg-blue-50 px-3 py-1 rounded-full">
                <p className="text-sm font-medium text-blue-600">
                  {collegeDoc?.fraternityCount || 0} {(collegeDoc?.fraternityCount === 1) ? 'Fraternity' : 'Fraternities'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* College Details Modal */}
      {showModal && selectedCollege && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex justify-between items-center w-full">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCollege?.name} - Fraternity Details
                  </h2>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Fraternity
                  </button>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-6">
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg">
                  <CollegeAvatar
                    name={selectedCollege.name}
                    logoUrl={`/college-logos/${selectedCollege.imageName}`}
                    className="w-20 h-20"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedCollege.name}</h3>
                    <div className="flex items-center gap-2">
                      {editingConference ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={getAbbreviatedConference(selectedCollege.conference)}
                              onChange={(e) => {
                                const newConference = getFullConferenceName(e.target.value);
                                setSelectedCollege(prev => ({
                                  ...prev,
                                  conference: newConference
                                }));
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                              disabled={savingConference}
                            >
                              {abbreviatedConferences.map(({ abbr, full }) => (
                                <option key={abbr} value={abbr}>{abbr}</option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  setSavingConference(true);
                                  try {
                                    const collegeId = createCollegeId(selectedCollege.name);
                                    const collegeRef = doc(db, 'colleges', collegeId);
                                    await updateDoc(collegeRef, {
                                      conference: selectedCollege.conference
                                    });
                                    await fetchColleges(); // Refresh colleges after update
                                  } catch (error) {
                                    console.error('Error updating conference:', error);
                                    alert('Error updating conference. Please try again.');
                                  } finally {
                                    setSavingConference(false);
                                    setEditingConference(false);
                                  }
                                }}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                disabled={savingConference}
                              >
                                {savingConference ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-white" />
                                ) : (
                                  'Save'
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingConference(false);
                                  // Reset to original conference
                                  setSelectedCollege(prev => ({
                                    ...prev,
                                    conference: prev.conference
                                  }));
                                }}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                disabled={savingConference}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-600">{getAbbreviatedConference(selectedCollege.conference)}</p>
                          <button
                            onClick={() => setEditingConference(true)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                            title="Edit conference"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-blue-600">
                      {selectedCollegeFraternities.length} {selectedCollegeFraternities.length === 1 ? 'Fraternity' : 'Fraternities'}
                    </p>
                  </div>
                </div>

                <div>
                  {loadingFraternities ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : selectedCollegeFraternities.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {selectedCollegeFraternities.map(fraternity => (
                        <FraternityCard
                          key={fraternity.id}
                          fraternity={fraternity}
                          onEdit={() => setEditingFraternity(fraternity)}
                          onDelete={async () => {
                            try {
                              const collegeId = createCollegeId(selectedCollege.name);
                              const fraternityRef = doc(db, 'colleges', collegeId, 'fraternities', fraternity.id);
                              await deleteDoc(fraternityRef);
                              
                              // Update fraternity count
                              const collegeRef = doc(db, 'colleges', collegeId);
                              await updateDoc(collegeRef, {
                                fraternityCount: selectedCollegeFraternities.length - 1
                              });
                              
                              // Refresh data
                              handleCollegeClick(selectedCollege.imageName);
                            } catch (error) {
                              console.error('Error deleting fraternity:', error);
                              alert('Error deleting fraternity. Please try again.');
                            }
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-gray-50">
                      <p className="text-gray-600 text-center">No fraternities found for {selectedCollege.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fraternity Edit Modal */}
      {editingFraternity && (
        <FraternityForm
          fraternity={editingFraternity}
          collegeName={selectedCollege.name}
          onClose={() => setEditingFraternity(null)}
          onSuccess={() => {
            setEditingFraternity(null);
            handleCollegeClick(selectedCollege.imageName);
          }}
        />
      )}

      {/* Add Fraternity Modal */}
      {showAddForm && (
        <AddFraternityForm
          collegeName={selectedCollege.name}
          onSuccess={() => {
            setShowAddForm(false);
            handleCollegeClick(selectedCollege.imageName);
          }}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default AdminCollegeList;
