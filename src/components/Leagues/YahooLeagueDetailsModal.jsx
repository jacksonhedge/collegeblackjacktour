import React, { useEffect, useState } from 'react';
import { X, Crown, Plus, ChevronRight, Info, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { groupService } from '../../services/firebase/GroupService';
import PlatformImageService from '../../services/firebase/PlatformImageService';
import { useNavigate } from 'react-router-dom';

const YahooLeagueDetailsModal = ({ league, onClose, onGroupCreated }) => {
  const { currentUser } = useAuth();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [yahooLogo, setYahooLogo] = useState(null);
  const [isConverted, setIsConverted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadYahooLogo = async () => {
      try {
        const logoUrl = await PlatformImageService.getImageUrl('yahoofantasy.png');
        setYahooLogo(logoUrl);
      } catch (error) {
        console.error('Error loading Yahoo logo:', error);
      }
    };
    loadYahooLogo();
  }, []);

  useEffect(() => {
    const checkExistingGroup = async () => {
      if (!currentUser) {
        console.error('User must be authenticated to check group existence');
        return;
      }

      if (!league?.id) {
        console.error('League ID is required to check group existence');
        return;
      }

      try {
        const exists = await groupService.checkGroupExists(league.id.toString(), 'yahoo');
        if (exists) {
          setIsConverted(true);
          if (onGroupCreated) {
            onGroupCreated();
          }
        }
      } catch (error) {
        console.error('Error checking existing group:', error);
        if (error.message.includes('Missing or insufficient permissions')) {
          setError('Please ensure you are logged in to check group existence');
        } else if (error.message.includes('League ID and platform are required')) {
          setError('Unable to verify league information');
        } else {
          setError('Failed to check if group exists. Please try again.');
        }
      }
    };

    checkExistingGroup();
  }, [league?.id, onGroupCreated, currentUser]);

  const validateLeagueData = (league) => {
    if (!league) return false;
    if (!league.id) return false;
    if (!league.name) return false;
    if (!league.leagueSize) return false;
    return true;
  };

  const handleCreateGroup = async () => {
    if (!currentUser) {
      setError('Please log in to create a group');
      return;
    }

    if (!validateLeagueData(league)) {
      setError('League information is incomplete. Please ensure all required fields are present.');
      return;
    }
    
    try {
      setCreating(true);
      setError('');
      
      // Create league info object
      const leagueInfo = {
        leagueId: league.id.toString(),
        platform: 'yahoo',
        totalTeams: league.leagueSize || 0,
        seasonYear: 2023, // TODO: Get actual season year from Yahoo
        leagueName: league.name,
        buyInAmount: league.buyInAmount || 0,
        totalExpense: (league.buyInAmount || 0) * (league.leagueSize || 0)
      };

      const groupData = {
        name: league.name,
        emoji: '🏈',
        description: JSON.stringify(leagueInfo),
        visibility: 'private',
        ownerId: currentUser.uid,
        type: 'league',
        leagueInfo,
        wallet: {
          cashBalance: 0,
          expenses: []
        }
      };

      // Create creator object with required fields
      const creator = {
        uid: currentUser.uid,
        id: currentUser.uid, // Ensure we have both uid and id
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL
      };

      console.log('Creating group with data:', { groupData, creator });
      const createdGroup = await groupService.createGroup(groupData, creator);
      console.log('Group created successfully:', createdGroup);
      
      onGroupCreated();
      onClose();
      
      // Navigate to the group view
      navigate(`/groups/${createdGroup.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      if (error.message === 'A group for this league already exists') {
        setError('This league has already been converted to a group');
        setIsConverted(true);
        // Update the parent component to show the group as converted
        onGroupCreated();
      } else if (error.message.includes('Missing or insufficient permissions')) {
        setError('Please ensure you are logged in to create a group');
      } else if (error.message.includes('League ID and platform are required')) {
        setError('League information is incomplete');
      } else {
        setError('Failed to create group. Please try again.');
      }
    } finally {
      setCreating(false);
    }
  };

  const renderButton = () => {
    if (!currentUser) {
      return (
        <button
          disabled
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-400 
            text-white rounded-lg opacity-75 cursor-not-allowed"
        >
          <AlertCircle className="h-5 w-5" />
          <span>Please Log In First</span>
        </button>
      );
    }

    if (isConverted) {
      return (
        <button
          disabled
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 
            text-white rounded-lg opacity-75 cursor-not-allowed"
        >
          <CheckCircle className="h-5 w-5" />
          <span>Group Created</span>
        </button>
      );
    }

    if (!validateLeagueData(league)) {
      return (
        <button
          disabled
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-400 
            text-white rounded-lg opacity-75 cursor-not-allowed"
        >
          <AlertCircle className="h-5 w-5" />
          <span>League Information Incomplete</span>
        </button>
      );
    }

    return (
      <>
        <button
          onClick={handleCreateGroup}
          disabled={creating}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-800 
            text-white rounded-lg hover:bg-purple-900 transition-colors disabled:opacity-50 
            disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          <span>{creating ? 'Creating...' : 'Create Bankroll Group'}</span>
        </button>
        {error && (
          <div className="mt-2 flex items-center justify-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#d6b4fc] p-8 rounded-2xl max-w-2xl w-full mx-4 relative border border-purple-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-800 hover:text-purple-900"
        >
          <X className="h-6 w-6" />
        </button>

        {/* League Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {yahooLogo ? (
              <img
                src={yahooLogo}
                alt="Yahoo Fantasy"
                className="w-16 h-16 rounded-full object-cover bg-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-purple-800 flex items-center justify-center">
                <span className="text-white font-bold text-xl">Y</span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-purple-900">
                {league?.isCommissioner && <Crown className="inline-block h-5 w-5 text-yellow-600 mr-2" />}
                {league?.name || 'League Details'}
              </h2>
              <p className="text-purple-800">Season 2023</p>
            </div>
          </div>
        </div>

        {/* League Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/80 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Total Teams</h3>
            <p className="text-2xl font-bold text-purple-900">{league?.leagueSize || 0}</p>
          </div>
          <div className="bg-white/80 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Buy-in Amount</h3>
            <p className="text-2xl font-bold text-purple-900">${league?.buyInAmount || 0}</p>
          </div>

          <div className="bg-white/80 p-4 rounded-lg col-span-2">
            <h3 className="text-sm font-medium text-purple-800 mb-2">Prize Structure</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-purple-900">1st Place:</span>
                <span className="font-bold text-purple-900">${league?.payouts?.first || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-900">2nd Place:</span>
                <span className="font-bold text-purple-900">${league?.payouts?.second || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-900">3rd Place:</span>
                <span className="font-bold text-purple-900">${league?.payouts?.third || 0}</span>
              </div>
              {league?.payouts?.fourth > 0 && (
                <div className="flex justify-between">
                  <span className="text-purple-900">4th Place:</span>
                  <span className="font-bold text-purple-900">${league?.payouts?.fourth}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          {league?.wantToInvest && (
            <div className="flex items-center space-x-2 text-green-600 bg-white/80 p-3 rounded-lg">
              <Check className="h-5 w-5" />
              <span>League dues will be invested throughout the season</span>
            </div>
          )}
          {league?.convertToSleeper && (
            <div className="flex items-center space-x-2 text-green-600 bg-white/80 p-3 rounded-lg">
              <Check className="h-5 w-5" />
              <span>Converting to Sleeper (+$50 to league pot)</span>
            </div>
          )}
          {league?.bountyToLeaguePot && (
            <div className="flex items-center space-x-2 text-green-600 bg-white/80 p-3 rounded-lg">
              <Check className="h-5 w-5" />
              <span>$10 referral bounty added to league pot</span>
            </div>
          )}
        </div>

        {/* Create Group Button */}
        <div className="mt-8">
          {renderButton()}
        </div>
      </div>
    </div>
  );
};

export default YahooLeagueDetailsModal;
