import React, { useState, useEffect } from 'react';
import { getTransactions, getBalance } from '../../../services/api';

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
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 hover:from-slate-700/90 hover:to-slate-600/90 flex items-center justify-center transition-all duration-300 border border-white/10 shadow-lg hover:shadow-cyan-500/20 hover:scale-105 group"
            >
              <i className="fi fi-br-arrow-left text-white text-xl group-hover:-translate-x-1 transition-transform"></i>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-receipt text-cyan-400 text-2xl"></i>
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Transactions</h2>
              </div>
              <p className="text-xs text-gray-400 ml-10">Your payment history</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-green-500/10">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-emerald-300 text-xs font-semibold">Live</span>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="flex-shrink-0 p-4">
        <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl p-6 shadow-2xl border border-cyan-500/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-2">
                <i className="fi fi-rr-wallet text-emerald-400"></i>
                <span>Available Balance</span>
              </div>
              <div className="text-white text-4xl font-black">৳{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-gray-500 mt-1">Updated just now</p>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-cyan-500/30 shadow-lg">
              <i className="fi fi-rr-piggy-bank text-cyan-400 text-3xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex-shrink-0 px-4 pb-4">
        <div className="flex gap-2 bg-slate-900/50 rounded-xl p-1.5 border border-slate-800">
          {[
            { key: 'all', label: 'All', icon: 'fi-rr-apps', color: 'cyan' },
            { key: 'sent', label: 'Sent', icon: 'fi-rr-arrow-up', color: 'red' },
            { key: 'received', label: 'Received', icon: 'fi-rr-arrow-down', color: 'green' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <i className={`fi ${tab.icon} ${filter === tab.key ? 'text-white' : ''}`}></i>
              <span>{tab.label}</span>
              {filter === tab.key && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {filteredTransactions.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20">
              <i className="fi fi-rr-receipt text-gray-500 text-4xl"></i>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">No Transactions Yet</h3>
            <p className="text-gray-400 text-center text-sm max-w-xs">
              {filter === 'all' 
                ? 'Your transaction history will appear here once you send or receive money.'
                : filter === 'sent'
                ? 'You haven\'t sent any money yet. Start sending money to see your sent transactions.'
                : 'You haven\'t received any money yet. Share your details to receive payments.'}
            </p>
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
                  className="bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 hover:from-slate-800/90 hover:via-slate-700/90 hover:to-slate-800/90 rounded-xl p-4 transition-all border border-white/10 hover:border-cyan-500/30 shadow-lg hover:shadow-cyan-500/10 group"
                >
                  <div className="flex items-start gap-3">
                    {/* User Avatar */}
                    <div className="flex-shrink-0 relative">
                      {otherUser.picture ? (
                        <img
                          src={otherUser.picture}
                          alt={otherUser.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white/10 group-hover:border-cyan-500/30 transition-all"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {otherUser.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${
                        isSent ? 'bg-red-500' : 'bg-green-500'
                      }`}>
                        <i className={`fi ${isSent ? 'fi-rr-arrow-up' : 'fi-rr-arrow-down'} text-white text-xs`}></i>
                      </div>
                    </div>

                    {/* Transaction Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-bold truncate flex items-center gap-2">
                            {isSent ? (
                              <>
                                <span className="text-gray-400 font-normal text-sm">Sent to</span>
                                {otherUser.name}
                              </>
                            ) : (
                              <>
                                <span className="text-gray-400 font-normal text-sm">From</span>
                                {otherUser.name}
                              </>
                            )}
                          </div>
                          <div className="text-gray-400 text-xs mt-0.5">@{otherUser.username}</div>
                        </div>
                        <div className={`text-xl font-black whitespace-nowrap ${
                          isSent ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {isSent ? '-' : '+'}৳{parseFloat(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-2">
                        <span className="capitalize flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-md">
                          <i className={`fas ${
                            transaction.transaction_type === 'send_money' ? 'fa-paper-plane' :
                            transaction.transaction_type === 'transfer' ? 'fa-exchange-alt' :
                            transaction.transaction_type === 'payment' ? 'fa-credit-card' :
                            transaction.transaction_type === 'tip' ? 'fa-hand-holding-usd' :
                            'fa-undo'
                          }`}></i>
                          {transaction.transaction_type?.replace('_', ' ') || 'Transfer'}
                        </span>
                        
                        {transaction.payment_method && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-md capitalize">
                              <i className="fi fi-rr-credit-card"></i>
                              {transaction.payment_method}
                            </span>
                          </>
                        )}
                        
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <i className="fi fi-rr-clock"></i>
                          {formatDate(transaction.created_at)}
                        </span>
                        
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-md font-medium ${
                          transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          transaction.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          <i className={`fas ${
                            transaction.status === 'completed' ? 'fa-check-circle' :
                            transaction.status === 'pending' ? 'fa-clock' :
                            transaction.status === 'failed' ? 'fa-times-circle' :
                            'fa-circle'
                          } mr-1`}></i>
                          {transaction.status}
                        </span>
                      </div>

                      {/* Payment Reference */}
                      {transaction.payment_reference && (
                        <div className="mt-2 text-xs text-gray-500 font-mono bg-slate-900/50 px-2 py-1 rounded inline-block">
                          <i className="fi fi-rr-barcode-read mr-1"></i>
                          Ref: {transaction.payment_reference}
                        </div>
                      )}

                      {/* Notes */}
                      {transaction.description && (
                        <div className="mt-2 text-sm text-gray-400 bg-slate-800/30 px-3 py-2 rounded-lg italic border border-slate-700/50">
                          <i className="fi fi-rr-comment-alt mr-1"></i>
                          "{transaction.description}"
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
