import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Users, UsersRound, DollarSign, Clock } from 'lucide-react';

const SendMoney = () => {
  const [amount, setAmount] = useState('0');
  const [username, setUsername] = useState('');
  const [note, setNote] = useState('');

  const handleAmountChange = (value) => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  return (
    <div className="relative">
      {/* Content */}
      <div className="max-w-md mx-auto p-6 space-y-8">
        {/* Amount Input */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Send Money</h2>
          <div className="flex items-center justify-center text-6xl font-bold text-white">
            <DollarSign className="h-12 w-12" />
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-40 bg-transparent text-center focus:outline-none"
              placeholder="0"
            />
          </div>
        </div>

        {/* Username Input */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="#username"
              className="w-full p-4 rounded-lg bg-purple-900/30 border border-purple-500/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Note Input */}
          <div className="relative">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's this for?"
              className="w-full p-4 rounded-lg bg-purple-900/30 border border-purple-500/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button className="w-full py-3 rounded-full bg-white text-purple-900 font-medium hover:bg-gray-100 transition-colors">
            Request
          </button>
          <button className="w-full py-3 rounded-full bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors">
            Pay
          </button>
        </div>

        {/* Payment Source Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Payment Source</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-blue-500">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Friends</div>
                    <div className="text-sm text-gray-500">0 friends</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-purple-500">
                    <UsersRound className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Groups</div>
                    <div className="text-sm text-gray-500">0 groups</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Coming Soon</h2>
          <p className="text-gray-300">
            The Send Money feature is currently under development. 
            Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SendMoney;
