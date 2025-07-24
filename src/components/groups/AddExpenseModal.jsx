import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import UserAvatar from '../ui/UserAvatar';

const AddExpenseModal = ({ group, onClose, onSubmit }) => {
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    splitBetween: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(expenseData);
  };

  const toggleMemberSelection = (memberId) => {
    setExpenseData(prev => ({
      ...prev,
      splitBetween: prev.splitBetween.includes(memberId)
        ? prev.splitBetween.filter(id => id !== memberId)
        : [...prev.splitBetween, memberId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-gray-900/40 border-purple-500/20 w-[400px]">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <CardTitle className="text-xl font-bold text-white">
            Add Expense
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Description
              </label>
              <input
                type="text"
                value={expenseData.description}
                onChange={(e) => setExpenseData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter expense description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Amount
              </label>
              <input
                type="number"
                value={expenseData.amount}
                onChange={(e) => setExpenseData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter amount"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Split Between
              </label>
              <div className="space-y-2">
                {group.members?.map((member) => (
                  <div
                    key={member.uid}
                    onClick={() => toggleMemberSelection(member.uid)}
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer
                      ${expenseData.splitBetween.includes(member.uid)
                        ? 'bg-purple-600/20 border border-purple-500/50'
                        : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
                      }`}
                  >
                    <UserAvatar user={member} />
                    <span className="text-white">{member.displayName}</span>
                  </div>
                ))}
              </div>
              {expenseData.splitBetween.length > 0 && expenseData.amount && (
                <p className="text-sm text-gray-400 mt-2">
                  Split amount: ${(parseFloat(expenseData.amount) / expenseData.splitBetween.length).toFixed(2)} each
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg 
                transition-colors"
            >
              Add Expense
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddExpenseModal;
