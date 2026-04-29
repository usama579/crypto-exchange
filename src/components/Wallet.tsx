'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Wallet, Eye, EyeOff, Plus, ArrowUpDown, Send, Download, LogIn } from 'lucide-react';

interface Asset {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  change: string;
}

export default function WalletComponent() {
  const { data: session, status } = useSession();
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  if (status === 'loading') {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto mt-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access your wallet and manage your digital assets.</p>
            <a
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <LogIn size={20} className="mr-2" />
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Mock wallet data
  const totalBalance = '12,547.82';
  const assets: Asset[] = [
    { symbol: 'BTC', name: 'Bitcoin', balance: '0.25847', value: '11,247.32', change: '+2.34' },
    { symbol: 'ETH', name: 'Ethereum', balance: '2.15643', value: '847.91', change: '-1.12' },
    { symbol: 'BNB', name: 'Binance Coin', balance: '5.847', value: '452.59', change: '+0.89' },
    { symbol: 'USDT', name: 'Tether', balance: '1250.00', value: '1250.00', change: '0.00' },
  ];

  const recentTransactions = [
    { type: 'deposit', asset: 'BTC', amount: '0.00521', time: '2 hours ago', status: 'completed' },
    { type: 'trade', asset: 'ETH/USDT', amount: '1.25 ETH', time: '5 hours ago', status: 'completed' },
    { type: 'withdrawal', asset: 'USDT', amount: '500.00', time: '1 day ago', status: 'pending' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
        <p className="text-gray-600">Manage your digital assets</p>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Wallet size={24} className="mr-2" />
            <span className="text-lg font-medium">Total Balance</span>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1 hover:bg-white/20 rounded"
          >
            {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
        <div className="text-3xl font-bold mb-4">
          {showBalance ? `$${totalBalance}` : '****'}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              const notification = document.createElement('div');
              notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform';
              notification.innerHTML = `
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <div>Deposit initiated - Check your email for instructions</div>
                </div>
              `;
              document.body.appendChild(notification);
              setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => document.body.contains(notification) && document.body.removeChild(notification), 300);
              }, 4000);
            }}
            className="flex items-center bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Deposit
          </button>
          <button
            onClick={() => {
              const notification = document.createElement('div');
              notification.className = 'fixed top-4 right-4 bg-orange-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform';
              notification.innerHTML = `
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  <div>Withdrawal requires 2FA verification</div>
                </div>
              `;
              document.body.appendChild(notification);
              setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => document.body.contains(notification) && document.body.removeChild(notification), 300);
              }, 4000);
            }}
            className="flex items-center bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <Send size={16} className="mr-2" />
            Withdraw
          </button>
          <button
            onClick={() => {
              const notification = document.createElement('div');
              notification.className = 'fixed top-4 right-4 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform';
              notification.innerHTML = `
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path>
                  </svg>
                  <div>Redirecting to trading interface...</div>
                </div>
              `;
              document.body.appendChild(notification);
              setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => document.body.contains(notification) && document.body.removeChild(notification), 300);
              }, 2000);
            }}
            className="flex items-center bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowUpDown size={16} className="mr-2" />
            Trade
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Assets
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            History
          </button>
        </nav>
      </div>

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 font-semibold text-gray-700">
            <div>Asset</div>
            <div className="text-right">Balance</div>
            <div className="text-right">Value (USD)</div>
            <div className="text-right">24h Change</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="divide-y divide-gray-200">
            {assets.map((asset) => (
              <div key={asset.symbol} className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{asset.symbol}</div>
                    <div className="text-sm text-gray-500">{asset.name}</div>
                  </div>
                </div>
                <div className="text-right font-mono text-gray-900">{asset.balance}</div>
                <div className="text-right text-gray-900">${asset.value}</div>
                <div className={`text-right font-medium ${parseFloat(asset.change) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {parseFloat(asset.change) >= 0 ? '+' : ''}{asset.change}%
                </div>
                <div className="text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Trade</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Assets */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Top Assets</h3>
            <div className="space-y-4">
              {assets.slice(0, 3).map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-xs">
                      {asset.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{asset.symbol}</div>
                      <div className="text-sm text-gray-500">{asset.balance}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${asset.value}</div>
                    <div className={`text-sm font-medium ${parseFloat(asset.change) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {parseFloat(asset.change) >= 0 ? '+' : ''}{asset.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h3>
            <div className="space-y-4">
              {recentTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full mr-3 flex items-center justify-center">
                      {tx.type === 'deposit' && <Download size={16} className="text-blue-600" />}
                      {tx.type === 'withdrawal' && <Send size={16} className="text-blue-600" />}
                      {tx.type === 'trade' && <ArrowUpDown size={16} className="text-blue-600" />}
                    </div>
                    <div>
                      <div className="font-medium capitalize text-gray-900">{tx.type}</div>
                      <div className="text-sm text-gray-500">{tx.asset}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{tx.amount}</div>
                    <div className="text-sm text-gray-500">{tx.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Export</button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTransactions.map((tx, index) => (
              <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full mr-4 flex items-center justify-center">
                    {tx.type === 'deposit' && <Download size={20} className="text-blue-600" />}
                    {tx.type === 'withdrawal' && <Send size={20} className="text-blue-600" />}
                    {tx.type === 'trade' && <ArrowUpDown size={20} className="text-blue-600" />}
                  </div>
                  <div>
                    <div className="font-medium capitalize text-gray-900">{tx.type} {tx.asset}</div>
                    <div className="text-sm text-gray-500">{tx.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{tx.amount}</div>
                  <div className={`text-sm px-2 py-1 rounded-full ${
                    tx.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tx.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}