import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import TournamentCard from '../components/TournamentCard';

const TournamentsPage = () => {
  const { type } = useParams(); // 'previous', 'upcoming', or 'scheduled'
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        // Map route parameter to tournament status
        const statusMap = {
          previous: 'completed',
          upcoming: 'upcoming',
          scheduled: 'scheduled'
        };

        const tournamentsRef = collection(db, 'tournaments');
        const q = query(tournamentsRef, where('status', '==', statusMap[type]));
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
  }, [type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-white text-xl">Loading tournaments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-white text-xl">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-12 capitalize">
          {type} Tournaments
        </h1>
        
        {tournaments.length === 0 ? (
          <div className="text-white text-xl text-center">
            No {type} tournaments found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tournaments.map((tournament) => (
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
