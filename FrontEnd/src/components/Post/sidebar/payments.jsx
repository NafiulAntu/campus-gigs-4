import React, { useState, useEffect } from "react";
import { getTransactions, getBalance, getPaymentHistory } from "../../../services/api";
import api from "../../../services/api";

export default function Payments({ onBack }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions, setTransactions] = useState([]);
  const [paymentTransactions, setPaymentTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showWithdrawMethods, setShowWithdrawMethods] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawProcessing, setWithdrawProcessing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

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
      const [transactionsRes, balanceRes, paymentHistoryRes] = await Promise.all([
        getTransactions(50),
        getBalance(),
        getPaymentHistory()
      ]);

      setTransactions(transactionsRes.data.transactions || []);
      setPaymentTransactions(paymentHistoryRes.data || []);
      setBalance(balanceRes.data.balance || 0);
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleWithdrawAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setWithdrawAmount(value);
    setWithdrawError('');
    setWithdrawSuccess('');
  };

  const handleWithdraw = async () => {
    // Clear previous messages
    setWithdrawError('');
    setWithdrawSuccess('');

    // Validation
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      setWithdrawError('Please enter a valid amount');
      return;
    }

    if (amount < 500) {
      setWithdrawError('Minimum withdrawal amount is ৳500');
      return;
    }

    if (amount > balance) {
      setWithdrawError('Insufficient balance');
      return;
    }

    if (!selectedMethod) {
      setWithdrawError('Please select a payment method');
      return;
    }

    if (!withdrawAccount.trim()) {
      setWithdrawError('Please enter your account number');
      return;
    }

    try {
      setWithdrawProcessing(true);
      
      const response = await api.post('/transactions/withdraw', {
        amount: amount,
        payment_method: selectedMethod,
        account_number: withdrawAccount
      });

      if (response.data.success) {
        setWithdrawSuccess(`Withdrawal of ৳${amount.toFixed(2)} initiated successfully! Transaction ID: ${response.data.transaction.id}`);
        // Refresh balance and transactions
        await fetchData();
        // Reset form
        setWithdrawAmount('');
        setWithdrawAccount('');
        setSelectedMethod(null);
        setShowWithdrawMethods(false);
      }
    } catch (error) {
      setWithdrawError(error.response?.data?.message || 'Failed to process withdrawal. Please try again.');
    } finally {
      setWithdrawProcessing(false);
    }
  };

  const recentTransactions = transactions.slice(0, 5);
  
  // Merge payment transactions (subscriptions) with user transactions for Recent Activity
  const allRecentActivity = [
    ...transactions.map(t => ({ ...t, type: 'user_transaction' })),
    ...paymentTransactions.filter(p => p.subscription_id).map(p => ({ ...p, type: 'payment_transaction' }))
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
  
  const thisMonthTransactions = transactions.filter(t => {
    const date = new Date(t.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  
  const thisMonthTotal = thisMonthTransactions.reduce((sum, t) => {
    return t.receiver_id === currentUserId ? sum + parseFloat(t.amount) : sum - parseFloat(t.amount);
  }, 0);
  
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const pendingTotal = pendingTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto py-6 px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onBack}
              className="h-9 w-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <i className="fi fi-br-arrow-left text-white text-xl"></i>
            </button>
            <h1 className="text-2xl font-bold text-white">Payments</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10">
            {[
              { key: "overview", label: "Overview", icon: "fi fi-br-dashboard" },
              { key: "transactions", label: "Transactions", icon: "fi fi-br-list" },
              { key: "methods", label: "Payment Methods", icon: "fi fi-br-credit-card" },
              { key: "withdraw", label: "Withdraw", icon: "fi fi-br-wallet" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "text-primary-teal border-b-2 border-primary-teal"
                    : "text-text-muted hover:text-white"
                }`}
              >
                <i className={`${tab.icon} text-sm`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary-teal border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-primary-teal to-blue-500 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm opacity-90">Available Balance</span>
                      <i className="fi fi-br-wallet text-xl"></i>
                    </div>
                    <p className="text-3xl font-bold mb-1">৳{balance.toFixed(2)}</p>
                    <p className="text-sm opacity-75">
                      {thisMonthTotal >= 0 ? '+' : ''}৳{thisMonthTotal.toFixed(2)} this month
                    </p>
                  </div>

                  <div className="bg-white/[0.04] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-text-muted">Pending</span>
                      <i className="fi fi-br-clock text-xl text-yellow-400"></i>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">৳{pendingTotal.toFixed(2)}</p>
                    <p className="text-sm text-text-muted">{pendingTransactions.length} transaction{pendingTransactions.length !== 1 ? 's' : ''}</p>
                  </div>

                  <div className="bg-white/[0.04] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-text-muted">This Month</span>
                      <i className="fi fi-br-chart-line-up text-xl text-green-400"></i>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">৳{Math.abs(thisMonthTotal).toFixed(2)}</p>
                    <p className="text-sm text-text-muted">{thisMonthTransactions.length} transaction{thisMonthTransactions.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </>
            )}

            {/* Quick Actions */}
            <div className="bg-white/[0.04] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: "fi fi-br-download", label: "Withdraw Funds", color: "text-green-400" },
                  { icon: "fi fi-br-paper-plane", label: "Send Money", color: "text-blue-400" },
                  { icon: "fi fi-br-document", label: "Invoices", color: "text-purple-400" },
                  { icon: "fi fi-br-settings", label: "Settings", color: "text-orange-400" },
                ].map((action, idx) => (
                  <button
                    key={idx}
                    className="p-4 bg-white/[0.04] rounded-lg hover:bg-white/[0.08] transition-colors text-center"
                  >
                    <i className={`${action.icon} text-3xl ${action.color} mb-2`}></i>
                    <p className="text-sm font-medium text-white">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/[0.04] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Recent Activity
              </h2>
              <div className="space-y-3">
                {allRecentActivity.length === 0 ? (
                  <p className="text-text-muted text-center py-8">No recent transactions</p>
                ) : (
                  allRecentActivity.map((txn) => {
                    // Handle payment transactions (subscriptions)
                    if (txn.type === 'payment_transaction') {
                      const planName = txn.subscription_id ? 
                        (txn.amount >= 1500 ? 'Yearly Premium' : 
                         txn.amount >= 150 ? '30 Days Premium' : 
                         '15 Days Premium') : 'Premium';
                      
                      return (
                        <div
                          key={`payment-${txn.id}`}
                          className="flex items-center justify-between p-3 bg-white/[0.04] rounded-lg border border-primary-teal/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-teal to-blue-500 flex items-center justify-center">
                              <i className="fi fi-br-crown text-white"></i>
                            </div>
                            <div>
                              <p className="font-medium text-white flex items-center gap-2">
                                Premium Subscription
                                {txn.status === 'success' && (
                                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                                    Completed
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-text-muted">
                                {planName} • {formatDate(txn.created_at)}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-red-400">
                            -৳{parseFloat(txn.amount).toFixed(2)}
                          </span>
                        </div>
                      );
                    }
                    
                    // Handle user transactions (P2P transfers)
                    const isReceived = txn.receiver_id === currentUserId;
                    const otherUser = isReceived 
                      ? { name: txn.sender_name, username: txn.sender_username }
                      : { name: txn.receiver_name, username: txn.receiver_username };
                    
                    return (
                      <div
                        key={`user-${txn.id}`}
                        className="flex items-center justify-between p-3 bg-white/[0.04] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              isReceived
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            <i
                              className={`fi ${
                                isReceived
                                  ? "fi-br-arrow-small-down"
                                  : "fi-br-arrow-small-up"
                              }`}
                            ></i>
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {isReceived ? 'From' : 'To'} {otherUser.name}
                            </p>
                            <p className="text-sm text-text-muted">
                              {txn.notes || `@${otherUser.username}`} • {formatDate(txn.created_at)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-bold ${
                            isReceived
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {isReceived ? "+" : "-"}৳
                          {parseFloat(txn.amount).toFixed(2)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2 mb-4">
              {["All", "Received", "Sent", "Pending"].map((filter) => (
                <button
                  key={filter}
                  className="px-4 py-2 bg-white/[0.04] hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Transactions List */}
            <div className="bg-white/[0.04] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/[0.04]">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-text-muted">
                      Transaction ID
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-text-muted">
                      Description
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-text-muted">
                      Date
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-text-muted">
                      Amount
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-text-muted">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400">
                        <i className="fi fi-rr-inbox text-3xl mb-2 block"></i>
                        No transactions yet
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn) => {
                      const isReceived = txn.receiver_id === currentUserId;
                      const isSent = txn.sender_id === currentUserId;
                      const otherPerson = isReceived 
                        ? { name: txn.sender_name, username: txn.sender_username }
                        : { name: txn.receiver_name, username: txn.receiver_username };
                      
                      return (
                        <tr
                          key={txn.id}
                          className="border-t border-white/10 hover:bg-white/[0.04] transition-colors"
                        >
                          <td className="p-4 text-white font-mono text-sm">
                            #{txn.id}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-white font-medium">
                                {isReceived ? 'Received from' : 'Sent to'} {otherPerson.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                @{otherPerson.username}
                                {txn.payment_method && (
                                  <span className="ml-2 px-2 py-0.5 bg-primary-teal/20 text-primary-teal rounded text-xs">
                                    {txn.payment_method.toUpperCase()}
                                  </span>
                                )}
                              </span>
                              {txn.notes && (
                                <span className="text-xs text-gray-500 mt-1 italic">"{txn.notes}"</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-text-muted text-sm">
                            {formatDate(txn.created_at)}
                          </td>
                          <td
                            className={`p-4 font-bold ${
                              isReceived
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {isReceived ? "+" : "-"}৳{parseFloat(txn.amount).toFixed(2)}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                txn.status === "completed" || txn.status === "success"
                                  ? "bg-green-500/20 text-green-400"
                                  : txn.status === "pending"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === "methods" && (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Payment Methods
              </h2>
              <p className="text-text-muted">
                Choose your preferred payment method for transactions
              </p>
            </div>

            {/* Mobile Banking */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fi fi-br-smartphone text-primary-teal"></i>
                Mobile Banking
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* bKash */}
                <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-4 hover:border-pink-500/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center">
                      <img 
                        src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" 
                        alt="bKash" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                      Available
                    </span>
                  </div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-pink-400 transition-colors text-sm">bKash</h4>
                  <p className="text-xs text-text-muted">Instant mobile wallet payment</p>
                </div>

                {/* Nagad */}
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4 hover:border-orange-500/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center">
                      <img 
                        src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" 
                        alt="Nagad" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                      Available
                    </span>
                  </div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-orange-400 transition-colors text-sm">Nagad</h4>
                  <p className="text-xs text-text-muted">Fast & secure digital payments</p>
                </div>

                {/* Rocket */}
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center">
                      <img 
                        src="https://futurestartup.com/wp-content/uploads/2016/09/DBBL-Mobile-Banking-Becomes-Rocket.jpg" 
                        alt="Rocket" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                      Available
                    </span>
                  </div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-purple-400 transition-colors text-sm">Rocket</h4>
                  <p className="text-xs text-text-muted">Dutch-Bangla Bank mobile wallet</p>
                </div>
              </div>
            </div>

            {/* Card Payments */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fi fi-br-credit-card text-primary-teal"></i>
                Card Payments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Visa */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 hover:border-blue-500/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" 
                        alt="Visa" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                      Available
                    </span>
                  </div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors text-sm">Visa</h4>
                  <p className="text-xs text-text-muted">Credit & Debit cards accepted</p>
                </div>

                {/* Mastercard */}
                <div className="bg-gradient-to-br from-red-500/10 to-orange-600/5 border border-red-500/20 rounded-xl p-4 hover:border-red-500/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                        alt="Mastercard" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                      Available
                    </span>
                  </div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-red-400 transition-colors text-sm">Mastercard</h4>
                  <p className="text-xs text-text-muted">All Mastercard types supported</p>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-primary-teal/10 border border-primary-teal/20 rounded-xl p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-teal/20 flex items-center justify-center">
                    <i className="fi fi-br-shield-check text-primary-teal text-xl"></i>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Secure Payments</h4>
                  <p className="text-sm text-text-muted">
                    All payments are processed securely through SSLCommerz payment gateway. 
                    Your financial information is encrypted and protected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === "withdraw" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/[0.04] rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                Withdraw Funds
              </h2>
              <div className="space-y-5">
                <div className="p-4 bg-gradient-to-br from-primary-teal/10 to-primary-teal/5 border border-primary-teal/30 rounded-lg">
                  <p className="text-gray-300 font-medium mb-1 text-sm">
                    Available Balance
                  </p>
                  <p className="text-3xl font-bold text-primary-teal">
                    ৳{balance.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Withdrawal Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold">
                      ৳
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={handleWithdrawAmountChange}
                      disabled={withdrawProcessing}
                      className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-primary-teal transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Minimum withdrawal: ৳500.00
                  </p>
                </div>

                <div>
                  <button 
                    onClick={() => setShowWithdrawMethods(!showWithdrawMethods)}
                    className="group w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-white/[0.06] to-white/[0.03] border border-white/10 rounded-lg hover:border-primary-teal/50 transition-all duration-300 mb-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-5 h-5">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" className="text-primary-teal"/>
                          <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-gray-200 group-hover:text-primary-teal transition-colors">Select Payment Method</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedMethod && (
                        <span className="text-xs px-2 py-1 bg-primary-teal/10 text-primary-teal rounded-full border border-primary-teal/30 font-medium">
                          {selectedMethod === 'bkash' ? 'bKash' : selectedMethod === 'nagad' ? 'Nagad' : selectedMethod === 'rocket' ? 'Rocket' : 'Bank'}
                        </span>
                      )}
                      <i className={`fi fi-rr-angle-small-down text-xl text-gray-400 group-hover:text-primary-teal transition-all duration-300 ${showWithdrawMethods ? 'rotate-180' : ''}`}></i>
                    </div>
                  </button>
                  
                  {showWithdrawMethods && (
                    <div className="grid grid-cols-1 gap-3 animate-[slideDown_0.3s_ease-out]">
                      {/* Mobile Banking */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mobile Banking</p>
                        
                        {/* bKash */}
                        <div>
                          <label className="flex items-center gap-3 p-3 bg-white/[0.04] border border-white/10 rounded-lg cursor-pointer hover:border-pink-500/40 transition-all group">
                            <input 
                              type="radio" 
                              name="withdrawMethod" 
                              value="bkash"
                              checked={selectedMethod === 'bkash'}
                              onChange={(e) => setSelectedMethod(e.target.value)}
                              className="w-4 h-4 text-pink-500 bg-transparent border-gray-500 focus:ring-pink-500" 
                            />
                            <div className="h-8 w-8 rounded flex items-center justify-center flex-shrink-0">
                              <img 
                                src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" 
                                alt="bKash" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="text-gray-200 font-medium group-hover:text-pink-400 transition-colors">bKash</span>
                          </label>
                          {selectedMethod === 'bkash' && (
                            <div className="mt-2 ml-7 space-y-2 animate-[slideDown_0.2s_ease-out]">
                              <input
                                type="tel"
                                placeholder="bKash Account Number (e.g., 01XXXXXXXXX)"
                                value={selectedMethod === 'bkash' ? withdrawAccount : ''}
                                onChange={(e) => setWithdrawAccount(e.target.value)}
                                disabled={withdrawProcessing}
                                className="w-full px-4 py-2 bg-white/[0.04] border border-pink-500/30 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-pink-500 transition-colors disabled:opacity-50"
                              />
                              <p className="text-xs text-gray-400">Enter your 11-digit bKash account number</p>
                            </div>
                          )}
                        </div>

                        {/* Nagad */}
                        <div>
                          <label className="flex items-center gap-3 p-3 bg-white/[0.04] border border-white/10 rounded-lg cursor-pointer hover:border-orange-500/40 transition-all group">
                            <input 
                              type="radio" 
                              name="withdrawMethod" 
                              value="nagad"
                              checked={selectedMethod === 'nagad'}
                              onChange={(e) => setSelectedMethod(e.target.value)}
                              className="w-4 h-4 text-orange-500 bg-transparent border-gray-500 focus:ring-orange-500" 
                            />
                            <div className="h-8 w-8 rounded flex items-center justify-center flex-shrink-0">
                              <img 
                                src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" 
                                alt="Nagad" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="text-gray-200 font-medium group-hover:text-orange-400 transition-colors">Nagad</span>
                          </label>
                          {selectedMethod === 'nagad' && (
                            <div className="mt-2 ml-7 space-y-2 animate-[slideDown_0.2s_ease-out]">
                              <input
                                type="tel"
                                placeholder="Nagad Account Number (e.g., 01XXXXXXXXX)"
                                value={selectedMethod === 'nagad' ? withdrawAccount : ''}
                                onChange={(e) => setWithdrawAccount(e.target.value)}
                                disabled={withdrawProcessing}
                                className="w-full px-4 py-2 bg-white/[0.04] border border-orange-500/30 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
                              />
                              <p className="text-xs text-gray-400">Enter your 11-digit Nagad account number</p>
                            </div>
                          )}
                        </div>

                        {/* Rocket */}
                        <div>
                          <label className="flex items-center gap-3 p-3 bg-white/[0.04] border border-white/10 rounded-lg cursor-pointer hover:border-purple-500/40 transition-all group">
                            <input 
                              type="radio" 
                              name="withdrawMethod" 
                              value="rocket"
                              checked={selectedMethod === 'rocket'}
                              onChange={(e) => setSelectedMethod(e.target.value)}
                              className="w-4 h-4 text-purple-500 bg-transparent border-gray-500 focus:ring-purple-500" 
                            />
                            <div className="h-8 w-8 rounded flex items-center justify-center flex-shrink-0">
                              <img 
                                src="https://futurestartup.com/wp-content/uploads/2016/09/DBBL-Mobile-Banking-Becomes-Rocket.jpg" 
                                alt="Rocket" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="text-gray-200 font-medium group-hover:text-purple-400 transition-colors">Rocket (DBBL)</span>
                          </label>
                          {selectedMethod === 'rocket' && (
                            <div className="mt-2 ml-7 space-y-2 animate-[slideDown_0.2s_ease-out]">
                              <input
                                type="tel"
                                placeholder="Rocket Account Number (e.g., 01XXXXXXXXX)"
                                value={selectedMethod === 'rocket' ? withdrawAccount : ''}
                                onChange={(e) => setWithdrawAccount(e.target.value)}
                                disabled={withdrawProcessing}
                                className="w-full px-4 py-2 bg-white/[0.04] border border-purple-500/30 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                              />
                              <p className="text-xs text-gray-400">Enter your 11-digit Rocket account number</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bank Transfer */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Bank Transfer</p>
                        
                        <div>
                          <label className="flex items-center gap-3 p-3 bg-white/[0.04] border border-white/10 rounded-lg cursor-pointer hover:border-green-500/40 transition-all group">
                            <input 
                              type="radio" 
                              name="withdrawMethod" 
                              value="bank"
                              checked={selectedMethod === 'bank'}
                              onChange={(e) => setSelectedMethod(e.target.value)}
                              className="w-4 h-4 text-green-500 bg-transparent border-gray-500 focus:ring-green-500" 
                            />
                            <div className="h-8 w-8 rounded flex items-center justify-center flex-shrink-0">
                              <i className="fi fi-br-bank text-2xl text-green-400"></i>
                            </div>
                            <span className="text-gray-200 font-medium group-hover:text-green-400 transition-colors">Bank Account</span>
                          </label>
                          {selectedMethod === 'bank' && (
                            <div className="mt-2 ml-7 space-y-2 animate-[slideDown_0.2s_ease-out]">
                              <input
                                type="text"
                                placeholder="Bank Name"
                                disabled={withdrawProcessing}
                                className="w-full px-4 py-2 bg-white/[0.04] border border-green-500/30 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
                              />
                              <input
                                type="text"
                                placeholder="Account Number"
                                value={selectedMethod === 'bank' ? withdrawAccount : ''}
                                onChange={(e) => setWithdrawAccount(e.target.value)}
                                disabled={withdrawProcessing}
                                className="w-full px-4 py-2 bg-white/[0.04] border border-green-500/30 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
                              />
                              <input
                                type="text"
                                placeholder="Account Holder Name"
                                disabled={withdrawProcessing}
                                className="w-full px-4 py-2 bg-white/[0.04] border border-green-500/30 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
                              />
                              <input
                                type="text"
                                placeholder="Branch Name"
                                disabled={withdrawProcessing}
                                className="w-full px-4 py-2 bg-white/[0.04] border border-green-500/30 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
                              />
                              <p className="text-xs text-gray-400">Enter your complete bank account details</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white/[0.04] rounded-lg border border-white/10">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Amount</span>
                    <span className="text-gray-200">৳{withdrawAmount || '0.00'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Processing Fee (2%)</span>
                    <span className="text-gray-200">৳{withdrawAmount ? (parseFloat(withdrawAmount) * 0.02).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-200">
                        You'll Receive
                      </span>
                      <span className="font-bold text-primary-teal">
                        ৳{withdrawAmount ? (parseFloat(withdrawAmount) * 0.98).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {withdrawError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <i className="fi fi-rr-exclamation text-base"></i>
                      {withdrawError}
                    </p>
                  </div>
                )}

                {/* Success Message */}
                {withdrawSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm flex items-center gap-2">
                      <i className="fi fi-rr-check-circle text-base"></i>
                      {withdrawSuccess}
                    </p>
                  </div>
                )}

                <button 
                  onClick={handleWithdraw}
                  disabled={withdrawProcessing || !withdrawAmount || parseFloat(withdrawAmount) < 500}
                  className="w-full bg-gradient-to-r from-primary-teal to-teal-600 text-white py-3 px-6 rounded-lg font-bold hover:from-primary-teal/90 hover:to-teal-600/90 transition-all shadow-lg shadow-primary-teal/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {withdrawProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Withdraw Funds'
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Funds typically arrive within 2-5 business days
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
