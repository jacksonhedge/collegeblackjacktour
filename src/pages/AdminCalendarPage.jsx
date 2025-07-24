import React from 'react';

const AdminCalendarPage = ({ onLogout }) => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
        <p className="text-gray-600 mt-2">Tournament schedule management</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Schedule Items</h3>
          <p className="text-gray-500">Schedule functionality coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminCalendarPage;
