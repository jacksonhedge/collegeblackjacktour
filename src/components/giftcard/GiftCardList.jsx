import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { db } from '../../services/firebase/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import GiftCardDisplay from './GiftCardDisplay';
import { Loader2, Search } from 'lucide-react';

const GiftCardList = () => {
  const { currentUser } = useAuth();
  const [giftCards, setGiftCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'pending', 'used'

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const userGiftCardsRef = collection(db, 'users', currentUser.uid, 'giftCards');
    const giftCardsQuery = query(
      userGiftCardsRef,
      orderBy('issuedDate', 'desc')
    );

    const unsubscribe = onSnapshot(
      giftCardsQuery,
      (snapshot) => {
        const cardData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGiftCards(cardData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching gift cards:', err);
        setError('Failed to load gift cards');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Apply filters and search
  useEffect(() => {
    if (!giftCards.length) {
      setFilteredCards([]);
      return;
    }

    let result = [...giftCards];
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(card => card.status === filter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        card => 
          card.platformName?.toLowerCase().includes(term) || 
          card.cardNumber?.includes(term)
      );
    }
    
    setFilteredCards(result);
  }, [giftCards, filter, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="ml-3 text-lg">Loading gift cards...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Gift Cards</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
            />
          </div>
          
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
          >
            <option value="all">All Cards</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="used">Used</option>
          </select>
        </div>
      </div>
      
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <GiftCardDisplay key={card.id} giftCard={card} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
            <div className="text-2xl">💳</div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Gift Cards Found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {giftCards.length === 0 
              ? "You don't have any gift cards yet. Request one from a platform to get started."
              : "No gift cards match your current filters."}
          </p>
        </div>
      )}
    </div>
  );
};

export default GiftCardList;