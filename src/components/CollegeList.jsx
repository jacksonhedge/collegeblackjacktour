import React, { useState, useMemo, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import FraternityCard from './FraternityCard';
import AddFraternityForm from './AddFraternityForm';
import FraternityForm from './FraternityForm';
import AddCollegeForm from './AddCollegeForm';

// Helper function to normalize college name for Firestore ID
const normalizeCollegeName = (name) => {
  if (!name) return '';
  return name
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const CollegeList = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedCollegeFraternities, setSelectedCollegeFraternities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConference, setSelectedConference] = useState('');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'fraternities-asc', 'fraternities-desc'
  const [loadingFraternities, setLoadingFraternities] = useState(false);
  const [editingFraternity, setEditingFraternity] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddCollegeForm, setShowAddCollegeForm] = useState(false);

  const fetchColleges = async () => {
      try {
        setLoading(true);
        const collegesRef = collection(db, 'colleges');
        const snapshot = await getDocs(collegesRef);
        const collegeData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setColleges(collegeData);
        setError(null);
      } catch (err) {
        console.error('Error fetching colleges:', err);
        setError('Failed to load colleges. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchColleges();
  }, []);

  // Get unique conferences
  const conferences = useMemo(() => {
    return [...new Set(colleges.filter(college => college?.conference).map(college => college.conference))].sort();
  }, [colleges]);

  // Filter and sort colleges
  const filteredColleges = useMemo(() => {
    let filtered = colleges.filter(college => {
      if (!college || !college.name) return false;
      const matchesSearch = college.name.toLowerCase().includes((searchTerm || '').toLowerCase());
      const matchesConference = !selectedConference || college.conference === selectedConference;
      return matchesSearch && matchesConference;
    });

    // Sort based on fraternity count if selected
    if (sortBy === 'fraternities-desc') {
      filtered = [...filtered].sort((a, b) => (b?.fraternityCount || 0) - (a?.fraternityCount || 0));
    } else if (sortBy === 'fraternities-asc') {
      filtered = [...filtered].sort((a, b) => (a?.fraternityCount || 0) - (b?.fraternityCount || 0));
    }

    return filtered;
  }, [colleges, searchTerm, selectedConference, sortBy]);

  const handleCollegeClick = async (college) => {
    if (!college?.name) return;
    
    setSelectedCollege(college);
    setShowModal(true);
    setLoadingFraternities(true);
    
    try {
      const normalizedCollegeId = normalizeCollegeName(college.name);
      const fraternitiesRef = collection(db, 'colleges', normalizedCollegeId, 'fraternities');
      const snapshot = await getDocs(fraternitiesRef);
      const fraternitiesData = snapshot.docs.map(doc => ({
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
      <div className="mb-8 space-y-4 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">College Directory</h1>
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
          <div className="flex gap-4">
            <div className="w-full md:w-64">
            <select
              value={selectedConference}
              onChange={(e) => setSelectedConference(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Conferences</option>
              {conferences.map(conf => (
                <option key={conf} value={conf}>{conf}</option>
              ))}
            </select>
            </div>
            <div className="w-full md:w-64">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Sort by</option>
                <option value="fraternities-desc">Most Fraternities</option>
                <option value="fraternities-asc">Least Fraternities</option>
              </select>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Showing {filteredColleges.length} {filteredColleges.length === 1 ? 'college' : 'colleges'}
            {selectedConference && ` in ${selectedConference}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
          
          {filteredColleges.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900">Total Fraternities</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredColleges.reduce((sum, college) => sum + (college.fraternityCount || 0), 0)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-green-900">Average per College</h3>
                <p className="text-2xl font-bold text-green-600">
                  {(filteredColleges.reduce((sum, college) => sum + (college.fraternityCount || 0), 0) / filteredColleges.length || 0).toFixed(1)}
                </p>
              </div>
              {filteredColleges.length > 0 && (
                <>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-purple-900">Most Fraternities</h3>
                    <p className="text-lg font-bold text-purple-600 truncate">
                      {filteredColleges.reduce((max, college) => 
                        (!max || (college.fraternityCount || 0) > (max.fraternityCount || 0)) ? college : max
                      , null)?.name || 'N/A'}
                      <span className="text-sm font-normal ml-1">
                        ({filteredColleges.reduce((max, college) => 
                          (!max || (college.fraternityCount || 0) > (max.fraternityCount || 0)) ? college : max
                        , null)?.fraternityCount || 0})
                      </span>
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-orange-900">Least Fraternities</h3>
                    <p className="text-lg font-bold text-orange-600 truncate">
                      {filteredColleges.reduce((min, college) => 
                        (!min || (college.fraternityCount || 0) < (min.fraternityCount || 0)) ? college : min
                      , null)?.name || 'N/A'}
                      <span className="text-sm font-normal ml-1">
                        ({filteredColleges.reduce((min, college) => 
                          (!min || (college.fraternityCount || 0) < (min.fraternityCount || 0)) ? college : min
                        , null)?.fraternityCount || 0})
                      </span>
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center p-4 text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredColleges.map((college) => (
            <div
              key={college.id}
              onClick={() => handleCollegeClick(college)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md overflow-hidden cursor-pointer transition-all duration-200 ease-in-out transform hover:-translate-y-1 border border-gray-100 hover:border-gray-200"
            >
              <div className="p-6 flex flex-col items-center h-52 relative">
                <div className="w-20 h-20 relative flex items-center justify-center bg-gray-50 rounded-md mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin opacity-0 transition-opacity duration-200" />
                  </div>
                  <img
                    src={college?.logoPath || '/default-college-logo.svg'}
                    alt={`${college?.name || 'College'} logo`}
                    className="w-full h-full object-contain relative z-10 transition-opacity duration-200"
                    onError={(e) => {
                      e.target.src = '/default-college-logo.svg';
                    }}
                    onLoad={(e) => {
                      e.target.parentElement.querySelector('.animate-spin').classList.add('opacity-0');
                      e.target.classList.remove('opacity-0');
                    }}
                    loading="lazy"
                    style={{ opacity: 0 }}
                  />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 text-center line-clamp-2 mb-2">{college?.name || 'Unknown College'}</h2>
                <p className="text-sm text-gray-600">{college?.conference || 'Unknown Conference'}</p>
                <div className="absolute bottom-4 right-4 bg-blue-50 px-3 py-1 rounded-full">
                  <p className="text-sm font-medium text-blue-600">
                    {college?.fraternityCount || 0} {(college?.fraternityCount === 1) ? 'Fraternity' : 'Fraternities'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                  <div className="w-20 h-20 relative flex items-center justify-center">
                    <img
                      src={selectedCollege?.logoPath || '/default-college-logo.svg'}
                      alt={`${selectedCollege?.name || 'College'} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const altPath = selectedCollege?.conference && selectedCollege?.name
                          ? `/college-logos/${selectedCollege.conference.replace(' ', '-')}/${selectedCollege.name.replace(/\s+/g, '-')}-logo.png`
                          : '/default-college-logo.svg';
                        if (e.target.src !== altPath) {
                          e.target.src = altPath;
                        } else {
                          e.target.src = '/default-college-logo.svg';
                        }
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedCollege?.name || 'Unknown College'}</h3>
                    <p className="text-gray-600">{selectedCollege?.conference || 'Unknown Conference'}</p>
                    <p className="text-blue-600">
                      {selectedCollege?.fraternityCount || 0} {(selectedCollege?.fraternityCount === 1) ? 'Fraternity' : 'Fraternities'}
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
                        key={fraternity?.id || Math.random()}
                        fraternity={fraternity}
                        collegeName={selectedCollege?.name || 'Unknown College'}
                        onClick={() => handleCollegeClick(selectedCollege)}
                        onEdit={() => setEditingFraternity(fraternity)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-gray-50">
                      <p className="text-gray-600 text-center">No fraternities found for {selectedCollege?.name || 'this college'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fraternity Edit Modal */}
      {editingFraternity && selectedCollege?.name && (
        <FraternityForm
          fraternity={editingFraternity}
          collegeName={selectedCollege.name}
          onClose={() => setEditingFraternity(null)}
          onSuccess={() => {
            setEditingFraternity(null);
            handleCollegeClick(selectedCollege);
          }}
        />
      )}

      {/* Add Fraternity Modal */}
      {showAddForm && selectedCollege?.name && (
        <AddFraternityForm
          collegeName={selectedCollege.name}
          onSuccess={() => {
            setShowAddForm(false);
            handleCollegeClick(selectedCollege);
          }}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* Add College Form */}
      {showAddCollegeForm && (
        <AddCollegeForm
          onClose={() => setShowAddCollegeForm(false)}
          onSuccess={() => {
            setShowAddCollegeForm(false);
            // Refresh the colleges list
            fetchColleges();
          }}
        />
      )}
    </div>
  );
};

export default CollegeList;
