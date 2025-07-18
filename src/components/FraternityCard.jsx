import React, { useState } from 'react';
import EventScheduleForm from './EventScheduleForm';

const FraternityCard = ({ fraternity, onClick, onEdit, onDelete, collegeName }) => {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'in contact':
        return 'bg-green-100 text-green-800';
      case 'outreached':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'need to reach out':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-4 relative">
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{fraternity.name}</h3>
              {fraternity.chapterName && (
                <p className="text-sm text-gray-600">{fraternity.chapterName}</p>
              )}
            </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Edit fraternity"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this fraternity?')) {
                  onDelete();
                }
              }}
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Delete fraternity"
            >
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          </div>
          <div className="flex items-center mt-1">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            {fraternity.instagramUsername ? (
              <a
                href={fraternity.instagramLink || `https://instagram.com/${fraternity.instagramUsername.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {fraternity.instagramUsername}
              </a>
            ) : (
              <span className="text-sm text-gray-500">Instagram: TBD</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3" onClick={onClick}>
        {/* Size */}
        <div className="flex items-center text-gray-700">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-sm">Size: {fraternity.size || 'Not specified'}</span>
        </div>

        {/* Philanthropy */}
        <div className="flex items-center text-gray-700">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-sm">Philanthropy: {fraternity.philanthropy || 'Not specified'}</span>
        </div>

        {/* Contact Information */}
        <div className="mt-4 space-y-2">
          {/* Rush Chair */}
          <div className="bg-gray-50 p-3 rounded-lg relative">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Rush Chair Contact</h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700">{fraternity.rushChairName || 'Name not provided'}</p>
                  <p className="text-sm text-gray-600">{fraternity.rushChairNumber || 'Number not provided'}</p>
                </div>
              </div>
              {fraternity.rushChairContacted && (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>

          {/* President */}
          <div className="bg-gray-50 p-3 rounded-lg relative">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">President Contact</h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700">{fraternity.presidentName || 'Name not provided'}</p>
                  <p className="text-sm text-gray-600">{fraternity.presidentNumber || 'Number not provided'}</p>
                </div>
              </div>
              {fraternity.presidentContacted && (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>

          {/* Philanthropy Chair */}
          <div className="bg-gray-50 p-3 rounded-lg relative">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Philanthropy Chair Contact</h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700">{fraternity.philanthropyName || 'Name not provided'}</p>
                  <p className="text-sm text-gray-600">{fraternity.philanthropyNumber || 'Number not provided'}</p>
                </div>
              </div>
              {fraternity.philanthropyContacted && (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Sign-up Links */}
        {(fraternity.signupFormUrl || fraternity.signupSheetUrl) && (
          <div className="mt-4 bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Sign-up Links</h4>
            <div className="space-y-2">
              {fraternity.signupFormUrl && (
                <a
                  href={fraternity.signupFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Sign-up Form
                </a>
              )}
              {fraternity.signupSheetUrl && (
                <a
                  href={fraternity.signupSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Sign-up Sheet
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowScheduleForm(true);
            }}
            className="flex items-center text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium">Schedule Event</span>
          </button>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(fraternity.status)}`}>
            {fraternity.status || 'No Status'}
          </span>
        </div>

        {showScheduleForm && (
          <EventScheduleForm
            fraternity={fraternity}
            collegeName={collegeName}
            onClose={() => setShowScheduleForm(false)}
            onSuccess={() => {
              setShowScheduleForm(false);
              // You might want to refresh the data here
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FraternityCard;
