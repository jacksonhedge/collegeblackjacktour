import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AdminEnterEventPage = () => {
  const [colleges, setColleges] = useState([]);
  const [fraternities, setFraternities] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateTBD, setDateTBD] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    college: '',
    fraternity: '',
    pointOfContact: '',
    googleFormLink: '',
    dateScheduled: ''
  });

  // Default fraternities that should always be available
  const defaultFraternities = [
    { id: 'pike', name: 'Pike (Pi Kappa Alpha)' },
    { id: 'sigma-chi', name: 'Sigma Chi' },
    { id: 'sae', name: 'SAE (Sigma Alpha Epsilon)' },
    { id: 'dke', name: 'DKE (Delta Kappa Epsilon)' },
    { id: 'kappa-sig', name: 'Kappa Sig' },
    { id: 'tke', name: 'TKE (Tau Kappa Epsilon)' },
    { id: 'pkt', name: 'PKT' },
    { id: 'phi-tau', name: 'Phi Tau' },
    { id: 'delta-chi', name: 'Delta Chi' }
  ];

  useEffect(() => {
    fetchColleges();
    fetchEvents();
    // Initialize with default fraternities
    setFraternities(defaultFraternities);
  }, []);

  // Initialize college search when colleges are loaded
  useEffect(() => {
    if (formData.college && colleges.length > 0) {
      const selectedCollege = colleges.find(c => c.id === formData.college);
      if (selectedCollege) {
        setCollegeSearch(selectedCollege.name);
      }
    }
  }, [formData.college, colleges]);

  const fetchColleges = async () => {
    try {
      const collegesRef = collection(db, 'colleges');
      const snapshot = await getDocs(collegesRef);
      const collegesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setColleges(collegesData.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  const fetchFraternities = async (collegeId) => {
    try {
      const fraternitiesRef = collection(db, 'colleges', collegeId, 'fraternities');
      const snapshot = await getDocs(fraternitiesRef);
      const dbFraternities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Combine database fraternities with default fraternities
      // Use a Map to avoid duplicates based on name
      const fraternityMap = new Map();
      
      // Add default fraternities first
      defaultFraternities.forEach(frat => {
        fraternityMap.set(frat.name.toLowerCase(), frat);
      });
      
      // Add database fraternities (they will override defaults if same name)
      dbFraternities.forEach(frat => {
        fraternityMap.set(frat.name.toLowerCase(), frat);
      });
      
      // Convert back to array and sort
      const combinedFraternities = Array.from(fraternityMap.values())
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setFraternities(combinedFraternities);
    } catch (error) {
      console.error('Error fetching fraternities:', error);
      // If error, at least show default fraternities
      setFraternities(defaultFraternities);
    }
  };

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleCollegeChange = (e) => {
    const collegeId = e.target.value;
    setFormData({ ...formData, college: collegeId, fraternity: '' });
    if (collegeId) {
      fetchFraternities(collegeId);
    } else {
      // Show default fraternities when no college is selected
      setFraternities(defaultFraternities);
    }
  };

  const handleCollegeSelect = (college) => {
    setFormData({ ...formData, college: college.id, fraternity: '' });
    setCollegeSearch(college.name);
    setShowCollegeDropdown(false);
    fetchFraternities(college.id);
  };

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.college-search-container')) {
        setShowCollegeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedCollege = colleges.find(c => c.id === formData.college);
      const selectedFraternity = fraternities.find(f => f.id === formData.fraternity);

      const eventData = {
        collegeName: selectedCollege?.name || '',
        collegeId: formData.college,
        fraternityName: selectedFraternity?.name || '',
        fraternityId: formData.fraternity,
        pointOfContact: formData.pointOfContact,
        googleFormLink: formData.googleFormLink,
        dateScheduled: dateTBD ? 'TBD' : formData.dateScheduled,
        status: 'scheduled',
        createdAt: new Date()
      };

      await addDoc(collection(db, 'events'), eventData);
      
      // Reset form
      setFormData({
        college: '',
        fraternity: '',
        pointOfContact: '',
        googleFormLink: '',
        dateScheduled: ''
      });
      setDateTBD(false);
      setFraternities([]);
      setCollegeSearch('');
      
      // Refresh events list
      fetchEvents();
      
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Temporary cleanup function to remove fake tournaments
  const cleanupFakeTournaments = async () => {
    if (!window.confirm('This will remove all fake sample tournaments. Continue?')) {
      return;
    }

    const fakeTournamentTitles = [
      "Texas Hold'em Championship",
      "Blackjack Tournament", 
      "Poker Night",
      "Spring Poker Championship",
      "March Madness Casino Night",
      "Spring Break Poker Series",
      "April Poker Classic",
      "Spring Finals Casino Night"
    ];

    try {
      setLoading(true);
      const tournamentsRef = collection(db, 'tournaments');
      const snapshot = await getDocs(tournamentsRef);
      
      let deletedCount = 0;
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // Check if this is one of the fake tournaments
        if (fakeTournamentTitles.includes(data.title)) {
          await deleteDoc(doc(db, 'tournaments', docSnapshot.id));
          deletedCount++;
        }
      }
      
      alert(`Successfully deleted ${deletedCount} fake tournaments!`);
    } catch (error) {
      console.error('Error cleaning tournaments:', error);
      alert('Error cleaning tournaments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Enter Event</h1>
        <p className="text-gray-600 mt-2">Create a new tournament event</p>
      </div>

      {/* Event Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* College Searchable Dropdown */}
          <div className="college-search-container relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              College *
            </label>
            <input
              type="text"
              value={collegeSearch}
              onChange={(e) => {
                setCollegeSearch(e.target.value);
                setShowCollegeDropdown(true);
                if (!e.target.value) {
                  setFormData({ ...formData, college: '', fraternity: '' });
                  setFraternities(defaultFraternities);
                }
              }}
              onFocus={() => setShowCollegeDropdown(true)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Search for a college..."
              required={!formData.college}
            />
            
            {/* Dropdown list */}
            {showCollegeDropdown && collegeSearch && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredColleges.length > 0 ? (
                  filteredColleges.map((college) => (
                    <div
                      key={college.id}
                      onClick={() => handleCollegeSelect(college)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {college.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">
                    No colleges found
                  </div>
                )}
              </div>
            )}
            
            {/* Show all colleges when input is empty and focused */}
            {showCollegeDropdown && !collegeSearch && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {colleges.map((college) => (
                  <div
                    key={college.id}
                    onClick={() => handleCollegeSelect(college)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {college.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fraternity Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fraternity *
            </label>
            <select
              value={formData.fraternity}
              onChange={(e) => setFormData({ ...formData, fraternity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              disabled={!formData.college}
            >
              <option value="">Select a fraternity</option>
              {fraternities.map((fraternity) => (
                <option key={fraternity.id} value={fraternity.id}>
                  {fraternity.name}
                </option>
              ))}
            </select>
          </div>

          {/* Point of Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Point of Contact *
            </label>
            <input
              type="text"
              value={formData.pointOfContact}
              onChange={(e) => setFormData({ ...formData, pointOfContact: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter contact person's name"
              required
            />
          </div>

          {/* Google Form Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Form Link
            </label>
            <input
              type="url"
              value={formData.googleFormLink}
              onChange={(e) => setFormData({ ...formData, googleFormLink: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="https://forms.google.com/..."
            />
          </div>

          {/* Date Scheduled */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Scheduled *
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={formData.dateScheduled}
                onChange={(e) => setFormData({ ...formData, dateScheduled: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required={!dateTBD}
                disabled={dateTBD}
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={dateTBD}
                  onChange={(e) => {
                    setDateTBD(e.target.checked);
                    if (e.target.checked) {
                      setFormData({ ...formData, dateScheduled: '' });
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">TBD</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Creating Event...' : 'Create Event'}
          </button>
        </form>
      </div>

      {/* Recent Events */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Events</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  College
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fraternity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.slice(0, 10).map((event) => (
                <tr key={event.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.collegeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.fraternityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.pointOfContact}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.dateScheduled}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No events created yet.
            </div>
          )}
        </div>
      </div>

      {/* Temporary Cleanup Button */}
      <div className="mt-8 text-center">
        <button
          onClick={cleanupFakeTournaments}
          disabled={loading}
          className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Cleaning...' : 'Clean Fake Tournaments (One-time cleanup)'}
        </button>
        <p className="text-sm text-gray-500 mt-2">This button will be removed after cleaning fake tournaments</p>
      </div>
    </div>
  );
};

export default AdminEnterEventPage;