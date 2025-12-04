import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sendMoney, getBalance, getUserById } from '../../../services/api';

export default function SendMoneyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const receiverId = searchParams.get('to');

  const [receiverInfo, setReceiverInfo] = useState(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [balance, setBalance] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [receiverLoading, setReceiverLoading] = useState(true);

  const MIN_AMOUNT = 10;
  const MAX_AMOUNT = 50000;

  const paymentMethods = [
    { 
      id: 'bkash', 
      name: 'bKash', 
      logo: 'https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png',
      color: '#E2136E',
      gradient: 'from-pink-600 to-pink-500'
    },
    { 
      id: 'nagad', 
      name: 'Nagad', 
      logo: 'https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png',
      color: '#EC1C24',
      gradient: 'from-orange-600 to-orange-500'
    },
    { 
      id: 'rocket', 
      name: 'Rocket', 
      logo: 'https://futurestartup.com/wp-content/uploads/2016/09/DBBL-Mobile-Banking-Becomes-Rocket.jpg',
      color: '#8B3090',
      gradient: 'from-purple-600 to-purple-500'
    }
  ];

  // Fetch receiver info
  useEffect(() => {
    if (receiverId) {
      fetchReceiverInfo();
    } else {
      setReceiverLoading(false);
    }
  }, [receiverId]);

  // Fetch balance
  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchReceiverInfo = async () => {
    try {
      setReceiverLoading(true);
      const response = await getUserById(receiverId);
      setReceiverInfo(response.data);
    } catch (err) {
      setError('Failed to load receiver information');
    } finally {
      setReceiverLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      setBalanceLoading(true);
      const response = await getBalance();
      setBalance(response.data.balance || 0);
    } catch (err) {
      setBalance(0);
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

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const validateAndShowConfirm = () => {
    const numAmount = parseFloat(amount);

    if (!receiverInfo?.user_id) {
      setError('Receiver information is missing');
      return;
    }

    if (!amount || numAmount <= 0) {
      setError('Please enter an amount');
      return;
    }

    if (numAmount < MIN_AMOUNT) {
      setError(`Minimum amount is ৳${MIN_AMOUNT}`);
      return;
    }

    if (numAmount > MAX_AMOUNT) {
      setError(`Maximum amount is ৳${MAX_AMOUNT.toLocaleString()}`);
      return;
    }

    if (numAmount > balance) {
      setError('Insufficient balance');
      return;
    }

    setError('');
    setShowConfirm(true);
  };

  const handleSend = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await sendMoney({
        receiver_id: receiverInfo.user_id,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        notes: notes.trim()
      });

      setSuccess('Money sent successfully!');
      await fetchBalance();
      
      setTimeout(() => {
        navigate('/post');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to send money. Please try again.';
      setError(errorMsg);
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const selectedMethod = paymentMethods.find(m => m.id === paymentMethod) || paymentMethods[0];

  if (receiverLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!receiverInfo && receiverId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fi fi-rr-cross-circle text-red-500 text-3xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Receiver Not Found</h2>
          <p className="text-gray-400 mb-6">Unable to load receiver information</p>
          <button
            onClick={() => navigate('/post')}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/post')}
                className="group h-10 w-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center transition-all duration-200 border border-white/5"
              >
                <i className="fi fi-br-arrow-left text-white text-lg group-hover:-translate-x-0.5 transition-transform"></i>
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Send Money</h1>
                <p className="text-xs text-gray-400">Quick & Secure Transfer</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-xs font-medium">Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Receiver & Balance Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Receiver Card */}
            {receiverInfo && (
              <div className="rounded-2xl bg-slate-900/50 border border-white/5 p-5 backdrop-blur-sm hover:border-white/10 transition-all duration-200">
                <div className="flex items-center gap-2 mb-4">
                  <i className="fi fi-rr-paper-plane text-cyan-400 text-sm"></i>
                  <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Sending to</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    {(receiverInfo.profile_picture || receiverInfo.profilePicUrl) ? (
                      <img
                        src={receiverInfo.profile_picture || receiverInfo.profilePicUrl}
                        alt={receiverInfo.full_name || receiverInfo.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/30 shadow-lg group-hover:border-cyan-500/50 transition-all"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border-2 border-cyan-500/30 shadow-lg" style={{ display: (receiverInfo.profile_picture || receiverInfo.profilePicUrl) ? 'none' : 'flex' }}>
                      <span className="text-white text-2xl font-bold">
                        {(receiverInfo.full_name || receiverInfo.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-lg"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg truncate">{receiverInfo.full_name || receiverInfo.name}</h3>
                    {receiverInfo.username && (
                      <p className="text-gray-400 text-sm">@{receiverInfo.username}</p>
                    )}
                    {!receiverInfo.username && receiverInfo.email && (
                      <p className="text-gray-400 text-sm">{receiverInfo.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Balance Card */}
            <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/20 p-5 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-200 shadow-lg shadow-cyan-500/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Available Balance</span>
                <button
                  onClick={fetchBalance}
                  disabled={balanceLoading}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
                >
                  <i className={`fi fi-rr-refresh text-sm ${balanceLoading ? 'animate-spin' : ''}`}></i>
                </button>
              </div>
              {balanceLoading ? (
                <div className="h-8 bg-white/5 rounded-lg animate-pulse"></div>
              ) : (
                <div className="text-2xl font-bold text-white">
                  ৳{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="rounded-2xl bg-blue-500/5 border border-blue-500/20 p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <i className="fi fi-rr-info text-blue-400 text-sm"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-300 mb-1">Transaction Info</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Transfers are instant and secure. You can send between ৳{MIN_AMOUNT} - ৳{MAX_AMOUNT.toLocaleString()}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Transaction Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-slate-900/50 border border-white/5 p-6 backdrop-blur-sm">
              {/* Payment Methods */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-3">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                        paymentMethod === method.id
                          ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/20'
                          : 'border-white/5 bg-transparent hover:border-white/10'
                      }`}
                    >
                      <div className="text-center relative">
                        <div className={`flex items-center justify-center h-12 ${paymentMethod === method.id ? 'opacity-100' : 'opacity-70'}`}>
                          <img 
                            src={method.logo} 
                            alt={method.name}
                            className="h-10 w-auto object-contain"
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-3">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">৳</span>
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl text-white text-xl font-bold placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:bg-slate-800/70 transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className="px-4 py-2 bg-slate-800/50 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/50 rounded-lg text-sm text-gray-300 hover:text-cyan-400 font-medium transition-all hover:scale-105 active:scale-95"
                    >
                      +৳{quickAmount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Note (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a message..."
                  maxLength={50}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:bg-slate-800/70 transition-all resize-none"
                />
                <div className="text-xs text-gray-500 text-right mt-1">{notes.length}/50</div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                  <i className="fi fi-rr-cross-circle text-red-400"></i>
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                  <i className="fi fi-rr-check-circle text-emerald-400"></i>
                  <span className="text-emerald-300 text-sm">{success}</span>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={validateAndShowConfirm}
                disabled={loading || !amount || !receiverInfo}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/25 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fi fi-rr-spinner animate-spin"></i>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fi fi-rr-paper-plane"></i>
                    Send Money
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-white/10 max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <i className="fi fi-rr-shield-check text-cyan-400 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Confirm Transaction</h3>
                  <p className="text-sm text-gray-400">Review before sending</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Amount */}
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-white mb-1">
                  ৳{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-400">via {selectedMethod.name}</div>
              </div>

              {/* Details */}
              <div className="space-y-3 bg-slate-800/30 rounded-xl p-4">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">To</span>
                  <span className="text-white text-sm font-medium">{receiverInfo?.full_name}</span>
                </div>
                {notes && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Note</span>
                    <span className="text-white text-sm max-w-[200px] truncate">{notes}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-white/5">
                  <span className="text-gray-400 text-sm">New Balance</span>
                  <span className="text-cyan-400 text-sm font-semibold">
                    ৳{(balance - parseFloat(amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fi fi-rr-spinner animate-spin"></i>
                    Sending...
                  </span>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
