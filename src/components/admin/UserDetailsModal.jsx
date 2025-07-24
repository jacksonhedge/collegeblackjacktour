import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  DollarSign,
  Activity,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Link2,
  FileText
} from 'lucide-react';

const UserDetailsModal = ({ user, onClose, onAction }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!user) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVerificationIcon = (verified) => {
    return verified ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Basic Information
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">User ID</span>
            <span className="text-sm font-medium text-gray-900">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Username</span>
            <span className="text-sm font-medium text-gray-900">{user.username}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Email</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{user.email}</span>
              {getVerificationIcon(user.emailVerified)}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Phone</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{user.phoneNumber}</span>
              {getVerificationIcon(user.phoneVerified)}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">KYC Status</span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              user.kycStatus === 'approved' 
                ? 'bg-green-100 text-green-800' 
                : user.kycStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {user.kycStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Account Details
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Created</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(user.createdAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Last Seen</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(user.lastSeen)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Account Age</span>
            <span className="text-sm font-medium text-gray-900">{user.accountAge}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              user.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : user.status === 'suspended'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {user.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Risk Level</span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              user.riskLevel === 'low' 
                ? 'bg-green-100 text-green-800' 
                : user.riskLevel === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {user.riskLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Social & Referrals */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Social & Referrals
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Referral Code</span>
            <span className="text-sm font-medium text-gray-900">{user.referralCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Referred By</span>
            <span className="text-sm font-medium text-gray-900">
              {user.referredBy || 'Direct Sign-up'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Referrals Made</span>
            <span className="text-sm font-medium text-gray-900">{user.referralCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Friends</span>
            <span className="text-sm font-medium text-gray-900">{user.friends}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Leagues</span>
            <span className="text-sm font-medium text-gray-900">{user.leagues}</span>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Notification Preferences
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Email Notifications</span>
            {user.notifications.email ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Push Notifications</span>
            {user.notifications.push ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">SMS Notifications</span>
            {user.notifications.sms ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancialsTab = () => (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Current Balance
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <DollarSign className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(user.balance.cash)}
            </p>
            <p className="text-sm text-gray-600">Cash Balance</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <CreditCard className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(user.balance.bonus)}
            </p>
            <p className="text-sm text-gray-600">Bonus Balance</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <DollarSign className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(user.balance.total)}
            </p>
            <p className="text-sm text-gray-600">Total Balance</p>
          </div>
        </div>
      </div>

      {/* Transaction Summary */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Transaction Summary
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Transactions</span>
            <span className="text-sm font-medium text-gray-900">
              {user.transactions.total}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Transaction Volume</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(user.transactions.volume)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Money Sent</span>
            <span className="text-sm font-medium text-red-600">
              {formatCurrency(user.transactions.sent.amount)} ({user.transactions.sent.count} txns)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Money Received</span>
            <span className="text-sm font-medium text-green-600">
              {formatCurrency(user.transactions.received.amount)} ({user.transactions.received.count} txns)
            </span>
          </div>
        </div>
      </div>

      {/* Deposit & Withdrawal Summary */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Deposits & Withdrawals
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <ArrowDownRight className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Deposits</span>
            </div>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(user.financials.deposits.total)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {user.financials.deposits.count} deposits
            </p>
            {user.financials.deposits.last && (
              <p className="text-xs text-gray-500 mt-2">
                Last: {formatDate(user.financials.deposits.last.createdAt)}
              </p>
            )}
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <ArrowUpRight className="w-5 h-5 text-red-600" />
              <span className="text-sm text-gray-600">Withdrawals</span>
            </div>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(user.financials.withdrawals.total)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {user.financials.withdrawals.count} withdrawals
            </p>
            {user.financials.withdrawals.last && (
              <p className="text-xs text-gray-500 mt-2">
                Last: {formatDate(user.financials.withdrawals.last.createdAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Metrics */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Financial Metrics
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Net Deposits</span>
            <span className={`text-sm font-medium ${
              user.financials.netDeposits >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(user.financials.netDeposits)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Lifetime Value</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(user.financials.lifetime)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Average Transaction</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(
                user.transactions.total > 0 
                  ? user.transactions.volume / user.transactions.total 
                  : 0
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      {/* Last Activity */}
      {user.lastActivity && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Last Activity
          </h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.lastActivity.description}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(user.lastActivity.timestamp)}
                </p>
              </div>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {user.transactions.lastTransaction && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Last Transaction
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                {user.transactions.lastTransaction.type}
              </span>
              <span className={`text-sm font-medium ${
                user.transactions.lastTransaction.type === 'deposit' || 
                user.transactions.lastTransaction.type === 'receive'
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatCurrency(user.transactions.lastTransaction.amount)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {formatDate(user.transactions.lastTransaction.createdAt)}
            </p>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Activity Timeline
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 text-center py-8">
            Detailed activity timeline coming soon...
          </p>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.username}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-purple-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'financials' && renderFinancialsTab()}
          {activeTab === 'activity' && renderActivityTab()}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <div className="flex gap-2">
            {user.status === 'suspended' ? (
              <button
                onClick={() => onAction(user.id, 'reactivate')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Reactivate User
              </button>
            ) : (
              <button
                onClick={() => onAction(user.id, 'suspend')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Suspend User
              </button>
            )}
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Send Email
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;