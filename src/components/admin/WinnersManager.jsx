import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Edit2, Trash2, Save, X, DollarSign } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { useTheme } from '../../contexts/ThemeContext';

const WinnersManager = () => {
  const { isDark } = useTheme();
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingWinner, setEditingWinner] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    title: 'Big Win',
    amount: '',
    platform: 'DraftKings',
    time: '2 hours ago',
    how: '',
    howType: 'slot',
    platformColor: '#F3701D',
    isActive: true
  });

  const platforms = [
    'DraftKings',
    'FanDuel', 
    'Sleeper',
    'ESPN BET',
    'BetMGM',
    'Caesars',
    'Underdog',
    'PointsBet',
    'PrizePicks'
  ];

  const platformColors = {
    'DraftKings': '#F3701D',
    'FanDuel': '#0B79E0',
    'Sleeper': '#F7B500',
    'ESPN BET': '#D50A0A',
    'BetMGM': '#FFB000',
    'Caesars': '#1E4C91',
    'Underdog': '#6B46C1',
    'PointsBet': '#FF6900',
    'PrizePicks': '#00D4FF'
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      setLoading(true);
      const winnersQuery = query(collection(db, 'winners'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(winnersQuery);
      const winnersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWinners(winnersData);
    } catch (error) {
      console.error('Error fetching winners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const winnerData = {
        ...formData,
        username: formData.username,
        amount: parseFloat(formData.amount),
        platformColor: platformColors[formData.platform],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingWinner) {
        await updateDoc(doc(db, 'winners', editingWinner.id), {
          ...winnerData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'winners'), winnerData);
      }

      await fetchWinners();
      resetForm();
    } catch (error) {
      console.error('Error saving winner:', error);
    }
  };

  const handleDelete = async (winnerId) => {
    if (window.confirm('Are you sure you want to delete this winner?')) {
      try {
        await deleteDoc(doc(db, 'winners', winnerId));
        await fetchWinners();
      } catch (error) {
        console.error('Error deleting winner:', error);
      }
    }
  };

  const handleEdit = (winner) => {
    setEditingWinner(winner);
    setFormData({
      username: winner.username || winner.name || '',
      title: winner.title || 'Big Win',
      amount: winner.amount.toString(),
      platform: winner.platform,
      platformColor: winner.platformColor || platformColors[winner.platform],
      time: winner.time,
      how: winner.how || '',
      howType: winner.howType || 'slot',
      isActive: winner.isActive
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      title: 'Big Win',
      amount: '',
      platform: 'DraftKings',
      platformColor: '#F3701D',
      time: '2 hours ago',
      how: '',
      howType: 'slot',
      isActive: true
    });
    setEditingWinner(null);
    setShowAddForm(false);
  };

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className={`h-6 w-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Winners Management
          </h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Winner
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className={`mb-6 p-4 rounded-lg border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Winner Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="@username"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Win Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Big Win, Jackpot, Hot Streak"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Amount Won
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    className={`w-full pl-8 pr-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value, platformColor: platformColors[e.target.value] })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Time Ago
                </label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="2 hours ago"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                />
              </div>
            </div>
            
            {/* How They Won Section */}
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  How They Won
                </label>
                <select
                  value={formData.howType}
                  onChange={(e) => setFormData({ ...formData, howType: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="slot">Slot Game</option>
                  <option value="blackjack">Blackjack</option>
                  <option value="parlay">Parlay</option>
                  <option value="single">Single Bet</option>
                  <option value="sidebet">SideBet Jackpot</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Win Details
                </label>
                <textarea
                  value={formData.how}
                  onChange={(e) => setFormData({ ...formData, how: e.target.value })}
                  placeholder={
                    formData.howType === 'slot' ? 'e.g., Triple 7s on Mega Moolah, 100x multiplier' :
                    formData.howType === 'blackjack' ? 'e.g., Split Aces, got 21 on both hands' :
                    formData.howType === 'parlay' ? 'e.g., 5-leg parlay: Lakers +5, Over 220.5...' :
                    formData.howType === 'single' ? 'e.g., Chiefs -3.5' :
                    formData.howType === 'sidebet' ? 'e.g., Hit the Royal Flush jackpot on Texas Hold\'em' :
                    'Describe how they won...'
                  }
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Show in carousel
                </span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                {editingWinner ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Winners List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {winners.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No winners added yet. Click "Add Winner" to get started.
            </div>
          ) : (
            winners.map(winner => (
              <div
                key={winner.id}
                className={`p-4 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } ${!winner.isActive ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className={`font-semibold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {winner.username || winner.name}
                        </h3>
                        <span className={`text-lg font-bold ${
                          isDark ? 'text-green-400' : 'text-green-600'
                        }`}>
                          ${winner.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span 
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: `${platformColors[winner.platform]}20`,
                            color: platformColors[winner.platform],
                            border: `1px solid ${platformColors[winner.platform]}`
                          }}
                        >
                          {winner.platform}
                        </span>
                        <span className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {winner.time}
                        </span>
                        {!winner.isActive && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                          }`}>
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(winner)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'hover:bg-gray-700 text-gray-400' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(winner.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'hover:bg-red-900/50 text-red-400' 
                          : 'hover:bg-red-50 text-red-600'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default WinnersManager;