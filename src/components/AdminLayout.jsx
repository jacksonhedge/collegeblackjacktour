import React from 'react';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminTournamentsPage from '../pages/AdminTournamentsPage';
import AdminFraternitiesPage from '../pages/AdminFraternitiesPage';

const AdminLayout = () => {
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('adminSessionExpires');
    window.location.reload();
  };

  const isActive = (path) => {
    return location.pathname.includes(path) ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/admin" className="text-lg font-semibold text-gray-900">
                  Admin Dashboard
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/admin/tournaments"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/tournaments')}`}
                >
                  Tournaments
                </Link>
                <Link
                  to="/admin/fraternities"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/fraternities')}`}
                >
                  Fraternities
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <main>
        <Routes>
          <Route path="tournaments" element={<AdminTournamentsPage />} />
          <Route path="fraternities" element={<AdminFraternitiesPage />} />
          <Route path="*" element={<Navigate to="tournaments" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;
