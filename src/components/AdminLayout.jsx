import React, { useState } from 'react';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminFraternitiesPage from '../pages/AdminFraternitiesPage';
import AdminCollegesPage from '../pages/AdminCollegesPage';
import AdminCalendarPage from '../pages/AdminCalendarPage';
import AdminPartnersPage from '../pages/AdminPartnersPage';
import AdminTournamentsPage from '../pages/AdminTournamentsPage';
import AdminTeamPage from '../pages/AdminTeamPage';
import { AdminLevel, signOut } from '../firebase/auth';

const AdminLayout = ({ adminLevel }) => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const handleLogout = () => {
    signOut();
    window.location.reload();
  };

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const menuItems = [
    {
      name: 'Enter Event',
      path: '/admin/enter-event',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      name: 'Schedule',
      path: '/admin/schedule',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Team',
      path: '/admin/team',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-black text-white transition-all duration-300 ease-in-out flex flex-col`}>
        {/* Logo and Collapse Button */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {!sidebarCollapsed && (
            <h2 className="text-xl font-bold">Admin Panel</h2>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive(item.path) 
                      ? 'bg-red-600 text-white' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 transition-colors w-full text-left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Routes>
            {/* New menu routes */}
            <Route path="enter-event" element={<AdminTournamentsPage onLogout={handleLogout} adminLevel={adminLevel} />} />
            <Route path="schedule" element={<AdminCalendarPage onLogout={handleLogout} />} />
            <Route path="team" element={<AdminTeamPage />} />
            
            {/* Legacy routes for backward compatibility */}
            <Route path="partners" element={<AdminPartnersPage />} />
            <Route path="colleges" element={<AdminCollegesPage />} />
            <Route path="fraternities" element={<AdminFraternitiesPage />} />
            <Route path="calendar" element={<AdminCalendarPage onLogout={handleLogout} />} />
            
            {/* Default route */}
            <Route path="*" element={<Navigate to="enter-event" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
