import React, { useState, useEffect } from 'react';
import { sendMoney, getBalance } from '../../services/api';

export default function SendMoney({ isOpen, onClose, receiverInfo, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionType, setTransactionType] = useState('transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBalance();
      setAmount('');
      setNotes('');
      setError('');
      setShowConfirm(false);
    }
  }, [isOpen]);

  const fetchBalance = async () => {
    try {
      const response = await getBalance();
      setBalance(response.data.balance || 0);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const handleSendClick = () => {
    const amountNum = parseFloat(amount);
    
    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum > balance) {
      setError('Insufficient balance');
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await sendMoney({
        receiver_id: receiverInfo.id,
        amount: parseFloat(amount),
        transaction_type: transactionType,
        notes: notes.trim()
      });

      if (response.data.success) {
        // Update balance
        await fetchBalance();
        
        // Call success callback
        if (onSuccess) {
          onSuccess(response.data.transaction);
        }

        // Close modal
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err) {
      console.error('Send money error:', err);
      setError(err.response?.data?.error || 'Failed to send money');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Send Money</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <i className="fas fa-times text-white"></i>
            </button>
          </div>

          {/* Receiver Info */}
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
            {receiverInfo.profile_picture ? (
              <img
                src={receiverInfo.profile_picture}
                alt={receiverInfo.full_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary-teal"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-teal to-blue-500 flex items-center justify-center text-white font-bold text-xl border-2 border-primary-teal">
                {receiverInfo.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1">
              <div className="text-white font-semibold">{receiverInfo.full_name}</div>
              <div className="text-gray-400 text-sm">@{receiverInfo.username}</div>
            </div>
          </div>

          {/* Balance Display */}
          <div className="mt-4 p-3 bg-gradient-to-r from-primary-teal/10 to-blue-500/10 rounded-lg border border-primary-teal/20">
            <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Your Balance</div>
            <div className="text-white text-xl font-bold">৳{balance.toFixed(2)}</div>
          </div>
        </div>

        {/* Form */}
        {!showConfirm ? (
          <div className="p-6 space-y-4">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Amount (৳)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">৳</span>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-2xl font-bold placeholder:text-gray-600 focus:outline-none focus:border-primary-teal transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-teal/50 rounded-lg text-white text-sm font-semibold transition-all"
                >
                  ৳{amt}
                </button>
              ))}
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Transaction Type
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-teal transition-all"
              >
                <option value="transfer">Transfer</option>
                <option value="payment">Payment</option>
                <option value="tip">Tip</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a message..."
                maxLength={200}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-teal transition-all resize-none"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {notes.length}/200
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendClick}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full py-4 bg-gradient-to-r from-primary-teal to-blue-500 hover:from-primary-teal/90 hover:to-blue-500/90 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary-teal/30"
            >
              Continue
            </button>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="p-6 space-y-4">
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-teal to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-money-bill-wave text-white text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirm Transaction</h3>
              <p className="text-gray-400 text-sm">Please review the details</p>
            </div>

            {/* Transaction Summary */}
            <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/10">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="text-white font-bold text-lg">৳{parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">To</span>
                <span className="text-white font-semibold">{receiverInfo.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type</span>
                <span className="text-white capitalize">{transactionType}</span>
              </div>
              {notes && (
                <div className="pt-2 border-t border-white/10">
                  <span className="text-gray-400 text-sm">Note: </span>
                  <span className="text-white text-sm">{notes}</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  'Confirm & Send'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
