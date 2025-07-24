import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useYahoo } from '../../contexts/YahooContext';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const YahooLeagueModal = ({ onClose }) => {
  const { createLeague, isLoading, error } = useYahoo();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    isCommissioner: null,
    leagueSize: '',
    hasBuyIn: null,
    buyInAmount: '',
    payouts: {
      first: '',
      second: '',
      third: '',
      fourth: ''
    },
    hasWeeklyPayouts: null,
    weeklyPayoutDetails: '',
    wantToInvest: null,
    invitedUsers: Array(16).fill(''),
    convertToSleeper: null,
    bountyToLeaguePot: null
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
        platform: 'yahoo',
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

      console.log('Creating league with data:', leagueData);

      await createLeague(leagueData);
      onClose();
    } catch (err) {
      console.error('Error creating league:', err);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-purple-900">League Details</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-purple-900">League Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/80 border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-900 placeholder-purple-400"
            placeholder="Enter league name"
            required
          />
        </div>

        <div>
          <p className="mb-2 text-purple-900">Are you the commissioner?</p>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleInputChange('isCommissioner', true)}
              className={`px-4 py-2 rounded-lg ${
                formData.isCommissioner === true
                  ? 'bg-purple-800 text-white'
                  : 'bg-white/80 text-purple-800 hover:bg-white'
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
                  : 'bg-white/80 text-purple-800 hover:bg-white'
              }`}
            >
              No
            </button>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-purple-900">How many people are in your league?</label>
          <input
            type="number"
            min="4"
            max="16"
            value={formData.leagueSize}
            onChange={(e) => handleInputChange('leagueSize', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/80 border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-900 placeholder-purple-400"
            placeholder="Enter number (4-16)"
          />
        </div>

        <div>
          <p className="mb-2 text-purple-900">Is there a buy-in to the league?</p>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleInputChange('hasBuyIn', true)}
              className={`px-4 py-2 rounded-lg ${
                formData.hasBuyIn === true
                  ? 'bg-purple-800 text-white'
                  : 'bg-white/80 text-purple-800 hover:bg-white'
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
                  : 'bg-white/80 text-purple-800 hover:bg-white'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {formData.hasBuyIn && (
          <div>
            <label className="block mb-2 text-purple-900">Buy-in amount per person</label>
            <input
              type="number"
              value={formData.buyInAmount}
              onChange={(e) => handleInputChange('buyInAmount', e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/80 border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-900 placeholder-purple-400"
              placeholder="Enter amount"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-purple-900">Payout Structure</h3>
      
      <div className="space-y-4">
        {['first', 'second', 'third', 'fourth'].map((position) => (
          <div key={position}>
            <label className="block mb-2 text-purple-900">{position.charAt(0).toUpperCase() + position.slice(1)} Place Payout</label>
            <input
              type="number"
              value={formData.payouts[position]}
              onChange={(e) => handlePayoutChange(position, e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/80 border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-900 placeholder-purple-400"
              placeholder="Enter amount"
            />
          </div>
        ))}

        <div>
          <p className="mb-2 text-purple-900">Do you do weekly payouts?</p>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleInputChange('hasWeeklyPayouts', true)}
              className={`px-4 py-2 rounded-lg ${
                formData.hasWeeklyPayouts === true
                  ? 'bg-purple-800 text-white'
                  : 'bg-white/80 text-purple-800 hover:bg-white'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('hasWeeklyPayouts', false)}
              className={`px-4 py-2 rounded-lg ${
                formData.hasWeeklyPayouts === false
                  ? 'bg-purple-800 text-white'
                  : 'bg-white/80 text-purple-800 hover:bg-white'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {formData.hasWeeklyPayouts && (
          <div>
            <label className="block mb-2 text-purple-900">Weekly Payout Details</label>
            <textarea
              value={formData.weeklyPayoutDetails}
              onChange={(e) => handleInputChange('weeklyPayoutDetails', e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/80 border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-900 placeholder-purple-400"
              placeholder="Describe your weekly payout structure..."
              rows={3}
            />
          </div>
        )}

        <div>
          <p className="mb-2 text-purple-900">Do you want to invest your league dues throughout the season?</p>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleInputChange('wantToInvest', true)}
              className={`px-4 py-2 rounded-lg ${
                formData.wantToInvest === true
                  ? 'bg-purple-800 text-white'
                  : 'bg-white/80 text-purple-800 hover:bg-white'
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
                  : 'bg-white/80 text-purple-800 hover:bg-white'
              }`}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-purple-900">Invite League Members</h3>
      
      <div className="space-y-4">
        <p className="text-purple-800">
          We have setup placeholders for {formData.leagueSize} people
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.invitedUsers.slice(0, formData.leagueSize).map((email, index) => (
            <div key={index}>
              <label className="block mb-2 text-purple-900">Member {index + 1}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  const newInvitedUsers = [...formData.invitedUsers];
                  newInvitedUsers[index] = e.target.value;
                  handleInputChange('invitedUsers', newInvitedUsers);
                }}
                className="w-full px-4 py-2 rounded-lg bg-white/80 border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-900 placeholder-purple-400"
                placeholder="Enter email address"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-purple-900">Additional Options</h3>
      
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-purple-900">Would you like to convert your league to Sleeper fantasy for a free $50 to the league pot?</p>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleInputChange('convertToSleeper', true)}
              className={`px-4 py-2 rounded-lg ${
                formData.convertToSleeper === true
                  ? 'bg-purple-800 text-white'
                  : 'bg-white/80 text-purple-800 hover:bg-white'
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
                  : 'bg-white/80 text-purple-800 hover:bg-white'
              }`}
            >
              No
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('convertToSleeper', 'notSure')}
              className={`px-4 py-2 rounded-lg ${
                formData.convertToSleeper === 'notSure'
                  ? 'bg-purple-800 text-white'
                  : 'bg-white/80 text-purple-800 hover:bg-white'
              }`}
            >
              Not Sure Yet
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-purple-900">Would you like the $10 referral bounty to go towards the league pot?</p>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleInputChange('bountyToLeaguePot', true)}
              className={`px-4 py-2 rounded-lg ${
                formData.bountyToLeaguePot === true
                  ? 'bg-purple-800 text-white'
                  : 'bg-white/80 text-purple-800 hover:bg-white'
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
                  : 'bg-white/80 text-purple-800 hover:bg-white'
              }`}
            >
              No
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('bountyToLeaguePot', 'notSure')}
              className={`px-4 py-2 rounded-lg ${
                formData.bountyToLeaguePot === 'notSure'
                  ? 'bg-purple-800 text-white'
                  : 'bg-white/80 text-purple-800 hover:bg-white'
              }`}
            >
              Not Sure Yet
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
                  disabled={isLoading || !formData.name.trim()}
                  className="px-6 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default YahooLeagueModal;
