import React, { useState, useEffect } from 'react';
import { 
  FundTransaction, 
  FundTransactionType,
  FundTransactionStatus,
  FundType
} from '../../types/funds';
import { fundManager } from '../../services/FundManagerService';
import { formatCurrency } from '../../lib/utils';
import { format } from 'date-fns';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter
} from 'lucide-react';

interface FundTransactionsListProps {
  userId: string;
  fundType?: FundType;
  limit?: number;
  className?: string;
}

const TRANSACTION_ICONS: Record<FundTransactionType, React.ElementType> = {
  [FundTransactionType.DEPOSIT]: ArrowDownLeft,
  [FundTransactionType.WITHDRAWAL]: ArrowUpRight,
  [FundTransactionType.TRANSFER_IN]: ArrowDownLeft,
  [FundTransactionType.TRANSFER_OUT]: ArrowUpRight,
  [FundTransactionType.BET_PLACED]: TrendingUp,
  [FundTransactionType.BET_WON]: TrendingUp,
  [FundTransactionType.BET_LOST]: TrendingDown,
  [FundTransactionType.GAME_SPENT]: TrendingUp,
  [FundTransactionType.GAME_WON]: TrendingUp,
  [FundTransactionType.PROMO_GRANTED]: Gift,
  [FundTransactionType.PROMO_EXPIRED]: XCircle,
  [FundTransactionType.PROMO_CONVERTED]: RefreshCw,
  [FundTransactionType.FEE]: ArrowUpRight,
  [FundTransactionType.REFUND]: ArrowDownLeft
};

const STATUS_ICONS: Record<FundTransactionStatus, React.ElementType> = {
  [FundTransactionStatus.PENDING]: Clock,
  [FundTransactionStatus.PROCESSING]: RefreshCw,
  [FundTransactionStatus.COMPLETED]: CheckCircle,
  [FundTransactionStatus.FAILED]: XCircle,
  [FundTransactionStatus.CANCELLED]: XCircle,
  [FundTransactionStatus.REVERSED]: RefreshCw
};

const TRANSACTION_COLORS: Record<FundTransactionType, string> = {
  [FundTransactionType.DEPOSIT]: 'text-green-600',
  [FundTransactionType.WITHDRAWAL]: 'text-red-600',
  [FundTransactionType.TRANSFER_IN]: 'text-green-600',
  [FundTransactionType.TRANSFER_OUT]: 'text-red-600',
  [FundTransactionType.BET_PLACED]: 'text-orange-600',
  [FundTransactionType.BET_WON]: 'text-green-600',
  [FundTransactionType.BET_LOST]: 'text-red-600',
  [FundTransactionType.GAME_SPENT]: 'text-orange-600',
  [FundTransactionType.GAME_WON]: 'text-green-600',
  [FundTransactionType.PROMO_GRANTED]: 'text-purple-600',
  [FundTransactionType.PROMO_EXPIRED]: 'text-gray-600',
  [FundTransactionType.PROMO_CONVERTED]: 'text-blue-600',
  [FundTransactionType.FEE]: 'text-red-600',
  [FundTransactionType.REFUND]: 'text-green-600'
};

const STATUS_COLORS: Record<FundTransactionStatus, string> = {
  [FundTransactionStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [FundTransactionStatus.PROCESSING]: 'bg-blue-100 text-blue-800',
  [FundTransactionStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [FundTransactionStatus.FAILED]: 'bg-red-100 text-red-800',
  [FundTransactionStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
  [FundTransactionStatus.REVERSED]: 'bg-orange-100 text-orange-800'
};

const FUND_TYPE_LABELS: Record<FundType, string> = {
  [FundType.PROMO]: 'Promo',
  [FundType.CASH]: 'Cash',
  [FundType.SENDABLE]: 'Sendable'
};

export function FundTransactionsList({
  userId,
  fundType,
  limit = 20,
  className = ''
}: FundTransactionsListProps) {
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<FundType | undefined>(fundType);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [userId, selectedType, limit]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fundManager.getFundTransactions(userId, selectedType, limit);
      setTransactions(data);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionSign = (type: FundTransactionType): string => {
    const positiveTypes = [
      FundTransactionType.DEPOSIT,
      FundTransactionType.TRANSFER_IN,
      FundTransactionType.BET_WON,
      FundTransactionType.GAME_WON,
      FundTransactionType.PROMO_GRANTED,
      FundTransactionType.REFUND
    ];
    return positiveTypes.includes(type) ? '+' : '-';
  };

  const formatTransactionDate = (date: Date | any): string => {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return format(dateObj, 'MMM d, yyyy h:mm a');
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </button>
        </div>
        
        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType(undefined)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                !selectedType 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Funds
            </button>
            {Object.values(FundType).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedType === type 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {FUND_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No transactions found
          </div>
        ) : (
          transactions.map((transaction) => {
            const Icon = TRANSACTION_ICONS[transaction.type];
            const StatusIcon = STATUS_ICONS[transaction.status];
            const sign = getTransactionSign(transaction.type);
            const colorClass = TRANSACTION_COLORS[transaction.type];
            
            return (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`mt-1 p-2 rounded-full bg-gray-100 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTransactionDate(transaction.createdAt)}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${colorClass}`}>
                          {sign}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {FUND_TYPE_LABELS[transaction.fundType]}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          Balance: {formatCurrency(transaction.balanceBefore)} → {formatCurrency(transaction.balanceAfter)}
                        </span>
                      </div>
                      
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[transaction.status]}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {transaction.status}
                      </span>
                    </div>
                    
                    {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {transaction.metadata.platformId && (
                          <span className="mr-3">Platform: {transaction.metadata.platformId}</span>
                        )}
                        {transaction.metadata.fromUserId && (
                          <span className="mr-3">From user</span>
                        )}
                        {transaction.metadata.toUserId && (
                          <span className="mr-3">To user</span>
                        )}
                      </div>
                    )}
                    
                    {transaction.failureReason && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 rounded p-2">
                        {transaction.failureReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {transactions.length >= limit && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Load more transactions
          </button>
        </div>
      )}
    </div>
  );
}