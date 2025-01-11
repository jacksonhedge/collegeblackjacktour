import React from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500 animate-gradient-xy pt-16">
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-7xl md:text-9xl font-black text-white tracking-widest animate-float drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
          COMING SOON
        </h1>
      </div>

      {/* Ticker Tape */}
      <div className="absolute bottom-0 w-full bg-black/30 backdrop-blur-lg py-10">
        <div className="ticker-container overflow-hidden">
          <div className="flex space-x-40 animate-ticker">
            {/* Repeat the logos three times to ensure smooth looping */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-40 whitespace-nowrap">
                <div className="w-52 h-28 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  MyPrize Casino
                </div>
                <div className="w-52 h-28 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  Sleeper Fantasy
                </div>
                <div className="w-52 h-28 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  Locker Fantasy
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
