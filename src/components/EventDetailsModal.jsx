import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

const EventDetailsModal = ({ event, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(event);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCollegeLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `college-logos/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setFormData(prev => ({ ...prev, collegeLogo: downloadURL }));
      
      // If in editing mode, save immediately
      if (isEditing) {
        onUpdate({ ...formData, collegeLogo: downloadURL });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Event'}
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  event.title
                )}
              </h4>
              
              {/* College Logo Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">College Logo</label>
                <div className="flex items-center space-x-4">
                  {formData.collegeLogo && (
                    <div className="flex-shrink-0">
                      <img 
                        src={formData.collegeLogo} 
                        alt="College logo"
                        className="h-20 w-20 object-contain bg-gray-100 rounded-lg p-2"
                      />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCollegeLogoUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Upload a new logo to replace the current one</p>
                  </div>
                </div>
              </div>
              
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(event.date)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Time</dt>
                  <dd className="mt-1 text-sm text-gray-900">{event.time}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">{event.location}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                      event.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Registration Password</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.registrationPassword || ''}
                        onChange={(e) => setFormData({...formData, registrationPassword: e.target.value})}
                        placeholder="Not set"
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    ) : (
                      event.registrationPassword || 'Not set'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Participants</dt>
                  <dd className="mt-1 text-sm text-gray-900">{event.currentParticipants || 0} / {event.maxParticipants || '∞'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Entry Fee</dt>
                  <dd className="mt-1 text-sm text-gray-900">${event.entryFee || 0}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Prize Pool</dt>
                  <dd className="mt-1 text-sm text-gray-900">${event.prizePool || 0}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Registration Form URL</dt>
                  <dd className="mt-1">
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData.googleFormUrl || ''}
                        onChange={(e) => setFormData({...formData, googleFormUrl: e.target.value})}
                        placeholder="Enter Google Form URL"
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      event.googleFormUrl ? (
                        <a 
                          href={event.googleFormUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          {event.googleFormUrl}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500">Not set</span>
                      )
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {event.salesContact && (event.salesContact.name || event.salesContact.email) && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-3">Fraternity Contact</h5>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{event.salesContact.name || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900">{event.salesContact.role || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{event.salesContact.email || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{event.salesContact.phone || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            )}

            {event.participants && event.participants.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-3">Participants ({event.participants.length})</h5>
                <div className="bg-gray-50 rounded-md p-4 max-h-48 overflow-y-auto">
                  <ul className="space-y-2">
                    {event.participants.map((participant, index) => (
                      <li key={participant.id || index} className="text-sm">
                        <span className="font-medium">{participant.name}</span>
                        <span className="text-gray-500 ml-2">{participant.email}</span>
                        {participant.checkedIn && (
                          <span className="ml-2 text-green-600 text-xs">✓ Checked In</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;