import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import EventCreationModal from '../components/EventCreationModal';
import EventDetailsModal from '../components/EventDetailsModal';
import SalesPipelineView from '../components/SalesPipelineView';

const AdminEventsPage = ({ showCreateModal, setShowCreateModal, defaultTab = 'events' }) => {
  const [events, setEvents] = useState([]);
  const [salesPipeline, setSalesPipeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localShowCreateModal, setLocalShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState(defaultTab); // 'events' or 'sales'
  const [filter, setFilter] = useState('all'); // all, upcoming, active, completed
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  
  // Use prop modal state if provided, otherwise use local state
  const isModalOpen = showCreateModal !== undefined ? showCreateModal : localShowCreateModal;
  const setModalOpen = setShowCreateModal || setLocalShowCreateModal;

  useEffect(() => {
    fetchEvents();
    fetchSalesPipeline();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData.sort((a, b) => b.date - a.date));
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesPipeline = async () => {
    try {
      const pipelineSnapshot = await getDocs(collection(db, 'salesPipeline'));
      const pipelineData = pipelineSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSalesPipeline(pipelineData);
    } catch (error) {
      console.error('Error fetching sales pipeline:', error);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      await addDoc(collection(db, 'events'), {
        ...eventData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      fetchEvents();
      setModalOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleUpdateEvent = async (eventId, updates) => {
    try {
      await updateDoc(doc(db, 'events', eventId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (window.confirm(`Are you sure you want to delete "${event?.title}"?\n\nThis action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  const handleToggleLandingPage = async (eventId, currentStatus) => {
    await handleUpdateEvent(eventId, { showOnLandingPage: !currentStatus });
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Show description only on main events page */}
      {activeTab === 'events' && (
        <div className="mb-6">
          <p className="text-gray-600">Manage tournaments, track registrations, and monitor event status</p>
        </div>
      )}

      {activeTab === 'events' ? (
        <>
          {/* Actions Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Event
            </button>
          </div>

          {/* Events Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <li key={event.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        {/* College Logo */}
                        {event.collegeLogo && (
                          <div className="flex-shrink-0">
                            <img 
                              src={event.collegeLogo} 
                              alt={event.collegeName || 'College logo'}
                              className="h-16 w-16 object-contain bg-gray-100 rounded-lg p-1"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                              <p className="text-sm text-gray-500">
                                {event.collegeName} • {event.fraternityName}
                                {event.state && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {event.state}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                                event.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {event.status}
                              </span>
                              {event.showOnLandingPage && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                  On Landing Page
                                </span>
                              )}
                            </div>
                          </div>
                        
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {event.date?.toDate ? new Date(event.date.toDate()).toLocaleDateString() : 'TBD'} at {event.time || 'TBD'}
                        </div>
                        
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {event.location}
                        </div>
                        
                        <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Participants:</span>
                            <span className="ml-1 font-medium">{event.currentParticipants || 0}/{event.maxParticipants || '∞'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Entry Fee:</span>
                            <span className="ml-1 font-medium">${event.entryFee || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Prize Pool:</span>
                            <span className="ml-1 font-medium">${event.prizePool || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Password:</span>
                            <span className="ml-1 font-medium font-mono">{event.registrationPassword || 'Not Set'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                      
                      {/* Actions */}
                      <div className="ml-4 flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          View Details
                        </button>
                        {event.googleFormUrl ? (
                          <a
                            href={event.googleFormUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-900 text-sm font-medium flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Open Form
                          </a>
                        ) : (
                          <button
                            onClick={() => setShowComingSoonModal(true)}
                            className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                          >
                            Enter
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleLandingPage(event.id, event.showOnLandingPage)}
                          className={`text-sm font-medium ${
                            event.showOnLandingPage 
                              ? 'text-yellow-600 hover:text-yellow-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {event.showOnLandingPage ? 'Hide from' : 'Show on'} Landing
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1 rounded-md transition-colors"
                          title="Delete Event"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 bg-white rounded-md">
              <p className="text-gray-500">No events found</p>
            </div>
          )}
        </>
      ) : (
        <SalesPipelineView 
          pipeline={salesPipeline} 
          onUpdate={fetchSalesPipeline}
          onConvertToEvent={(lead) => {
            setModalOpen(true);
            // Pre-fill modal with lead data
          }}
        />
      )}

      {/* Create Event Modal */}
      {isModalOpen && (
        <EventCreationModal
          onClose={() => setModalOpen(false)}
          onSave={handleCreateEvent}
          colleges={[]} // You'll need to fetch these
          fraternities={[]} // You'll need to fetch these
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={(updates) => handleUpdateEvent(selectedEvent.id, updates)}
        />
      )}

      {/* Coming Soon Modal */}
      {showComingSoonModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
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
    </div>
  );
};

export default AdminEventsPage;