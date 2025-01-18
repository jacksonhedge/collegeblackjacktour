import React, { useState } from 'react';
import AdminCollegeList from '../components/AdminCollegeList';
import CollegeList from '../components/CollegeList';

const AdminCollegesPage = () => {
  const [view, setView] = useState('all'); // 'all' or 'active'

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Colleges</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setView('all')}
            className={`px-4 py-2 rounded transition-colors ${
              view === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Colleges
          </button>
          <button
            onClick={() => setView('active')}
            className={`px-4 py-2 rounded transition-colors ${
              view === 'active'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active Colleges
          </button>
        </div>
      </div>
      {view === 'all' ? <AdminCollegeList /> : <CollegeList />}
    </div>
  );
};

export default AdminCollegesPage;
