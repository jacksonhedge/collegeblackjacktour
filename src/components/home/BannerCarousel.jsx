import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Users, TrendingUp, Award, DollarSign, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isDark } = useTheme();

  const banners = [
    {
      id: 'rewards',
      title: 'Weekly Rewards',
      subtitle: 'Earn cash back on every play',
      icon: Trophy,
      stats: [
        { label: 'This Week', value: '$25,000', subtext: 'Total Rewards' },
        { label: 'Active Users', value: '1,247', subtext: 'Earning Now' },
        { label: 'Avg Reward', value: '$85', subtext: 'Per User' },
        { label: 'Next Payout', value: '3 days', subtext: 'Friday 12PM' }
      ],
      gradient: 'from-purple-600 to-purple-800',
      iconBg: 'bg-purple-500'
    },
    {
      id: 'winners',
      title: 'Recent Winners',
      subtitle: 'Join our winning community',
      icon: Award,
      stats: [
        { label: 'Today', value: '47', subtext: 'Winners' },
        { label: 'This Week', value: '$142K', subtext: 'Total Won' },
        { label: 'Biggest Win', value: '$5,200', subtext: '@jackson_w' },
        { label: 'Win Rate', value: '73%', subtext: 'Success Rate' }
      ],
      gradient: 'from-yellow-500 to-orange-600',
      iconBg: 'bg-yellow-500'
    },
    {
      id: 'growth',
      title: 'League Growth',
      subtitle: 'Your leagues are thriving',
      icon: TrendingUp,
      stats: [
        { label: 'Active Leagues', value: '24', subtext: 'This Season' },
        { label: 'Members', value: '3,450', subtext: 'Total Players' },
        { label: 'Growth', value: '+127%', subtext: 'This Month' },
        { label: 'Prize Pool', value: '$85K', subtext: 'Combined' }
      ],
      gradient: 'from-green-600 to-teal-700',
      iconBg: 'bg-green-500'
    }
  ];

  // Auto-scroll every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const currentBanner = banners[currentIndex];
  const Icon = currentBanner.icon;

  return (
    <div className="relative w-full mb-8">
      {/* Main Banner Container */}
      <div className={`relative overflow-hidden rounded-2xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-xl`}>
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-r ${currentBanner.gradient} opacity-10`} />
        
        {/* Content */}
        <div className="relative p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {currentBanner.title}
              </h2>
              <p className={`text-sm md:text-base ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {currentBanner.subtitle}
              </p>
            </div>
            <div className={`${currentBanner.iconBg} p-3 rounded-xl bg-opacity-20`}>
              <Icon className={`h-8 w-8 ${currentBanner.iconBg.replace('bg-', 'text-')}`} />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentBanner.stats.map((stat, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl ${
                  isDark ? 'bg-gray-900/50' : 'bg-gray-50'
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${
                  isDark ? 'text-gray-500' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
                <div className={`text-xl md:text-2xl font-bold mb-1 bg-gradient-to-r ${currentBanner.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className={`text-xs ${
                  isDark ? 'text-gray-600' : 'text-gray-500'
                }`}>
                  {stat.subtext}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
            isDark 
              ? 'bg-gray-800/80 hover:bg-gray-700 text-white' 
              : 'bg-white/80 hover:bg-white text-gray-900 shadow-lg'
          }`}
          aria-label="Previous banner"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={goToNext}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
            isDark 
              ? 'bg-gray-800/80 hover:bg-gray-700 text-white' 
              : 'bg-white/80 hover:bg-white text-gray-900 shadow-lg'
          }`}
          aria-label="Next banner"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center items-center gap-2 mt-4">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 h-2 bg-purple-600 rounded-full'
                : `w-2 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;