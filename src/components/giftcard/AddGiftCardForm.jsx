import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { giftCardService } from '../../services/firebase/GiftCardService';
import { Timestamp } from 'firebase/firestore';

const AddGiftCardForm = ({ onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Visa Debit',
    gamingBrand: '',
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    startingAmount: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const giftCard = {
        ...formData,
        startingAmount: parseFloat(formData.startingAmount),
        dateAdded: Timestamp.now(),
        userId: currentUser.uid
      };

      await giftCardService.addGiftCard(giftCard);
      onSuccess?.();
      
      // Reset form
      setFormData({
        type: 'Visa Debit',
        gamingBrand: '',
        cardNumber: '',
        expirationDate: '',
        cvv: '',
        startingAmount: '',
      });
    } catch (error) {
      console.error('Error adding gift card:', error);
      alert('Failed to add gift card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Card Type
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
          required
        >
          <option value="Visa Debit">Visa Debit</option>
          <option value="Mastercard Debit">Mastercard Debit</option>
          <option value="Tapppp Debit">Tapppp Debit</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Gaming Brand
        </label>
        <input
          type="text"
          name="gamingBrand"
          value={formData.gamingBrand}
          onChange={handleChange}
          placeholder="e.g., PokerStars, DraftKings"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Card Number
        </label>
        <input
          type="text"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleChange}
          placeholder="1234 5678 9012 3456"
          pattern="\d{16}"
          maxLength="16"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Expiration Date
        </label>
        <input
          type="text"
          name="expirationDate"
          value={formData.expirationDate}
          onChange={handleChange}
          placeholder="MM/YY"
          pattern="\d{2}/\d{2}"
          maxLength="5"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          CVV
        </label>
        <input
          type="text"
          name="cvv"
          value={formData.cvv}
          onChange={handleChange}
          placeholder="123"
          pattern="\d{3}"
          maxLength="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Starting Amount
        </label>
        <input
          type="number"
          name="startingAmount"
          value={formData.startingAmount}
          onChange={handleChange}
          placeholder="20.00"
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Gift Card'}
      </button>
    </form>
  );
};

export default AddGiftCardForm;
