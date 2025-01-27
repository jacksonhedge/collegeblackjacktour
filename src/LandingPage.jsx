import React from 'react';

// Partners data
const partners = [
  {
    name: 'MyPrize Casino',
    logo: '/partners/myprize.jpg'
  },
  {
    name: 'Sleeper Fantasy',
    logo: '/partners/sleeper.png'
  },
  {
    name: 'Bankroll',
    logo: '/partners/bankroll.png'
  }
];

const LandingPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-700 via-gray-900 to-black animate-gradient-xy pt-16">
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-20 px-4">
        <div className="max-w-4xl w-full flex flex-col items-center space-y-12">
          <img 
            src="/CCT_Logo_1.png" 
            alt="CCT Logo" 
            className="w-72 md:w-[450px] animate-float drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]"
          />
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest animate-float drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] text-center">
            COMING SOON
          </h1>
        </div>
      </div>

      {/* Partners Section */}
      <div className="w-full bg-black/40 backdrop-blur-lg py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Our Partners</h2>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {partners.map((partner) => (
              <div 
                key={partner.name}
                className="bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center p-8 transition-all duration-300 aspect-video"
              >
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className={`max-w-full max-h-full object-contain ${partner.name === 'Bankroll' ? 'scale-120' : ''}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="w-full bg-black/60 backdrop-blur-lg py-12 px-4 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold mb-4">COMPANY</h3>
            <div className="space-y-2">
              <div className="text-gray-300 text-sm">About CCL</div>
              <div className="text-gray-300 text-sm">Contact Us</div>
              <div className="text-gray-300 text-sm">Terms of Use</div>
              <div className="text-gray-300 text-sm">Privacy Policy</div>
            </div>
          </div>

          {/* Tournaments */}
          <div>
            <h3 className="text-white font-bold mb-4">TOURNAMENTS</h3>
            <div className="space-y-2">
              <div className="text-gray-300 text-sm">Upcoming Events</div>
              <div className="text-gray-300 text-sm">Past Events</div>
              <div className="text-gray-300 text-sm">Rules & Guidelines</div>
              <div className="text-gray-300 text-sm">Prize Information</div>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold mb-4">RESOURCES</h3>
            <div className="space-y-2">
              <div className="text-gray-300 text-sm">How to Play</div>
              <div className="text-gray-300 text-sm">FAQ</div>
              <div className="text-gray-300 text-sm">Support</div>
              <div className="text-gray-300 text-sm">Responsible Gaming</div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">CONTACT</h3>
            <div className="space-y-2">
              <div className="text-gray-300 text-sm">Email: info@ccl.com</div>
              <div className="text-gray-300 text-sm">Support: 1-800-SUPPORT</div>
              <div className="text-gray-300 text-sm">Hours: 24/7</div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Collegiate Casino League. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
