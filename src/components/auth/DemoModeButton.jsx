import React from 'react';
import { Zap } from 'lucide-react';

const DemoModeButton = ({ onFillDemo }) => {
  // Only show in development mode
  if (import.meta.env.PROD) return null;

  const generateTestData = () => {
    const randomNum = Math.floor(Math.random() * 10000);
    return {
      email: `demo${randomNum}@bankroll.test`,
      firstName: 'Demo',
      lastName: `User${randomNum}`,
      username: `demouser${randomNum}`,
      password: 'DemoPass123!',
      confirmPassword: 'DemoPass123!',
      phoneNumber: `555${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
      pin: '1234',
      birthday: '1990-01-01',
      onboarding: {
        experience: 'regular',
        platforms: ['fanduel', 'draftkings'],
        fantasy: 'football',
        goals: ['faster-withdrawals', 'earn-interest']
      },
      venmo: '@demouser',
      sleeper: 'demouser',
      espn: 'demouser',
      instagram: '@demouser'
    };
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => onFillDemo(generateTestData())}
        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg 
          hover:bg-yellow-400 transition-colors shadow-lg text-sm font-medium"
        title="Fill form with demo data (Dev mode only)"
      >
        <Zap className="w-4 h-4" />
        Demo Fill
      </button>
    </div>
  );
};

export default DemoModeButton;