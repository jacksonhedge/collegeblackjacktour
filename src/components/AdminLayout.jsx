import React from 'react';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminFraternitiesPage from '../pages/AdminFraternitiesPage';
import AdminCollegesPage from '../pages/AdminCollegesPage';
import AdminCalendarPage from '../pages/AdminCalendarPage';
import AdminPartnersPage from '../pages/AdminPartnersPage';
import { AdminLevel, signOut } from '../firebase/auth';

const AdminLayout = ({ adminLevel }) => {
  const location = useLocation();
  
  const handleLogout = () => {
    signOut();
    window.location.reload();
  };

  const isActive = (path) => {
    return location.pathname.includes(path) ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white shadow fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/admin" className="text-lg font-semibold text-gray-900">
                  Admin Dashboard
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {/* Super admin only navigation items */}
                {adminLevel === AdminLevel.SUPER && (
                  <>
                    <Link
                      to="/admin/colleges"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/colleges')}`}
                    >
                      Colleges
                    </Link>
                    <Link
                      to="/admin/fraternities"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/fraternities')}`}
                    >
                      Fraternities
                    </Link>
                    <Link
                      to="/admin/calendar"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/calendar')}`}
                    >
                      Calendar
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/partners"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/partners')}`}
              >
                Partners
              </Link>
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
      <main className="min-h-screen bg-gray-50 pt-16">
        <Routes>
          {/* Common routes */}
          <Route path="partners" element={<AdminPartnersPage />} />
          
          {/* Super admin only routes */}
          {adminLevel === AdminLevel.SUPER && (
            <>
              <Route path="colleges" element={<AdminCollegesPage />} />
              <Route path="fraternities" element={<AdminFraternitiesPage />} />
              <Route path="calendar" element={<AdminCalendarPage onLogout={handleLogout} />} />
            </>
          )}
          
          {/* Default route */}
          <Route path="*" element={<Navigate to="colleges" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;
