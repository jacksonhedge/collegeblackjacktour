import React from 'react';

const InfoPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-12">About College Blackjack Tour</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-white/90 mb-4">
            The College Blackjack Tour brings the excitement of competitive blackjack to college campuses across the nation. 
            We partner with fraternities and student organizations to create unforgettable tournament experiences.
          </p>
          <p className="text-white/90">
            Our goal is to provide a safe, fun, and competitive environment where students can test their skills, 
            win amazing prizes, and create lasting memories.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="text-2xl font-bold text-white mr-4">1.</span>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Sign Up</h3>
                <p className="text-white/90">Register for tournaments at your college or nearby campuses.</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl font-bold text-white mr-4">2.</span>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Compete</h3>
                <p className="text-white/90">Play in professionally organized blackjack tournaments with standardized rules.</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl font-bold text-white mr-4">3.</span>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Win</h3>
                <p className="text-white/90">Top players win cash prizes, merchandise, and championship qualifications.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Tournament Rules</h2>
          <ul className="list-disc list-inside text-white/90 space-y-2">
            <li>Standard blackjack rules apply</li>
            <li>Tournament chips have no cash value</li>
            <li>Buy-ins support charity and prize pools</li>
            <li>Professional dealers and equipment</li>
            <li>Fair play monitored by tournament directors</li>
          </ul>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
          <div className="space-y-2 text-white/90">
            <p>Email: <a href="mailto:jackson@hedgepayments.com" className="text-white hover:underline">jackson@hedgepayments.com</a></p>
            <p>Phone: Coming Soon</p>
            <p>Follow us on social media for updates!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;