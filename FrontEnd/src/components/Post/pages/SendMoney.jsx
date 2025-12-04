import React, { useState, useEffect } from 'react';
import { sendMoney, getBalance } from '../../../services/api';

export default function SendMoney({ isOpen, onClose, receiverInfo, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [balance, setBalance] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const MIN_AMOUNT = 10;
  const MAX_AMOUNT = 50000;

  const paymentMethods = [
    { 
      id: 'bkash', 
      name: 'bKash', 
      color: '#E2136E',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500',
      textColor: 'text-pink-500'
    },
    { 
      id: 'nagad', 
      name: 'Nagad', 
      color: '#EC1C24',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-500'
    },
    { 
      id: 'rocket', 
      name: 'Rocket', 
      color: '#8B3090',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-500'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      console.log('SendMoney opened with receiverInfo:', receiverInfo);
      fetchBalance();
      setAmount('');
      setNotes('');
      setError('');
      setSuccess('');
      setPaymentMethod('bkash');
      setShowPaymentMethods(false);
      setShowConfirm(false);
      setBalanceLoading(true);
    }
  }, [isOpen]);

  const fetchBalance = async () => {
    setBalanceLoading(true);
    try {
      const response = await getBalance();
      setBalance(response.data.balance || 0);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance(0);
      setError('Could not fetch balance. Please try again.');
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
      setError('');
      setSuccess('');
    }
  };

  const validateAndShowConfirm = () => {
    console.log('Validate clicked', { amount, balance, receiverInfo });
    setError('');
    
    const amountNum = parseFloat(amount);
    
    if (!amountNum || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum < MIN_AMOUNT) {
      setError(`Minimum amount is ৳${MIN_AMOUNT}`);
      return;
    }

    if (amountNum > MAX_AMOUNT) {
      setError(`Maximum amount is ৳${MAX_AMOUNT.toLocaleString()}`);
      return;
    }

    if (amountNum > balance) {
      setError(`Insufficient balance. Available: ৳${balance.toFixed(2)}`);
      return;
    }

    if (!receiverInfo?.user_id) {
      setError('Invalid receiver information');
      return;
    }

    setShowConfirm(true);
  };

  const handleSend = async () => {
    setError('');
    setSuccess('');

    const amountNum = parseFloat(amount);
    setLoading(true);

    try {
      const response = await sendMoney({
        receiver_id: receiverInfo.user_id,
        amount: amountNum,
        notes: notes.trim() || `Payment via ${paymentMethods.find(m => m.id === paymentMethod)?.name}`
      });

      if (response.data) {
        setSuccess(`৳${amountNum.toFixed(2)} sent successfully!`);
        setShowConfirm(false);
        setAmount('');
        setNotes('');
        await fetchBalance();

        if (onSuccess) {
          onSuccess(response.data);
        }

        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Send money error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to send money. Please try again.';
      setError(errorMsg);
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedMethod = paymentMethods.find(m => m.id === paymentMethod) || paymentMethods[0];

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950">
      <div className="w-full h-full flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/95">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
              className="group h-10 w-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-all duration-200 border border-white/10"
              >
                <i className="fi fi-br-arrow-left text-white text-xl group-hover:-translate-x-0.5 transition-transform"></i>
              </button>
              <div>
              <h2 className="text-xl font-semibold text-white">Send Money</h2>
              <p className="text-xs text-gray-400">Choose method & amount</p>
              </div>
            </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-[11px] font-medium">Secure transfer</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-start justify-center pt-8">
          {/* Left: receiver + balance */}
          <div className="hidden md:flex w-2/5 h-[420px] flex-col justify-start gap-6 px-8 border-r border-white/5 bg-slate-950 rounded-l-3xl pt-8">
            {/* Receiver card */}
            <div className="rounded-2xl border border-white/10 bg-slate-900 px-6 py-5">
              <div className="text-gray-400 text-[11px] font-semibold uppercase tracking-[0.2em] mb-3">Sending to</div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {receiverInfo.profile_picture ? (
                      <img
                        src={receiverInfo.profile_picture}
                        alt={receiverInfo.full_name}
                        className="w-16 h-16 rounded-2xl object-cover border border-primary-teal/40 shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-primary-teal/20 flex items-center justify-center text-white font-semibold text-2xl shadow-md">
                        {receiverInfo.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-lg truncate">{receiverInfo.full_name}</div>
                    <div className="text-primary-teal text-sm">@{receiverInfo.username}</div>
                  </div>
                </div>
              </div>

            {/* Balance card */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-1">Balance</div>
                  {balanceLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-teal border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xl text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-semibold text-white">৳{balance.toFixed(2)}</div>
                      <div className="text-xs text-gray-400 mt-1">Available to send</div>
                    </>
                  )}
                </div>
                <div className="w-11 h-11 rounded-xl bg-primary-teal/20 flex items-center justify-center text-primary-teal">
                  <i className="fas fa-wallet"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="flex-1 flex items-start justify-center px-4 py-8 md:px-10">
            <div className="w-full max-w-lg space-y-6 h-[420px] flex flex-col justify-start rounded-r-3xl bg-slate-950 pt-8">
              {/* Payment Method */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
                  <i className="fas fa-credit-card text-primary-teal"></i>
                  Payment method
                </label>
                
                {/* Simple row of 3 options */}
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map(method => {
                    const isActive = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition-colors ${
                          isActive
                            ? 'border-white/60 bg-white/10 text-white'
                            : 'border-white/10 bg-slate-900 hover:bg-slate-800 text-gray-300'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                          style={{ backgroundColor: method.color }}
                        >
                          {method.name === 'bKash' ? 'bK' : method.name.charAt(0)}
                        </div>
                        <span>{method.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
                  <i className="fas fa-coins text-primary-teal"></i>
                  Amount
                  <span className="text-gray-500 text-[11px] font-normal normal-case">(min ৳10, max ৳50,000)</span>
                </label>
                <div className="relative rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 flex items-center gap-3">
                  <div className="text-2xl text-gray-500 font-semibold">৳</div>
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    disabled={balanceLoading || loading}
                    className="flex-1 bg-transparent text-2xl md:text-3xl font-semibold text-white placeholder:text-gray-700 focus:outline-none disabled:opacity-50"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap justify-center">
                  {[50, 100, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      disabled={balanceLoading || loading}
                      className="px-4 py-2 rounded-full border border-white/10 text-xs text-gray-200 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +৳{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
                  <i className="fas fa-comment-dots text-primary-teal"></i>
                  Note
                  <span className="text-gray-500 text-[11px] font-normal normal-case">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What's this payment for?"
                    maxLength={100}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-teal transition-colors"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 text-xs font-bold">
                    {notes.length}/100
                  </div>
                </div>
              </div>

              {/* Status */}
              {success && (
                <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center gap-2">
                  <i className="fas fa-check-circle" />
                  <span>{success}</span>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
                  <i className="fas fa-exclamation-triangle" />
                  <span>{error}</span>
                </div>
              )}

              {/* Primary action */}
              <button
                onClick={validateAndShowConfirm}
                disabled={!amount || parseFloat(amount) <= 0 || loading || success || balanceLoading}
                className="mt-1 w-full rounded-xl bg-primary-teal hover:bg-primary-teal/90 disabled:bg-slate-700 disabled:text-gray-400 py-3.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" />
                    <span>Review & Send ৳{amount || '0.00'}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-gray-500 text-[11px]">
                <i className="fas fa-lock" />
                <span>256-bit encrypted • Secure transaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <i className="fas fa-receipt text-primary-teal"></i>
                Confirm Transaction
              </h3>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Amount */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                <div className="text-xs text-gray-400 mb-1">You're sending</div>
                <div className="text-3xl font-bold text-white">৳{parseFloat(amount).toFixed(2)}</div>
              </div>

              {/* Recipient */}
              <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                <div className="w-12 h-12 rounded-xl bg-primary-teal/20 flex items-center justify-center text-primary-teal font-semibold">
                  {receiverInfo.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-400">To</div>
                  <div className="text-white font-semibold">{receiverInfo.full_name}</div>
                  <div className="text-xs text-primary-teal">@{receiverInfo.username}</div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/5">
                <span className="text-sm text-gray-400">Payment method</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
                    style={{ backgroundColor: selectedMethod.color }}
                  >
                    {selectedMethod.name === 'bKash' ? 'bK' : selectedMethod.name.charAt(0)}
                  </div>
                  <span className="text-white font-medium">{selectedMethod.name}</span>
                </div>
              </div>

              {/* Note */}
              {notes && (
                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                  <div className="text-xs text-gray-400 mb-1">Note</div>
                  <div className="text-sm text-white">{notes}</div>
                </div>
              )}

              {/* New Balance Preview */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/5">
                <span className="text-sm text-gray-400">New balance</span>
                <span className="text-white font-semibold">৳{(balance - parseFloat(amount)).toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-teal to-blue-500 hover:from-primary-teal/90 hover:to-blue-500/90 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    <span>Confirm</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
