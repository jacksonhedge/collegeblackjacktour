import React, { useState, useEffect } from 'react';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import SessionWarning from '../components/SessionWarning';
import CollegeList from '../components/CollegeList';
import TournamentForm from '../components/TournamentForm';
import TournamentTicker from '../components/TournamentTicker';
import TournamentSchedule from '../components/TournamentSchedule';

const SESSION_DURATION = 30 * 60 * 1000;
const WARNING_THRESHOLD = 5 * 60 * 1000;

const AdminTournamentsPage = ({ onLogout }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTournamentForm, setShowTournamentForm] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedFraternity, setSelectedFraternity] = useState(null);
  const [fraternities, setFraternities] = useState([]);
  const [loadingFraternities, setLoadingFraternities] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const tournamentsRef = collection(db, 'tournaments');
      const snapshot = await getDocs(tournamentsRef);
      const tournamentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTournaments(tournamentsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setLoading(false);
    }
  };

  const fetchFraternities = async (college) => {
    setLoadingFraternities(true);
    try {
      const normalizedCollegeId = college.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const fraternitiesRef = collection(db, 'colleges', normalizedCollegeId, 'fraternities');
      const snapshot = await getDocs(fraternitiesRef);
      const fraternitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFraternities(fraternitiesData);
    } catch (error) {
      console.error('Error fetching fraternities:', error);
    } finally {
      setLoadingFraternities(false);
    }
  };

  const handleDelete = async (tournamentId) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await deleteDoc(doc(db, 'tournaments', tournamentId));
        await fetchTournaments();
      } catch (error) {
        console.error('Error deleting tournament:', error);
      }
    }
  };

  const handleTournamentSuccess = async () => {
    setShowTournamentForm(false);
    setSelectedTournament(null);
    setSelectedCollege(null);
    setSelectedFraternity(null);
    await fetchTournaments();
  };

  const handleCollegeSelect = async (college) => {
    setSelectedCollege(college);
    await fetchFraternities(college);
  };

  const handleFraternitySelect = (fraternity) => {
    setSelectedFraternity(fraternity);
    setShowTournamentForm(true);
  };

  useEffect(() => {
    const checkSession = () => {
      const expiresAt = localStorage.getItem('adminSessionExpires');
      if (expiresAt) {
        const expiryTime = parseInt(expiresAt);
        const now = new Date().getTime();
        const timeLeft = expiryTime - now;
        
        if (timeLeft <= 0) {
          onLogout();
        } else {
          setShowWarning(timeLeft <= WARNING_THRESHOLD);
          setRemainingTime(timeLeft);
        }
      }
    };

    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, [onLogout]);

  const handleExtendSession = () => {
    const expiresAt = new Date().getTime() + SESSION_DURATION;
    localStorage.setItem('adminSessionExpires', expiresAt.toString());
    setShowWarning(false);
  };

  const handleBack = () => {
    if (showTournamentForm) {
      setShowTournamentForm(false);
      setSelectedFraternity(null);
    } else if (selectedCollege) {
      setSelectedCollege(null);
      setFraternities([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-16 flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
        <span 
          className="cursor-pointer hover:text-gray-200"
          onClick={handleBack}
        >
          Admin Dashboard
        </span>
        <div className="flex items-center space-x-4">
          <button
            onClick={onLogout}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="sticky top-0 z-10">
        <TournamentTicker tournaments={tournaments} />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        {showTournamentForm ? (
          <TournamentForm
            selectedTournament={selectedTournament}
            selectedCollege={selectedCollege}
            selectedFraternity={selectedFraternity}
            onCancel={handleBack}
            onSuccess={handleTournamentSuccess}
          />
        ) : selectedCollege ? (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCollege.name} - Select Fraternity
              </h2>
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Colleges
              </button>
            </div>
            {loadingFraternities ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : fraternities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fraternities.map(fraternity => (
                  <div
                    key={fraternity.id}
                    onClick={() => handleFraternitySelect(fraternity)}
                    className="p-4 border rounded-lg hover:shadow-md cursor-pointer transition-all"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">{fraternity.name}</h3>
                    {fraternity.chapterName && (
                      <p className="text-sm text-gray-600">{fraternity.chapterName}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">No fraternities found for this college</p>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-8">
              <CollegeList onCollegeSelect={handleCollegeSelect} />
              
              {/* Tournament Schedule Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Tournament Schedule</h3>
                <TournamentSchedule tournaments={tournaments} />
              </div>

              {/* All Tournaments Table */}
              {tournaments.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">All Tournaments</h3>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tournament
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tournaments.map((tournament) => (
                      <tr key={tournament.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-12 w-12 relative rounded overflow-hidden">
                            <img
                              src={tournament.imageUrl || '/tournament-images/default.jpg'}
                              alt={tournament.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/tournament-images/default.jpg';
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{tournament.title}</div>
                          <div className="text-sm text-gray-500">{tournament.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{tournament.date}</div>
                          <div className="text-sm text-gray-500">{tournament.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tournament.status === 'completed' ? 'bg-green-100 text-green-800' :
                            tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {tournament.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedTournament(tournament);
                              setShowTournamentForm(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tournament.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {showWarning && (
        <SessionWarning
          remainingTime={remainingTime}
          onExtend={handleExtendSession}
        />
      )}
    </div>
  );
};

export default AdminTournamentsPage;
