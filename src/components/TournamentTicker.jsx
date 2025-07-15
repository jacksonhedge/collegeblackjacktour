import React from 'react';

const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
  }) + ' ' + day + getOrdinalSuffix(day);
};

const TournamentTicker = ({ tournaments }) => {
  if (!tournaments || tournaments.length === 0) {
    return null;
  }

  const scheduledTournaments = tournaments.filter(tournament => 
    tournament.status === 'scheduled' || tournament.status === 'upcoming'
  );

  if (scheduledTournaments.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-700 text-white py-4 overflow-hidden w-full">
      <div className="relative whitespace-nowrap">
        <div className="inline-block animate-marquee px-4">
          {scheduledTournaments.map((tournament, index) => (
            <span key={tournament.id} className="mx-6 text-sm">
              {tournament.college} - {tournament.fraternity} | {tournament.type} | {formatDate(tournament.date)} {tournament.time}
              {index !== scheduledTournaments.length - 1 && " • "}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentTicker;
