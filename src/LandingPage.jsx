import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase/config';
import EventCard from './components/EventCard';
import EventRegistrationModal from './components/EventRegistrationModal';

// Partners data
const partners = [
  {
    name: 'Sleeper Fantasy',
    logo: '/partners/sleeper.png'
  },
  {
    name: 'Pulsz',
    logo: '/partners/pulsz.png'
  },
  {
    name: 'McLuck',
    logo: '/partners/mcluck.png'
  },
  {
    name: 'MyPrize',
    logo: '/partners/myprize.jpg'
  },
  {
    name: 'Bankroll',
    logo: '/partners/bankroll.png'
  },
  {
    name: 'Hedge Payments',
    logo: '/partners/hedge-payments.png'
  }
];

const LandingPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const q = query(
        collection(db, 'events'),
        where('showOnLandingPage', '==', true),
        where('status', '==', 'upcoming'),
        orderBy('date', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEvents(eventsData.slice(0, 6)); // Show max 6 events
    } catch (error) {
      console.error('Error fetching events:', error);
      // If query fails, try without compound query
      try {
        const eventsRef = collection(db, 'events');
        const snapshot = await getDocs(eventsRef);
        const eventsData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(event => event.showOnLandingPage === true && event.status === 'upcoming')
          .sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
            return dateA - dateB;
          });
        setEvents(eventsData.slice(0, 6));
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        setEvents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };
  return (
    <div 
      className="min-h-screen relative overflow-hidden pt-16"
      style={{ 
        backgroundImage: 'url("/cartoon-casino-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Main Content */}
      <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-20 px-4">
        <div className="max-w-4xl w-full flex flex-col items-center space-y-12">
          <img 
            src="/CCT_Logo_1.png" 
            alt="CCT Logo" 
            className="w-72 md:w-[450px] animate-float drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]"
          />
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest animate-float drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] text-center">
            COLLEGE CASINO TOUR
          </h1>
          <p className="text-xl md:text-2xl text-white text-center">
            Splitting 10s
          </p>
        </div>
      </div>

      {/* Events Section - Show if events exist */}
      {events.length > 0 && (
        <div className="relative w-full bg-black/70 backdrop-blur-lg py-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Upcoming Events</h2>
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={handleEventClick}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Partners Section */}
      <div className="relative w-full bg-black/70 backdrop-blur-lg py-16 mt-12">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Our Partners</h2>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partners.map((partner) => (
              <div 
                key={partner.name}
                className="bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center p-8 transition-all duration-300 aspect-video"
              >
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className={`max-w-full max-h-full object-contain ${partner.name === 'Bankroll' ? 'scale-120' : ''}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="relative w-full bg-black/80 backdrop-blur-lg py-12 px-4 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold mb-4">COMPANY</h3>
            <div className="space-y-2">
              <div className="text-gray-300 text-sm">About CCL</div>
              <div className="text-gray-300 text-sm">Contact Us</div>
              <div className="text-gray-300 text-sm">Terms of Use</div>
              <div className="text-gray-300 text-sm">Privacy Policy</div>
            </div>
          </div>

          {/* Tournaments */}
          <div>
            <h3 className="text-white font-bold mb-4">TOURNAMENTS</h3>
            <div className="space-y-2">
              <div className="text-gray-300 text-sm">Upcoming Events</div>
              <div className="text-gray-300 text-sm">Past Events</div>
              <div className="text-gray-300 text-sm">Rules & Guidelines</div>
              <div className="text-gray-300 text-sm">Prize Information</div>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold mb-4">RESOURCES</h3>
            <div className="space-y-2">
              <div className="text-gray-300 text-sm">How to Play</div>
              <div className="text-gray-300 text-sm">FAQ</div>
              <div className="text-gray-300 text-sm">Support</div>
              <div className="text-gray-300 text-sm">Responsible Gaming</div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">CONTACT</h3>
            <div className="space-y-2">
              <div className="text-gray-300 text-sm">Email: info@ccl.com</div>
              <div className="text-gray-300 text-sm">Support: 1-800-SUPPORT</div>
              <div className="text-gray-300 text-sm">Hours: 24/7</div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Collegiate Casino League. All Rights Reserved.
        </div>
      </div>
      
      {/* Event Registration Modal */}
      {selectedEvent && (
        <EventRegistrationModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default LandingPage;
