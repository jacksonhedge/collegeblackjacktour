import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../ui';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const WelcomeFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // If no user is logged in, redirect to login
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  const togglePreference = (preference, type) => {
    const setter = type === 'payment' ? setSelectedPayments : setSelectedPreferences;
    setter(prev => 
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  if (!currentUser) {
    return null;
  }

  const steps = [
    {
      title: "Welcome to Bankroll! 🎉",
      description: "Let's get you set up with a few quick steps. You can always complete these later.",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            We're excited to have you join us! We'll help you:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Set up your gaming preferences</li>
            <li>Connect your existing accounts</li>
            <li>Discover bonus opportunities</li>
          </ul>
        </div>
      )
    },
    {
      title: "Gaming Preferences",
      description: "What interests you the most? Select any that apply.",
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['Sports Betting', 'Poker', 'Fantasy Football'].map((preference) => (
              <button
                key={preference}
                className={`px-4 py-2 rounded-full border border-blue-500 transition-colors ${
                  selectedPreferences.includes(preference)
                    ? 'bg-blue-500 text-white'
                    : 'text-blue-400 hover:bg-blue-500/10'
                }`}
                onClick={() => togglePreference(preference, 'gaming')}
              >
                {preference}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-4">
            This helps us personalize your experience. You can change these anytime.
          </p>
          {selectedPreferences.length > 0 && (
            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-300">
                Selected: {selectedPreferences.join(', ')}
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Payment Methods",
      description: "Which payment methods do you use? Select all that apply.",
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['Debit Card', 'Venmo', 'Cash App'].map((payment) => (
              <button
                key={payment}
                className={`px-4 py-2 rounded-full border border-blue-500 transition-colors ${
                  selectedPayments.includes(payment)
                    ? 'bg-blue-500 text-white'
                    : 'text-blue-400 hover:bg-blue-500/10'
                }`}
                onClick={() => togglePreference(payment, 'payment')}
              >
                {payment}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-4">
            This helps us recommend the best deposit methods for you.
          </p>
          {selectedPayments.length > 0 && (
            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-300">
                Selected: {selectedPayments.join(', ')}
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Connect Your Accounts",
      description: "Link your existing accounts to track your bonuses",
      content: (
        <div className="space-y-6">
          <p className="text-gray-300">
            Link your FanDuel, DraftKings, PrizePicks, or other accounts here to track the money and promos on those apps.
          </p>
          
          {/* Platform Icons Web Visualization */}
          <div className="relative h-48 flex items-center justify-center">
            {/* Platform icons at the top */}
            <div className="absolute w-full top-4">
              <div className="flex justify-between px-4 max-w-[300px] mx-auto">
                {/* FanDuel */}
                <div className="w-14 h-14 bg-gray-800 rounded-full border-2 border-blue-500 flex items-center justify-center">
                  <img src="/images/fanduel.png" alt="FanDuel" className="w-10 h-10 object-contain" />
                </div>
                
                {/* DraftKings */}
                <div className="w-14 h-14 bg-gray-800 rounded-full border-2 border-green-500 flex items-center justify-center">
                  <img src="/images/draftkingsfantasy.png" alt="DraftKings" className="w-10 h-10 object-contain" />
                </div>
                
                {/* PrizePicks */}
                <div className="w-14 h-14 bg-gray-800 rounded-full border-2 border-red-500 flex items-center justify-center">
                  <img src="/images/prizepicks.png" alt="PrizePicks" className="w-10 h-10 object-contain" />
                </div>
              </div>
            </div>
            
            {/* Bankroll at bottom */}
            <div className="absolute bottom-0 left-1/2 -translate-x-12">
              <div className="w-24 h-24 bg-gray-800 rounded-full border-2 border-purple-500 flex items-center justify-center">
                <img
                  src="/images/BankrollLogoTransparent.png"
                  alt="Bankroll"
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate('/platforms')}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
          >
            Connect Accounts
          </Button>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/platforms');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate('/platforms');
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-900 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-6 bg-gray-800 border-gray-700">
        <div className="p-6">
          <div className="flex flex-col items-center">
            <h2 className="text-center text-2xl font-bold tracking-tight text-white">
              {steps[currentStep].title}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              {steps[currentStep].description}
            </p>
          </div>

          <div className="mt-8">
            {steps[currentStep].content}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div>
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-1" />
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Setup Later
              </button>
              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="h-5 w-5 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeFlow;
