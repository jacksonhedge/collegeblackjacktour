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
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'school'

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
        
        // If no type or invalid type, get all tournaments
        let querySnapshot;
        if (type && statusMap[type]) {
          const q = query(tournamentsRef, where('status', '==', statusMap[type]));
          querySnapshot = await getDocs(q);
        } else {
          // Get all tournaments if no valid type
          querySnapshot = await getDocs(tournamentsRef);
        }
        
        const tournamentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setTournaments(tournamentsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError('Failed to load tournaments. Please try again later.');
        setTournaments([]); // Set empty array on error
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [type]);

  // Sort tournaments based on selected criteria
  const sortedTournaments = [...tournaments].sort((a, b) => {
    if (sortBy === 'date') {
      // Parse dates for comparison (assuming format like "December 15, 2024" or "TBD")
      const parseDate = (dateStr) => {
        if (!dateStr || dateStr === 'TBD') return new Date('9999-12-31'); // Put TBD at the end
        try {
          return new Date(dateStr);
        } catch {
          return new Date('9999-12-31');
        }
      };
      
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateA - dateB;
    } else if (sortBy === 'school') {
      // Extract school name from title or location
      const getSchoolName = (tournament) => {
        // First check if there's a collegeName field
        if (tournament.collegeName) {
          return tournament.collegeName;
        }
        
        // Try to extract from title (e.g., "Nebraska Cornhuskers - Kappa Sig")
        if (tournament.title) {
          // Split by common separators
          const parts = tournament.title.split(/[-–—]/);
          if (parts.length > 0) {
            let schoolName = parts[0].trim();
            // Remove common suffixes
            schoolName = schoolName
              .replace(/Tournament \d{4}$/i, '')
              .replace(/\s+(DU|PKT|DKE|Acacia)$/i, '')
              .replace(/\s+\(.*\)$/i, '')
              .trim();
            return schoolName;
          }
        }
        
        // Fallback to location
        return tournament.location || '';
      };
      
      const schoolA = getSchoolName(a).toLowerCase();
      const schoolB = getSchoolName(b).toLowerCase();
      return schoolA.localeCompare(schoolB);
    }
    return 0;
  });

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
          <h1 className="text-4xl font-bold text-white capitalize">
            {type ? `${type} Tournaments` : 'All Tournaments'}
          </h1>
          
          {/* Sort By Dropdown - Only show if there are tournaments */}
          {tournaments.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="text-white font-medium">
                Sort by:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              >
                <option value="date" className="bg-gray-800">Date</option>
                <option value="school" className="bg-gray-800">School Name</option>
              </select>
            </div>
          )}
        </div>
        
        {tournaments.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-12 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              No Tournaments Yet
            </h2>
            <p className="text-white/80 mb-6">
              {type ? `No ${type} tournaments at this time.` : 'No tournaments have been scheduled yet.'}
            </p>
            <p className="text-white/60 text-sm">
              Check back soon or contact us to host a tournament at your school!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedTournaments.map((tournament) => (
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
