import React from 'react';
import { format } from 'date-fns';

const EventCard = ({ event, onClick }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MM/dd/yy');
  };

  return (
    <div className="relative rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 aspect-[4/3]">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${event.backgroundImage || '/tournament-images/default.jpg'})` 
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6 text-white">
        {/* Title */}
        <h3 className="text-xl font-bold text-center leading-tight">
          {event.title}
        </h3>
        
        {/* Divider */}
        <div className="w-24 h-0.5 bg-white mx-auto my-2" />
        
        {/* Details */}
        <div className="space-y-3">
          {/* Date and Time */}
          <div className="flex items-center justify-center space-x-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatDate(event.date)} @ {event.time}</span>
          </div>
          
          {/* Location */}
          <div className="flex items-center justify-center space-x-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.location}</span>
          </div>
        </div>
        
        {/* Enter Button */}
        <button
          onClick={() => onClick(event)}
          className="bg-white text-black font-bold py-2 px-8 rounded-full mx-auto hover:bg-gray-200 transition-colors duration-200"
        >
          Enter
        </button>
      </div>
    </div>
  );
};

export default EventCard;