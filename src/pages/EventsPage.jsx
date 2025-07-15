import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEventsByStatus } from '../firebase/events';
import EventCard from '../components/EventCard';
import TournamentRequestModal from '../components/TournamentRequestModal';

const EventsPage = () => {
  const { status } = useParams(); // 'scheduled' or 'completed'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventStatus = status === 'scheduled' ? 'upcoming' : 'completed';
        const eventsData = await getEventsByStatus(eventStatus);
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
    <div className="min-h-screen bg-gray-900 pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Request Button */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white capitalize">
            {status} Events
          </h1>
          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors duration-200"
          >
            Request
          </button>
        </div>
        
        {events.length === 0 ? (
          <div className="text-white text-xl text-center">
            No {status} events found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
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
  );
};

export default EventsPage;