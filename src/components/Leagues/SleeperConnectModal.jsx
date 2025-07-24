import React from 'react';
import { useSleeperContext } from '@/contexts/SleeperContext';

const SleeperConnectModal = ({ isOpen, onClose }) => {
  const { username, setUsername, fetchUser, errorMessage, isLoading } = useSleeperContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchUser();
    if (!errorMessage) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header with Logo */}
        <div className="p-8 flex flex-col items-center space-y-6">
          <div className="bg-[#1B213E] w-24 h-24 rounded-3xl flex items-center justify-center">
            <img
              src="/api/placeholder/96/96"
              alt="Sleeper Logo"
              className="w-16 h-16"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Sleeper Fantasy</h2>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
          <div className="space-y-2">
            <label className="block text-xl text-gray-900">
              Sleeper Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B213E]"
              placeholder="Enter your username"
              required
            />
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#FFD104] text-gray-900 rounded-lg text-xl font-semibold
              hover:bg-[#FFD104]/90 transition-colors duration-200"
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>

          {/* Footer Link */}
          <div className="text-center space-x-2">
            <span className="text-gray-600">Don't have a Sleeper Account?</span>
            <a 
              href="https://sleeper.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
              Go to Sleeper
            </a>
          </div>
        </form>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SleeperConnectModal;
