/**
 * Mock Payment Frontend Component
 * Simulates payment gateway page
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { processMockPayment } from '../../../services/api';

export default function MockPaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');

  const tranId = searchParams.get('tran_id');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency') || 'BDT';

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'fa-credit-card' },
    { id: 'bkash', name: 'bKash', icon: 'fa-mobile-alt', color: '#E2136E' },
    { id: 'nagad', name: 'Nagad', icon: 'fa-mobile-alt', color: '#F27121' },
    { id: 'rocket', name: 'Rocket', icon: 'fa-rocket', color: '#8B3A8B' }
  ];

  const testCards = [
    { number: '4111111111111111', label: 'Success Card', type: 'success' },
    { number: '4000000000000002', label: 'Declined Card', type: 'error' },
    { number: '4000000000000069', label: 'Expired Card', type: 'error' }
  ];

  const handlePayment = async () => {
    if (selectedMethod === 'card' && !cardNumber) {
      alert('Please enter a card number');
      return;
    }

    setProcessing(true);
    try {
      await processMockPayment({
        transaction_id: tranId,
        payment_method: selectedMethod,
        card_number: selectedMethod === 'card' ? cardNumber : null
      });
    } catch (error) {
      alert('Payment failed: ' + error.message);
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-shield-alt text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Demo Payment Gateway</h1>
          <p className="text-gray-400 text-sm">Secure Mock Transaction</p>
        </div>

        {/* Amount */}
        <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-700">
          <div className="text-gray-400 text-sm mb-1">Amount to Pay</div>
          <div className="text-3xl font-bold text-white">
            {currency} {parseFloat(amount).toLocaleString()}
          </div>
          <div className="text-xs text-emerald-400 mt-2">
            <i className="fas fa-info-circle mr-1"></i>
            This is a DEMO transaction - No real money will be charged
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-300 mb-3 block">Select Payment Method</label>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === method.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                }`}
              >
                <i className={`fas ${method.icon} text-2xl mb-2`} style={{ color: method.color || '#10b981' }}></i>
                <div className="text-white text-sm font-medium">{method.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Card Input */}
        {selectedMethod === 'card' && (
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-300 mb-2 block">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
              placeholder="4111 1111 1111 1111"
              maxLength={16}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
            />
            
            {/* Test Cards */}
            <div className="mt-3 space-y-2">
              <div className="text-xs text-gray-400 mb-2">Quick Test Cards:</div>
              {testCards.map(card => (
                <button
                  key={card.number}
                  onClick={() => setCardNumber(card.number)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                    card.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  }`}
                >
                  <i className={`fas ${card.type === 'success' ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                  {card.label}: {card.number}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Banking Instructions */}
        {['bkash', 'nagad', 'rocket'].includes(selectedMethod) && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="text-blue-400 text-sm">
              <i className="fas fa-info-circle mr-2"></i>
              In demo mode, all mobile banking payments succeed automatically.
            </div>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/50"
        >
          {processing ? (
            <span className="flex items-center justify-center">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <i className="fas fa-lock mr-2"></i>
              Pay {currency} {parseFloat(amount).toLocaleString()}
            </span>
          )}
        </button>

        {/* Cancel */}
        <button
          onClick={() => navigate('/premium')}
          className="w-full mt-3 py-3 text-gray-400 hover:text-white transition-colors"
        >
          Cancel Payment
        </button>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <i className="fas fa-shield-alt mr-1"></i>
          Demo Mode - No real transactions
        </div>
      </div>
    </div>
  );
}
