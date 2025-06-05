import React, { useState } from 'react';
import EventScheduleForm from './EventScheduleForm';

const FraternityCard = ({ fraternity, onClick, onEdit, onDelete, collegeName, className, index }) => {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFinalDeleteConfirm, setShowFinalDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    <div className={`rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100 ${className || 'bg-white'}`}>
      <div className="flex justify-between items-start mb-4 relative">
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {fraternity.logoUrl ? (
                <img 
                  src={fraternity.logoUrl} 
                  alt={`${fraternity.name} logo`}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs">{fraternity.name?.charAt(0) || '?'}</span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{fraternity.name}</h3>
                {fraternity.chapterName && (
                  <p className="text-sm text-gray-600">{fraternity.chapterName}</p>
                )}
              </div>
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
                setShowDeleteConfirm(true);
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
          <div className="space-y-2 mt-1">
            <div className="flex items-center">
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
            {fraternity.signupFormUrl && (
              <a
                href={fraternity.signupFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Google Form #{index + 1}
              </a>
            )}
            {fraternity.signupSheetUrl && (
              <a
                href={fraternity.signupSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 ml-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Google Sheet #{index + 1}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3" onClick={onClick}>
        {/* Contact Information */}
        <div className="mt-4">
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
        </div>


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
              fraternity={{
                ...fraternity,
                collegeId: fraternity.collegeId
              }}
              collegeName={collegeName}
              onClose={() => setShowScheduleForm(false)}
              onSuccess={() => {
                setShowScheduleForm(false);
                window.location.reload(); // Refresh to update all counts
              }}
            />
        )}
      </div>

      {/* First Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Fraternity?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {fraternity.name}?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setShowFinalDeleteConfirm(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Delete Confirmation Modal */}
      {showFinalDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 mb-4">Final Warning</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. Type <span className="font-bold">{fraternity.name}</span> to confirm deletion.
            </p>
            <input
              type="text"
              className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Type fraternity name to confirm"
              onChange={(e) => {
                if (e.target.value === fraternity.name) {
                  setDeleting(true);
                  onDelete();
                  setShowFinalDeleteConfirm(false);
                  setDeleting(false);
                }
              }}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowFinalDeleteConfirm(false);
                  setDeleting(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={true}
              >
                {deleting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete Fraternity'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FraternityCard;
