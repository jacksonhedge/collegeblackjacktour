import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { analyticsService } from '../services/firebase/AnalyticsService';

const PartnersLanding = () => {
  const [activeCategory, setActiveCategory] = useState('SPORTSBOOK');
  const [openFaq, setOpenFaq] = useState(null);

  const categories = [
    { id: 'SPORTSBOOK', label: 'Sportsbook' },
    { id: 'CASINO', label: 'Casino' },
    { id: 'FANTASY', label: 'Fantasy Sports' },
    { id: 'SWEEPS', label: 'Sweeps Casino' },
    { id: 'LOTTERY', label: 'Lottery' }
  ];

  // All platforms organized by category
  const allPlatforms = [
    // Sportsbook Partners
    { 
      id: 'draftkings-sportsbook', 
      name: 'DraftKings Sportsbook', 
      category: 'SPORTSBOOK', 
      logo: '/images/draftkings.png',
      description: 'Premier sports betting platform',
      bonus: 'Get up to $1,500 in Bonus Bets',
      url: 'https://dksb.sng.link/As9kz/0uj4?_dl=https%3A%2F%2Fsportsbook.draftkings.com%2Fgateway%3Fs%3D471182079&pcid=414490&psn=3084&pcn=SSB18&pscn=100DB_50BB&pcrn=1&pscid=xx&pcrid=xx&wpcid=414490&wpsrc=3084&wpcn=SSB18&wpscn=100DB_50BB&wpcrn=1&wpscid=xx&wpcrid=xx&_forward_params=1'
    },
    { 
      id: 'fanduel-sportsbook', 
      name: 'FanDuel Sportsbook', 
      category: 'SPORTSBOOK', 
      logo: '/images/fanduel.png',
      description: 'America\'s #1 Sportsbook',
      bonus: 'Bet $5, Get $300 in Bonus Bets',
      url: 'https://wlfanduelus.adsrv.eacdn.com/C.ashx?btag=a_42626b_16c_&affid=5594&siteid=42626&adid=16&c=662608032'
    },
    { 
      id: 'fanatics-sportsbook', 
      name: 'Fanatics Sportsbook', 
      category: 'SPORTSBOOK', 
      logo: '/images/fanatics.png',
      description: 'Sports betting with FanCash rewards',
      bonus: 'Get up to $1,000 in Bonus Bets',
      url: 'https://track.fanaticsbettingpartners.com/track/d2ed08a4-86b2-4b78-8e8b-37ba1c9a20dd?type=seo&s1=662608032'
    },
    { 
      id: 'betmgm-sportsbook', 
      name: 'BetMGM Sportsbook', 
      category: 'SPORTSBOOK', 
      logo: '/images/betmgm.png',
      description: 'King of Sportsbooks',
      bonus: 'Get up to $1,500 paid back in Bonus Bets',
      url: 'https://sports.betmgm.com'
    },
    { 
      id: 'caesars-sportsbook', 
      name: 'Caesars Sportsbook', 
      category: 'SPORTSBOOK', 
      logo: '/images/caesars.png',
      description: 'Official sportsbook of the NFL',
      bonus: 'Get up to $1,000 on Caesars',
      url: 'https://sportsbook.caesars.com'
    },
    { 
      id: 'espn-bet', 
      name: 'ESPN BET', 
      category: 'SPORTSBOOK', 
      logo: '/images/espnBet.png',
      description: 'The ultimate sports betting experience',
      bonus: 'Get up to $1,500 in Bonus Bets',
      url: 'https://espnbet.com'
    },
    { 
      id: 'betrivers', 
      name: 'BetRivers', 
      category: 'SPORTSBOOK', 
      logo: '/images/betRivers.png',
      description: 'Get in on the action',
      bonus: 'Up to $500 2nd Chance Bet',
      url: 'https://betrivers.com'
    },

    // Casino Partners
    { 
      id: 'draftkings-casino', 
      name: 'DraftKings Casino', 
      category: 'CASINO', 
      logo: '/images/draftkingsCasino.png',
      description: 'Casino games & live dealer',
      bonus: 'Get up to $2,000 in Casino Credits',
      url: 'https://dksb.sng.link/As9kz/0uj4?_dl=https%3A%2F%2Fsportsbook.draftkings.com%2Fgateway%3Fs%3D471182079&pcid=414490&psn=3084&pcn=SSB18&pscn=100DB_50BB&pcrn=1&pscid=xx&pcrid=xx&wpcid=414490&wpsrc=3084&wpcn=SSB18&wpscn=100DB_50BB&wpcrn=1&wpscid=xx&wpcrid=xx&_forward_params=1'
    },
    { 
      id: 'fanduel-casino', 
      name: 'FanDuel Casino', 
      category: 'CASINO', 
      logo: '/images/fanduelCasino.jpg',
      description: 'Real money casino games',
      bonus: 'Play $1, Get $100 in Casino Credits',
      url: 'https://wlfanduelus.adsrv.eacdn.com/C.ashx?btag=a_42627b_50c_&affid=5594&siteid=42627&adid=50&c=662608032'
    },
    { 
      id: 'fanatics-casino', 
      name: 'Fanatics Casino', 
      category: 'CASINO', 
      logo: '/images/fanatics.png',
      description: 'Casino with FanCash rewards',
      bonus: 'Get up to $2,000 in Casino Bonuses',
      url: 'https://casino.fanatics.com'
    },
    { 
      id: 'betmgm-casino', 
      name: 'BetMGM Casino', 
      category: 'CASINO', 
      logo: '/images/betmgm.png',
      description: 'King of Casino',
      bonus: '100% Deposit Match up to $1,000',
      url: 'https://casino.betmgm.com'
    },
    { 
      id: 'caesars-casino', 
      name: 'Caesars Casino', 
      category: 'CASINO', 
      logo: '/images/caesarsCasino.png',
      description: 'Classic casino experience',
      bonus: '100% Deposit Match up to $2,500',
      url: 'https://casino.caesars.com'
    },
    { 
      id: 'borgata', 
      name: 'Borgata Casino', 
      category: 'CASINO', 
      logo: '/images/BorgataPoker.png',
      description: 'NJ\'s premier online casino',
      bonus: '$20 on the House + up to $1,000',
      url: 'https://casino.borgataonline.com'
    },

    // Fantasy Football Partners
    { 
      id: 'prizepicks', 
      name: 'PrizePicks', 
      category: 'FANTASY', 
      logo: '/images/prizepicks.png',
      description: 'Daily Fantasy Sports made simple',
      bonus: '100% Deposit Match up to $100',
      url: 'https://app.prizepicks.com/sign-up?invite_code=WINDAILY'
    },
    { 
      id: 'underdog', 
      name: 'Underdog Fantasy', 
      category: 'FANTASY', 
      logo: '/images/underdog.jpeg',
      description: 'Pick\'em & Best Ball',
      bonus: '100% Deposit Match up to $100',
      url: 'https://play.underdogfantasy.com/p-win-daily-sports'
    },
    { 
      id: 'sleeper', 
      name: 'Sleeper', 
      category: 'FANTASY', 
      logo: '/images/sleeperFantasy.png',
      description: 'Fantasy leagues & chat',
      bonus: 'Free to play season-long fantasy',
      url: 'https://sleeper.app'
    },
    { 
      id: 'espn-fantasy', 
      name: 'ESPN Fantasy', 
      category: 'FANTASY', 
      logo: '/images/espnFantasy.png',
      description: 'Fantasy sports leader',
      bonus: 'Free fantasy leagues',
      url: 'https://fantasy.espn.com'
    },
    { 
      id: 'yahoo-fantasy', 
      name: 'Yahoo Fantasy', 
      category: 'FANTASY', 
      logo: '/images/yahoofantasy.png',
      description: 'Fantasy sports & daily games',
      bonus: 'Free and paid leagues',
      url: 'https://sports.yahoo.com/fantasy'
    },
    { 
      id: 'betr-fantasy', 
      name: 'Betr Fantasy', 
      category: 'FANTASY', 
      logo: '/images/betrFantasy.png',
      description: 'Micro-betting fantasy',
      bonus: '100% Deposit Match',
      url: 'https://betr.app'
    },

    // Sweeps Casino Partners
    { 
      id: 'mcluck', 
      name: 'McLuck', 
      category: 'SWEEPS', 
      logo: '/images/mcluck.png',
      description: 'Social casino with sweeps',
      bonus: 'Get 7,500 Gold Coins + 5 SC',
      url: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5356&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BANKROLL&corid'
    },
    { 
      id: 'pulsz', 
      name: 'Pulsz', 
      category: 'SWEEPS', 
      logo: '/images/pulsz.png',
      description: 'Free-to-play social casino',
      bonus: 'Get 5,000 GC + 2.3 SC',
      url: 'https://affiliates.pulsz.com/visit/?bta=3035&nci=5348&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BANKROLL&corid'
    },
    { 
      id: 'hello-millions', 
      name: 'Hello Millions', 
      category: 'SWEEPS', 
      logo: '/images/hellomillions.png',
      description: 'Sweepstakes casino',
      bonus: 'Get 50,000 GC + 25 SC',
      url: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5357&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=BANKROLL&corid'
    },
    { 
      id: 'crown-coins', 
      name: 'Crown Coins', 
      category: 'SWEEPS', 
      logo: '/images/crowncoins.png',
      description: 'Social casino gaming',
      bonus: 'Get 100,000 GC + 2 SC',
      url: 'https://crowncoinscasino.com/?landing=direct_su&utm_source=affiliates_seo&utm_content=662608032&utm_campaign=bankroll&utm_medium=bankroll&click_id={click_id}&deal_id=cfca54e2-e98f-4225-932b-80f69267d8b2'
    },
    { 
      id: 'sportsmillions', 
      name: 'Sports Millions', 
      category: 'SWEEPS', 
      logo: '/images/sportsmillions.png',
      description: 'Sports-themed sweepstakes',
      bonus: 'Get 3,000 GC + 1.5 SC',
      url: 'https://tracking.b2-partners.com/visit/?bta=3035&nci=5414&afp={clickid}&afp1=662608032&utm_campaign=lhr&utm_creative=662608032&referred_by=PLAYBONUS&corid'
    },
    { 
      id: 'realprize', 
      name: 'RealPrize', 
      category: 'SWEEPS', 
      logo: '/images/realprize.webp',
      description: 'Win real prizes',
      bonus: 'Get 100,000 GC + 2 SC',
      url: 'https://realprize.com/?af=2255&p1=662608032'
    },
    { 
      id: 'chumba', 
      name: 'Chumba Casino', 
      category: 'SWEEPS', 
      logo: '/images/chumba.png',
      description: 'America\'s #1 social casino',
      bonus: 'Get 2M Gold Coins + 2 SC',
      url: 'https://chumbacasino.com'
    },
    { 
      id: 'luckyland', 
      name: 'LuckyLand Slots', 
      category: 'SWEEPS', 
      logo: '/images/luckyland.png',
      description: 'Social slots & sweeps',
      bonus: 'Get 7,777 GC + 10 SC',
      url: 'https://luckylandslots.com'
    },
    { 
      id: 'wow-vegas', 
      name: 'WOW Vegas', 
      category: 'SWEEPS', 
      logo: '/images/wowvegas.png',
      description: 'Social casino experience',
      bonus: 'Get 250,000 WOW Coins + 5 SC',
      url: 'https://wowvegas.com'
    },
    { 
      id: 'high5', 
      name: 'High 5 Casino', 
      category: 'SWEEPS', 
      logo: '/images/high5.png',
      description: 'Social casino with real prizes',
      bonus: 'Get 250 GC + 5 SC',
      url: 'https://high5casino.com'
    },

    // Lottery Partners
    { 
      id: 'jackpocket', 
      name: 'Jackpocket', 
      category: 'LOTTERY', 
      logo: '/images/jackpocket.png',
      description: 'Official lottery app',
      bonus: 'Coming Soon',
      url: 'https://jackpocket.com'
    }
  ];

  const handlePlatformClick = (platform) => {
    analyticsService.logPlatformView(platform.id, platform.name, platform.category);
    if (platform.url) {
      window.open(platform.url, '_blank', 'noopener,noreferrer');
    }
  };

  const filteredPlatforms = allPlatforms.filter(
    platform => platform.category === activeCategory
  );

  const faqs = [
    {
      q: "How does Bankroll work with partners?",
      a: "Bankroll partners with leading sports betting, casino, and fantasy platforms to give you instant access to your winnings. You can transfer funds between platforms or withdraw to your bank instantly."
    },
    {
      q: "Are these affiliate links?",
      a: "Yes, we use affiliate partnerships to keep Bankroll free for users. When you sign up through our links, you get exclusive bonuses and we receive a commission that helps us maintain and improve our service."
    },
    {
      q: "Which states are these platforms available in?",
      a: "Availability varies by platform and state regulations. Each platform will show you their available states when you visit their site. Most major platforms operate in 20+ states."
    },
    {
      q: "How do I get the sign-up bonuses?",
      a: "Simply click on any partner card to visit their site. The bonus will be automatically applied when you sign up through our link and make your first deposit."
    },
    {
      q: "Can I connect multiple platforms to Bankroll?",
      a: "Yes! You can connect all your sports betting, casino, and fantasy accounts to Bankroll for easy fund management across all platforms."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background - Orange & Purple */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-orange-800">
        <div className="absolute inset-0 bg-wavy-gradient opacity-60"></div>
      </div>
      
      {/* Animated blob shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-lava-1"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-lava-2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-2xl animate-lava-3"></div>
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-black/70 backdrop-blur-md z-50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <Link to="/" className="text-2xl font-bold text-white">
                  Bankroll
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  to="/"
                  className="text-white/90 hover:text-white px-4 py-2 text-sm font-medium"
                >
                  Home
                </Link>
                <Link 
                  to="/login"
                  className="text-white/90 hover:text-white px-4 py-2 text-sm font-medium"
                >
                  Log in
                </Link>
                <Link 
                  to="/signup"
                  className="bg-[#5B3A9B] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#4A2F82] transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Remove hero section - go straight to categories */}

        {/* Category Tabs */}
        <section className="pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-3 flex-wrap justify-center">
              {categories.map((category) => {
                const count = allPlatforms.filter(p => p.category === category.id).length;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`
                      px-8 py-3 rounded-full text-base font-semibold transition-all duration-200 flex items-center gap-2 transform hover:scale-105
                      ${activeCategory === category.id 
                        ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg' 
                        : 'bg-black/40 backdrop-blur-sm text-white hover:bg-black/50 border border-white/20'}
                    `}
                  >
                    {category.label}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeCategory === category.id 
                        ? 'bg-white/20' 
                        : 'bg-white/10'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Partners Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlatforms.map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => handlePlatformClick(platform)}
                  className="bg-white/20 backdrop-blur-md rounded-xl p-6 hover:bg-white/25 transition-all duration-200 cursor-pointer group border border-white/30 hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-20 h-20 bg-white/10 rounded-lg p-3 flex items-center justify-center">
                      <img
                        src={platform.logo}
                        alt={platform.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.innerHTML = `<span class="text-white font-bold">${platform.name.split(' ')[0]}</span>`;
                        }}
                      />
                    </div>
                    <ExternalLink className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {platform.name}
                  </h3>
                  <p className="text-white/80 text-sm mb-3">
                    {platform.description}
                  </p>
                  
                  {platform.bonus && (
                    <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
                      <p className="text-white font-medium text-sm">
                        {platform.bonus}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white/10 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white/20 backdrop-blur-md rounded-lg border border-white/30">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/10 transition-colors"
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

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to start winning with Bankroll?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Join thousands who are already enjoying instant withdrawals and exclusive bonuses.
            </p>
            <Link 
              to="/signup"
              className="inline-block bg-[#5B3A9B] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#4A2F82] transition-colors shadow-lg"
            >
              Create Your Free Account
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-white/70">
              © 2024 Bankroll. All rights reserved. | 
              <a href="/terms" className="hover:text-white ml-1">Terms</a> | 
              <a href="/privacy" className="hover:text-white ml-1">Privacy</a>
              <p className="mt-4 text-xs text-white/50">
                Gambling Problem? Call 1-800-GAMBLER. Must be 21+ to participate.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PartnersLanding;