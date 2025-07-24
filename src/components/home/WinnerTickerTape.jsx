import React, { useState, useEffect } from 'react';
import { Trophy, Eye } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import SeeHowModal from '../modals/SeeHowModal';
import './WinnerTickerTape.css';

const WinnerTickerTape = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [showSeeHowModal, setShowSeeHowModal] = useState(false);

  // Platform logos mapping
  const platformLogos = {
    'DraftKings': '/images/draftkingsFantasy.png',
    'FanDuel': '/images/fanduel.png',
    'Sleeper': '/images/sleeperFantasy.png',
    'ESPN BET': '/images/espnbet.png',
    'BetMGM': '/images/betmgm.png',
    'Caesars': '/images/caesars.png',
    'Underdog': '/images/underdog.png',
    'PointsBet': '/images/pointsbet.png',
    'PrizePicks': '/images/prizepicks.png'
  };

  // Fetch winners from Firestore
  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const winnersQuery = query(
          collection(db, 'winners'),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        
        const snapshot = await getDocs(winnersQuery);
        const winnersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // If we have winners, duplicate them for seamless scrolling
        if (winnersData.length > 0) {
          setWinners([...winnersData, ...winnersData]);
        } else {
          // Use default winners if none from database
          const defaultWinners = [
            {
              id: '1',
              title: 'Recent Winner',
              username: '@jackson_w',
              amount: 2500,
              platform: 'DraftKings',
              platformColor: '#F3701D',
              time: '2 hours ago'
            },
            {
              id: '2',
              title: 'Big Winner',
              username: '@chris_b',
              amount: 1750,
              platform: 'Underdog',
              platformColor: '#6B46C1',
              time: '3 hours ago'
            },
            {
              id: '3',
              title: 'Just Won!',
              username: '@ryan_t',
              amount: 950,
              platform: 'Caesars',
              platformColor: '#1E4C91',
              time: '45 mins ago'
            },
            {
              id: '4',
              title: 'Big Win Alert',
              username: '@sarah_m',
              amount: 4200,
              platform: 'Sleeper',
              platformColor: '#F7B500',
              time: '5 mins ago'
            },
            {
              id: '5',
              title: 'Fresh Win',
              username: '@david_m',
              amount: 2800,
              platform: 'PrizePicks',
              platformColor: '#00D4FF',
              time: '10 mins ago'
            },
            {
              id: '6',
              title: 'New Winner',
              username: '@alex_r',
              amount: 3100,
              platform: 'ESPN BET',
              platformColor: '#D50A0A',
              time: '15 mins ago'
            },
            {
              id: '7',
              title: 'Latest Winner',
              username: '@mike_d',
              amount: 1850,
              platform: 'FanDuel',
              platformColor: '#0B79E0',
              time: '30 mins ago'
            },
            {
              id: '8',
              title: 'Jackpot!',
              username: '@emma_w',
              amount: 7200,
              platform: 'PointsBet',
              platformColor: '#FF6900',
              time: '20 mins ago'
            }
          ];
          setWinners([...defaultWinners, ...defaultWinners]);
        }
      } catch (error) {
        console.error('Error fetching winners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, []);

  if (loading) {
    return (
      <div className="relative w-full h-36 bg-gray-900 rounded-lg overflow-hidden">
        <div className="flex items-center h-full px-4">
          <div className="animate-pulse text-white">Loading winners...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-36 bg-gray-900 rounded-lg overflow-hidden">
      {/* Gradient fade on edges */}
      <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none" />
      
      {/* Ticker tape container */}
      <div className="relative h-full flex items-center">
        <div className="w-full overflow-hidden">
          <div 
            className="flex animate-scroll"
            style={{
              animation: 'scroll 40s linear infinite',
              width: 'fit-content'
            }}
            onMouseEnter={(e) => e.currentTarget.style.animationPlayState = 'paused'}
            onMouseLeave={(e) => e.currentTarget.style.animationPlayState = 'running'}
          >
            {winners.map((winner, index) => (
              <div
                key={`${winner.id}-${index}`}
                className="ticker-item bg-black rounded-lg p-4 mx-2 flex-shrink-0 w-64 h-28 shadow-lg border border-gray-800"
              >
                <div className="flex flex-col h-full justify-between text-white">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-medium opacity-80">{winner.title || 'Recent Winner'}</h3>
                      <Trophy className="h-3 w-3 opacity-60" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl font-bold">${winner.amount.toLocaleString()}</div>
                      <div className="text-xs font-medium opacity-90">{winner.username}</div>
                      <div className="flex items-center gap-1">
                        {platformLogos[winner.platform] && (
                          <img 
                            src={platformLogos[winner.platform]} 
                            alt={winner.platform}
                            className="h-4 w-auto object-contain opacity-80"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="text-[10px] font-medium opacity-70">
                          {winner.platform}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] opacity-60">{winner.time}</div>
                    {winner.how && (
                      <button 
                        onClick={() => {
                          setSelectedWinner(winner);
                          setShowSeeHowModal(true);
                        }}
                        className="flex items-center gap-1 text-[10px] font-medium bg-white/10 hover:bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full transition-colors"
                      >
                        <Eye className="h-2.5 w-2.5" />
                        See How
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* See How Modal */}
      {selectedWinner && (
        <SeeHowModal
          isOpen={showSeeHowModal}
          onClose={() => {
            setShowSeeHowModal(false);
            setSelectedWinner(null);
          }}
          winner={selectedWinner}
        />
      )}

    </div>
  );
};

export default WinnerTickerTape;