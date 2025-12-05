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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        
        {/* Floating Money Icons */}
        <div className="absolute top-32 right-1/4 text-cyan-500/5 text-6xl animate-float">
          <i className="fi fi-rr-dollar"></i>
        </div>
        <div className="absolute bottom-40 left-1/3 text-blue-500/5 text-5xl animate-float-delayed">
          <i className="fi fi-rr-coins"></i>
        </div>
        <div className="absolute top-1/2 right-20 text-emerald-500/5 text-7xl animate-float-slow">
          <i className="fi fi-rr-wallet"></i>
        </div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/post')}
                className="group h-11 w-11 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 hover:from-slate-700/90 hover:to-slate-600/90 flex items-center justify-center transition-all duration-300 border border-white/10 shadow-lg hover:shadow-cyan-500/20 hover:scale-105"
              >
                <i className="fi fi-br-arrow-left text-white text-lg group-hover:-translate-x-1 transition-transform"></i>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <i className="fi fi-rr-paper-plane text-cyan-400 text-2xl"></i>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Send Money</h1>
                </div>
                <p className="text-xs text-gray-400 ml-10">Quick & Secure Transfer</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-green-500/10 shadow-lg shadow-emerald-500/10">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
              <span className="text-emerald-300 text-xs font-semibold">Secure SSL</span>
              <i className="fi fi-rr-shield-check text-emerald-400 text-sm"></i>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
      `}</style>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Receiver & Balance Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Receiver Card */}
            {receiverInfo && (
              <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 border border-white/10 p-5 backdrop-blur-xl hover:border-cyan-500/30 transition-all duration-300 shadow-xl hover:shadow-cyan-500/10 group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="fi fi-rr-paper-plane text-cyan-400 text-xl"></i>
                    <div className="text-gray-300 text-xs font-bold uppercase tracking-wider">Sending to</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 relative">
                  <div className="relative">
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
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-slate-900 shadow-lg animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg truncate">{receiverInfo.full_name || receiverInfo.name}</h3>
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
            <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/30 p-6 backdrop-blur-xl hover:border-cyan-500/50 transition-all duration-300 shadow-2xl shadow-cyan-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="fi fi-rr-wallet text-emerald-400 text-xl"></i>
                    <span className="text-gray-300 text-xs font-bold uppercase tracking-wider">Available Balance</span>
                  </div>
                  <button
                    onClick={fetchBalance}
                    disabled={balanceLoading}
                    className="w-8 h-8 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all disabled:opacity-50 hover:scale-110 active:scale-95"
                  >
                    <i className={`fi fi-rr-refresh text-sm ${balanceLoading ? 'animate-spin' : ''}`}></i>
                  </button>
                </div>
                {balanceLoading ? (
                  <div className="h-10 bg-white/5 rounded-xl animate-pulse"></div>
                ) : (
                  <div className="text-3xl font-black bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                    ৳{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 p-5 backdrop-blur-xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <i className="fi fi-rr-info text-blue-400 text-2xl"></i>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
                    <i className="fi fi-rr-shield-check text-blue-400 text-xs"></i>
                    Transaction Info
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Transfers are <span className="text-emerald-400 font-semibold">instant and secure</span>. You can send between <span className="text-cyan-400 font-semibold">৳{MIN_AMOUNT}</span> - <span className="text-cyan-400 font-semibold">৳{MAX_AMOUNT.toLocaleString()}</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Transaction Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-white/10 p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-0"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -z-0"></div>
              <div className="relative z-10">
              {/* Payment Methods */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <i className="fi fi-rr-credit-card text-purple-400 text-xl"></i>
                  <label className="block text-sm font-bold text-white">Payment Method</label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 group ${
                        paymentMethod === method.id
                          ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/10 to-green-500/10 shadow-xl shadow-emerald-500/30 scale-105'
                          : 'border-white/10 bg-slate-800/30 hover:border-white/20 hover:bg-slate-700/30'
                      }`}
                    >
                      <div className="text-center relative">
                        <div className={`flex items-center justify-center h-12 transition-transform group-hover:scale-110 ${
                          paymentMethod === method.id ? 'opacity-100' : 'opacity-70'
                        }`}>
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
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <i className="fi fi-rr-coins text-cyan-400 text-xl"></i>
                  <label className="block text-sm font-bold text-white">Amount</label>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">৳</span>
                  </div>
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-2 border-white/10 rounded-xl text-white text-2xl font-bold placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 focus:bg-slate-800/70 transition-all hover:border-white/20"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className="px-5 py-2.5 bg-gradient-to-br from-slate-800/60 to-slate-700/60 hover:from-cyan-500/20 hover:to-blue-500/20 border border-white/10 hover:border-cyan-500/50 rounded-xl text-sm text-gray-300 hover:text-cyan-400 font-semibold transition-all hover:scale-110 active:scale-95 shadow-lg hover:shadow-cyan-500/20"
                    >
                      <i className="fi fi-rr-plus text-xs mr-1"></i>৳{quickAmount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fi fi-rr-edit text-orange-400 text-xl"></i>
                  <label className="block text-sm font-bold text-white">Note (Optional)</label>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a message... 💬"
                  maxLength={50}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 focus:bg-slate-800/70 transition-all resize-none hover:border-white/20"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">✨ Add a personal touch</span>
                  <span className="text-xs text-gray-500 font-medium">{notes.length}/50</span>
                </div>
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
                className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 bg-size-200 hover:bg-pos-100 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all duration-500 shadow-2xl shadow-cyan-500/40 disabled:shadow-none hover:scale-[1.03] active:scale-[0.97] disabled:hover:scale-100 relative overflow-hidden group"
                style={{ backgroundSize: '200% 100%', backgroundPosition: 'left' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                {loading ? (
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    <i className="fi fi-rr-spinner animate-spin text-xl"></i>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    <i className="fi fi-rr-paper-plane text-xl"></i>
                    Send Money
                    <i className="fi fi-rr-arrow-right text-lg group-hover:translate-x-1 transition-transform"></i>
                  </span>
                )}
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/20 max-w-md w-full shadow-2xl shadow-cyan-500/20 animate-scaleIn relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
            <div className="relative z-10">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <i className="fi fi-rr-shield-check text-cyan-400 text-4xl"></i>
                  <div>
                    <h3 className="text-xl font-bold text-white">Confirm Transaction</h3>
                    <p className="text-sm text-gray-400">Review details before sending</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Amount */}
                <div className="text-center py-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20">
                  <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    ৳{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <span>via</span>
                    <div className="flex items-center gap-1 px-3 py-1 bg-slate-800/50 rounded-lg">
                      <i className="fi fi-rr-credit-card text-xs text-emerald-400"></i>
                      <span className="font-semibold text-white">{selectedMethod.name}</span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 bg-slate-800/50 rounded-xl p-5 border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm flex items-center gap-2">
                      <i className="fi fi-rr-user text-xs"></i>
                      To
                    </span>
                    <span className="text-white text-sm font-semibold">{receiverInfo?.full_name}</span>
                  </div>
                  {notes && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <i className="fi fi-rr-comment-alt text-xs"></i>
                        Note
                      </span>
                      <span className="text-white text-sm max-w-[200px] text-right">{notes}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-gray-400 text-sm flex items-center gap-2">
                      <i className="fi fi-rr-wallet text-xs"></i>
                      New Balance
                    </span>
                    <span className="text-emerald-400 text-base font-bold">
                      ৳{(balance - parseFloat(amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-50 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 border border-white/10"
                >
                  <i className="fi fi-rr-cross mr-2"></i>
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-cyan-500/40"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fi fi-rr-spinner animate-spin"></i>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fi fi-rr-check"></i>
                      Confirm & Send
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
