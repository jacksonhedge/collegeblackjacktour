import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import FraternityCard from './FraternityCard';
import AddFraternityForm from './AddFraternityForm';
import FraternityForm from './FraternityForm';
import CollegeAvatar from './CollegeAvatar';
import AddCollegeForm from './AddCollegeForm';

const AdminCollegeList = () => {
  const [searchTerm, setSearchTerm] = useState(''); // For colleges search
  const [fraternitySearchTerm, setFraternitySearchTerm] = useState(''); // For fraternities search
  const [selectedConference, setSelectedConference] = useState('');
  const [colleges, setColleges] = useState([]);
  const [sortMethod, setSortMethod] = useState('fraternities');
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedCollegeFraternities, setSelectedCollegeFraternities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddFraternityForm, setShowAddFraternityForm] = useState(false);
  const [showAddCollegeForm, setShowAddCollegeForm] = useState(false);
  const [editingFraternity, setEditingFraternity] = useState(null);
  const [loadingFraternities, setLoadingFraternities] = useState(false);
  const [editingConference, setEditingConference] = useState(false);
  const [savingConference, setSavingConference] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFinalDeleteConfirm, setShowFinalDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const conferenceOrder = [
    'A10', 'ACC', 'AEC', 'ASUN', 'BIG 10', 'BIG 12', 'BIG EAST', 'BIG SKY',
    'BIG SOUTH', 'CAA', 'IVY', 'MAAC', 'MAC', 'Missouri Valley', 'MW',
    'PAC - 12', 'Patriot League', 'SBC', 'SEC', 'SLC', 'SOCON', 'SUMMIT',
    'WAC', 'WCC'
  ];

  const getAbbreviatedConference = (fullName) => {
    return Object.entries(conferenceMap).find(([abbr, full]) => full === fullName)?.[0] || fullName;
  };

  const getFullConferenceName = (abbr) => {
    return conferenceMap[abbr] || abbr;
  };

  const abbreviatedConferences = conferenceOrder.map(abbr => ({
    abbr,
    full: conferenceMap[abbr] || abbr
  }));

  const sortedAndFilteredColleges = useMemo(() => {
    let filtered = colleges.filter(college => {
      const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesConference = !selectedConference || college.conference === selectedConference;
      return matchesSearch && matchesConference;
    });

    switch (sortMethod) {
      case 'conference':
        return filtered.sort((a, b) => {
          const confA = a.conference || 'Unknown Conference';
          const confB = b.conference || 'Unknown Conference';
          return confA.localeCompare(confB);
        });

      case 'alpha':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));

      case 'fraternities':
        return filtered.sort((a, b) => {
          // First sort by scheduled count
          const scheduledDiff = (b.scheduledCount || 0) - (a.scheduledCount || 0);
          if (scheduledDiff !== 0) return scheduledDiff;
          
          // Then sort by fraternity count
          return (b.fraternityCount || 0) - (a.fraternityCount || 0);
        });

      default:
        return filtered;
    }
  }, [colleges, searchTerm, selectedConference, sortMethod]);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    setLoadingCounts(true);
    try {
      const collegesRef = collection(db, 'colleges');
      const snapshot = await getDocs(collegesRef);
      
      const collegeData = await Promise.all(snapshot.docs.map(async doc => {
        const collegeId = doc.id;
        const fraternitiesRef = collection(db, 'colleges', collegeId, 'fraternities');
        const fraternitiesSnapshot = await getDocs(fraternitiesRef);
        const fraternities = fraternitiesSnapshot.docs.map(fDoc => ({
          id: fDoc.id,
          ...fDoc.data()
        }));
        
        return {
          id: collegeId,
          ...doc.data(),
          fraternityCount: fraternities.length,
          scheduledCount: fraternities.filter(f => f.status === 'scheduled').length
        };
      }));
      
      setColleges(collegeData);
    } catch (err) {
      console.error('Error fetching colleges:', err);
    } finally {
      setLoadingCounts(false);
    }
  };

  const handleCollegeClick = async (college) => {
    setSelectedCollege(college);
    setShowModal(true);
    setLoadingFraternities(true);
    
    try {
      const fraternitiesRef = collection(db, 'colleges', college.id, 'fraternities');
      const fraternitiesSnapshot = await getDocs(fraternitiesRef);
      const fraternitiesData = fraternitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSelectedCollegeFraternities(fraternitiesData);
    } catch (err) {
      console.error('Error fetching fraternities:', err);
    } finally {
      setLoadingFraternities(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header section */}
      <div className="mb-8 space-y-4 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">All Available Colleges</h1>
          <button
            onClick={() => setShowAddCollegeForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add College
          </button>
        </div>
        
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

        {/* Stats and Sorting */}
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-600">
            Showing {sortedAndFilteredColleges.length} {sortedAndFilteredColleges.length === 1 ? 'college' : 'colleges'}
            {selectedConference && ` in ${selectedConference}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setSortMethod('conference')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortMethod === 'conference'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Order by Conference Size
            </button>
            <button
              onClick={() => setSortMethod('alpha')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortMethod === 'alpha'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Order Alphabetically
            </button>
            <button
              onClick={() => setSortMethod('fraternities')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortMethod === 'fraternities'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Order by Number of Fraternities
            </button>
          </div>
        </div>
      </div>

      {/* College Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {sortedAndFilteredColleges.map((college) => (
          <div
            key={college.id}
            onClick={() => handleCollegeClick(college)}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 p-6 flex flex-col items-center h-52 cursor-pointer hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-1 relative"
          >
            {/* Scheduled Events Counter */}
            <div className="absolute top-2 left-2 bg-green-100 px-2 py-1 rounded-full">
              <p className="text-sm font-medium text-green-600">
                {loadingCounts ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                ) : (
                  <>{college.scheduledCount || 0} Scheduled</>
                )}
              </p>
            </div>
            <CollegeAvatar
              name={college.name}
              className="w-20 h-20 mb-4"
              logoUrl={college.logoUrl}
              onLogoChange={(newLogoUrl) => {
                setColleges(prevColleges => 
                  prevColleges.map(c => 
                    c.id === college.id
                      ? { ...c, logoUrl: newLogoUrl }
                      : c
                  )
                );
              }}
            />
            <h2 className="text-lg font-semibold text-gray-900 text-center line-clamp-2 mb-2">{college.name}</h2>
            <p className="text-sm text-gray-600">{getAbbreviatedConference(college.conference || 'Unknown Conference')}</p>
            <div className="absolute bottom-4 right-4 bg-blue-50 px-3 py-1 rounded-full">
              {loadingCounts ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              ) : (
                <p className="text-sm font-medium text-blue-600">
                  {college.fraternityCount || 0} {(college.fraternityCount === 1) ? 'Fraternity' : 'Fraternities'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* College Details Modal */}
      {showModal && selectedCollege && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex justify-between items-center w-full">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCollege?.name} - Fraternity Details
                  </h2>
                  <button
                    onClick={() => setShowAddFraternityForm(true)}
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
                    className="w-20 h-20"
                    logoUrl={selectedCollege.logoUrl}
                    onLogoChange={(newLogoUrl) => {
                      setSelectedCollege(prev => ({
                        ...prev,
                        logoUrl: newLogoUrl
                      }));
                      setColleges(prevColleges => 
                        prevColleges.map(college => 
                          college.id === selectedCollege.id
                            ? { ...college, logoUrl: newLogoUrl }
                            : college
                        )
                      );
                    }}
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
                                    const collegeRef = doc(db, 'colleges', selectedCollege.id);
                                    await updateDoc(collegeRef, {
                                      conference: selectedCollege.conference
                                    });
                                    await fetchColleges();
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

                {/* College Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Scheduled Fraternities</h4>
                    <span className="text-3xl font-bold text-blue-600">
                      {loadingFraternities ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      ) : (
                        selectedCollegeFraternities.filter(f => f.status === 'scheduled').length
                      )}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">In Touch</h4>
                    <span className="text-3xl font-bold text-green-600">
                      {loadingFraternities ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                      ) : (
                        selectedCollegeFraternities.filter(f => f.status === 'in contact').length
                      )}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Contact Info</h4>
                    <span className="text-3xl font-bold text-red-600">
                      {loadingFraternities ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                      ) : (
                        selectedCollegeFraternities.filter(f => !f.rushChairName && !f.presidentName && !f.philanthropyName).length
                      )}
                    </span>
                  </div>
                </div>

                {/* Fraternity Search */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search fraternities..."
                      value={fraternitySearchTerm}
                      onChange={(e) => setFraternitySearchTerm(e.target.value)}
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

                <div>
                  {loadingFraternities ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : selectedCollegeFraternities.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {[...selectedCollegeFraternities]
                        .filter(fraternity => 
                          fraternity.name.toLowerCase().includes(fraternitySearchTerm.toLowerCase()) ||
                          (fraternity.chapterName && fraternity.chapterName.toLowerCase().includes(fraternitySearchTerm.toLowerCase()))
                        )
                        .sort((a, b) => {
                          // First prioritize scheduled fraternities
                          if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
                          if (b.status === 'scheduled' && a.status !== 'scheduled') return 1;
                          
                          // Then prioritize fraternities with Google forms
                          const aHasForm = Boolean(a.signupFormUrl);
                          const bHasForm = Boolean(b.signupFormUrl);
                          if (aHasForm && !bHasForm) return -1;
                          if (bHasForm && !aHasForm) return 1;
                          
                          // If both have same status and form presence, maintain original order
                          return 0;
                        })
                        .map(fraternity => (
                        <FraternityCard
                          key={fraternity.id}
                          fraternity={{
                            ...fraternity,
                            collegeId: selectedCollege.id
                          }}
                          collegeName={selectedCollege.name}
                          onEdit={() => {
                    setEditingFraternity({
                      ...fraternity,
                      collegeId: selectedCollege.id
                    });
                  }}
                          onDelete={async () => {
                            try {
                              const fraternityRef = doc(db, 'colleges', selectedCollege.id, 'fraternities', fraternity.id);
                              await deleteDoc(fraternityRef);
                              
                              const collegeRef = doc(db, 'colleges', selectedCollege.id);
                              // Get updated counts after deletion
                              const fraternitiesRef = collection(db, 'colleges', selectedCollege.id, 'fraternities');
                              const fraternitiesSnapshot = await getDocs(fraternitiesRef);
                              const fraternities = fraternitiesSnapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                              }));

                              await updateDoc(collegeRef, {
                                fraternityCount: fraternities.length,
                                scheduledCount: fraternities.filter(f => f.status === 'scheduled').length
                              });
                              
                              // Refresh all colleges to update counts
                              await fetchColleges();
                              handleCollegeClick(selectedCollege);
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

              {/* Delete College Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete College
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* First Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete College?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedCollege?.name}? This will also delete all associated fraternities.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setShowFinalDeleteConfirm(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Delete Confirmation Modal */}
      {showFinalDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 mb-4">Final Warning</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. Type <span className="font-bold">{selectedCollege?.name}</span> to confirm deletion.
            </p>
            <input
              type="text"
              className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Type college name to confirm"
              onChange={(e) => {
                if (e.target.value === selectedCollege?.name) {
                  setDeleting(true);
                  // Delete all fraternities first
                  const deleteFraternities = async () => {
                    try {
                      // Delete all fraternities
                      const batch = writeBatch(db);
                      selectedCollegeFraternities.forEach((fraternity) => {
                        const fraternityRef = doc(db, 'colleges', selectedCollege.id, 'fraternities', fraternity.id);
                        batch.delete(fraternityRef);
                      });
                      await batch.commit();

                      // Delete the college
                      const collegeRef = doc(db, 'colleges', selectedCollege.id);
                      await deleteDoc(collegeRef);

                      setShowFinalDeleteConfirm(false);
                      setShowModal(false);
                      fetchColleges();
                    } catch (error) {
                      console.error('Error deleting college:', error);
                      alert('Error deleting college. Please try again.');
                    } finally {
                      setDeleting(false);
                    }
                  };
                  deleteFraternities();
                }
              }}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowFinalDeleteConfirm(false);
                  setDeleting(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={true}
              >
                {deleting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete College'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add College Form Modal */}
      {showAddCollegeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AddCollegeForm
              onClose={() => setShowAddCollegeForm(false)}
              onSuccess={() => {
                setShowAddCollegeForm(false);
                fetchColleges();
              }}
            />
          </div>
        </div>
      )}

      {/* Add Fraternity Modal */}
      {showAddFraternityForm && (
        <AddFraternityForm
          collegeId={selectedCollege.id}
          collegeName={selectedCollege.name}
          onSuccess={() => {
            setShowAddFraternityForm(false);
            handleCollegeClick(selectedCollege);
          }}
          onClose={() => setShowAddFraternityForm(false)}
        />
      )}

      {/* Edit Fraternity Modal */}
      {editingFraternity && (
        <FraternityForm
          fraternity={editingFraternity}
          collegeId={selectedCollege.id}
          onSuccess={() => {
            setEditingFraternity(null);
            handleCollegeClick(selectedCollege);
          }}
          onClose={() => setEditingFraternity(null)}
        />
      )}
    </div>
  );
};

export default AdminCollegeList;
