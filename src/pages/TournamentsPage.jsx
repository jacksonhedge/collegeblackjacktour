import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import TournamentCard from '../components/TournamentCard';

const TournamentsPage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'completed'

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const tournamentsRef = collection(db, 'tournaments');
        const q = query(tournamentsRef, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const tournamentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setTournaments(tournamentsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError('Failed to load tournaments. Please try again later.');
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  // Filter tournaments based on selected filter
  const filteredTournaments = tournaments.filter(tournament => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return tournament.status === 'upcoming' || tournament.status === 'scheduled';
    if (filter === 'completed') return tournament.status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-white text-xl">Loading tournaments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Tournaments
        </h1>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all' 
                ? 'bg-red-600 text-white' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            All Tournaments
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'upcoming' 
                ? 'bg-red-600 text-white' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'completed' 
                ? 'bg-red-600 text-white' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            Previous
          </button>
        </div>
        
        {filteredTournaments.length === 0 ? (
          <div className="text-white text-xl text-center mt-12">
            No tournaments found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                title={tournament.title}
                date={tournament.date}
                time={tournament.time}
                location={tournament.location}
                imageUrl={tournament.imageUrl}
                status={tournament.status}
                type={tournament.type}
                winner={tournament.winner}
                runnerUp={tournament.runnerUp}
                chapter={tournament.chapter}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentsPage;
