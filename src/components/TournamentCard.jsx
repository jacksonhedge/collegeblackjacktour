import React, { useState, useEffect } from 'react';
import { getTournamentImageURL } from '../firebase/storage';

const TournamentCard = ({
  title, 
  date, 
  time, 
  location, 
  imageUrl, 
  status,
  type,
  winner,
  runnerUp,
  chapter 
}) => {
  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg group">
      {/* Background Image with Overlay */}
      <div className="relative h-64 w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40 z-10" />
        {/* Image with loading state */}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/tournament-images/default.jpg'; // Fallback image
            }}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gray-800 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        {/* Content */}
        <div className="absolute inset-0 z-20 p-6 flex flex-col justify-between">
          <h3 className="text-2xl font-bold text-white leading-tight">
            {title}
          </h3>
          
          <div className="space-y-3">
            {/* Status Badge */}
            <div className="inline-block px-2 py-1 bg-white/20 rounded text-sm text-white">
              {status}
            </div>

            {/* Date & Time */}
            <div className="flex items-center space-x-2 text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{date} @ {time}</span>
            </div>
            
            {/* Location & Chapter */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{location}</span>
              </div>
              <div className="text-white/80 text-sm pl-7">
                {chapter}
              </div>
            </div>

            {/* Winners (if tournament is completed) */}
            {status === 'completed' && (
              <div className="space-y-2 text-white">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" />
                  </svg>
                  <span>Winner: {winner}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" />
                  </svg>
                  <span>Runner-up: {runnerUp}</span>
                </div>
              </div>
            )}
            
            {/* Action Button */}
            <button 
              className={`w-full font-semibold py-2 px-4 rounded-md transition-colors ${
                status === 'upcoming' 
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              disabled={status !== 'upcoming'}
            >
              {status === 'upcoming' ? 'Enter' : 'View Details'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;
