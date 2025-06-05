import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import FraternityCard from './FraternityCard';
import AddFraternityForm from './AddFraternityForm';
import FraternityForm from './FraternityForm';
import CollegeAvatar from './CollegeAvatar';
import AddCollegeForm from './AddCollegeForm';

const AdminCollegeList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fraternitySearchTerm, setFraternitySearchTerm] = useState('');
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
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleDeleteCollege = async () => {
    if (!selectedCollege || deleteConfirmText !== selectedCollege.name) return;
    
    setDeleting(true);
    try {
      const normalizedCollegeId = normalizeCollegeName(selectedCollege.name);
      const batch = writeBatch(db);

      // Delete all fraternities first
      const fraternitiesRef = collection(db, 'colleges', normalizedCollegeId, 'fraternities');
      const fraternitiesSnapshot = await getDocs(fraternitiesRef);
      fraternitiesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete the college document
      const collegeRef = doc(db, 'colleges', normalizedCollegeId);
      batch.delete(collegeRef);

      await batch.commit();

      // Close modals and refresh the list
      setShowFinalDeleteConfirm(false);
      setShowModal(false);
      setDeleteConfirmText('');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting college:', error);
      alert('Failed to delete college. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Helper function to normalize college name for Firestore ID
  const normalizeCollegeName = (name) => {
    if (!name) return '';
    return name
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Count Google Forms for a college
  const countGoogleForms = (college) => {
    if (!college?.fraternities) return 0;
    return college.fraternities.filter(frat => frat?.signupFormUrl && frat.signupFormUrl.trim() !== '').length;
  };

  // Fetch colleges data
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const collegesRef = collection(db, 'colleges');
        const snapshot = await getDocs(collegesRef);
        const collegeData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setColleges(collegeData);
        setLoadingCounts(false);
      } catch (error) {
        console.error('Error fetching colleges:', error);
        setLoadingCounts(false);
      }
    };

    fetchColleges();
  }, []);

  // Handle college click
  const handleCollegeClick = async (college) => {
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

  // Get unique conferences
  const conferences = useMemo(() => {
    return [...new Set(colleges.filter(college => college?.conference).map(college => college.conference))].sort();
  }, [colleges]);

  // Filter and sort colleges
  const filteredColleges = useMemo(() => {
    let filtered = colleges.filter(college => {
      if (!college?.name) return false;
      const matchesSearch = college.name.toLowerCase().includes((searchTerm || '').toLowerCase());
      const matchesConference = !selectedConference || (college.conference || '') === selectedConference;
      return matchesSearch && matchesConference;
    });

    // Helper function to check if a fraternity has both form and sheet
    const hasBothLinks = (fraternity) => {
      return fraternity?.signupFormUrl && fraternity?.signupSheetUrl;
    };

    // Helper function to count fraternities with both links
    const countBothLinks = (college) => {
      if (!college?.fraternities) return 0;
      return college.fraternities.filter(frat => hasBothLinks(frat)).length;
    };

    // First sort by fraternities that have both links
    filtered.sort((a, b) => {
      const aHasBoth = countBothLinks(a);
      const bHasBoth = countBothLinks(b);
      if (aHasBoth !== bHasBoth) return bHasBoth - aHasBoth;

      // If equal on both links, use the selected sort method
      switch (sortMethod) {
        case 'fraternities':
          return (b.fraternityCount || 0) - (a.fraternityCount || 0);
        case 'name':
          return (a?.name || '').localeCompare(b?.name || '');
        case 'conference':
          return (a?.conference || '').localeCompare(b?.conference || '');
        case 'forms':
          return countGoogleForms(b) - countGoogleForms(a);
        default:
          return 0;
      }
    });

    return filtered;
  }, [colleges, searchTerm, selectedConference, sortMethod]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Section */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-purple-900">Google Form Links</h3>
          <p className="text-2xl font-bold text-purple-600">
            {colleges.reduce((sum, college) => sum + countGoogleForms(college), 0)}
          </p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">College Management</h1>
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
            <input
              type="text"
              placeholder="Search colleges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={selectedConference}
              onChange={(e) => setSelectedConference(e.target.value)}
              className="w-full md:w-48 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Conferences</option>
              {conferences.map(conf => (
                <option key={conf} value={conf}>{conf}</option>
              ))}
            </select>
            <select
              value={sortMethod}
              onChange={(e) => setSortMethod(e.target.value)}
              className="w-full md:w-48 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fraternities">Sort by Fraternities</option>
              <option value="name">Sort by Name</option>
              <option value="conference">Sort by Conference</option>
              <option value="forms">Sort by Google Forms</option>
            </select>
          </div>
        </div>
      </div>

      {/* Colleges Grid */}
      {loadingCounts ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredColleges.map((college) => (
            <div
              key={college.id}
              onClick={() => handleCollegeClick(college)}
              className="bg-white rounded-lg shadow hover:shadow-lg overflow-hidden cursor-pointer transition-all duration-200 ease-in-out transform hover:-translate-y-1"
            >
              <div className="p-6 flex flex-col items-center relative">
                <div className="absolute top-2 right-2 flex gap-2">
                  {countGoogleForms(college) > 0 && (
                    <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                      {countGoogleForms(college)} Forms
                    </div>
                  )}
                  {college.scheduled > 0 && (
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                      {college.scheduled} Scheduled
                    </div>
                  )}
                </div>
                <CollegeAvatar
                  name={college.name}
                  className="w-20 h-20 mb-4"
                  logoUrl={college.logoUrl}
                />
                <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">{college.name}</h2>
                <p className="text-sm text-gray-600 mb-4">{college.conference}</p>
                <div className="bg-blue-50 px-3 py-1 rounded-full">
                  <p className="text-sm font-medium text-blue-600">
                    {college.fraternityCount || 0} {college.fraternityCount === 1 ? 'Fraternity' : 'Fraternities'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddCollegeForm && (
        <AddCollegeForm
          onClose={() => setShowAddCollegeForm(false)}
          onSuccess={() => {
            setShowAddCollegeForm(false);
            window.location.reload();
          }}
        />
      )}

      {showModal && selectedCollege && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <CollegeAvatar
                    name={selectedCollege.name}
                    className="w-16 h-16"
                    logoUrl={selectedCollege.logoUrl}
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCollege.name}</h2>
                    <p className="text-gray-600">{selectedCollege.conference}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowAddFraternityForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Fraternity
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Delete College
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Fraternity List */}
              <div className="mt-6">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search fraternities..."
                    value={fraternitySearchTerm}
                    onChange={(e) => setFraternitySearchTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {loadingFraternities ? (
                  <div className="flex justify-center items-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : selectedCollegeFraternities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedCollegeFraternities
                      .filter(frat => {
                        if (!frat) return false;
                        const searchLower = (fraternitySearchTerm || '').toLowerCase();
                        const nameMatch = (frat.name || '').toLowerCase().includes(searchLower);
                        const lettersMatch = (frat.letters || '').toLowerCase().includes(searchLower);
                        return nameMatch || lettersMatch;
                      })
                      .sort((a, b) => {
                        const aHasBoth = !!(a?.signupFormUrl && a?.signupSheetUrl);
                        const bHasBoth = !!(b?.signupFormUrl && b?.signupSheetUrl);
                        return bHasBoth - aHasBoth;
                      })
                      .map((fraternity, index) => {
                        const bgColors = [
                          'bg-green-50 hover:bg-green-100',
                          'bg-blue-50 hover:bg-blue-100',
                          'bg-red-50 hover:bg-red-100'
                        ];
                        const bgColor = bgColors[index % 3];
                        return (
                        <FraternityCard
                          key={fraternity.id}
                          fraternity={fraternity}
                          collegeName={selectedCollege.name}
                          onEdit={() => setEditingFraternity(fraternity)}
                          className={bgColor}
                          index={index}
                        />
                      )})}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No fraternities found for this college</p>
                  </div>
                )}
              </div>

              {showAddFraternityForm && (
                <AddFraternityForm
                  collegeId={selectedCollege.id}
                  collegeName={selectedCollege.name}
                  onClose={() => setShowAddFraternityForm(false)}
                  onSuccess={() => {
                    setShowAddFraternityForm(false);
                    handleCollegeClick(selectedCollege);
                  }}
                />
              )}

              {editingFraternity && (
                <FraternityForm
                  fraternity={editingFraternity}
                  collegeId={selectedCollege.id}
                  onClose={() => setEditingFraternity(null)}
                  onSuccess={() => {
                    setEditingFraternity(null);
                    handleCollegeClick(selectedCollege);
                  }}
                />
              )}

              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[150]">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Delete College?</h3>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to delete {selectedCollege.name}? This will also delete all associated fraternities.
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

              {showFinalDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[150]">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-xl font-bold text-red-600 mb-4">Final Warning</h3>
                    <p className="text-gray-600 mb-6">
                      This action cannot be undone. Type <span className="font-bold">{selectedCollege.name}</span> to confirm deletion.
                    </p>
                    <input
                      type="text"
                      className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Type college name to confirm"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                    />
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => {
                          setShowFinalDeleteConfirm(false);
                          setDeleteConfirmText('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        disabled={deleting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteCollege}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        disabled={deleteConfirmText !== selectedCollege.name || deleting}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCollegeList;
