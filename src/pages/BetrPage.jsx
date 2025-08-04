import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CollegeMapContainer from '../components/CollegeMapContainer';
import CampusMap from '../components/CampusMap';
import SimpleCampusMap from '../components/SimpleCampusMap';
import StaticCampusMap from '../components/StaticCampusMap';

const BetrPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if already authenticated
  useEffect(() => {
    const authStatus = sessionStorage.getItem('betrAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Set your password here
    const correctPassword = 'betr2024';
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('betrAuthenticated', 'true');
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('betrAuthenticated');
    setIsAuthenticated(false);
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <img
              className="mx-auto h-24 w-auto"
              src="/CCT_Logo_1.png"
              alt="CCT Logo"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Betr Access
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Enter password to continue
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit}>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Access Betr
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // If authenticated, render the layout with the map
  return <BetrLayout onLogout={handleLogout} />;
};

// Betr Layout Component
const BetrLayout = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with Navigation */}
      <div className="w-64 bg-gray-800">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-gray-900">
            <img src="/CCT_Logo_1.png" alt="CCT Logo" className="h-12 w-auto" />
          </div>

          {/* Navigation Menu */}
          <nav className="mt-8 flex-1">
            <div className="px-4 space-y-2">
              <button
                onClick={() => setCurrentView('home')}
                className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  currentView === 'home'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </button>
              
              <button
                onClick={() => setCurrentView('map')}
                className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  currentView === 'map'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Map
              </button>
              
              <button
                onClick={() => setCurrentView('database')}
                className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  currentView === 'database'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                Database
              </button>
              
              <button
                onClick={() => setCurrentView('campus')}
                className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  currentView === 'campus'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                Campus View
              </button>
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={onLogout}
              className="w-full group flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              {currentView === 'home' && 'Home'}
              {currentView === 'map' && 'College Map'}
              {currentView === 'database' && 'Database'}
              {currentView === 'campus' && 'Campus View'}
            </h1>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto">
          {currentView === 'home' && <BetrHomePage />}
          {currentView === 'map' && (
            <div className="p-6 h-full">
              <div className="h-full bg-white rounded-lg shadow-lg p-4">
                <CollegeMapContainer />
              </div>
            </div>
          )}
          {currentView === 'database' && <BetrDatabasePage />}
          {currentView === 'campus' && <BetrCampusViewPage />}
        </main>
      </div>
    </div>
  );
};

