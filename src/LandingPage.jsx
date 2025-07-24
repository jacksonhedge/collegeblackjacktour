import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase/config';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, 'publicEvents');
      const q = query(
        eventsRef,
        where('isPublic', '==', true),
        orderBy('date', 'asc')
      );
      const snapshot = await getDocs(q);
      const now = new Date();
      const upcomingEvents = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= now;
        })
        .slice(0, 3); // Show only next 3 events
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleJoinTeam = (e) => {
    e.preventDefault();
    if (email) {
      window.location.href = `mailto:jackson@hedgepayments.com?subject=Join the Team&body=Email: ${email}`;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #dc2626 0, #dc2626 10px, transparent 10px, transparent 20px)',
        }}></div>
      </div>

      {/* Hero Section with Logo */}
      <div className="relative w-full py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Red background circle for logo */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-red-600 rounded-full blur-3xl opacity-30 scale-150"></div>
            <img 
              src="/CCT_Logo_2.png" 
              alt="College Casino Tour" 
              className="relative w-64 md:w-80 mx-auto filter drop-shadow-2xl"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            College Casino Tour
          </h1>
          <p className="text-2xl text-red-500 font-semibold">
            The Ultimate College Blackjack Experience
          </p>
        </div>
      </div>

      {/* Upcoming Events Section */}
      {events.length > 0 && (
        <div className="relative w-full bg-gray-900 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-black border-2 border-red-600 rounded-lg p-6 hover:bg-gray-900 transition-colors">
                  {/* Logos */}
                  <div className="flex justify-between items-start mb-4">
                    {event.collegeLogoUrl && (
                      <img 
                        src={event.collegeLogoUrl} 
                        alt={event.collegeName}
                        className="h-16 w-16 object-contain"
                      />
                    )}
                    {event.fraternityLogoUrl && (
                      <img 
                        src={event.fraternityLogoUrl} 
                        alt={event.fraternityName}
                        className="h-16 w-16 object-contain"
                      />
                    )}
                  </div>
                  
                  {/* Event Details */}
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  {event.description && (
                    <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {(event.collegeName || event.fraternityName) && (
                      <p className="text-red-500">
                        {event.collegeName} {event.collegeName && event.fraternityName && '-'} {event.fraternityName}
                      </p>
                    )}
                    <p className="text-gray-300">
                      <span className="font-semibold">Date:</span> {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-semibold">Time:</span> {event.time}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-semibold">Location:</span> {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Follow Bankroll Section */}
      <div className="relative w-full bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-black mb-8">Follow Bankroll</h2>
          <div className="bg-gray-100 rounded-lg p-8 border-2 border-red-600">
            <img 
              src="/partners/bankroll.png" 
              alt="Bankroll" 
              className="w-48 mx-auto mb-6"
            />
            <p className="text-black mb-6">
              Stay updated with Bankroll for the latest news, tips, and exclusive content!
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-red-600 hover:text-red-700 transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                </svg>
              </a>
              <a href="#" className="text-red-600 hover:text-red-700 transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>
              <a href="#" className="text-red-600 hover:text-red-700 transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Join the Team Section */}
      <div className="relative w-full bg-red-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Join the Team</h2>
          <p className="text-white mb-8">
            Interested in joining the College Blackjack Tour team? We're always looking for passionate individuals!
          </p>
          <form onSubmit={handleJoinTeam} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
