import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  sendMoney, 
  getBalance, 
  getUserById,
  searchUsers,
  initiateMobileWalletPayment,
  verifyMobileWalletPayment,
  checkPaymentStatus,
  initiateSSLCommerzPayment
} from '../../../services/api';

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
  const [isDummyMode, setIsDummyMode] = useState(true); // Toggle between dummy and real API
  
  // Phone number search states
  const [phoneSearch, setPhoneSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);

  const MIN_AMOUNT = 50;
  const MAX_AMOUNT = 5000;

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
    },
    { 
      id: 'sslcommerz', 
      name: 'Card Payment', 
      logo: 'https://seeklogo.com/images/S/sslcommerz-logo-79BD65046D-seeklogo.com.png',
      color: '#1A8FE3',
      gradient: 'from-blue-600 to-indigo-600',
      description: 'Visa, MasterCard, Amex & more'
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
    if (!receiverId) return;
    
    try {
      setReceiverLoading(true);
      const response = await getUserById(receiverId);
      console.log('Receiver info loaded from URL:', response.data);
      
      // Ensure the receiver has the id field set
      const receiver = response.data;
      if (receiver && !receiver.id && receiver.user_id) {
        receiver.id = receiver.user_id;
      }
      
      setReceiverInfo(receiver);
    } catch (err) {
      console.error('Failed to load receiver:', err);
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

  // Phone number search handler
  const handlePhoneSearch = async (value) => {
    setPhoneSearch(value);
    
    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await searchUsers(value.trim());
      setSearchResults(response.data.data || []);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Select user from search results
  const selectUser = (user) => {
    console.log('User selected from search:', user);
    
    // Ensure the user object has an id field
    const receiver = { ...user };
    if (!receiver.id && receiver.user_id) {
      receiver.id = receiver.user_id;
    }
    
    setReceiverInfo(receiver);
    setPhoneSearch('');
    setSearchResults([]);
    setShowSearchResults(false);
    setError(''); // Clear any previous errors
  };

  // Clear selected receiver
  const clearReceiver = () => {
    setReceiverInfo(null);
    setPhoneSearch('');
    setAmount('');
    setNotes('');
  };

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const validateAndShowConfirm = () => {
    // Check if receiver exists and has valid ID
    const targetReceiverId = receiverInfo?.id || receiverInfo?.user_id;
    
    console.log('Validation check:', {
      receiverInfo,
      targetReceiverId,
      hasReceiverInfo: !!receiverInfo,
      hasId: !!targetReceiverId,
      receiverLoading
    });

    // Check if receiver is still loading
    if (receiverLoading) {
      setError('Please wait, loading receiver information...');
      return;
    }

    if (!receiverInfo) {
      setError('Please search and select a receiver first');
      return;
    }

    if (!targetReceiverId) {
      setError('Receiver information is incomplete. Please select again.');
      return;
    }

    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
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
      setError('Insufficient balance. Please add funds first.');
      return;
    }

    setError('');
    setShowConfirm(true);
  };

  const handleSend = async () => {
    try {
      setLoading(true);
      setError('');

      const receiverId = receiverInfo.id || receiverInfo.user_id;

      // Handle SSLCommerz (Credit/Debit Card) payment separately
      if (paymentMethod === 'sslcommerz') {
        const response = await initiateSSLCommerzPayment({
          receiver_id: receiverId,
          amount: parseFloat(amount),
          notes: notes.trim()
        });

        if (response.data.success && response.data.gatewayUrl) {
          console.log('Redirecting to SSLCommerz:', response.data.gatewayUrl);
          
          // Store transaction info for redirect callback
          localStorage.setItem('pending_transaction_id', response.data.transaction_id);
          localStorage.setItem('payment_method', 'sslcommerz');
          localStorage.setItem('ssl_session_key', response.data.session_key);
          
          // Redirect to SSLCommerz gateway
          window.location.href = response.data.gatewayUrl;
        } else {
          throw new Error('Failed to initialize SSLCommerz payment');
        }
        return;
      }

      // Handle Mobile Wallet payments (bKash, Nagad, Rocket)
      const apiUrl = isDummyMode 
        ? 'http://localhost:5000/api/dummy-mobile-wallet/initiate'
        : 'http://localhost:5000/api/mobile-wallet/initiate';

      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: receiverId,
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          notes: notes.trim()
        })
      });

      const data = await response.json();

      if (data.success && data.data.payment_url) {
        console.log('Redirecting to payment gateway:', data.data.payment_url);
        
        // Store transaction ID and mode for verification after redirect back
        localStorage.setItem('pending_transaction_id', data.data.transaction_id);
        localStorage.setItem('payment_method', paymentMethod);
        localStorage.setItem('payment_mode', isDummyMode ? 'dummy' : 'real');
        
        // Redirect to payment gateway
        window.location.href = data.data.payment_url;
      } else {
        throw new Error('Failed to get payment URL');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to initiate payment. Please try again.';
      setError(errorMsg);
      setShowConfirm(false);
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.7);
        }
      `}</style>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Sidebar - Receiver & Balance Info */}
          <div className="lg:col-span-1 space-y-3">
            
            {/* Phone Number Search - Show when no receiver selected */}
            {!receiverInfo && !receiverId && (
              <div ref={searchRef} className="rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 border border-white/10 p-4 backdrop-blur-xl shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fi fi-rr-search text-cyan-400 text-xl"></i>
                  <h3 className="text-white font-semibold">Find Receiver</h3>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter phone, name, or username..."
                    value={phoneSearch}
                    onChange={(e) => handlePhoneSearch(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                {/* Search Results */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="mt-3 max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => selectUser(user)}
                        className="w-full p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          {user.profile_picture ? (
                            <img
                              src={user.profile_picture}
                              alt={user.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                              <span className="text-white font-bold">{user.full_name?.charAt(0)}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{user.full_name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {user.username && <span>@{user.username}</span>}
                              {user.phone && (
                                <>
                                  {user.username && <span>•</span>}
                                  <span>{user.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <i className="fi fi-rr-arrow-right text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {showSearchResults && searchResults.length === 0 && !searchLoading && phoneSearch.length >= 2 && (
                  <div className="mt-3 text-center py-4 text-gray-400 text-sm">
                    <i className="fi fi-rr-user-slash text-2xl mb-2"></i>
                    <p>No users found</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Receiver Card */}
            {receiverInfo && (
              <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 border border-white/10 p-4 backdrop-blur-xl hover:border-cyan-500/30 transition-all duration-300 shadow-xl hover:shadow-cyan-500/10 group">
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
                    {receiverInfo.phone && (
                      <p className="text-gray-400 text-sm flex items-center gap-1">
                        <i className="fi fi-rr-phone-call text-xs"></i>
                        {receiverInfo.phone}
                      </p>
                    )}
                    {!receiverInfo.username && !receiverInfo.phone && receiverInfo.email && (
                      <p className="text-gray-400 text-sm">{receiverInfo.email}</p>
                    )}
                  </div>
                </div>
                {!receiverId && (
                  <button
                    onClick={clearReceiver}
                    className="mt-3 w-full py-2 bg-slate-800/50 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 rounded-lg text-red-400 text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fi fi-rr-cross-circle"></i>
                    Change Receiver
                  </button>
                )}
              </div>
            )}

            {/* Balance Card */}
            <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/30 p-4 backdrop-blur-xl hover:border-cyan-500/50 transition-all duration-300 shadow-2xl shadow-cyan-500/20 relative overflow-hidden group">
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
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 p-4 backdrop-blur-xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group">
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
            <div className="rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-white/10 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-0"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -z-0"></div>
              <div className="relative z-10">
              {/* Test Mode Toggle */}
              <div className="mb-5 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">Test Mode</span>
                  <button
                    onClick={() => setIsDummyMode(!isDummyMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDummyMode ? 'bg-amber-500' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                        isDummyMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <i className="fi fi-rr-credit-card text-purple-400 text-xl"></i>
                  <label className="block text-sm font-bold text-white">Payment Method</label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`relative p-4 rounded-xl border transition-all duration-300 group ${
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
              <div className="mb-5">
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
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border-2 border-white/10 rounded-xl text-white text-2xl font-bold placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 focus:bg-slate-800/70 transition-all hover:border-white/20"
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
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fi fi-rr-edit text-orange-400 text-xl"></i>
                  <label className="block text-sm font-bold text-white">Note (Optional)</label>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a message... 💬"
                  maxLength={50}
                  rows={2}
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
                className="w-full py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 bg-size-200 hover:bg-pos-100 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all duration-500 shadow-2xl shadow-cyan-500/40 disabled:shadow-none hover:scale-[1.03] active:scale-[0.97] disabled:hover:scale-100 relative overflow-hidden group"
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

                {/* Receiver Info */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    {receiverInfo?.profile_picture ? (
                      <img
                        src={receiverInfo.profile_picture}
                        alt={receiverInfo.full_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {receiverInfo?.full_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{receiverInfo?.full_name}</p>
                      {receiverInfo?.username && (
                        <p className="text-gray-400 text-xs">@{receiverInfo.username}</p>
                      )}
                      {receiverInfo?.phone && (
                        <p className="text-gray-400 text-xs flex items-center gap-1">
                          <i className="fi fi-rr-phone-call"></i>
                          {receiverInfo.phone}
                        </p>
                      )}
                    </div>
                    <i className="fi fi-rr-check-circle text-emerald-400 text-xl"></i>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-3 bg-slate-800/50 rounded-xl p-5 border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm flex items-center gap-2">
                      <i className="fi fi-rr-coins text-xs"></i>
                      Amount
                    </span>
                    <span className="text-white text-lg font-bold">৳{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm flex items-center gap-2">
                      <i className="fi fi-rr-credit-card text-xs"></i>
                      Method
                    </span>
                    <span className="text-white text-sm font-semibold">{selectedMethod.name}</span>
                  </div>
                  {notes && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <i className="fi fi-rr-comment-alt text-xs"></i>
                        Note
                      </span>
                      <span className="text-white text-sm max-w-[180px] text-right">{notes}</span>
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
