import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import EventCard from '../components/EventCard';
import TournamentRequestModal from '../components/TournamentRequestModal';
import Footer from '../components/Footer';
import { collegeOptions } from '../data/collegeList';

const EventsPage = () => {
  const { status } = useParams(); // 'scheduled' or 'completed'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'school'

  // Helper function to get college name from collegeId
  const getCollegeName = (collegeId) => {
    if (!collegeId) return 'Unknown College';
    
    // Handle special cases
    const specialMappings = {
      'virginia-tech-hokies': 'Virginia Tech',
      'towson-tigers': 'Towson University',
      'nebraska-cornhuskers': 'University of Nebraska',
      'indiana-hoosiers': 'Indiana University'
    };
    
    if (specialMappings[collegeId]) {
      return specialMappings[collegeId];
    }
    
    // Look for match in college options
    const college = collegeOptions.find(option => option.value === collegeId);
    if (college) {
      return college.label;
    }
    
    // Fallback: Convert ID to readable name
    return collegeId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Helper function to format fraternity name
  const getFraternityName = (fraternityId, fraternityName) => {
    if (fraternityName) return fraternityName;
    if (!fraternityId) return 'TBD';
    
    // Convert fraternity ID to readable name
    const commonMappings = {
      'delta-chi': 'Delta Chi',
      'kappa-sig': 'Kappa Sigma',
      'pkt': 'Phi Kappa Tau',
      'dke': 'Delta Kappa Epsilon'
    };
    
    return commonMappings[fraternityId] || fraternityId.toUpperCase();
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Get ALL events from the database
        const eventsRef = collection(db, 'events');
        const snapshot = await getDocs(eventsRef);
        const eventsData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .map(event => {
            // Handle both 'date' and 'dateScheduled' fields
            if (!event.date && event.dateScheduled) {
              event.date = event.dateScheduled === 'TBD' ? null : event.dateScheduled;
            }
            
            // Normalize contact person field
            if (!event.contactPerson && event.pointOfContact) {
              event.contactPerson = event.pointOfContact;
            }
            
            // Ensure college/fraternity names are present with proper mapping
            if (!event.collegeName) {
              event.collegeName = getCollegeName(event.collegeId);
            }
            
            if (!event.fraternityName) {
              event.fraternityName = getFraternityName(event.fraternityId, event.fraternityName);
            }
            
            // TEST: Add a sample logo ONLY if none exists (remove this after testing)
            // Priority: 1. Manual upload (collegeLogo field), 2. Test logo
            if (!event.collegeLogo) {
              // Only add test logo if there's no manually uploaded logo
              const testLogos = [
                '/college-logos/CAA/Towson-Tigers-logo.png',
                '/college-logos/CAA/Drexel-Dragons-logo 2.png',
                '/college-logos/CAA/Elon-Phoenix-logo.png',
                '/college-logos/CAA/UNC-Wilmington-Seahawks-logo.png',
                '/college-logos/CAA/Northeastern-Huskies-logo 2.png'
              ];
              
              // Match logos to specific colleges if possible
              if (event.collegeName?.includes('Towson')) {
                event.collegeLogo = '/college-logos/CAA/Towson-Tigers-logo.png';
              } else if (event.collegeName?.includes('Pitt') || event.collegeName?.includes('Pittsburgh')) {
                // Could add Pitt logo if available
                event.collegeLogo = testLogos[0];
              } else if (event.collegeName?.includes('Georgia')) {
                // Could add Georgia logo if available
                event.collegeLogo = testLogos[2];
              } else if (event.collegeName?.includes('Nebraska')) {
                // Could add Nebraska logo if available
                event.collegeLogo = testLogos[3];
              } else if (event.collegeName?.includes('Purdue')) {
                // Could add Purdue logo if available
                event.collegeLogo = testLogos[4];
              } else if (event.collegeName?.includes('Indiana')) {
                // Could add Indiana logo if available
                event.collegeLogo = testLogos[1];
              } else {
                // Fallback: use a random logo based on college name
                const index = Math.abs(event.collegeName?.charCodeAt(0) || 0) % testLogos.length;
                event.collegeLogo = testLogos[index];
              }
            }
            
            return event;
          });
        
        setEvents(eventsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, [status]);

  const handleEventClick = (event) => {
    // Handle event click - could navigate to event details or open registration
    console.log('Event clicked:', event);
  };

  // Sort events based on selected criteria
  const sortedEvents = [...events].sort((a, b) => {
    if (sortBy === 'date') {
      // Parse dates for comparison
      const parseDate = (dateStr) => {
        if (!dateStr || dateStr === 'TBD') return new Date('9999-12-31'); // Put TBD at the end
        
        // Handle Firestore Timestamp objects
        if (dateStr?.toDate) {
          return dateStr.toDate();
        }
        
        // Handle string dates
        try {
          return new Date(dateStr);
        } catch {
          return new Date('9999-12-31');
        }
      };
      
      const dateA = parseDate(a.date || a.dateScheduled);
      const dateB = parseDate(b.date || b.dateScheduled);
      return dateA - dateB;
    } else if (sortBy === 'school') {
      // Sort by college name
      const schoolA = (a.collegeName || getCollegeName(a.collegeId)).toLowerCase();
      const schoolB = (b.collegeName || getCollegeName(b.collegeId)).toLowerCase();
      return schoolA.localeCompare(schoolB);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-white text-xl">Loading events...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-white text-xl">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-16 px-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Request Button and Sort */}
        <div className="flex flex-col gap-4 mb-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 capitalize mb-2">
                {status} Events
              </h1>
              <p className="text-gray-300 text-lg">Join the action at our upcoming tournaments</p>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold py-3 px-8 rounded-full hover:from-purple-700 hover:to-cyan-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl"
          >
            Request Tournament
          </button>
          </div>
          
          {/* Sort By Dropdown - Only show if there are events */}
          {events.length > 0 && (
            <div className="flex items-center gap-3">
              <label htmlFor="sort-by" className="text-gray-300 font-medium">
                Sort by:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 backdrop-blur-sm hover:bg-white/15 transition-colors"
              >
                <option value="date" className="bg-gray-900">Date</option>
                <option value="school" className="bg-gray-900">School Name</option>
              </select>
            </div>
          )}
        </div>
        
        {events.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-2xl mb-4">
              No {status} events found
            </div>
            <p className="text-gray-500">Check back soon for upcoming tournaments!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={handleEventClick}
              />
            ))}
          </div>
        )}
      </div>

        {/* Tournament Request Modal */}
        {showRequestModal && (
          <TournamentRequestModal onClose={() => setShowRequestModal(false)} />
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </>
  );
};

export default EventsPage;