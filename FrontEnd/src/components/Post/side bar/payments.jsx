import React, { useState } from "react";

export default function Payments({ onBack }) {
  const [activeTab, setActiveTab] = useState("overview");

  const transactions = [
    {
      id: "TXN001",
      type: "received",
      amount: 150.00,
      from: "TechCorp Inc.",
      description: "Frontend Development - Project Payment",
      date: "2025-11-01",
      status: "completed",
    },
    {
      id: "TXN002",
      type: "sent",
      amount: 9.99,
      to: "Campus Gigs",
      description: "Premium Subscription - Monthly",
      date: "2025-11-01",
      status: "completed",
    },
    {
      id: "TXN003",
      type: "received",
      amount: 200.00,
      from: "Design Studio",
      description: "UI/UX Design Services",
      date: "2025-10-28",
      status: "pending",
    },
  ];

  const paymentMethods = [
    {
      id: 1,
      type: "card",
      name: "Visa ending in 4242",
      expiry: "12/25",
      default: true,
    },
    {
      id: 2,
      type: "paypal",
      name: "PayPal Account",
      email: "you@example.com",
      default: false,
    },
  ];

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
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-primary-teal to-blue-500 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">Available Balance</span>
                  <i className="fi fi-br-wallet text-xl"></i>
                </div>
                <p className="text-3xl font-bold mb-1">$1,245.50</p>
                <p className="text-sm opacity-75">+$150.00 this month</p>
              </div>

              <div className="bg-white/[0.04] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-muted">Pending</span>
                  <i className="fi fi-br-clock text-xl text-yellow-400"></i>
                </div>
                <p className="text-3xl font-bold text-white mb-1">$200.00</p>
                <p className="text-sm text-text-muted">1 transaction</p>
              </div>

              <div className="bg-white/[0.04] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-muted">This Month</span>
                  <i className="fi fi-br-chart-line-up text-xl text-green-400"></i>
                </div>
                <p className="text-3xl font-bold text-white mb-1">$350.00</p>
                <p className="text-sm text-text-muted">3 transactions</p>
              </div>
            </div>

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
                {transactions.slice(0, 3).map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-3 bg-white/[0.04] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          txn.type === "received"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        <i
                          className={`fi ${
                            txn.type === "received"
                              ? "fi-br-arrow-small-down"
                              : "fi-br-arrow-small-up"
                          }`}
                        ></i>
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {txn.description}
                        </p>
                        <p className="text-sm text-text-muted">{txn.date}</p>
                      </div>
                    </div>
                    <span
                      className={`font-bold ${
                        txn.type === "received"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {txn.type === "received" ? "+" : "-"}$
                      {txn.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Your Payment Methods
              </h2>
              <button className="px-4 py-2 bg-primary-teal hover:bg-primary-blue text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                <i className="fi fi-br-plus"></i>
                Add New
              </button>
            </div>

            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="bg-white/[0.04] rounded-xl p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-white/[0.04] flex items-center justify-center text-primary-teal">
                    <i
                      className={`${
                        method.type === "card"
                          ? "fi fi-br-credit-card"
                          : "fi fi-brands-paypal"
                      } text-2xl`}
                    ></i>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{method.name}</p>
                    <p className="text-sm text-text-muted">
                      {method.expiry || method.email}
                    </p>
                  </div>
                  {method.default && (
                    <span className="px-3 py-1 bg-primary-teal/20 text-primary-teal rounded-full text-xs font-semibold">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-white/[0.04] hover:bg-white/10 text-white rounded-lg font-medium transition-colors">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ))}
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
