import React, { useState } from 'react';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminTournamentsPage from '../pages/AdminTournamentsPage';
import AdminEventsPage from '../pages/AdminEventsPage';
import AdminFraternitiesPage from '../pages/AdminFraternitiesPage';
import AdminCollegesPage from '../pages/AdminCollegesPage';
import AdminCalendarPage from '../pages/AdminCalendarPage';
import AdminPartnersPage from '../pages/AdminPartnersPage';
import BracketManagementPage from '../pages/BracketManagementPage';
import SalesPipelinePage from '../pages/SalesPipelinePage';
import AdminMapPage from '../pages/AdminMapPage';
import { AdminLevel, signOut } from '../firebase/auth';

const AdminLayout = ({ adminLevel }) => {
  const location = useLocation();
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  
  const handleLogout = () => {
    signOut();
    window.location.reload();
  };

  const isActive = (path) => {
    return location.pathname.includes(path) 
      ? 'bg-gray-900 text-white' 
      : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };

  const menuItems = [
    {
      section: 'Events',
      items: [
        { 
          name: 'Create Event', 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          ),
          action: () => setShowCreateEventModal(true),
          primary: true
        },
        { 
          name: 'Manage Events', 
          path: '/admin/events',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )
        },
        { 
          name: 'Sales Pipeline', 
          path: '/admin/sales',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        }
      ]
    },
    {
      section: 'Brackets',
      items: [
        { 
          name: 'Manage Brackets', 
          path: '/admin/brackets',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          )
        }
      ]
    },
    {
      section: 'Management',
      items: [
        { 
          name: 'Colleges', 
          path: '/admin/colleges',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          ),
          adminOnly: true
        },
        { 
          name: 'Fraternities', 
          path: '/admin/fraternities',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          adminOnly: true
        },
        { 
          name: 'Partners', 
          path: '/admin/partners',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )
        }
      ]
    },
    {
      section: 'Tools',
      items: [
        { 
          name: 'College Map', 
          path: '/admin/map',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          )
        },
        { 
          name: 'Calendar', 
          path: '/admin/calendar',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          adminOnly: true
        },
        { 
          name: 'Reports', 
          path: '/admin/reports',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-gray-900">
            <Link to="/admin" className="text-xl font-bold text-white">
              CCL Admin
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx} className="mb-6">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.section}
                </h3>
                <div className="mt-2 space-y-1">
                  {section.items.map((item, itemIdx) => {
                    // Skip admin-only items for non-super admins
                    if (item.adminOnly && adminLevel !== AdminLevel.SUPER) {
                      return null;
                    }

                    if (item.action) {
                      return (
                        <button
                          key={itemIdx}
                          onClick={item.action}
                          className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                            item.primary 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          {item.icon}
                          <span className="ml-3">{item.name}</span>
                        </button>
                      );
                    }

                    if (item.external) {
                      return (
                        <a
                          key={itemIdx}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          {item.icon}
                          <span className="ml-3 flex items-center">
                            {item.name}
                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </span>
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={itemIdx}
                        to={item.path}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive(item.path)}`}
                      >
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full group flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              {location.pathname.includes('events') ? 'Event Management' :
               location.pathname.includes('brackets') || location.pathname.includes('tournaments') ? 'Bracket Management' :
               location.pathname.includes('colleges') ? 'College Management' :
               location.pathname.includes('fraternities') ? 'Fraternity Management' :
               location.pathname.includes('partners') ? 'Partner Management' :
               location.pathname.includes('calendar') ? 'Calendar' :
               location.pathname.includes('sales') ? 'Sales Pipeline' :
               location.pathname.includes('map') ? 'College Map' :
               location.pathname.includes('reports') ? 'Reports' :
               'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {/* Common routes */}
            <Route path="events" element={<AdminEventsPage adminLevel={adminLevel} showCreateModal={showCreateEventModal} setShowCreateModal={setShowCreateEventModal} />} />
            <Route path="tournaments" element={<BracketManagementPage />} />
            <Route path="brackets" element={<BracketManagementPage />} />
            <Route path="partners" element={<AdminPartnersPage />} />
            <Route path="sales" element={<SalesPipelinePage />} />
            <Route path="map" element={<AdminMapPage />} />
            
            {/* Super admin only routes */}
            {adminLevel === AdminLevel.SUPER && (
              <>
                <Route path="colleges" element={<AdminCollegesPage />} />
                <Route path="fraternities" element={<AdminFraternitiesPage />} />
                <Route path="calendar" element={<AdminCalendarPage onLogout={handleLogout} />} />
              </>
            )}
            
            {/* Default route */}
            <Route path="*" element={
              <Navigate to="events" replace />
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
