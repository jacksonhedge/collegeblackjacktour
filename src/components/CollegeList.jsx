import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CONFERENCE_DATA } from '../firebase/conferenceData';
import { collegeNames } from '../firebase/collegeNames';
import { getCollegeImageURL } from '../firebase/storage';
const CollegeList = () => {
  const [colleges, setColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConference, setSelectedConference] = useState('all');
  const [selectedFraternityFilter, setSelectedFraternityFilter] = useState('all');
  const [fraternities, setFraternities] = useState(new Set(['all']));
  const [sortByFraternities, setSortByFraternities] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedFraternity, setSelectedFraternity] = useState(null);
  const [collegeEvents, setCollegeEvents] = useState([]);
  const [fraternityDetails, setFraternityDetails] = useState(null);

  // Helper function to normalize college name for Firestore ID
  const normalizeCollegeName = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };


  useEffect(() => {
    const fetchColleges = async () => {
      try {
        // Initialize all colleges from the collegeNames array
        // Use the full name from collegeNames array
        const initialColleges = collegeNames.map(name => {
          return {
            id: normalizeCollegeName(name), // Use full name for ID to match database
            name: name.split(' ').slice(0, -1).join(' '), // Use base name without mascot for display
            fullName: name, // Store full name for logo lookup
            fraternityCount: 0,
            logoUrl: null
          };
        });

        // Find conference for each college
        initialColleges.forEach(college => {
          for (const [conference, schools] of Object.entries(CONFERENCE_DATA)) {
            const normalizedCollegeName = normalizeCollegeName(college.fullName);
            const found = schools.some(school => {
              const normalizedSchoolName = normalizeCollegeName(school);
              // Try exact match first
              if (normalizedCollegeName === normalizedSchoolName) {
                return true;
              }
              // Try partial match by comparing base names (without mascots)
              const collegeBaseName = college.name.toLowerCase();
              const schoolBaseName = school.split(' ').slice(0, -1).join(' ').toLowerCase();
              if (collegeBaseName === schoolBaseName) {
                return true;
              }
              // Try fuzzy match if no exact match found
              const collegeWords = collegeBaseName.split(/\s+/);
              const schoolWords = schoolBaseName.split(/\s+/);
              return collegeWords.some(word => 
                word.length > 3 && schoolWords.some(schoolWord => 
                  schoolWord.includes(word) || word.includes(schoolWord)
                )
              );
            });
            if (found) {
              college.conference = conference;
              break;
            }
          }
        });

        // Fetch additional data from Firestore
        const collegesRef = collection(db, 'colleges');
        const snapshot = await getDocs(collegesRef);
        
        // Create a map of existing Firestore data
        const firestoreData = new Map();
        for (const doc of snapshot.docs) {
          const data = doc.data();
          // Use full name for Firestore data lookup to match the new ID format
          // Use the document ID directly since it matches our normalized format
          firestoreData.set(doc.id, {
            logoUrl: data.logoUrl,
            ref: doc.ref
          });
        }

        // Update colleges with Firestore data
        const updatedColleges = await Promise.all(
          initialColleges.map(async (college) => {
            const firestoreCollege = firestoreData.get(college.id);
            if (firestoreCollege) {
              // Get logo URL from Firebase Storage
              try {
                college.logoUrl = await getCollegeImageURL(college.fullName);
              } catch (error) {
                console.error(`Error getting logo URL for ${college.fullName}:`, error);
                college.logoUrl = null;
              }
              
              // Get fraternities
              const fraternitiesRef = collection(firestoreCollege.ref, 'fraternities');
              const fraternitiesSnapshot = await getDocs(fraternitiesRef);
              const fraternityDocs = fraternitiesSnapshot.docs;
              const activeFraternities = fraternityDocs.map(fratDoc => {
                const fratData = fratDoc.data();
                return { 
                  id: fratDoc.id,
                  name: fratData.name, 
                  letters: fratData.letters,
                  active: fratData.active,
                  ref: fratDoc.ref
                };
              });
              
              college.fraternities = activeFraternities;
              // Update fraternities set with new fraternity names
              activeFraternities.forEach(frat => setFraternities(prev => new Set([...prev, frat.name])));
              // Set fraternity count based on all fraternities, not just active ones
              college.fraternityCount = fraternityDocs.length;
            } else {
              college.fraternities = [];
              college.fraternityCount = 0;
            }
            return college;
          })
        );

        setColleges(updatedColleges);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching colleges:', err);
        setError('Failed to load colleges');
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  const conferences = ['all', ...Object.keys(CONFERENCE_DATA)];
  
  const filteredColleges = colleges
    .sort((a, b) => {
      if (sortByFraternities) {
        return b.fraternityCount - a.fraternityCount;
      }
      return (a.fullName || a.name).localeCompare(b.fullName || b.name);
    })
    .filter(college => {
      const matchesSearch = (college.fullName || college.name).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesConference = selectedConference === 'all' || college.conference === selectedConference;
      const matchesFraternity = selectedFraternityFilter === 'all' || 
        (college.fraternities && college.fraternities.some(frat => frat.name === selectedFraternityFilter));
      return matchesSearch && matchesConference && matchesFraternity;
    });

  if (loading) {
    return <div className="text-center p-4">Loading colleges...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <input
            type="text"
            placeholder="Search colleges by name or mascot..."
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-4">
            <button
              onClick={() => setSortByFraternities(!sortByFraternities)}
              className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                sortByFraternities ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
              }`}
            >
              {sortByFraternities ? 'Sorted by Fraternities' : 'Sort by Fraternities'}
            </button>
            <select
              value={selectedConference}
              onChange={(e) => setSelectedConference(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {conferences.map(conf => (
                <option key={conf} value={conf}>
                  {conf === 'all' ? 'All Conferences' : conf}
                </option>
              ))}
            </select>
            <select
              value={selectedFraternityFilter}
              onChange={(e) => setSelectedFraternityFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from(fraternities).sort().map(frat => (
                <option key={frat} value={frat}>
                  {frat === 'all' ? 'All Fraternities' : frat}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Showing {filteredColleges.length} of {colleges.length} colleges
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredColleges.map((college) => (
          <div
            key={college.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden cursor-pointer"
            onClick={() => handleCollegeClick(college)}
          >
            <div className="h-48 bg-gray-100 flex items-center justify-center p-4">
              {college.logoUrl ? (
                <img
                  src={college.logoUrl}
                  alt={`${college.name} logo`}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    // Get initials and color
                    const words = college.fullName.split(' ');
                    const initials = words
                      .filter(word => word.length > 0 && !['of', 'the', 'and', '&'].includes(word.toLowerCase()))
                      .map(word => word[0])
                      .join('')
                      .toUpperCase();
                    
                    // Get color based on college index to ensure alternating colors
                    const colors = ['#FF0000', '#FFD700', '#FFA500', '#008000', '#0000FF']; // Red, Yellow, Orange, Green, Blue
                    const colorIndex = filteredColleges.findIndex(c => c.id === college.id) % colors.length;
                    const color = colors[colorIndex];
                    
                    // Create a div with initials
                    const parent = e.target.parentNode;
                    parent.innerHTML = `
                      <div 
                        style="
                          width: 120px; 
                          height: 120px; 
                          background-color: ${color}; 
                          color: white;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 2.5rem;
                          font-weight: bold;
                          border-radius: 60px;
                        "
                      >
                        ${initials}
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className="w-30 h-30 rounded-full flex items-center justify-center">
                  {(() => {
                    const words = college.fullName.split(' ');
                    const initials = words
                      .filter(word => word.length > 0 && !['of', 'the', 'and', '&'].includes(word.toLowerCase()))
                      .map(word => word[0])
                      .join('')
                      .toUpperCase();
                    
                    const colors = ['#FF0000', '#FFD700', '#FFA500', '#008000', '#0000FF']; // Red, Yellow, Orange, Green, Blue
                    const colorIndex = filteredColleges.findIndex(c => c.id === college.id) % colors.length;
                    const color = colors[colorIndex];
                    
                    return (
                      <div 
                        style={{
                          width: '120px',
                          height: '120px',
                          backgroundColor: color,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2.5rem',
                          fontWeight: 'bold',
                          borderRadius: '60px'
                        }}
                      >
                        {initials}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {college.fullName || college.name}
              </h3>
              <div className="text-sm text-gray-600 mb-2">
                {college.conference || 'No Conference'}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600 font-medium">
                  {college.fraternityCount} {college.fraternityCount === 1 ? 'Fraternity' : 'Fraternities'}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {college.fraternityCount >= 10 ? 'Qualifying' : 'Not Qualifying'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* College Detail Modal */}
      {selectedCollege && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20">
                    {selectedCollege.logoUrl ? (
                      <img
                        src={selectedCollege.logoUrl}
                        alt={`${selectedCollege.name} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          // Get initials and color
                          const words = selectedCollege.fullName.split(' ');
                          const initials = words
                            .filter(word => word.length > 0 && !['of', 'the', 'and', '&'].includes(word.toLowerCase()))
                            .map(word => word[0])
                            .join('')
                            .toUpperCase();
                          
                          // Get color based on index
                          const colors = ['#FF0000', '#FFD700', '#FFA500', '#008000', '#0000FF']; // Red, Yellow, Orange, Green, Blue
                          const colorIndex = filteredColleges.findIndex(c => c.id === selectedCollege.id) % colors.length;
                          const color = colors[colorIndex];
                          
                          // Create a div with initials
                          const parent = e.target.parentNode;
                          parent.innerHTML = `
                            <div 
                              style="
                                width: 80px; 
                                height: 80px; 
                                background-color: ${color}; 
                                color: white;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 1.5rem;
                                font-weight: bold;
                                border-radius: 40px;
                              "
                            >
                              ${initials}
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full flex items-center justify-center">
                        {(() => {
                          const words = selectedCollege.fullName.split(' ');
                          const initials = words
                            .filter(word => word.length > 0 && !['of', 'the', 'and', '&'].includes(word.toLowerCase()))
                            .map(word => word[0])
                            .join('')
                            .toUpperCase();
                          
                          const colors = ['#FF0000', '#FFD700', '#FFA500', '#008000', '#0000FF']; // Red, Yellow, Orange, Green, Blue
                          const colorIndex = filteredColleges.findIndex(c => c.id === selectedCollege.id) % colors.length;
                          const color = colors[colorIndex];
                          
                          return (
                            <div 
                              style={{
                                width: '80px',
                                height: '80px',
                                backgroundColor: color,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                borderRadius: '40px'
                              }}
                            >
                              {initials}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCollege.fullName || selectedCollege.name}</h2>
                    <p className="text-gray-600">{selectedCollege.conference || 'No Conference'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCollege(null);
                    setCollegeEvents([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">Fraternities</h3>
                  <p className="text-2xl font-bold text-blue-600">{selectedCollege.fraternityCount}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-1">Events Scheduled</h3>
                  <p className="text-2xl font-bold text-green-600">{collegeEvents.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 mb-1">Status</h3>
                  <p className="text-xl font-bold text-purple-600">
                    {selectedCollege.fraternityCount >= 10 ? 'Qualifying' : 'Not Qualifying'}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Fraternities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedCollege.fraternities.map((fraternity, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-50 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFraternityClick(fraternity);
                      }}
                    >
                      <p className="text-xl font-bold text-gray-900 mb-1">{fraternity.letters}</p>
                      <p className="text-sm text-gray-600">{fraternity.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                {collegeEvents.length > 0 ? (
                  <div className="grid gap-4">
                    {collegeEvents.map((event) => (
                      <div key={event.id} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900">{event.name}</h4>
                        <p className="text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No upcoming events scheduled</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fraternity Detail Modal */}
      {selectedFraternity && fraternityDetails && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">{fraternityDetails.letters}</h2>
                  <p className="text-xl text-gray-600">{fraternityDetails.name}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFraternity(null);
                    setFraternityDetails(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">Active Members</h3>
                  <p className="text-2xl font-bold text-blue-600">{fraternityDetails.activeCount || 0}</p>
                </div>
                <div className={`${fraternityDetails.status === 'Active' ? 'bg-green-50' : 'bg-red-50'} p-4 rounded-lg`}>
                  <h3 className={`text-lg font-semibold ${fraternityDetails.status === 'Active' ? 'text-green-900' : 'text-red-900'} mb-1`}>Status</h3>
                  <p className={`text-xl font-bold ${fraternityDetails.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                    {fraternityDetails.status || 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Leadership</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">President</p>
                      <p className="font-medium text-gray-900">{fraternityDetails.presidentName || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Philanthropy Chair</p>
                      <p className="font-medium text-gray-900">{fraternityDetails.philanthropyChairName || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Philanthropy</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">{fraternityDetails.philanthropy || 'Not specified'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">{fraternityDetails.address || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Instagram</p>
                      <p className="font-medium text-gray-900">
                        {fraternityDetails.instagramUsername ? (
                          <a 
                            href={`https://instagram.com/${fraternityDetails.instagramUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            @{fraternityDetails.instagramUsername}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  async function handleFraternityClick(fraternity) {
    setSelectedFraternity(fraternity);
    try {
      const fraternityDoc = await getDoc(fraternity.ref);
      if (fraternityDoc.exists()) {
        const data = fraternityDoc.data();
        setFraternityDetails({
          ...fraternity,
          ...data,
          activeCount: data.activeCount || 0,
          status: data.status || 'Unknown',
          presidentName: data.presidentName || '',
          philanthropyChairName: data.philanthropyChairName || '',
          philanthropy: data.philanthropy || '',
          address: data.address || '',
          instagramUsername: data.instagramUsername || ''
        });
      }
    } catch (err) {
      console.error('Error fetching fraternity details:', err);
      setFraternityDetails(null);
    }
  }

  async function handleCollegeClick(college) {
    setSelectedCollege(college);
    try {
      // Fetch events for the selected college
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('collegeId', '==', college.id));
      const eventsSnapshot = await getDocs(q);
      const eventsData = eventsSnapshot.docs
        .map(doc => {
          const data = doc.data();
          // Only include future events
          if (data.date && new Date(data.date) >= new Date()) {
            return {
              id: doc.id,
              ...data
            };
          }
          return null;
        })
        .filter(Boolean) // Remove null values
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
      setCollegeEvents(eventsData);
    } catch (err) {
      // Silently handle the error since it's expected when no events exist
      setCollegeEvents([]);
    }
  }
};

export default CollegeList;