// Betr Home Page Component
const BetrHomePage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [fraternityFilter, setFraternityFilter] = useState('');
  
  // Sample data - replace with real data from Firebase
  const [colleges] = useState([
    {
      id: 1,
      status: 'green',
      state: 'Massachusetts',
      college: 'Harvard University',
      fraternity: 'Alpha Delta Phi',
      pointOfContact: 'John Smith'
    },
    {
      id: 2,
      status: 'yellow',
      state: 'California',
      college: 'Stanford University',
      fraternity: 'Kappa Sigma',
      pointOfContact: 'Jane Doe'
    },
    {
      id: 3,
      status: 'red',
      state: 'Texas',
      college: 'University of Texas',
      fraternity: 'Phi Delta Theta',
      pointOfContact: 'Mike Johnson'
    },
    {
      id: 4,
      status: 'green',
      state: 'Michigan',
      college: 'University of Michigan',
      fraternity: 'Sigma Chi',
      pointOfContact: 'Sarah Williams'
    },
    {
      id: 5,
      status: 'yellow',
      state: 'Florida',
      college: 'University of Florida',
      fraternity: 'Beta Theta Pi',
      pointOfContact: 'Chris Brown'
    },
  ]);

  // Filter data
  const filteredColleges = colleges.filter(college => {
    if (statusFilter !== 'all' && college.status !== statusFilter) return false;
    if (stateFilter && !college.state.toLowerCase().includes(stateFilter.toLowerCase())) return false;
    if (collegeFilter && !college.college.toLowerCase().includes(collegeFilter.toLowerCase())) return false;
    if (fraternityFilter && !college.fraternity.toLowerCase().includes(fraternityFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Map Section */}
      <div className="bg-white rounded-lg shadow-lg p-4" style={{ height: '500px' }}>
        <CollegeMapContainer showStateSelector={true} />
      </div>

      {/* Grid Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">College Database</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  statusFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('green')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  statusFilter === 'green' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              </button>
              <button
                onClick={() => setStatusFilter('yellow')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  statusFilter === 'yellow' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
              </button>
              <button
                onClick={() => setStatusFilter('red')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  statusFilter === 'red' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
              </button>
            </div>
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              placeholder="Filter by state..."
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* College Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
            <input
              type="text"
              placeholder="Filter by college..."
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Fraternity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fraternity</label>
            <input
              type="text"
              placeholder="Filter by fraternity..."
              value={fraternityFilter}
              onChange={(e) => setFraternityFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Point of Contact (Display Only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Point of Contact</label>
            <div className="px-3 py-1.5 text-sm text-gray-500 italic">Not searchable</div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  College
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fraternity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Point of Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredColleges.map((college) => (
                <tr key={college.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          college.status === 'green' ? 'bg-green-500' :
                          college.status === 'yellow' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {college.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {college.college}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {college.fraternity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {college.pointOfContact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Betr Database Page Component
const BetrDatabasePage = () => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Database Management</h2>
        <p className="text-gray-600">Database functionality coming soon...</p>
      </div>
    </div>
  );
};

// Betr Campus View Page Component
const BetrCampusViewPage = () => {
  const [selectedCollege, setSelectedCollege] = useState('');
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapType, setMapType] = useState('simple'); // 'advanced', 'simple', or 'static'
  
  // Sample colleges for dropdown
  const colleges = [
    { id: '1', name: 'University of Connecticut', lat: 41.8077, lng: -72.2540 },
    { id: '2', name: 'University of Texas at Austin', lat: 30.2849, lng: -97.7341 },
    { id: '3', name: 'University of Michigan', lat: 42.2780, lng: -83.7382 },
    { id: '4', name: 'Stanford University', lat: 37.4275, lng: -122.1697 },
  ];

  // Load Google Maps script
  useEffect(() => {
    console.log('API Key present:', !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
    console.log('Google already loaded:', !!window.google);
    
    if (!window.google && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      // Create callback function
      window.initGoogleMaps = () => {
        console.log('Google Maps loaded successfully');
        setMapsLoaded(true);
        delete window.initGoogleMaps;
      };
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&loading=async&libraries=marker&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.error('Failed to load Google Maps');
      };
      document.head.appendChild(script);
    } else if (window.google) {
      setMapsLoaded(true);
    }
  }, []);

  // Sample landmarks data for demo
  const getSampleLandmarks = (collegeId) => {
    const landmarkData = {
      '1': [ // UConn
        { name: 'Student Union', type: 'flag', lat: 41.8075, lng: -72.2520, color: '#ef4444', description: 'Main student center' },
        { name: 'Gampel Pavilion', type: 'building', lat: 41.8095, lng: -72.2560, color: '#3b82f6', description: 'Basketball arena' },
        { name: 'Library', type: 'building', lat: 41.8065, lng: -72.2515, color: '#6b7280', description: 'Homer Babbidge Library' },
      ],
      '2': [ // UT Austin
        { name: 'UT Tower', type: 'flag', lat: 30.2862, lng: -97.7394, color: '#f97316', description: 'Main campus landmark' },
        { name: 'DKR Stadium', type: 'building', lat: 30.2835, lng: -97.7325, color: '#f97316', description: 'Football stadium' },
      ],
      '3': [ // Michigan
        { name: 'The Diag', type: 'flag', lat: 42.2770, lng: -83.7385, color: '#fbbf24', description: 'Central campus quad' },
        { name: 'Michigan Stadium', type: 'building', lat: 42.2658, lng: -83.7487, color: '#1e40af', description: 'The Big House' },
      ],
      '4': [ // Stanford
        { name: 'Main Quad', type: 'flag', lat: 37.4275, lng: -122.1700, color: '#dc2626', description: 'Historic campus center' },
        { name: 'Hoover Tower', type: 'building', lat: 37.4274, lng: -122.1668, color: '#7c2d12', description: '285-foot landmark' },
      ],
    };
    return landmarkData[collegeId] || [];
  };

  // Sample fraternity data for demo
  const getSampleFraternities = (collegeId) => {
    const fraternityData = {
      '1': [ // UConn
        { name: 'ΣΧ', fullName: 'Sigma Chi', lat: 41.8085, lng: -72.2535, memberCount: 145, color: '#3b82f6' },
        { name: 'ΦΚΨ', fullName: 'Phi Kappa Psi', lat: 41.8090, lng: -72.2545, memberCount: 112, color: '#ef4444' },
        { name: 'ΑΔΦ', fullName: 'Alpha Delta Phi', lat: 41.8070, lng: -72.2530, memberCount: 98, color: '#10b981' },
        { name: 'ΖΒΤ', fullName: 'Zeta Beta Tau', lat: 41.8082, lng: -72.2555, memberCount: 87, color: '#f59e0b' },
      ],
      '2': [ // UT Austin
        { name: 'ΦΔΘ', fullName: 'Phi Delta Theta', lat: 30.2855, lng: -97.7335, memberCount: 156, color: '#3b82f6' },
        { name: 'ΣΑΕ', fullName: 'Sigma Alpha Epsilon', lat: 30.2860, lng: -97.7345, memberCount: 134, color: '#ef4444' },
        { name: 'ΚΣ', fullName: 'Kappa Sigma', lat: 30.2845, lng: -97.7340, memberCount: 128, color: '#10b981' },
      ],
      '3': [ // Michigan
        { name: 'ΣΦΕ', fullName: 'Sigma Phi Epsilon', lat: 42.2785, lng: -83.7375, memberCount: 178, color: '#8b5cf6' },
        { name: 'ΔΤΔ', fullName: 'Delta Tau Delta', lat: 42.2775, lng: -83.7390, memberCount: 145, color: '#ec4899' },
      ],
      '4': [ // Stanford
        { name: 'ΣΝ', fullName: 'Sigma Nu', lat: 37.4280, lng: -122.1690, memberCount: 132, color: '#14b8a6' },
        { name: 'ΚΑ', fullName: 'Kappa Alpha', lat: 37.4270, lng: -122.1705, memberCount: 118, color: '#f97316' },
      ],
    };
    return fraternityData[collegeId] || [];
  };

  return (
    <div className="p-6 h-full">
      <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
        {/* Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* College Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select College Campus
            </label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Choose a college...</option>
              {colleges.map(college => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Map Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Map Type
            </label>
            <select
              value={mapType}
              onChange={(e) => setMapType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="simple">Simple Google Maps</option>
              <option value="advanced">Advanced Markers</option>
              <option value="static">Static Image Map</option>
            </select>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {selectedCollege ? (
            mapType === 'static' ? (
              <StaticCampusMap
                college={colleges.find(c => c.id === selectedCollege)}
                fraternities={getSampleFraternities(selectedCollege)}
                landmarks={getSampleLandmarks(selectedCollege)}
              />
            ) : mapType === 'simple' ? (
              <SimpleCampusMap
                college={colleges.find(c => c.id === selectedCollege)}
                fraternities={getSampleFraternities(selectedCollege)}
                landmarks={getSampleLandmarks(selectedCollege)}
              />
            ) : (
              <CampusMap
                college={colleges.find(c => c.id === selectedCollege)}
                fraternities={getSampleFraternities(selectedCollege)}
                landmarks={getSampleLandmarks(selectedCollege)}
              />
            )
          ) : (
            <p className="text-gray-500">Select a college to view campus map</p>
          )}
        </div>

        {/* Info Panel - Only show for Google Maps if not loaded */}
        {selectedCollege && !mapsLoaded && mapType !== 'static' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Once Google Maps is integrated, this will show:
            </p>
            <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
              <li>Satellite/aerial view of the campus</li>
              <li>Fraternity house locations with colored circle markers</li>
              <li>Red flag markers for important landmarks</li>
              <li>Building icons for campus facilities</li>
              <li>Click any marker for detailed information</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BetrPage;