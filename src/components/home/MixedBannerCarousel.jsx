import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Users, DollarSign, TrendingUp, Award, Activity, Target, Zap, Eye } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import DailySpinner from '../banners/DailySpinner';
import SideBetBanner from '../banners/SideBetBanner';
import SpinnerModal from '../modals/SpinnerModal';
import SeeHowModal from '../modals/SeeHowModal';
import SideBetModal from '../modals/SideBetModal';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

const MixedBannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSpinnerModal, setShowSpinnerModal] = useState(false);
  const [showSideBetModal, setShowSideBetModal] = useState(false);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [showSeeHowModal, setShowSeeHowModal] = useState(false);
  const { isDark } = useTheme();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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
          limit(12)
        );
        
        const snapshot = await getDocs(winnersQuery);
        const winnersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setWinners(winnersData);
      } catch (error) {
        console.error('Error fetching winners:', error);
        // Keep default data if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, []);

  // Convert Firestore winners to banner format
  const convertWinnerToCard = (winner, index) => ({
    type: 'winner',
    title: winner.title || 'Recent Winner',
    name: winner.username,
    amount: `$${winner.amount.toLocaleString()}`,
    platform: winner.platform,
    platformColor: winner.platformColor,
    time: winner.time || `${Math.floor(Math.random() * 60) + 1} mins ago`,
    icon: Trophy,
    gradient: [
      'from-yellow-400 to-orange-500',
      'from-purple-500 to-pink-500',
      'from-blue-500 to-indigo-600',
      'from-green-500 to-emerald-600',
      'from-red-500 to-orange-600',
      'from-cyan-500 to-blue-600'
    ][index % 6],
    originalData: winner // Keep original winner data for the modal
  });

  // Static cards for variety
  const staticCards = [
    {
      type: 'sidebet',
      title: 'SideBet Jackpot',
      gradient: 'from-purple-600 via-indigo-600 to-blue-600'
    },
    {
      type: 'reward',
      title: 'Your Rewards',
      amount: '$85.50',
      pending: '$42.00',
      nextPayout: 'Friday',
      streak: '7 days',
      icon: DollarSign,
      gradient: 'from-green-500 to-teal-500'
    },
    {
      type: 'league',
      title: 'Join Now',
      name: 'Elite Basketball',
      members: '89/100',
      prize: '$10,000',
      deadline: 'Starting soon',
      icon: Target,
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      type: 'league',
      title: 'Featured League',
      name: 'March Madness',
      members: '450',
      prize: '$25,000',
      deadline: 'Registration open',
      icon: Activity,
      gradient: 'from-red-500 to-pink-600'
    }
  ];

  // Generate banner sets from winners data
  const generateBannerSets = () => {
    if (winners.length === 0) {
      // Return default sets if no winners are loaded
      return defaultBannerSets;
    }

    const winnerCards = winners.map((winner, index) => convertWinnerToCard(winner, index));
    const allCards = [...winnerCards, ...staticCards];
    
    // Create sets of 4 cards each
    const sets = [];
    for (let i = 0; i < allCards.length; i += 4) {
      const set = allCards.slice(i, i + 4);
      if (set.length === 4) {
        sets.push(set);
      }
    }
    
    return sets.length > 0 ? sets : defaultBannerSets;
  };

  // Default banner sets for fallback
  const defaultBannerSets = [
    [
      {
        type: 'winner',
        title: 'Recent Winner',
        name: '@jackson_w',
        amount: '$2,500',
        platform: 'DraftKings',
        platformColor: '#F3701D',
        time: '2 hours ago',
        icon: Trophy,
        gradient: 'from-yellow-400 to-orange-500'
      },
      {
        type: 'winner',
        title: 'Big Winner',
        name: '@chris_b',
        amount: '$1,750',
        platform: 'Underdog',
        platformColor: '#6B46C1',
        time: '3 hours ago',
        icon: Trophy,
        gradient: 'from-purple-500 to-pink-500'
      },
      {
        type: 'reward',
        title: 'Your Rewards',
        amount: '$85.50',
        pending: '$42.00',
        nextPayout: 'Friday',
        streak: '7 days',
        icon: DollarSign,
        gradient: 'from-green-500 to-teal-500'
      },
      {
        type: 'winner',
        title: 'Just Won!',
        name: '@ryan_t',
        amount: '$950',
        platform: 'Caesars',
        platformColor: '#1E4C91',
        time: '45 mins ago',
        icon: Trophy,
        gradient: 'from-blue-500 to-indigo-600'
      }
    ],
    [
      {
        type: 'winner',
        title: 'Big Win Alert',
        name: '@sarah_m',
        amount: '$4,200',
        platform: 'Sleeper',
        platformColor: '#F7B500',
        time: '5 mins ago',
        icon: Award,
        gradient: 'from-pink-500 to-red-500'
      },
      {
        type: 'league',
        title: 'Join Now',
        name: 'Elite Basketball',
        members: '89/100',
        prize: '$10,000',
        deadline: 'Starting soon',
        icon: Target,
        gradient: 'from-indigo-500 to-purple-600'
      },
      {
        type: 'winner',
        title: 'Fresh Win',
        name: '@david_m',
        amount: '$2,800',
        platform: 'PrizePicks',
        platformColor: '#00D4FF',
        time: '10 mins ago',
        icon: Trophy,
        gradient: 'from-cyan-500 to-blue-600'
      },
      {
        type: 'winner',
        title: 'New Winner',
        name: '@alex_r',
        amount: '$3,100',
        platform: 'ESPN BET',
        platformColor: '#D50A0A',
        time: '15 mins ago',
        icon: Trophy,
        gradient: 'from-red-500 to-orange-600'
      }
    ],
    [
      {
        type: 'winner',
        title: 'Latest Winner',
        name: '@mike_d',
        amount: '$1,850',
        platform: 'FanDuel',
        platformColor: '#0B79E0',
        time: '30 mins ago',
        icon: Trophy,
        gradient: 'from-green-500 to-emerald-600'
      },
      {
        type: 'winner',
        title: 'Jackpot!',
        name: '@emma_w',
        amount: '$7,200',
        platform: 'PointsBet',
        platformColor: '#FF6900',
        time: '20 mins ago',
        icon: Trophy,
        gradient: 'from-orange-500 to-red-500'
      },
      {
        type: 'league',
        title: 'Featured League',
        name: 'March Madness',
        members: '450',
        prize: '$25,000',
        deadline: 'Registration open',
        icon: Activity,
        gradient: 'from-red-500 to-pink-600'
      },
      {
        type: 'winner',
        title: 'Hot Streak',
        name: '@lisa_k',
        amount: '$1,500',
        platform: 'BetMGM',
        platformColor: '#FFB000',
        time: '1 hour ago',
        icon: Trophy,
        gradient: 'from-amber-500 to-yellow-600'
      }
    ]
  ];

  const bannerSets = generateBannerSets();
  const currentSet = bannerSets[currentIndex] || [];

  // Auto-scroll
  useEffect(() => {
    if (bannerSets.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % bannerSets.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [bannerSets.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swipe left
      setCurrentIndex((prev) => (prev + 1) % bannerSets.length);
    }
    if (touchStartX.current - touchEndX.current < -50) {
      // Swipe right
      setCurrentIndex((prev) => (prev - 1 + bannerSets.length) % bannerSets.length);
    }
  };

  const renderCard = (card) => {
    const Icon = card.icon;

    switch (card.type) {
      case 'winner':
        return (
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium opacity-90">{card.title}</h3>
                <Icon className="h-3 w-3 opacity-80" />
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold">{card.amount}</div>
                <div className="text-xs font-medium">{card.name}</div>
                <div className="flex items-center gap-1">
                  {platformLogos[card.platform] && (
                    <img 
                      src={platformLogos[card.platform]} 
                      alt={card.platform}
                      className="h-4 w-auto object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div 
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm"
                    style={{ 
                      backgroundColor: card.platformColor ? `${card.platformColor}20` : 'rgba(255,255,255,0.2)',
                      borderColor: card.platformColor || 'white',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                  >
                    {card.platform}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div className="text-[10px] opacity-70">{card.time}</div>
              <button 
                onClick={() => {
                  if (card.originalData && card.originalData.how) {
                    setSelectedWinner(card.originalData);
                    setShowSeeHowModal(true);
                  }
                }}
                className="flex items-center gap-1 text-[10px] font-medium bg-white/20 hover:bg-white/30 backdrop-blur-sm px-1.5 py-0.5 rounded-full transition-colors"
              >
                <Eye className="h-2.5 w-2.5" />
                See How
              </button>
            </div>
          </div>
        );

      case 'league':
        return (
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium opacity-90">{card.title}</h3>
                <Icon className="h-3 w-3 opacity-80" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold">{card.name}</div>
                <div className="text-xl font-bold">{card.prize}</div>
                <div className="text-xs">{card.members} players</div>
              </div>
            </div>
            <div className="text-[10px] font-medium opacity-90">{card.deadline}</div>
          </div>
        );

      case 'reward':
        return (
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium opacity-90">{card.title}</h3>
                <Icon className="h-3 w-3 opacity-80" />
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold">{card.amount}</div>
                <div className="text-xs">Pending: {card.pending}</div>
                <div className="text-xs">{card.streak} streak 🔥</div>
              </div>
            </div>
            <div className="text-[10px] opacity-80">Next: {card.nextPayout}</div>
          </div>
        );

      case 'performance':
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium opacity-90">{card.title}</h3>
              <Icon className="h-4 w-4 opacity-80" />
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1">
              <div>
                <div className="text-lg font-bold">{card.winRate}</div>
                <div className="text-xs opacity-70">Win Rate</div>
              </div>
              <div>
                <div className="text-lg font-bold">{card.streak}</div>
                <div className="text-xs opacity-70">Streak</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">{card.profit}</div>
                <div className="text-xs opacity-70">Profit</div>
              </div>
              <div>
                <div className="text-lg font-bold">{card.rank}</div>
                <div className="text-xs opacity-70">Rank</div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">{card.title}</h3>
                <Icon className="h-4 w-4 opacity-80" />
              </div>
              <div className="space-y-2">
                {Object.entries(card).slice(2, 6).map(([key, value]) => (
                  key !== 'icon' && key !== 'gradient' && key !== 'type' && key !== 'title' && (
                    <div key={key} className="text-sm">
                      <span className="font-semibold">{value}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  // Show loading skeleton if still loading
  if (loading && winners.length === 0) {
    return (
      <div className="relative w-full mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 md:h-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full mb-6">
      <div 
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sliding Container */}
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {bannerSets.map((set, setIndex) => (
            <div key={setIndex} className="w-full flex-shrink-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {set.map((card, cardIndex) => {
                  if (card.type === 'dailySpinner') {
                    return (
                      <div key={cardIndex} className="h-32 md:h-36">
                        <DailySpinner onClick={() => setShowSpinnerModal(true)} />
                      </div>
                    );
                  }
                  if (card.type === 'sidebet') {
                    return (
                      <div key={cardIndex} className="h-32 md:h-36">
                        <SideBetBanner onClick={() => setShowSideBetModal(true)} />
                      </div>
                    );
                  }
                  return (
                    <div
                      key={cardIndex}
                      className={`relative overflow-hidden rounded-lg p-3 md:p-4 h-32 md:h-36 
                        bg-gradient-to-br ${card.gradient} text-white shadow-md
                        transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                    >
                      {renderCard(card)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center items-center gap-2 mt-4">
        {bannerSets.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 h-2 bg-purple-600 rounded-full'
                : `w-2 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Spinner Modal */}
      <SpinnerModal 
        isOpen={showSpinnerModal} 
        onClose={() => setShowSpinnerModal(false)} 
      />
      
      {/* SideBet Modal */}
      <SideBetModal
        isOpen={showSideBetModal}
        onClose={() => setShowSideBetModal(false)}
      />
      
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

export default MixedBannerCarousel;