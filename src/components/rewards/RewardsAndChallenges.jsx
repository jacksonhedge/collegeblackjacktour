import React, { useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const RewardsAndChallenges = () => {
  const [showSpinner, setShowSpinner] = useState(false);

  const challenges = [
    {
      id: 1,
      description: "Connect your Season-Long Fantasy League",
      bounty: 5,
      completed: false,
      buttonColor: "bg-blue-500 hover:bg-blue-600",
      logos: [
        { src: "/images/espnFantasy.png", alt: "ESPN" },
        { src: "/images/sleeperFantasy.png", alt: "Sleeper" },
        { src: "/images/yahoofantasy.png", alt: "Yahoo" }
      ]
    },
    {
      id: 2,
      description: "Connect your FanDuel and DraftKings accounts",
      bounty: 5,
      completed: false,
      buttonColor: "bg-purple-500 hover:bg-purple-600",
      logos: [
        { src: "/images/fanduel.png", alt: "FanDuel" },
        { src: "/images/draftkingsFantasy.png", alt: "DraftKings" }
      ]
    },
    {
      id: 3,
      description: "Share with your best friend",
      bounty: 10,
      completed: false,
      buttonColor: "bg-green-500 hover:bg-green-600",
      emoji: "🤝"
    }
  ];

  const handleBountyClick = (challengeId) => {
    // Handle bounty click based on challenge ID
    console.log(`Clicked bounty for challenge ${challengeId}`);
  };

  const SpinnerModal = () => (
    <div className="fixed inset-0 bg-blue-500 flex flex-col items-center justify-start z-50 p-4">
      {/* Close Button */}
      <button 
        onClick={() => setShowSpinner(false)}
        className="text-white text-2xl font-medium mb-8 self-start"
      >
        Close
      </button>

      {/* Potential Rewards */}
      <div className="space-y-4 w-full max-w-md mb-8">
        <div className="bg-blue-400/30 rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/images/sleeperFantasy.png" alt="Sleeper" className="w-8 h-8 rounded" />
            <div>
              <div className="text-white">$0.50 for your</div>
              <div className="text-white/70">Sleeper League</div>
            </div>
          </div>
          <div className="text-white text-xl font-medium">$0.50</div>
        </div>

        <div className="bg-blue-400/30 rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/images/fanduel.png" alt="FanDuel" className="w-8 h-8 rounded" />
            <div>
              <div className="text-white">$1.00 FanDuel</div>
              <div className="text-white/70">Fanduel</div>
            </div>
          </div>
          <div className="text-white text-xl font-medium">$1.00</div>
        </div>
      </div>

      {/* Spinner Wheel */}
      <div className="relative w-full max-w-md aspect-square">
        <div className="absolute inset-0 bg-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full z-10"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 
                      border-l-[20px] border-l-transparent
                      border-b-[40px] border-b-white
                      border-r-[20px] border-r-transparent z-20"></div>
      </div>

      {/* Spin Button */}
      <button 
        className="mt-8 bg-white text-blue-500 rounded-full px-12 py-4 text-xl font-bold"
        onClick={() => {
          // Add spin animation logic here
        }}
      >
        SPIN!
      </button>
    </div>
  );

  return (
    <Card className="bg-gray-900/50 border-purple-500/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Rewards and Challenges</h3>
          <Trophy className="h-5 w-5 text-yellow-500" />
        </div>

        {/* Challenges */}
        <div className="rounded-lg overflow-hidden">
          {challenges.map((challenge, index) => (
            <div 
              key={challenge.id}
              className={`flex items-center justify-between p-4 ${
                index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800/30'
              }`}
            >
              <div className="flex items-center flex-1">
                {challenge.logos ? (
                  <div className="flex -space-x-2 mr-4">
                    {challenge.logos.map((logo, logoIndex) => (
                      <img
                        key={logoIndex}
                        src={logo.src}
                        alt={logo.alt}
                        className="w-8 h-8 rounded-full border-2 border-gray-800 bg-white"
                      />
                    ))}
                  </div>
                ) : challenge.emoji ? (
                  <div className="w-8 h-8 flex items-center justify-center mr-4 text-xl">
                    {challenge.emoji}
                  </div>
                ) : null}
                <p className="text-white">{challenge.description}</p>
              </div>
              <button
                onClick={() => handleBountyClick(challenge.id)}
                className={`ml-4 px-6 py-2 ${challenge.buttonColor} text-white rounded-lg transition-colors shadow-lg`}
              >
                Bounty: ${challenge.bounty}
              </button>
            </div>
          ))}
        </div>

        {/* Daily Reward */}
        <div className="flex items-center justify-between mt-6 p-4 bg-gray-800/50 rounded-lg">
          <div>
            <p className="text-white font-medium">Daily Reward</p>
            <p className="text-sm text-gray-400">Spin for a chance to win rewards!</p>
          </div>
          <div className="relative">
            <button
              disabled
              className="px-6 py-2 bg-gradient-to-r from-blue-500/50 to-purple-500/50 text-white/70 rounded-lg cursor-not-allowed shadow-lg"
            >
              Spin Now!
            </button>
            <span className="absolute -top-2 right-0 text-xs font-medium text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>
      </CardContent>

      {/* Spinner Modal */}
      {showSpinner && <SpinnerModal />}
    </Card>
  );
};

export default RewardsAndChallenges;
