import React from 'react';
import { Wallet, Users, Trophy, ArrowRight, Plus, TrendingUp } from 'lucide-react';

// Preview of Monday's Home Page Redesign
const HomePageRedesign = () => {
  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="text-gray-400">Your betting command center</p>
      </div>

      {/* Main Grid - Wallet and Groups Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Wallet Card */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Wallet</h2>
                <p className="text-sm text-gray-400">Total Balance</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="mb-4">
            <div className="text-3xl font-bold">$2,450.00</div>
            <div className="flex items-center gap-2 mt-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">+12.5% this week</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors">
              Deposit
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
              Withdraw
            </button>
          </div>

          {/* New Bank Connection Preview */}
          <div className="mt-4 p-3 bg-purple-600/10 border border-purple-600/20 rounded-lg">
            <p className="text-sm text-purple-400">🏦 Connect your bank for instant transfers</p>
          </div>
        </div>

        {/* Groups Card */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Groups</h2>
                <p className="text-sm text-gray-400">3 Active Groups</p>
              </div>
            </div>
            <Plus className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
          </div>

          {/* Active Groups List */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏈</span>
                <div>
                  <p className="font-medium">Sunday Squad</p>
                  <p className="text-xs text-gray-400">8 members • $450</p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-500">+$125</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏀</span>
                <div>
                  <p className="font-medium">NBA Nights</p>
                  <p className="text-xs text-gray-400">5 members • $280</p>
                </div>
              </div>
              <span className="text-sm font-medium text-red-500">-$45</span>
            </div>
          </div>

          <button className="w-full bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
            View All Groups
          </button>
        </div>
      </div>

      {/* Smaller Recent Winners Section */}
      <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Recent Winners</h3>
          </div>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            View All
          </button>
        </div>

        {/* Compact Winner Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-green-500">JD</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">John D.</p>
              <p className="text-xs text-gray-400">Won $450 on NBA</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-green-500">SM</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Sarah M.</p>
              <p className="text-xs text-gray-400">Won $320 on NFL</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-green-500">MJ</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Mike J.</p>
              <p className="text-xs text-gray-400">Won $275 on UFC</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-20 right-4">
        <button className="w-14 h-14 bg-purple-600 rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 transition-colors">
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default HomePageRedesign;