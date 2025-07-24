import React, { useState } from 'react';
import { X, CreditCard, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { db } from '../../services/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { analyticsService } from '../../services/firebase/AnalyticsService';
import { giftCardService } from '../../services/firebase/GiftCardService';

const GiftCardRequestModal = ({ platform, onClose }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    purpose: 'blackjack-tournament',
    amount: '20', // Default amount
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate user is logged in
      if (!currentUser) {
        throw new Error('You must be logged in to request a gift card');
      }
      
      // Validate required notes for "other" options
      if ((formData.amount === 'other' || formData.purpose === 'other') && !formData.notes.trim()) {
        throw new Error(formData.amount === 'other' 
          ? 'Please specify the requested amount in the notes' 
          : 'Please specify the purpose in the notes');
      }
      
      // Validate amount format when "other" is selected
      if (formData.amount === 'other') {
        // Extract amount from notes - look for digits preceded by $ or followed by "dollars" or just number patterns
        const amountMatch = formData.notes.match(/\$(\d+)|\$(\d+\.\d{2})|(\d+)\s+dollars|(\d+)/i);
        if (!amountMatch) {
          throw new Error('Please specify a valid dollar amount in the notes (e.g. $50 or 50 dollars)');
        }
        
        // Try to extract the numeric amount
        const extractedAmount = amountMatch[1] || amountMatch[2] || amountMatch[3] || amountMatch[4];
        const numericAmount = parseFloat(extractedAmount);
        
        // Validate the amount is reasonable
        if (isNaN(numericAmount) || numericAmount <= 0 || numericAmount > 1000) {
          throw new Error('Please enter a valid amount between $1 and $1000');
        }
      }

      // Check if user already has a gift card for this platform
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      
      if (userData?.giftCards?.some(card => card.platformId === platform.id && card.status !== 'used')) {
        throw new Error('You already have an active gift card for this platform');
      }
      
      // Create confirmation message
      let amountText = formData.amount === 'other' ? 'custom amount' : '$' + formData.amount;
      let purposeText = formData.purpose === 'other' ? 'Custom' : formData.purpose.replace(/-/g, ' ');
      
      // Ask for confirmation
      const confirmMessage = `Are you sure you want to request a ${amountText} gift card for ${platform.name}?\n\nPurpose: ${purposeText}\n${formData.notes ? 'Notes: ' + formData.notes : ''}`;
      
      if (!window.confirm(confirmMessage)) {
        setLoading(false);
        return;
      }

      // Create gift card request
      const requestData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: userData?.username || 'Unknown',
        platformId: platform.id,
        platformName: platform.name,
        platformUrl: platform.url || '',
        purpose: formData.purpose,
        requestedAmount: formData.amount,
        notes: formData.notes
      };
      
      console.log("Submitting gift card request with data:", requestData);

      // Add request to Firebase using the service
      const requestId = await giftCardService.createGiftCardRequest(requestData);
      console.log("Request created with ID:", requestId);

      // Log the analytics event
      analyticsService.logEvent('gift_card_requested', {
        platform_id: platform.id,
        platform_name: platform.name,
        amount: formData.amount,
        purpose: formData.purpose
      });

      setSuccess(true);
    } catch (err) {
      console.error('Error requesting gift card:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-indigo-100 to-purple-100 rounded-3xl max-w-md w-full mx-auto relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>

        {/* Content Container */}
        <div className="p-6 space-y-6">
          {/* Title and Icon */}
          <div className="flex flex-col items-center justify-center pt-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <CreditCard className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Request Gift Card
            </h2>
            <div className="flex items-center mt-2 bg-indigo-50 px-3 py-1 rounded-full">
              <img 
                src={platform.logo} 
                alt={platform.name} 
                className="w-5 h-5 object-contain mr-2" 
              />
              <p className="text-indigo-800 font-medium">
                For {platform.name}
              </p>
            </div>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-100 shadow-sm">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                    <Check className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-green-800">Request Submitted!</h3>
                <p className="text-gray-700 mt-3 leading-relaxed">
                  Your gift card request has been submitted successfully. We'll process it and notify you when it's ready.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] shadow-md"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Purpose Selection */}
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose
                </label>
                <select
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer text-gray-900 font-medium"
                  required
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem"
                  }}
                >
                  <option value="blackjack-tournament">Blackjack Tournament</option>
                  <option value="first-time-user">First Time Deposit</option>
                  <option value="special-promotion">Weekly Bonus</option>
                  <option value="loyalty-reward">Loyalty Reward</option>
                  <option value="deposit-issues">Deposit Issues</option>
                  <option value="other">Other (specify in notes)</option>
                </select>
              </div>

              {/* Amount Selection */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Amount
                </label>
                <select
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer text-gray-900 font-medium"
                  required
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem"
                  }}
                >
                  <option value="20">$20</option>
                  <option value="50">$50</option>
                  <option value="100">$100</option>
                  <option value="other">Other (specify in notes)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.amount === 'other' || formData.purpose === 'other' 
                    ? 'Additional Notes (Required)' 
                    : 'Additional Notes (Optional)'}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600 ${
                    (formData.amount === 'other' || formData.purpose === 'other') && !formData.notes
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder={formData.amount === 'other' 
                    ? "Please specify the amount you are requesting..."
                    : formData.purpose === 'other'
                    ? "Please specify the purpose of your request..."
                    : "Any specific details about your request..."}
                  required={formData.amount === 'other' || formData.purpose === 'other'}
                />
                {(formData.amount === 'other' || formData.purpose === 'other') && (
                  <p className="mt-1 text-sm text-red-500">
                    {formData.amount === 'other' 
                      ? "Please specify the requested amount in the notes" 
                      : "Please specify the purpose in the notes"}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (formData.amount === 'other' && !formData.notes.trim()) || (formData.purpose === 'other' && !formData.notes.trim())}
                className={`w-full py-3.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center shadow-md ${
                  loading || (formData.amount === 'other' && !formData.notes.trim()) || (formData.purpose === 'other' && !formData.notes.trim())
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:scale-[1.02]'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </form>
          )}

          {/* Terms */}
          <div className="text-center text-sm text-gray-600 pt-4">
            <p>Gift cards are subject to availability and approval. 
              See our <a href="#" className="text-indigo-600 hover:underline">terms and conditions</a> for details.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardRequestModal;