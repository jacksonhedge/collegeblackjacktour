import React from 'react';
import { Link } from 'react-router-dom';

const AdminTest = () => {
  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Test Page</h1>
        <p className="mb-4">If you can see this page, routing to /admin-test is working correctly.</p>
        <p className="mb-8">Try the real admin page at <Link to="/admin" className="text-blue-500 underline">/admin</Link></p>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Debugging Information</h2>
          <ul className="space-y-2">
            <li><strong>Current Path:</strong> {window.location.pathname}</li>
            <li><strong>Current Hash:</strong> {window.location.hash}</li>
            <li><strong>Full URL:</strong> {window.location.href}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminTest;