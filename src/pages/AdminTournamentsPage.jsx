import React, { useState, useEffect } from 'react';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import SessionWarning from '../components/SessionWarning';
import CollegeList from '../components/CollegeList';
import TournamentForm from '../components/TournamentForm';

const SESSION_DURATION = 30 * 60 * 1000;
const WARNING_THRESHOLD = 5 * 60 * 1000;

const AdminTournamentsPage = ({ onLogout }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTournamentForm, setShowTournamentForm] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
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
    await fetchTournaments();
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

  return (
    <div className="min-h-screen bg-gray-100 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center mb-8">
        <span 
          className="cursor-pointer hover:text-gray-200"
          onClick={() => {
            setShowTournamentForm(false);
            setSelectedTournament(null);
          }}
        >
          Admin Dashboard
        </span>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowTournamentForm(!showTournamentForm)}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-sm"
          >
            {showTournamentForm ? 'View Network' : 'Add Tournament'}
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        {showTournamentForm ? (
          <TournamentForm
            selectedTournament={selectedTournament}
            onCancel={() => {
              setShowTournamentForm(false);
              setSelectedTournament(null);
            }}
            onSuccess={handleTournamentSuccess}
          />
        ) : (
          <>
            <CollegeList />
            {tournaments.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Tournaments</h3>
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
