import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    collegeName: '',
    fraternityName: '',
    collegeLogoUrl: '',
    fraternityLogoUrl: '',
    isPublic: true
  });

  const [collegeLogoFile, setCollegeLogoFile] = useState(null);
  const [fraternityLogoFile, setFraternityLogoFile] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, 'publicEvents');
      const q = query(eventsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const uploadImage = async (file, path) => {
    if (!file) return null;
    
    try {
      const storageRef = ref(storage, `events/${path}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      // Return null if upload fails - images are optional
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let imageUploadWarning = false;

    try {
      let collegeLogoUrl = formData.collegeLogoUrl;
      let fraternityLogoUrl = formData.fraternityLogoUrl;

      // Upload images if new files are selected
      if (collegeLogoFile || fraternityLogoFile) {
        setUploading(true);
        
        if (collegeLogoFile) {
          const uploadedUrl = await uploadImage(collegeLogoFile, 'college-logos');
          if (uploadedUrl) {
            collegeLogoUrl = uploadedUrl;
          } else {
            imageUploadWarning = true;
          }
        }
        
        if (fraternityLogoFile) {
          const uploadedUrl = await uploadImage(fraternityLogoFile, 'fraternity-logos');
          if (uploadedUrl) {
            fraternityLogoUrl = uploadedUrl;
          } else {
            imageUploadWarning = true;
          }
        }
        
        setUploading(false);
      }

      const eventData = {
        ...formData,
        collegeLogoUrl: collegeLogoUrl || '',
        fraternityLogoUrl: fraternityLogoUrl || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingEvent) {
        await updateDoc(doc(db, 'publicEvents', editingEvent.id), {
          ...eventData,
          createdAt: editingEvent.createdAt
        });
      } else {
        await addDoc(collection(db, 'publicEvents'), eventData);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        collegeName: '',
        fraternityName: '',
        collegeLogoUrl: '',
        fraternityLogoUrl: '',
        isPublic: true
      });
      setCollegeLogoFile(null);
      setFraternityLogoFile(null);
      setShowAddForm(false);
      setEditingEvent(null);
      
      // Refresh events
      fetchEvents();
      
      const successMessage = editingEvent ? 'Event updated successfully!' : 'Event created successfully!';
      const warningMessage = imageUploadWarning ? ' (Note: Some images could not be uploaded)' : '';
      alert(successMessage + warningMessage);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please try again.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      date: event.date || '',
      time: event.time || '',
      location: event.location || '',
      collegeName: event.collegeName || '',
      fraternityName: event.fraternityName || '',
      collegeLogoUrl: event.collegeLogoUrl || '',
      fraternityLogoUrl: event.fraternityLogoUrl || '',
      isPublic: event.isPublic !== false
    });
    setShowAddForm(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'publicEvents', eventId));
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const togglePublicStatus = async (event) => {
    try {
      await updateDoc(doc(db, 'publicEvents', event.id), {
        isPublic: !event.isPublic,
        updatedAt: new Date()
      });
      fetchEvents();
    } catch (error) {
      console.error('Error toggling public status:', error);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
        <p className="text-gray-600 mt-2">Manage public events visible on the landing page</p>
      </div>

      {/* Add/Edit Form */}
      {showAddForm ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Student Union Building, Room 201"
                  required
                />
              </div>

              {/* College Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Name
                </label>
                <input
                  type="text"
                  value={formData.collegeName}
                  onChange={(e) => setFormData({...formData, collegeName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Fraternity Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fraternity Name
                </label>
                <input
                  type="text"
                  value={formData.fraternityName}
                  onChange={(e) => setFormData({...formData, fraternityName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* College Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Logo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCollegeLogoFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {formData.collegeLogoUrl && !collegeLogoFile && (
                  <img src={formData.collegeLogoUrl} alt="College logo" className="mt-2 h-20 object-contain" />
                )}
              </div>

              {/* Fraternity Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fraternity Logo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFraternityLogoFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {formData.fraternityLogoUrl && !fraternityLogoFile && (
                  <img src={formData.fraternityLogoUrl} alt="Fraternity logo" className="mt-2 h-20 object-contain" />
                )}
              </div>

              {/* Public Status */}
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Display on public landing page
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? (uploading ? 'Uploading images...' : 'Saving...') : (editingEvent ? 'Update Event' : 'Add Event')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingEvent(null);
                  setFormData({
                    title: '',
                    description: '',
                    date: '',
                    time: '',
                    location: '',
                    collegeName: '',
                    fraternityName: '',
                    collegeLogoUrl: '',
                    fraternityLogoUrl: '',
                    isPublic: true
                  });
                  setCollegeLogoFile(null);
                  setFraternityLogoFile(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-8 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Add Event
        </button>
      )}

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    {(event.collegeName || event.fraternityName) && (
                      <div className="text-sm text-gray-500">
                        {event.collegeName} {event.collegeName && event.fraternityName && '-'} {event.fraternityName}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {event.date} at {event.time}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {event.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => togglePublicStatus(event)}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                      event.isPublic 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {event.isPublic ? 'Public' : 'Hidden'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No events created yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEventsPage;