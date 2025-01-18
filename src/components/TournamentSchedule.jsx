import React from 'react';

const TournamentSchedule = ({ tournaments }) => {
  // Group tournaments by month
  const groupByMonth = (tournaments) => {
    const grouped = {};
    tournaments.forEach(tournament => {
      const date = new Date(tournament.date);
      const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(tournament);
    });
    return grouped;
  };

  // Sort tournaments within each month by date
  const sortTournaments = (tournaments) => {
    return tournaments.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const groupedTournaments = groupByMonth(tournaments);
  const sortedMonths = Object.keys(groupedTournaments).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA - dateB;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const getOrdinalSuffix = (d) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
    }) + ' ' + day + getOrdinalSuffix(day);
  };

  return (
    <div className="space-y-8">
      {sortedMonths.map(month => (
        <div key={month} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-800 text-white px-6 py-4">
            <h3 className="text-xl font-semibold">{month}</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {sortTournaments(groupedTournaments[month]).map(tournament => (
              <div key={tournament.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {tournament.college} - {tournament.fraternity}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(tournament.date)} at {tournament.time}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {tournament.type} • {tournament.location}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    tournament.status === 'completed' ? 'bg-green-100 text-green-800' :
                    tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tournament.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TournamentSchedule;
