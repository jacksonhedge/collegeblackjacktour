import React, { useState } from 'react';

const EventDetailsModal = ({ event, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(event);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
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
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">{event.title}</h4>
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
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{event.registrationPassword || 'Not set'}</dd>
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
                {event.googleFormUrl && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Registration Form</dt>
                    <dd className="mt-1">
                      <a 
                        href={event.googleFormUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        {event.googleFormUrl}
                      </a>
                    </dd>
                  </div>
                )}
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