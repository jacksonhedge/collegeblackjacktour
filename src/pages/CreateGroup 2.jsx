import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { groupService } from '../services/firebase/GroupService';
import { Card } from '../components/ui/card';
import { X, ChevronLeft, ChevronRight, Check, Smile, Users } from 'lucide-react';

const EMOJI_OPTIONS = [
  '🏈', '⚽️', '🏀', '⚾️', '🎾', '🏒', '🏂', '🎰', '🎲', '🎮',
  '🏆', '💰', '🎯', '🎪', '🎨', '🎭', '🎪', '🎢', '🎡', '🎪'
];

const CreateGroup = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🏈',
    members: []
  });
  const [error, setError] = useState('');

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      setError('Please enter a group name');
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      await groupService.createGroup({
        name: formData.name,
        emoji: formData.emoji,
      }, currentUser.id);
      navigate('/profile');
    } catch (err) {
      setError('Failed to create group. Please try again.');
      console.error('Error creating group:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Name your group</h2>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter group name"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={50}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Choose an emoji</h2>
            <div className="grid grid-cols-5 gap-3">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setFormData({ ...formData, emoji })}
                  className={`text-2xl p-3 rounded-lg ${
                    formData.emoji === emoji
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-800 hover:bg-gray-700'
                  } transition-colors`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Add people (Optional)</h2>
            <p className="text-gray-400">You can add people to your group later</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/profile')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-white">Create Group</h1>
          <div className="w-6" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="max-w-lg mx-auto">
          <Card className="bg-gray-900 border-gray-800">
            <div className="p-6 space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                {[
                  { icon: <Smile className="w-5 h-5" />, label: 'Name' },
                  { icon: <Smile className="w-5 h-5" />, label: 'Emoji' },
                  { icon: <Users className="w-5 h-5" />, label: 'People' }
                ].map((s, i) => (
                  <div key={i} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        step > i
                          ? 'bg-blue-500 text-white'
                          : step === i + 1
                          ? 'bg-blue-500/20 text-blue-500'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {step > i ? <Check className="w-5 h-5" /> : s.icon}
                    </div>
                    {i < 2 && (
                      <div
                        className={`w-12 h-0.5 mx-2 ${
                          step > i + 1 ? 'bg-blue-500' : 'bg-gray-800'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              {renderStep()}

              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handleBack}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    step === 1
                      ? 'invisible'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  } transition-colors`}
                  disabled={step === 1}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                {step < 3 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <span>Create Group</span>
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
