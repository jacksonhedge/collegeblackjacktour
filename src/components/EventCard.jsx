import React, { useState } from 'react';
import { format } from 'date-fns';

const EventCard = ({ event, onClick }) => {
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MM/dd/yy');
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'TBD';
    }
  };

  // Extract state from location or use state field if available
  const getStateAbbr = () => {
    if (event.state) return event.state;
    
    // Try to extract from location field
    if (event.location) {
      // Common state abbreviations pattern
      const stateMatch = event.location.match(/,\s*([A-Z]{2})(?:\s|$)/);
      if (stateMatch) return stateMatch[1];
    }
    
    // Map of college names to states (add more as needed)
    const collegeToState = {
      'Nebraska': 'NE',
      'Purdue': 'IN',
      'Indiana': 'IN',
      'Towson': 'MD',
      'Georgia': 'GA',
      'Pitt': 'PA',
      'Virginia Tech': 'VA',
      'Ohio State': 'OH',
      'Michigan': 'MI',
      'Texas': 'TX',
      'Florida': 'FL',
      'California': 'CA',
      'Arizona': 'AZ',
      'Colorado': 'CO',
      'Iowa': 'IA',
      'Wisconsin': 'WI',
      'Illinois': 'IL',
      'Minnesota': 'MN',
      'Penn State': 'PA',
      'Maryland': 'MD',
      'Rutgers': 'NJ',
      'Northwestern': 'IL',
      'Michigan State': 'MI'
    };
    
    // Try to match college name
    const collegeName = event.collegeName || event.title || '';
    for (const [college, state] of Object.entries(collegeToState)) {
      if (collegeName.toLowerCase().includes(college.toLowerCase())) {
        return state;
      }
    }
    
    return '';
  };

  // Generate title from available fields - improved logic
  const eventTitle = event.title || 
    (event.collegeName && event.fraternityName ? 
      `${event.collegeName} - ${event.fraternityName}` : 
      event.collegeName || event.fraternityName || 'Untitled Event');
  
  // Handle date display - support both date timestamp and dateScheduled string
  let displayDate = 'TBD';
  if (event.date) {
    displayDate = formatDate(event.date);
  } else if (event.dateScheduled && event.dateScheduled !== 'TBD') {
    displayDate = event.dateScheduled;
  }
  
  // Handle time display
  const displayTime = event.time || '@ TBD';
  
  // Handle location - check multiple possible fields (no contact info shown)
  const displayLocation = event.location || 
                          event.venue || 
                          event.address || 
                          'TBD';

  const stateAbbr = getStateAbbr();

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 aspect-[4/3] bg-gradient-to-br from-purple-900/90 via-slate-900 to-cyan-900/90 border border-purple-500/30 hover:border-cyan-400/50 transform hover:-translate-y-2 group">
      {/* Background Image with gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-300"
        style={{ 
          backgroundImage: `url(${event.backgroundImage || '/tournament-images/default.jpg'})` 
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-slate-900/70 to-cyan-900/90" />
      
      {/* College Logo - Top Right */}
      {event.collegeLogo && (
        <div className="absolute top-4 right-4 z-20">
          <img 
            src={event.collegeLogo} 
            alt={event.collegeName || 'College logo'}
            className="h-12 w-12 object-contain bg-white/90 rounded-lg p-1 shadow-lg backdrop-blur-sm"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      {/* State Abbreviation - Bottom Right */}
      {stateAbbr && (
        <div className="absolute bottom-4 right-4 z-20">
          <div className="bg-gradient-to-r from-purple-500/80 to-cyan-500/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20">
            <span className="text-white font-bold text-lg tracking-wider">{stateAbbr}</span>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-8 text-white">
        {/* Title Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold tracking-wide mb-3 drop-shadow-lg">
            {eventTitle}
          </h3>
          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-purple-400/60" />
            <div className="w-2 h-2 rounded-full bg-cyan-400/80" />
            <div className="w-8 h-[2px] bg-gradient-to-l from-transparent to-cyan-400/60" />
          </div>
        </div>
        
        {/* Details Section */}
        <div className="space-y-4 flex-grow flex flex-col justify-center">
          {/* Date and Time */}
          <div className="flex items-center justify-center gap-3 text-base bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm rounded-lg py-2 px-4 border border-purple-400/20">
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium text-white">{displayDate}</span>
            <span className="text-purple-200">{displayTime}</span>
          </div>
          
          {/* Location */}
          <div className="flex items-center justify-center gap-3 text-base bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-lg py-2 px-4 border border-cyan-400/20">
            <svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium text-white">{displayLocation}</span>
          </div>
        </div>
        
        {/* Enter Button */}
        <button
          onClick={() => {
            if (event.googleFormUrl) {
              // Open the Google Form in a new tab
              window.open(event.googleFormUrl, '_blank', 'noopener,noreferrer');
            } else {
              // Show coming soon modal
              setShowComingSoonModal(true);
            }
          }}
          className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-3 px-10 rounded-full mx-auto hover:from-purple-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-200 shadow-lg group-hover:shadow-purple-500/25"
        >
          Enter
        </button>
      </div>
    </div>
      
    {/* Coming Soon Modal - Full Screen Overlay */}
    {showComingSoonModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
        <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sign-up Form Coming Soon!</h3>
            <p className="text-sm text-gray-500 mb-4">
              The registration form for this event is being set up. Check back later!
            </p>
            <button
              onClick={() => setShowComingSoonModal(false)}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:text-sm"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default EventCard;