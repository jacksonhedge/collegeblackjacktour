import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import TournamentSchedule from '../components/TournamentSchedule';
import TournamentTicker from '../components/TournamentTicker';

const AdminCalendarPage = ({ onLogout }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchTournaments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pb-16 flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
        <span className="text-xl font-semibold">Calendar</span>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tournament Schedule</h2>
              <TournamentSchedule tournaments={tournaments} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCalendarPage;
