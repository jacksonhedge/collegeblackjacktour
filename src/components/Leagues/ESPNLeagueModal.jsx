import React, { useState, useEffect } from 'react';
import { X, Crown, Plus, ChevronRight, Info, Check, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useESPN } from '../../contexts/ESPNContext';
import { groupService } from '../../services/firebase/GroupService';

const ESPNLeagueModal = ({ league, onClose, onGroupCreated, isCreating = false }) => {
  const { createLeague, loading, error } = useESPN();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: league?.name || '',
    isCommissioner: league?.isCommissioner || null,
    leagueSize: league?.leagueSize || '',
    hasBuyIn: league?.hasBuyIn || null,
    buyInAmount: league?.buyInAmount || '',
    payouts: {
      first: league?.payouts?.first || '',
      second: league?.payouts?.second || '',
      third: league?.payouts?.third || '',
      fourth: league?.payouts?.fourth || ''
    },
    hasWeeklyPayouts: league?.hasWeeklyPayouts || null,
    weeklyPayoutDetails: league?.weeklyPayoutDetails || '',
    wantToInvest: league?.wantToInvest || null,
    invitedUsers: league?.invitedUsers || Array(16).fill(''),
    convertToSleeper: league?.convertToSleeper || null,
    bountyToLeaguePot: league?.bountyToLeaguePot || null
  });

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePayoutChange = (position, value) => {
    setFormData(prev => ({
      ...prev,
      payouts: {
        ...prev.payouts,
        [position]: value
      }
    }));
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      return; // Don't proceed if league name is empty
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleCreateGroup = async () => {
    if (!currentUser) return;
    
    try {
      const groupData = {
        name: formData.name,
        emoji: '🏈',
        coOwners: [currentUser.uid],
        members: [],
        platform: 'espn'
      };

      await groupService.createGroup(groupData, currentUser.uid);
      if (onGroupCreated) onGroupCreated();
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!currentUser?.uid) {
        throw new Error('You must be logged in to create a league');
      }

      if (!formData.name.trim()) {
        throw new Error('League name is required');
      }

      const filteredInvitedUsers = formData.invitedUsers
        .slice(0, formData.leagueSize)
        .filter(email => email.trim() !== '');

      const leagueData = {
        userId: currentUser.uid,
        platform: 'espn',
        status: 'pending',
        createdAt: new Date().toISOString(),
        name: formData.name.trim(),
        isCommissioner: formData.isCommissioner,
        leagueSize: parseInt(formData.leagueSize, 10),
        hasBuyIn: formData.hasBuyIn,
        buyInAmount: formData.hasBuyIn ? parseFloat(formData.buyInAmount) : 0,
        payouts: {
          first: parseFloat(formData.payouts.first) || 0,
          second: parseFloat(formData.payouts.second) || 0,
          third: parseFloat(formData.payouts.third) || 0,
          fourth: parseFloat(formData.payouts.fourth) || 0
        },
        hasWeeklyPayouts: formData.hasWeeklyPayouts,
        weeklyPayoutDetails: formData.hasWeeklyPayouts ? formData.weeklyPayoutDetails : '',
        wantToInvest: formData.wantToInvest,
        invitedUsers: filteredInvitedUsers,
        convertToSleeper: formData.convertToSleeper,
        bountyToLeaguePot: formData.bountyToLeaguePot
      };

      await createLeague(leagueData);
      await handleCreateGroup();
      onClose();
    } catch (err) {
      console.error('Error creating league:', err);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-purple-900">League Details</h2>
      <div>
        <label className="block text-sm font-medium text-purple-900 mb-2">
          League Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter league name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-purple-900 mb-2">
          Are you the commissioner?
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => handleInputChange('isCommissioner', true)}
            className={`px-4 py-2 rounded-lg ${
              formData.isCommissioner === true
                ? 'bg-purple-800 text-white'
                : 'bg-white/80 text-purple-800'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleInputChange('isCommissioner', false)}
            className={`px-4 py-2 rounded-lg ${
              formData.isCommissioner === false
                ? 'bg-purple-800 text-white'
                : 'bg-white/80 text-purple-800'
            }`}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-purple-900">League Size & Buy-in</h2>
      <div>
        <label className="block text-sm font-medium text-purple-900 mb-2">
          Number of Teams
        </label>
        <input
          type="number"
          value={formData.leagueSize}
          onChange={(e) => handleInputChange('leagueSize', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter number of teams"
          min="4"
          max="16"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-purple-900 mb-2">
          Does your league have a buy-in?
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => handleInputChange('hasBuyIn', true)}
            className={`px-4 py-2 rounded-lg ${
              formData.hasBuyIn === true
                ? 'bg-purple-800 text-white'
                : 'bg-white/80 text-purple-800'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleInputChange('hasBuyIn', false)}
            className={`px-4 py-2 rounded-lg ${
              formData.hasBuyIn === false
                ? 'bg-purple-800 text-white'
                : 'bg-white/80 text-purple-800'
            }`}
          >
            No
          </button>
        </div>
      </div>
      {formData.hasBuyIn && (
        <div>
          <label className="block text-sm font-medium text-purple-900 mb-2">
            Buy-in Amount ($)
          </label>
          <input
            type="number"
            value={formData.buyInAmount}
            onChange={(e) => handleInputChange('buyInAmount', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter buy-in amount"
            min="0"
          />
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-purple-900">Payout Structure</h2>
      {formData.hasBuyIn && (
        <>
          <div>
            <label className="block text-sm font-medium text-purple-900 mb-2">
              1st Place Prize ($)
            </label>
            <input
              type="number"
              value={formData.payouts.first}
              onChange={(e) => handlePayoutChange('first', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter 1st place prize"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-900 mb-2">
              2nd Place Prize ($)
            </label>
            <input
              type="number"
              value={formData.payouts.second}
              onChange={(e) => handlePayoutChange('second', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter 2nd place prize"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-900 mb-2">
              3rd Place Prize ($)
            </label>
            <input
              type="number"
              value={formData.payouts.third}
              onChange={(e) => handlePayoutChange('third', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter 3rd place prize"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-900 mb-2">
              4th Place Prize ($)
            </label>
            <input
              type="number"
              value={formData.payouts.fourth}
              onChange={(e) => handlePayoutChange('fourth', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter 4th place prize"
              min="0"
            />
          </div>
        </>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-purple-900">Additional Options</h2>
      {formData.hasBuyIn && (
        <div>
          <label className="block text-sm font-medium text-purple-900 mb-2">
            Would you like to invest your league dues throughout the season?
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleInputChange('wantToInvest', true)}
              className={`px-4 py-2 rounded-lg ${
                formData.wantToInvest === true
                  ? 'bg-purple-800 text-white'
                  : 'bg-white/80 text-purple-800'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('wantToInvest', false)}
              className={`px-4 py-2 rounded-lg ${
                formData.wantToInvest === false
                  ? 'bg-purple-800 text-white'
                  : 'bg-white/80 text-purple-800'
              }`}
            >
              No
            </button>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-purple-900 mb-2">
          Would you like to convert your league to Sleeper? (+$50 to league pot)
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => handleInputChange('convertToSleeper', true)}
            className={`px-4 py-2 rounded-lg ${
              formData.convertToSleeper === true
                ? 'bg-purple-800 text-white'
                : 'bg-white/80 text-purple-800'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleInputChange('convertToSleeper', false)}
            className={`px-4 py-2 rounded-lg ${
              formData.convertToSleeper === false
                ? 'bg-purple-800 text-white'
                : 'bg-white/80 text-purple-800'
            }`}
          >
            No
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-purple-900 mb-2">
          Add $10 referral bounty to league pot?
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => handleInputChange('bountyToLeaguePot', true)}
            className={`px-4 py-2 rounded-lg ${
              formData.bountyToLeaguePot === true
                ? 'bg-purple-800 text-white'
                : 'bg-white/80 text-purple-800'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleInputChange('bountyToLeaguePot', false)}
            className={`px-4 py-2 rounded-lg ${
              formData.bountyToLeaguePot === false
                ? 'bg-purple-800 text-white'
                : 'bg-white/80 text-purple-800'
            }`}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );

  // If we're viewing an existing league, show the details view
  if (!isCreating && league) {
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
              <div className="w-16 h-16 rounded-full bg-purple-800 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-purple-900">
                  {league.isCommissioner && <Crown className="inline-block h-5 w-5 text-yellow-600 mr-2" />}
                  {league.name}
                </h2>
                <p className="text-purple-800">Season 2023</p>
              </div>
            </div>
          </div>

          {/* League Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/80 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800">Total Teams</h3>
              <p className="text-2xl font-bold text-purple-900">{league.leagueSize}</p>
            </div>
            <div className="bg-white/80 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800">Buy-in Amount</h3>
              <p className="text-2xl font-bold text-purple-900">${league.buyInAmount || 0}</p>
            </div>

            <div className="bg-white/80 p-4 rounded-lg col-span-2">
              <h3 className="text-sm font-medium text-purple-800 mb-2">Prize Structure</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-purple-900">1st Place:</span>
                  <span className="font-bold text-purple-900">${league.payouts?.first || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-900">2nd Place:</span>
                  <span className="font-bold text-purple-900">${league.payouts?.second || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-900">3rd Place:</span>
                  <span className="font-bold text-purple-900">${league.payouts?.third || 0}</span>
                </div>
                {league.payouts?.fourth > 0 && (
                  <div className="flex justify-between">
                    <span className="text-purple-900">4th Place:</span>
                    <span className="font-bold text-purple-900">${league.payouts.fourth}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            {league.wantToInvest && (
              <div className="flex items-center space-x-2 text-green-600 bg-white/80 p-3 rounded-lg">
                <Check className="h-5 w-5" />
                <span>League dues will be invested throughout the season</span>
              </div>
            )}
            {league.convertToSleeper && (
              <div className="flex items-center space-x-2 text-green-600 bg-white/80 p-3 rounded-lg">
                <Check className="h-5 w-5" />
                <span>Converting to Sleeper (+$50 to league pot)</span>
              </div>
            )}
            {league.bountyToLeaguePot && (
              <div className="flex items-center space-x-2 text-green-600 bg-white/80 p-3 rounded-lg">
                <Check className="h-5 w-5" />
                <span>$10 referral bounty added to league pot</span>
              </div>
            )}
          </div>

          {/* Create Group Button */}
          <div className="mt-8">
            <button
              onClick={handleCreateGroup}
              className="w-full px-6 py-3 bg-purple-800 text-white rounded-lg hover:bg-purple-900 
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Bankroll Group</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If we're creating a new league, show the form
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#d6b4fc] p-8 rounded-2xl max-w-2xl w-full mx-4 relative border border-purple-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-800 hover:text-purple-900"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8">
          {/* Progress Indicator */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-1/4 h-2 rounded-full mx-1 ${
                  step <= currentStep ? 'bg-purple-800' : 'bg-white/80'
                }`}
              />
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg border border-red-300">
              {error}
            </div>
          )}

          {/* Step Content */}
          <form onSubmit={(e) => e.preventDefault()}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2 bg-white/80 text-purple-800 rounded-lg hover:bg-white transition-colors"
                >
                  Back
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentStep === 1 && !formData.name.trim()}
                  className="px-6 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !formData.name.trim()}
                  className="px-6 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ESPNLeagueModal;
