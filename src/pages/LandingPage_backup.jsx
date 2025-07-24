import React, { useState } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';
import PlatformModal from '../components/platforms/PlatformModal';
import { analyticsService } from '../services/firebase/AnalyticsService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { usePlatforms } from '../contexts/PlatformsContext';

const LandingPage = () => {
  const { currentUser, loading } = useAuth();
  const { platforms, platformImages, imagesLoading, imagesLoaded, imageErrors, totalPlatforms, categories, observeElement } = usePlatforms();
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [activeCategory, setActiveCategory] = useState('SWEEPS_CASINO');

  const handlePlatformClick = (platform) => {
    if (currentUser) {
      analyticsService.logPlatformView(platform.id, platform.name, platform.category);
    }
    setSelectedPlatform(platform);
  };

  // Early return with minimal content while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <LoadingSpinner size="lg" color="lime" text="Loading Bankroll..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 backdrop-blur-md sticky top-0 z-50 bg-white/95 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            {/* Left section - Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <img
                  src="/images/BankrollLogoTransparent.png"
                  alt="Bankroll Logo"
                  className="h-8 sm:h-10 w-auto"
                  onError={(e) => {
                    console.error('Failed to load logo, trying fallback');
                    e.target.src = '/assets/BankrollLogoTransparent.png';
                    // If that fails too, use a text fallback
                    e.target.onerror = () => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML += '<span class="text-xl font-bold text-lime-500">Bankroll</span>';
                    };
                  }}
                />
              </Link>
            </div>

            {/* Right section - Auth Buttons */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Always show these buttons regardless of login state */}
              <Link 
                to="/login"
                className="px-4 py-2 text-sm sm:text-base text-gray-800 hover:text-lime-600 transition-colors duration-300"
              >
                Log in
              </Link>
              <Link 
                to="/signup"
                className="px-5 py-2.5 bg-lime-500 text-sm sm:text-base text-white rounded-lg hover:bg-lime-600 transition-all duration-300 shadow-lg hover:shadow-lime-500/25"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-20">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-green-500">
            Welcome to Bankroll
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
            Seamless payment solutions for businesses with advanced security and real-time tracking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          <Card className="bg-white border border-gray-200 hover:border-lime-400 transition-all duration-300 shadow-lg hover:shadow-lime-500/10 rounded-xl">
            <CardHeader>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">Online Payments</h2>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-base sm:text-lg text-gray-600 mb-4">Accept payments online with our secure and reliable payment gateway. Supports credit cards, digital wallets, and bank transfers.</p>
              <p className="text-sm text-gray-500 mb-8">Multi-currency support with real-time fraud protection</p>
              {currentUser ? (
                <Link to="/wallets" className="inline-block bg-lime-500 text-white px-6 py-3 rounded-lg hover:bg-lime-600 transition-all duration-300 shadow-lg hover:shadow-lime-500/25 text-sm sm:text-base">
                  View Dashboard
                </Link>
              ) : (
                <Link to="/login" className="inline-block bg-lime-500 text-white px-6 py-3 rounded-lg hover:bg-lime-600 transition-all duration-300 shadow-lg hover:shadow-lime-500/25 text-sm sm:text-base">
                  Get Started
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:border-lime-400 transition-all duration-300 shadow-lg hover:shadow-lime-500/10 rounded-xl">
            <CardHeader>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">Invoice Management</h2>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-base sm:text-lg text-gray-600 mb-8">Create, send, and track invoices effortlessly with our intuitive dashboard</p>
              {currentUser ? (
                <Link to="/leagues" className="inline-block bg-lime-500 text-white px-6 py-3 rounded-lg hover:bg-lime-600 transition-all duration-300 shadow-lg hover:shadow-lime-500/25 text-sm sm:text-base">
                  View Invoices
                </Link>
              ) : (
                <Link to="/login" className="inline-block bg-lime-500 text-white px-6 py-3 rounded-lg hover:bg-lime-600 transition-all duration-300 shadow-lg hover:shadow-lime-500/25 text-sm sm:text-base">
                  Get Started
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:border-lime-400 transition-all duration-300 shadow-lg hover:shadow-lime-500/10 rounded-xl">
            <CardHeader>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">Subscription Billing</h2>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-base sm:text-lg text-gray-600 mb-8">Set up recurring payments and manage subscriptions with ease</p>
              {currentUser ? (
                <Link to="/friends" className="inline-block bg-lime-500 text-white px-6 py-3 rounded-lg hover:bg-lime-600 transition-all duration-300 shadow-lg hover:shadow-lime-500/25 text-sm sm:text-base">
                  Manage Subscriptions
                </Link>
              ) : (
                <Link to="/login" className="inline-block bg-lime-500 text-white px-6 py-3 rounded-lg hover:bg-lime-600 transition-all duration-300 shadow-lg hover:shadow-lime-500/25 text-sm sm:text-base">
                  Get Started
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-20 sm:mt-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-green-500">
            Payment Methods
          </h2>
          
          {/* Category Tabs - Improved scrollable container for mobile */}
          <div className="overflow-x-auto pb-2 mb-8 -mx-4 px-4">
            <div className="flex gap-3 justify-center min-w-max mx-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap
                    ${activeCategory === category.id 
                      ? 'bg-lime-500 text-white shadow-lg shadow-lime-500/25' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-lg hover:shadow-gray-200/10'}
                  `}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {imagesLoading && (
          <div className="flex justify-center my-12">
            <LoadingSpinner 
              size="lg"
              color="lime" 
              text={`Loading payment methods... ${Math.round((imagesLoaded / totalPlatforms) * 100)}%`}
            />
          </div>
        )}

        {/* Payment Methods Grid - Improved responsive layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 max-w-7xl mx-auto px-2 sm:px-4">
          {(activeCategory === 'ALL' 
            ? [...platforms]
                .sort((a, b) => {
                  if (a.name === 'PlayStar Casino NJ') return -1;
                  if (b.name === 'PlayStar Casino NJ') return 1;
                  if (a.name === 'Pulsz') return -1;
                  if (b.name === 'Pulsz') return 1;
                  const categoryOrder = {
                    FANTASY: 1,
                    CASINO: 2,
                    SPORTS: 3,
                    SWEEPS_CASINO: 4
                  };
                  return categoryOrder[a.category] - categoryOrder[b.category];
                })
            : platforms.filter(platform => {
                if (platform.category === activeCategory) {
                  if (activeCategory === 'SWEEPS_CASINO') {
                    return !platform.disabled;
                  }
                  return true;
                }
                return false;
              })
          ).map((platform) => (
            <Card 
              key={platform.id}
              className={`
                ${platform.name === 'PlayStar Casino NJ' 
                  ? 'bg-lime-50 shadow-lg shadow-lime-500/10' 
                  : platform.disabled
                    ? 'bg-gray-100 opacity-70'
                    : 'bg-white'
                } 
                border border-gray-200 
                ${!platform.disabled && 'hover:border-lime-400 hover:shadow-lg hover:shadow-lime-500/10'} 
                transition-all duration-300 
                ${!platform.disabled && 'cursor-pointer'}
                rounded-xl
              `}
              onClick={() => !platform.disabled && handlePlatformClick(platform)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[180px] sm:min-h-[220px]">
                <div 
                  className="w-20 h-20 sm:w-28 sm:h-28 mb-4 sm:mb-6 relative flex items-center justify-center"
                  ref={(el) => {
                    // Only observe non-priority platforms that don't have images loaded yet
                    if (el && !platform.priority && !platformImages[platform.id]) {
                      // Use the new observer function
                      if (typeof observeElement === 'function') {
                        observeElement(el, platform.id);
                      }
                    }
                  }}
                >
                  {imagesLoading && !platformImages[platform.id] ? (
                    <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse" />
                  ) : platformImages[platform.id] ? (
                    <img
                      src={platformImages[platform.id]}
                      alt={platform.name}
                      className="w-full h-full object-contain rounded-lg"
                      loading="lazy"
                      decoding="async"
                      fetchpriority={platform.priority ? "high" : "low"}
                      onError={(e) => {
                        console.error(`Failed to load image for ${platform.name}`);
                        // Try direct path as fallback
                        if (platform.imageFile && !e.target.src.includes(platform.imageFile)) {
                          e.target.src = `/images/${platform.imageFile}`;
                        } else {
                          // Use placeholder as last resort
                          try {
                            // Simple letter fallback (faster than SVG generation)
                            const letter = platform.name.charAt(0).toUpperCase();
                            const color = {
                              a: '#84cc16', b: '#84cc16', c: '#84cc16', d: '#84cc16', e: '#84cc16',
                              f: '#84cc16', g: '#84cc16', h: '#84cc16', i: '#84cc16', j: '#84cc16',
                              k: '#84cc16', l: '#84cc16', m: '#84cc16', n: '#84cc16', o: '#84cc16',
                              p: '#84cc16', q: '#84cc16', r: '#84cc16', s: '#84cc16', t: '#84cc16',
                              u: '#84cc16', v: '#84cc16', w: '#84cc16', x: '#84cc16', y: '#84cc16',
                              z: '#84cc16'
                            }[platform.name.charAt(0).toLowerCase()] || '#84cc16';
                            
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = `
                              <div class="w-full h-full rounded-lg flex items-center justify-center" style="background-color: ${color}">
                                <span class="text-2xl font-bold text-white">${letter}</span>
                              </div>
                            `;
                          } catch (err) {
                            console.error('Failed to create fallback', err);
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg flex items-center justify-center" style={{ 
                      backgroundColor: {
                        a: '#84cc16', b: '#84cc16', c: '#84cc16', d: '#84cc16', e: '#84cc16',
                        f: '#84cc16', g: '#84cc16', h: '#84cc16', i: '#84cc16', j: '#84cc16',
                        k: '#84cc16', l: '#84cc16', m: '#84cc16', n: '#84cc16', o: '#84cc16',
                        p: '#84cc16', q: '#84cc16', r: '#84cc16', s: '#84cc16', t: '#84cc16',
                        u: '#84cc16', v: '#84cc16', w: '#84cc16', x: '#84cc16', y: '#84cc16',
                        z: '#84cc16'
                      }[platform.name.charAt(0).toLowerCase()] || '#84cc16'
                    }}>
                      <span className="text-2xl font-bold text-white">{platform.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-gray-900 text-base sm:text-lg">
                    {platform.name}
                  </h3>
                  {platform.disabled && (
                    <p className="text-gray-500 text-sm mt-2">{platform.disabledText}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Modal */}
        {selectedPlatform && (
          <PlatformModal
            platform={{
              ...selectedPlatform,
              logo: platformImages[selectedPlatform.id]
            }}
            onClose={() => setSelectedPlatform(null)}
          />
        )}

        <div className="mt-20 sm:mt-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-900">Ready to get started?</h2>
          {currentUser ? (
            <Link 
              to="/partners" 
              className="inline-block bg-lime-500 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-lime-600 transition-all duration-300 shadow-lg hover:shadow-lime-500/25"
            >
              View Payment Options
            </Link>
          ) : (
            <Link 
              to="/signup" 
              className="inline-block bg-lime-500 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-lime-600 transition-all duration-300 shadow-lg hover:shadow-lime-500/25"
            >
              Create Account
            </Link>
          )}
        </div>

        {/* Security Footer */}
        <div className="mt-12 text-center text-sm sm:text-base text-gray-500 px-4 max-w-3xl mx-auto">
          Secure Payments: All transactions are protected with industry-leading encryption and security standards.
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
