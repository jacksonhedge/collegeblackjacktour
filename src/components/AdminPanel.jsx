import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Search, Users, Star, ChevronDown, Home, Settings, BarChart, Bell, Trash2, X, CreditCard, Palette, Trophy, UserCheck, Users2, DollarSign, LogOut, Shield } from 'lucide-react';
import { adminSettingsService } from '../services/firebase/AdminSettingsService';
import { useNavigate } from 'react-router-dom';
import GiftCardInventory from './admin/GiftCardInventory';
import GiftCardDesigns from './admin/GiftCardDesigns';
import NotificationManager from './admin/NotificationManager';
import FirebaseNotificationPanel from './admin/FirebaseNotificationPanel';
import WinnersManager from './admin/WinnersManager';
import UserManagement from './admin/UserManagement';
import GroupManagement from './admin/GroupManagement';
import FundsManagement from './admin/FundsManagement';
import LeagueGroupsManagement from './admin/LeagueGroupsManagement';

const AdminPanel = () => {
  // console.log('AdminPanel - Version with Supabase Notification Panel loading');
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('player-management');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);
  const [useSupabaseNotifications, setUseSupabaseNotifications] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReferrals: 0,
    totalLeagues: 0,
    emailSubscribed: 0
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Use the improved AdminSettingsService to get users
        const userData = await adminSettingsService.getAllUsers();
        setUsers(userData);
        
        // Get admin stats using the service
        const adminStats = await adminSettingsService.getAdminStats();
        setStats(adminStats);
      } catch (err) {
        setError('Failed to fetch users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower)
    );
  });

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">
        {error}
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date || isNaN(date)) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInitials = (user) => {
    if (!user.username) return '??';
    return user.username.substring(0, 2).toUpperCase();
  };

  const SidebarItem = ({ icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors rounded-lg ${
        isActive 
          ? 'bg-blue-50 text-blue-600 font-medium' 
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );

  const StatCard = ({ label, value }) => (
    <div className="bg-white bg-opacity-5 rounded-lg p-6">
      <div className="text-sm font-medium text-gray-400">{label}</div>
      <div className="text-3xl font-bold text-blue-500">{value}</div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-300 bg-white flex flex-col">
        <div className="p-4 flex-1">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>
          <nav className="space-y-1">
            <SidebarItem
              icon={Users}
              label="Player Management"
              isActive={activeTab === 'player-management'}
              onClick={() => setActiveTab('player-management')}
            />
            <SidebarItem
              icon={DollarSign}
              label="Funds Management"
              isActive={activeTab === 'funds-management'}
              onClick={() => setActiveTab('funds-management')}
            />
            <SidebarItem
              icon={Trophy}
              label="Big Win Alerts"
              isActive={activeTab === 'winners-management'}
              onClick={() => setActiveTab('winners-management')}
            />
            <SidebarItem
              icon={Bell}
              label="Notification Hub"
              isActive={activeTab === 'notification-hub'}
              onClick={() => setActiveTab('notification-hub')}
            />
            <SidebarItem
              icon={Shield}
              label="Leagues/Groups"
              isActive={activeTab === 'leagues-groups'}
              onClick={() => setActiveTab('leagues-groups')}
            />
          </nav>
        </div>
        
        {/* Logout button at bottom */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              // Clear any admin session data
              localStorage.removeItem('adminAuthenticated');
              navigate('/admin-login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-red-50 text-red-600 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        {activeTab === 'player-management' ? (
          <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Player Management</h1>
            <UserManagement />
            <div className="mt-8">
              <GroupManagement />
            </div>
          </div>
        ) : activeTab === 'funds-management' ? (
          <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Funds Management</h1>
            <FundsManagement />
          </div>
        ) : activeTab === 'winners-management' ? (
          <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Big Win Alerts Management</h1>
            <WinnersManager />
          </div>
        ) : activeTab === 'notification-hub' ? (
          <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Notification Hub</h1>
            <FirebaseNotificationPanel />
          </div>
        ) : activeTab === 'leagues-groups' ? (
          <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Leagues & Groups Management</h1>
            <LeagueGroupsManagement />
          </div>
        ) : null}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Delete User</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-1 hover:bg-gray-700 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300 mb-2">Are you sure you want to delete this user?</p>
                <div className="bg-gray-700/50 p-3 rounded-md">
                  <p className="font-medium text-black">
                    {selectedUser.firstName && selectedUser.lastName 
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : 'No name provided'}
                  </p>
                  <p className="text-sm text-gray-400">@{selectedUser.username}</p>
                  <p className="text-sm text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement user deletion
                    alert('Delete user feature coming soon');
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
