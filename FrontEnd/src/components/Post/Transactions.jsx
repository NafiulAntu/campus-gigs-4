import React, { useState, useEffect } from 'react';
import { getTransactions, getBalance } from '../../services/api';

export default function Transactions({ onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [filter, setFilter] = useState('all'); // all, sent, received
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUserId(user.id);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, balanceRes] = await Promise.all([
        getTransactions(100),
        getBalance()
      ]);

      setTransactions(transactionsRes.data.transactions || []);
      setBalance(balanceRes.data.balance || 0);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'sent') return t.sender_id === currentUserId;
    if (filter === 'received') return t.receiver_id === currentUserId;
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-black/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={onBack}
            className="h-9 w-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <i className="fi fi-br-arrow-left text-white text-xl"></i>
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Transactions</h2>
            <p className="text-sm text-gray-400">Your transaction history</p>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="flex-shrink-0 p-4">
        <div className="bg-gradient-to-br from-primary-teal to-blue-500 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/80 text-sm font-medium mb-1">Available Balance</div>
              <div className="text-white text-3xl font-bold">৳{balance.toFixed(2)}</div>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <i className="fas fa-wallet text-white text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex-shrink-0 px-4 pb-4">
        <div className="flex gap-2 bg-white/5 rounded-xl p-1">
          {[
            { key: 'all', label: 'All', icon: 'fa-list' },
            { key: 'sent', label: 'Sent', icon: 'fa-arrow-up' },
            { key: 'received', label: 'Received', icon: 'fa-arrow-down' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all ${
                filter === tab.key
                  ? 'bg-primary-teal text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <i className={`fas ${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto px-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-teal border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-receipt text-gray-600 text-3xl"></i>
            </div>
            <p className="text-gray-400 text-center">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3 pb-6">
            {filteredTransactions.map((transaction) => {
              const isSent = transaction.sender_id === currentUserId;
              const otherUser = isSent 
                ? { name: transaction.receiver_name, username: transaction.receiver_username, picture: transaction.receiver_picture }
                : { name: transaction.sender_name, username: transaction.sender_username, picture: transaction.sender_picture };

              return (
                <div
                  key={transaction.id}
                  className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all border border-white/10 hover:border-white/20"
                >
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      {otherUser.picture ? (
                        <img
                          src={otherUser.picture}
                          alt={otherUser.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-teal to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                          {otherUser.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>

                    {/* Transaction Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-semibold truncate">
                            {isSent ? 'Sent to' : 'Received from'} {otherUser.name}
                          </div>
                          <div className="text-gray-400 text-sm">@{otherUser.username}</div>
                        </div>
                        <div className={`text-lg font-bold whitespace-nowrap ${
                          isSent ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {isSent ? '-' : '+'}৳{parseFloat(transaction.amount).toFixed(2)}
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                        <span className="capitalize">
                          <i className={`fas ${
                            transaction.transaction_type === 'transfer' ? 'fa-exchange-alt' :
                            transaction.transaction_type === 'payment' ? 'fa-credit-card' :
                            transaction.transaction_type === 'tip' ? 'fa-hand-holding-usd' :
                            'fa-undo'
                          } mr-1`}></i>
                          {transaction.transaction_type}
                        </span>
                        <span>•</span>
                        <span>{formatDate(transaction.created_at)}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          transaction.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>

                      {/* Notes */}
                      {transaction.notes && (
                        <div className="mt-2 text-sm text-gray-400 italic">
                          "{transaction.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
