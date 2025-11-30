import React, { useState, useEffect } from "react";
import { getTransactions, getBalance } from "../../../services/api";

export default function Payments({ onBack }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
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
        getTransactions(50),
        getBalance()
      ]);

      setTransactions(transactionsRes.data.transactions || []);
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

  const recentTransactions = transactions.slice(0, 5);
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
                {recentTransactions.length === 0 ? (
                  <p className="text-text-muted text-center py-8">No recent transactions</p>
                ) : (
                  recentTransactions.map((txn) => {
                    const isReceived = txn.receiver_id === currentUserId;
                    const otherUser = isReceived 
                      ? { name: txn.sender_name, username: txn.sender_username }
                      : { name: txn.receiver_name, username: txn.receiver_username };
                    
                    return (
                      <div
                        key={txn.id}
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
                  {transactions.map((txn) => (
                    <tr
                      key={txn.id}
                      className="border-t border-white/10 hover:bg-white/[0.04] transition-colors"
                    >
                      <td className="p-4 text-white font-mono text-sm">
                        {txn.id}
                      </td>
                      <td className="p-4 text-white">{txn.description}</td>
                      <td className="p-4 text-text-muted">{txn.date}</td>
                      <td
                        className={`p-4 font-bold ${
                          txn.type === "received"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {txn.type === "received" ? "+" : "-"}$
                        {txn.amount.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            txn.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
                <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-6 hover:border-pink-500/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-14 w-14 rounded-xl bg-pink-500 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">bKash</span>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                      Available
                    </span>
                  </div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-pink-400 transition-colors">bKash</h4>
                  <p className="text-sm text-text-muted">Instant mobile wallet payment</p>
                </div>

                {/* Nagad */}
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-6 hover:border-orange-500/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-14 w-14 rounded-xl bg-orange-500 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">Nagad</span>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                      Available
                    </span>
                  </div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">Nagad</h4>
                  <p className="text-sm text-text-muted">Fast & secure digital payments</p>
                </div>

                {/* Rocket */}
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-14 w-14 rounded-xl bg-purple-600 flex items-center justify-center">
                      <i className="fi fi-br-rocket text-2xl text-white"></i>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                      Available
                    </span>
                  </div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">Rocket</h4>
                  <p className="text-sm text-text-muted">Dutch-Bangla Bank mobile wallet</p>
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
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">VISA</span>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                      Available
                    </span>
                  </div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Visa</h4>
                  <p className="text-sm text-text-muted">Credit & Debit cards accepted</p>
                </div>

                {/* Mastercard */}
                <div className="bg-gradient-to-br from-red-500/10 to-orange-600/5 border border-red-500/20 rounded-xl p-6 hover:border-red-500/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">MC</span>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                      Available
                    </span>
                  </div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-red-400 transition-colors">Mastercard</h4>
                  <p className="text-sm text-text-muted">All Mastercard types supported</p>
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
                <div className="p-4 bg-primary-teal/10 border border-primary-teal/20 rounded-lg">
                  <p className="text-white font-semibold mb-1">
                    Available Balance
                  </p>
                  <p className="text-3xl font-bold text-primary-teal">
                    $1,245.50
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Withdrawal Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-lg">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary-teal transition-colors"
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Minimum withdrawal: $50.00
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Withdraw To
                  </label>
                  <select className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-teal transition-colors">
                    <option>Visa ending in 4242</option>
                    <option>PayPal Account</option>
                  </select>
                </div>

                <div className="p-4 bg-white/[0.04] rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-text-muted">Amount</span>
                    <span className="text-white">$100.00</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-text-muted">Processing Fee (2%)</span>
                    <span className="text-white">$2.00</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-white">
                        You'll Receive
                      </span>
                      <span className="font-bold text-primary-teal">
                        $98.00
                      </span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-primary-teal to-blue-500 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90 transition-opacity">
                  Withdraw Funds
                </button>

                <p className="text-xs text-text-muted text-center">
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
