import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Menu, X, Handshake, CreditCard, Banknote, Wallet, Trophy, Bitcoin, TrendingUp, PiggyBank, LineChart, Building2, Shield } from 'lucide-react';
import Footer from '../layout/Footer';

const LandingPage = () => {
  const { currentUser, loading } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const heroSlides = [
    {
      title: "Easy and Fast Withdrawals",
      subtitle: "Get your sports betting winnings instantly",
      description: "No more waiting days for payouts. Transfer winnings from your favorite platforms to your bank in seconds.",
      cta: "Start withdrawing faster",
      partners: [
        { name: "DraftKings", logo: "/images/draftkings.png" },
        { name: "FanDuel", logo: "/images/fanduel.png" },
        { name: "Underdog", logo: "/images/underdog.png" },
        { name: "PrizePicks", logo: "/images/prizepicks.png" },
        { name: "Fanatics", logo: "/images/fanatics.png" }
      ]
    },
    {
      title: "Invest Your Fantasy Football Dues",
      subtitle: "Turn league fees into investments",
      description: "Don't let your season-long fantasy dues sit idle. Automatically invest them and watch your money grow throughout the season.",
      cta: "Start investing today",
      partners: [
        { name: "Sleeper", logo: "/images/sleeperFantasy.png" },
        { name: "ESPN", logo: "/images/espnFantasy.png" },
        { name: "Yahoo", logo: "/images/yahoofantasy.png" },
        { name: "CBS", logo: "/images/cbs.png" }
      ]
    },
    {
      title: "Earn on Every Balance",
      subtitle: "Your betting bankroll works 24/7",
      description: "Every dollar in your Bankroll account earns interest. Make money even when you're not placing bets.",
      cta: "Start earning now",
      icon: "💰"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 10000); // Increased to 10 seconds
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#9D8CDB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5B3A9B]"></div>
      </div>
    );
  }

  const benefits = [
    {
      title: "Get your sports betting winnings fast",
      description: "Instant withdrawals from all major sportsbooks. No more waiting days for your money.",
      icon: "⚡"
    },
    {
      title: "Earn money on your bets passively",
      description: "Your idle betting balance earns interest automatically while you decide your next play.",
      icon: "💰"
    },
    {
      title: "Invest your Fantasy Football dues",
      description: "Turn league dues into investments. Keep growing your money during and after the season.",
      icon: "📈"
    }
  ];

  const faqs = [
    {
      q: "How does Bankroll work?",
      a: "Bankroll connects all your sports betting and fantasy accounts in one place. You can instantly transfer winnings, earn interest on idle balances, and invest your fantasy dues."
    },
    {
      q: "Is my money safe?",
      a: "Yes. We use bank-level encryption and partner with FDIC-insured institutions. Your funds are as secure as they would be in a traditional bank."
    },
    {
      q: "Which platforms are supported?",
      a: "We support 30+ platforms including DraftKings, FanDuel, BetMGM, Caesars, ESPN Fantasy, and more."
    },
    {
      q: "How fast are withdrawals?",
      a: "Withdrawals are instant. As soon as you request a transfer, the money is available in your Bankroll account."
    },
    {
      q: "What are the fees?",
      a: "Bankroll is free to use. We make money through partnerships with sportsbooks and from the spread on investment products."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0">
        <div className="h-screen bg-white"></div>
        <div className="bg-black">
          <div className="bg-wavy-gradient opacity-80"></div>
        </div>
      </div>
      
      {/* Wavy overlay shapes for lower sections */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-full -left-1/2 w-full h-full bg-purple-600/30 rounded-full blur-3xl animate-lava-1"></div>
        <div className="absolute top-full -right-1/2 w-full h-full bg-orange-500/30 rounded-full blur-3xl animate-lava-2"></div>
        <div className="absolute top-[150%] right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-2xl animate-lava-3"></div>
        <div className="absolute top-[150%] left-1/4 w-96 h-96 bg-orange-400/20 rounded-full blur-2xl animate-lava-4"></div>
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-3">
                  <img 
                    src="/images/BankrollLogoNew.png" 
                    alt="Bankroll" 
                    className="h-14 w-auto"
                  />
                  <span className="text-white text-2xl font-bold tracking-wide">BANKROLL</span>
                </Link>
              </div>
              
              {/* Center Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {/* Personal Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === 'personal' ? null : 'personal')}
                    className="flex items-center text-white hover:text-white/80 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Personal
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  {openDropdown === 'personal' && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl">
                      <Link to="/partners" className="flex items-center px-4 py-3 text-sm text-gray-900 hover:bg-gray-50">
                        <Handshake className="w-4 h-4 mr-3 text-blue-600" />
                        Partners
                      </Link>
                      <Link to="/deposits" className="flex items-center px-4 py-3 text-sm text-gray-900 hover:bg-gray-50">
                        <Banknote className="w-4 h-4 mr-3 text-green-600" />
                        Deposits
                      </Link>
                      <Link to="/withdrawals" className="flex items-center px-4 py-3 text-sm text-gray-900 hover:bg-gray-50">
                        <Wallet className="w-4 h-4 mr-3 text-purple-600" />
                        Withdrawals
                      </Link>
                      <Link to="/fantasy" className="flex items-center px-4 py-3 text-sm text-gray-900 hover:bg-gray-50">
                        <Trophy className="w-4 h-4 mr-3 text-yellow-600" />
                        Season Long Fantasy
                      </Link>
                      <Link to="/crypto" className="flex items-center px-4 py-3 text-sm text-gray-900 hover:bg-gray-50">
                        <Bitcoin className="w-4 h-4 mr-3 text-orange-600" />
                        Crypto
                      </Link>
                      <Link to="/stocks" className="flex items-center px-4 py-3 text-sm text-gray-900 hover:bg-gray-50">
                        <TrendingUp className="w-4 h-4 mr-3 text-blue-600" />
                        Stock Trading
                      </Link>
                      <Link to="/savings" className="flex items-center px-4 py-3 text-sm text-gray-900 hover:bg-gray-50">
                        <PiggyBank className="w-4 h-4 mr-3 text-pink-600" />
                        Savings
                      </Link>
                      <Link to="/futures" className="flex items-center px-4 py-3 text-sm text-gray-900 hover:bg-gray-50">
                        <LineChart className="w-4 h-4 mr-3 text-indigo-600" />
                        Futures
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Business Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === 'business' ? null : 'business')}
                    className="flex items-center text-white hover:text-white/80 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Business
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  {openDropdown === 'business' && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl">
                      <Link to="/business-partners" className="flex items-center px-4 py-3 text-sm text-gray-900 hover:bg-gray-50">
                        <Building2 className="w-4 h-4 mr-3 text-blue-600" />
                        Partners
                      </Link>
                      <Link to="/fantasy-plaque" className="flex items-center px-4 py-3 text-sm text-gray-900 hover:bg-gray-50">
                        <Trophy className="w-4 h-4 mr-3 text-yellow-600" />
                        Fantasy Plaque
                      </Link>
                      <Link to="/admin" className="flex items-center px-4 py-3 text-sm text-gray-900 hover:bg-gray-50">
                        <Shield className="w-4 h-4 mr-3 text-red-600" />
                        Admin Portal
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Developer Tab */}
                <Link 
                  to="/developers"
                  className="text-white hover:text-white/80 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Developer
                </Link>
              </div>
              
              {/* Right Side - Auth Buttons */}
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login"
                  className="text-white hover:text-white/80 px-4 py-2 text-sm font-medium transition-all"
                >
                  Log in
                </Link>
                <Link 
                  to="/signup"
                  className="bg-lime-400 text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-lime-500 transition-all"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Announcement Banner */}
        <div className="fixed top-20 w-full bg-lime-400 text-black py-2 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-medium">
              It's Bankroll Season. Unlock limited-time offers in your app. 
              <a href="#" className="underline ml-1 font-semibold">Learn more</a>.
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center relative pt-32 overflow-hidden">
          {/* Animated gradient background - Light lavender and mint green */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50 to-emerald-50 animate-gradient-shift"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-purple-100/30 to-emerald-100/40 animate-gradient-shift-reverse"></div>
          </div>
          
          <div className="relative z-10 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left side - Text */}
                <div className="flex items-center justify-center md:justify-start">
                  <h1 className="text-7xl md:text-8xl lg:text-9xl font-light text-gray-900 drop-shadow-lg">
                    Easy Money.
                  </h1>
                </div>

                {/* Right side - Bigger Image */}
                <div className="relative">
                  <div className="w-full max-w-2xl mx-auto flex items-center justify-center">
                    <img 
                      src="/images/BankrollImageLandingPage.png" 
                      alt="Bankroll - For The Win" 
                      className="w-full h-auto max-h-[600px] object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gradient Transition */}
        <div className="relative h-32 bg-gradient-to-b from-white to-transparent"></div>

        {/* Original Hero Section with Carousel */}
        <section className="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-purple-900/90 via-purple-800/90 to-orange-800/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="relative">
              {/* Sliding Carousel Container */}
              <div className="relative h-[700px] overflow-hidden">
                <div 
                  className="flex carousel-slide h-full"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {heroSlides.map((slide, index) => (
                    <div key={index} className="w-full flex-shrink-0 flex items-center justify-center">
                      <div className="w-full max-w-7xl px-4">
                        {/* Slide 1: Easy and Fast Withdrawals */}
                        {index === 0 && (
                          <div className="text-center">
                            <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
                              {slide.title}
                            </h1>
                            <p className="text-2xl text-white/90 mb-4">
                              {slide.subtitle}
                            </p>
                            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
                              {slide.description}
                            </p>
                            
                            {/* Placeholder for withdrawal image */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8 max-w-4xl mx-auto">
                              <div className="h-64 bg-white/20 rounded-lg flex items-center justify-center">
                                <span className="text-white/60 text-lg">[Withdrawal Process Image Coming Soon]</span>
                              </div>
                            </div>
                            
                            {/* Partner Logos */}
                            <div className="flex justify-center items-center gap-4 flex-wrap mb-8">
                              {slide.partners.map((partner, pIndex) => (
                                <div key={pIndex} className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                                  <img 
                                    src={partner.logo} 
                                    alt={partner.name}
                                    className="h-12 w-auto object-contain"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.parentElement.innerHTML = `<span class="text-sm font-medium text-white">${partner.name}</span>`;
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Slide 2: Invest Your Fantasy Football Dues */}
                        {index === 1 && (
                          <div>
                            <div className="text-center mb-8">
                              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                                {slide.title}
                              </h1>
                              <p className="text-2xl text-white/90 mb-2">
                                {slide.subtitle}
                              </p>
                              <p className="text-lg text-white/80 max-w-3xl mx-auto">
                                {slide.description}
                              </p>
                            </div>
                            
                            {/* Two column layout for fantasy league and portfolio */}
                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                              {/* Fantasy League Image */}
                              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <h3 className="text-xl font-semibold text-white mb-4">Your Fantasy League</h3>
                                <div className="h-64 bg-white/20 rounded-lg flex items-center justify-center">
                                  <span className="text-white/60 text-sm">[Fantasy Football League Image Coming Soon]</span>
                                </div>
                              </div>
                              
                              {/* Stock Portfolio */}
                              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <h3 className="text-xl font-semibold text-white mb-4">League Stock Portfolio</h3>
                                <div className="h-64 bg-white/20 rounded-lg flex items-center justify-center">
                                  <span className="text-white/60 text-sm">[Stock Portfolio Image Coming Soon]</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Partner Logos */}
                            <div className="flex justify-center items-center gap-4 flex-wrap">
                              {slide.partners.map((partner, pIndex) => (
                                <div key={pIndex} className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                                  <img 
                                    src={partner.logo} 
                                    alt={partner.name}
                                    className="h-10 w-auto object-contain"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.parentElement.innerHTML = `<span class="text-sm font-medium text-white">${partner.name}</span>`;
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Slide 3: Earn on Every Balance */}
                        {index === 2 && (
                          <div className="text-center">
                            <div className="text-6xl mb-6">{slide.icon}</div>
                            <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
                              {slide.title}
                            </h1>
                            <p className="text-2xl text-white/90 mb-4">
                              {slide.subtitle}
                            </p>
                            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
                              {slide.description}
                            </p>
                            
                            {/* Investment flow visualization */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-4xl mx-auto">
                              <h3 className="text-xl font-semibold text-white mb-4">Your Sportsbook Funds Working For You</h3>
                              <div className="h-64 bg-white/20 rounded-lg flex items-center justify-center">
                                <span className="text-white/60 text-lg">[Sportsbook to Investment Flow Image Coming Soon]</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* CTAs for all slides */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                          <Link 
                            to="/signup"
                            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg transform hover:scale-105"
                          >
                            {slide.cta}
                          </Link>
                          <a 
                            href="#benefits"
                            className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-medium border border-white/30 hover:bg-white/30 transition-colors"
                          >
                            Learn more
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Slide Indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
              <ChevronDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gradient-to-b from-purple-900/60 to-orange-900/60 backdrop-blur-sm" id="benefits">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Built for sports bettors
              </h2>
              <p className="text-lg text-white/90">
                Everything you need to manage your betting bankroll in one place
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-black/40 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:bg-black/50 border border-white/20">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-white/90">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Simple as 1-2-3
              </h2>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-12">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Connect your accounts
                    </h3>
                    <p className="text-white/90">
                      Link your DraftKings, FanDuel, BetMGM, and other betting accounts securely.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Transfer instantly
                    </h3>
                    <p className="text-white/90">
                      Move winnings between platforms or to your bank account with one tap.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Watch your money grow
                    </h3>
                    <p className="text-white/90">
                      Earn interest on idle balances and invest fantasy dues automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 bg-gradient-to-b from-orange-900/60 to-purple-900/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-2">30+</div>
                <div className="text-white/90">Supported platforms</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">Instant</div>
                <div className="text-white/90">Withdrawals</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">FDIC</div>
                <div className="text-white/90">Insured deposits</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">$0</div>
                <div className="text-white/90">Monthly fees</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Frequently asked questions
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-black/40 backdrop-blur-md rounded-lg border border-white/20">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-black/30 transition-colors"
                  >
                    <span className="font-medium text-white">{faq.q}</span>
                    <ChevronDown 
                      className={`w-5 h-5 text-white/80 transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-white/90">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-20 bg-gradient-to-b from-purple-900/60 to-pink-900/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Our Partners
              </h2>
              <p className="text-lg text-white/90 max-w-3xl mx-auto">
                We work with the industry's leading platforms to give you instant access to your money everywhere
              </p>
            </div>
            
            {/* Partners Grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6 mb-12">
              {/* Sportsbooks */}
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center hover:bg-black/50 transition-colors">
                <img src="/images/draftkings.png" alt="DraftKings" className="h-12 w-auto object-contain" />
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center hover:bg-black/50 transition-colors">
                <img src="/images/fanduel.png" alt="FanDuel" className="h-12 w-auto object-contain" />
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center hover:bg-black/50 transition-colors">
                <img src="/images/betmgm.png" alt="BetMGM" className="h-12 w-auto object-contain" />
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center hover:bg-black/50 transition-colors">
                <img src="/images/caesars.png" alt="Caesars" className="h-12 w-auto object-contain" />
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center hover:bg-black/50 transition-colors">
                <img src="/images/espnBet.png" alt="ESPN Bet" className="h-12 w-auto object-contain" />
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center hover:bg-black/50 transition-colors">
                <img src="/images/fanatics.png" alt="Fanatics" className="h-12 w-auto object-contain" />
              </div>
              
              {/* Fantasy Platforms */}
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center hover:bg-black/50 transition-colors">
                <img src="/images/prizepicks.png" alt="PrizePicks" className="h-12 w-auto object-contain" />
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center hover:bg-black/50 transition-colors">
                <img src="/images/underdog.png" alt="Underdog" className="h-12 w-auto object-contain" />
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center hover:bg-black/50 transition-colors">
                <img src="/images/sleeperFantasy.png" alt="Sleeper" className="h-12 w-auto object-contain" />
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center hover:bg-black/50 transition-colors">
                <img src="/images/espnFantasy.png" alt="ESPN Fantasy" className="h-12 w-auto object-contain" />
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center hover:bg-black/50 transition-colors">
                <img src="/images/yahoofantasy.png" alt="Yahoo Fantasy" className="h-12 w-auto object-contain" />
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center hover:bg-black/50 transition-colors">
                <div className="text-white font-semibold">30+ More</div>
              </div>
            </div>
            
            <div className="text-center">
              <Link 
                to="/partners"
                className="inline-block bg-black/40 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-medium border border-white/30 hover:bg-black/50 transition-colors"
              >
                View All Partners →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-900/70 via-pink-900/70 to-orange-900/70 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to make your money work harder?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Join thousands of sports bettors who are earning more with Bankroll.
            </p>
            <Link 
              to="/signup"
              className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 transition-all shadow-lg transform hover:scale-105"
            >
              Get your $25 bonus
            </Link>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;