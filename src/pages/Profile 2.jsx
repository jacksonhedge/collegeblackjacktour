import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  ChevronRight,
  Shield,
  CreditCard,
  Bell as BellIcon,
  Users,
  DollarSign,
  HelpCircle,
  FileText,
  Lock,
  LogOut,
  Smartphone,
  MessageCircle,
  X,
  UserPlus
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import DepositScreen from '../components/dwolla/DepositScreen';
import { groupService } from '../services/firebase/GroupService';
import GroupViewModal from '../components/groups/GroupViewModal';

const Profile = () => {
  const { currentUser, logout, updateProfileImage } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser && !currentUser.profileImage) {
      const randomNum = Math.floor(Math.random() * 30) + 1;
      const fileExtension = [1, 30].includes(randomNum) ? '.jpeg' : 
                          randomNum === 16 ? '.jpg' : '.png';
      const profileImage = `/images/profile_${randomNum}${fileExtension}`;
      updateProfileImage(currentUser.id, profileImage);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (currentUser) {
        try {
          const userGroups = await groupService.getUserGroups(currentUser.id);
          setGroups(userGroups);
        } catch (error) {
          console.error('Error fetching groups:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchGroups();
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleCreateGroup = () => {
    navigate('/create-group');
  };

  const handleNavigateToNotifications = () => {
    setShowSettings(false);
    navigate('/notifications');
  };

  const TransferComingSoonModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md mx-4 relative border border-gray-700">
        <button 
          onClick={() => setShowTransferModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">Coming Soon!</h3>
          <p className="text-gray-300">
            Direct transfers between users will be available soon! Stay tuned for this exciting feature.
          </p>
          <button
            onClick={() => setShowTransferModal(false)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mt-4"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );

  const settingsSections = [
    {
      title: "ACCOUNT & SECURITY",
      items: [
        {
          icon: <Shield className="w-5 h-5" />,
          label: "Security Settings",
          description: "Password, 2FA, login history",
          action: () => {}
        },
        {
          icon: <CreditCard className="w-5 h-5" />,
          label: "Payment Methods",
          description: "Manage your payment options",
          action: () => {}
        }
      ]
    },
    {
      title: "PREFERENCES",
      items: [
        {
          icon: <BellIcon className="w-5 h-5" />,
          label: "Notifications",
          description: "Customize your alerts",
          action: handleNavigateToNotifications
        },
        {
          icon: <Users className="w-5 h-5" />,
          label: "Friends & Leagues",
          description: "Manage your connections",
          action: () => {}
        },
        {
          icon: <DollarSign className="w-5 h-5" />,
          label: "Transaction Settings",
          description: "Deposit & withdrawal preferences",
          action: () => {}
        }
      ]
    },
    {
      title: "SUPPORT & LEGAL",
      items: [
        {
          icon: <HelpCircle className="w-5 h-5" />,
          label: "Help Center",
          description: "FAQs and support resources",
          action: () => {}
        },
        {
          icon: <MessageCircle className="w-5 h-5" />,
          label: "Contact Support",
          description: "Get help with your account",
          action: () => {}
        },
        {
          icon: <FileText className="w-5 h-5" />,
          label: "Terms of Service",
          description: "Read our terms and conditions",
          action: () => {}
        },
        {
          icon: <Lock className="w-5 h-5" />,
          label: "Privacy Policy",
          description: "Learn about data protection",
          action: () => {}
        }
      ]
    },
    {
      title: "APP INFO",
      items: [
        {
          icon: <Smartphone className="w-5 h-5" />,
          label: "App Version",
          description: "Version 1.0.0",
          action: () => {}
        }
      ]
    }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 relative">
      {/* Header with icons */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">Rewards and Challenges</span>
          <button className="relative">
            <Bell className="h-6 w-6 text-gray-400" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="relative">
            <Settings className="h-6 w-6 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Settings Popup */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Settings Sections */}
              <div className="space-y-6">
                {settingsSections.map((section, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-500">{section.title}</h3>
                    <div className="space-y-1">
                      {section.items.map((item, itemIndex) => (
                        <button
                          key={itemIndex}
                          onClick={item.action}
                          className="w-full p-3 flex items-center space-x-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex-shrink-0 text-gray-400">
                            {item.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sign Out Button */}
              <button 
                onClick={handleSignOut}
                className="w-full p-3 flex items-center space-x-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>

              {/* Footer */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-500">Made with ❤️ in Pittsburgh, PA</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Info */}
      <div className="text-center space-y-3">
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden">
          <img
            src={currentUser?.profileImage || '/images/profile_1.png'}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-3xl font-bold">{currentUser?.firstName} {currentUser?.lastName}</h2>
        <p className="text-gray-400 text-lg">#{currentUser?.username}</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-gray-400 text-center">Bankroll Balance</h3>
          <div className="text-4xl font-bold text-center text-white">${currentUser?.dwollaBalance || '0.00'}</div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setShowTransferModal(true)}
              className="p-3 bg-gray-800 rounded-lg text-blue-400 font-medium flex items-center justify-center space-x-2 hover:bg-gray-700 transition-colors"
            >
              <span>↔</span>
              <span>Transfer</span>
            </button>
            <button 
              onClick={() => setShowDepositModal(true)}
              className="p-3 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors"
            >
              <span>+</span>
              <span>Add Money</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Groups and Friends Section */}
      <div className="grid grid-cols-2 gap-4">
        {/* Groups Box */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Groups</h3>
            <div className="space-y-3">
              {loading ? (
                <p className="text-gray-400">Loading groups...</p>
              ) : groups.length > 0 ? (
                <div className="space-y-2">
                  {groups.map(group => (
                    <div 
                      key={group.id}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => setSelectedGroupId(group.id)}
                    >
                      <span className="text-2xl">{group.emoji}</span>
                      <span className="text-white">{group.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No groups yet</p>
              )}
              <button 
                onClick={handleCreateGroup}
                className="w-full p-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Group</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Friends Box */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Friends</h3>
            <div className="space-y-3">
              <p className="text-gray-400">No friends yet</p>
              <button className="w-full p-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                Add Friends
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center space-y-2 mt-8">
        <p className="text-gray-400">Last updated 1 sec</p>
        <p className="text-gray-400">Made with care in Pittsburgh, PA</p>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <DepositScreen onClose={() => setShowDepositModal(false)} />
          </div>
        </div>
      )}

      {/* Transfer Coming Soon Modal */}
      {showTransferModal && <TransferComingSoonModal />}

      {/* Group View Modal */}
      {selectedGroupId && (
        <GroupViewModal 
          groupId={selectedGroupId} 
          onClose={() => setSelectedGroupId(null)} 
        />
      )}
    </div>
  );
};

export default Profile;
