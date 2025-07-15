import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

const BracketManagementPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bracketImages, setBracketImages] = useState({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData.filter(e => e.status === 'active' || e.status === 'completed'));
      
      // Load bracket images for each event
      const images = {};
      eventsData.forEach(event => {
        if (event.bracketImage) {
          images[event.id] = event.bracketImage;
        }
      });
      setBracketImages(images);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBracketUpload = async (eventId, file) => {
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `brackets/${eventId}/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update event with bracket image
      await updateDoc(doc(db, 'events', eventId), {
        bracketImage: downloadURL,
        bracketUpdatedAt: new Date()
      });

      setBracketImages(prev => ({ ...prev, [eventId]: downloadURL }));
      alert('Bracket uploaded successfully!');
      fetchEvents();
    } catch (error) {
      console.error('Error uploading bracket:', error);
      alert('Failed to upload bracket. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateBracketStatus = async (eventId, status) => {
    try {
      await updateDoc(doc(db, 'events', eventId), {
        bracketStatus: status,
        bracketUpdatedAt: new Date()
      });
      alert(`Bracket status updated to: ${status}`);
      fetchEvents();
    } catch (error) {
      console.error('Error updating bracket status:', error);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bracket Management</h1>
        <p className="text-gray-600">Upload and manage tournament brackets</p>
      </div>

      {/* Event Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event
        </label>
        <select
          value={selectedEvent?.id || ''}
          onChange={(e) => {
            const event = events.find(ev => ev.id === e.target.value);
            setSelectedEvent(event);
          }}
          className="block w-full md:w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Choose an event</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>
              {event.title} - {event.collegeName} ({event.status})
            </option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{selectedEvent.title}</h2>
            <p className="text-gray-600">
              {selectedEvent.collegeName} • {selectedEvent.fraternityName}
            </p>
          </div>

          {/* Bracket Upload */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Bracket Image</h3>
            
            {bracketImages[selectedEvent.id] ? (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={bracketImages[selectedEvent.id]} 
                    alt="Tournament bracket"
                    className="w-full"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="relative cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    <span>Update Bracket</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBracketUpload(selectedEvent.id, e.target.files[0])}
                      disabled={uploading}
                      className="sr-only"
                    />
                  </label>
                  <a
                    href={bracketImages[selectedEvent.id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Full Size
                  </a>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">No bracket uploaded yet</p>
                <label className="mt-3 relative cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block">
                  <span>Upload Bracket</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBracketUpload(selectedEvent.id, e.target.files[0])}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
              </div>
            )}
            {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
          </div>

          {/* Bracket Status */}
          <div>
            <h3 className="text-lg font-medium mb-3">Bracket Status</h3>
            <div className="flex flex-wrap gap-2">
              {['setup', 'round-1', 'quarter-finals', 'semi-finals', 'finals', 'completed'].map(status => (
                <button
                  key={status}
                  onClick={() => handleUpdateBracketStatus(selectedEvent.id, status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedEvent.bracketStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Participants</p>
              <p className="text-2xl font-semibold">{selectedEvent.currentParticipants || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Prize Pool</p>
              <p className="text-2xl font-semibold">${selectedEvent.prizePool || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-2xl font-semibold capitalize">{selectedEvent.status}</p>
            </div>
          </div>
        </div>
      )}

      {/* All Events Brackets Grid */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">All Tournament Brackets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{event.title}</h3>
                <p className="text-sm text-gray-600">{event.collegeName}</p>
                <p className="text-sm text-gray-500">{event.date?.toDate ? new Date(event.date.toDate()).toLocaleDateString() : 'TBD'}</p>
              </div>
              {bracketImages[event.id] ? (
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  <img 
                    src={bracketImages[event.id]} 
                    alt={`${event.title} bracket`}
                    className="object-contain cursor-pointer hover:opacity-90"
                    onClick={() => setSelectedEvent(event)}
                  />
                </div>
              ) : (
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="text-sm mt-2">Upload Bracket</p>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BracketManagementPage;