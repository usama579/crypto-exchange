'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Wallet, Eye, EyeOff, Plus, ArrowUpDown, Send, Download, LogIn, X, Copy, QrCode, AlertCircle } from 'lucide-react';

type USDTIconProps = { size?: number; className?: string };

// USDT Icon Component - Official Tether Logo
const USDTIcon = ({ size = 16, className = '' }: USDTIconProps) => (
  <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className="drop-shadow-sm"
    >
      <path
        d="M 10.417969 5 L 2.0820312 22.949219 L 25 45 L 47.917969 22.949219 L 39.582031 5 L 10.417969 5 z M 12.957031 10.042969 L 36.957031 10.042969 L 37 16 L 28 16 L 28 19.490234 C 36.125 19.874234 39.582031 21.046969 39.582031 22.542969 C 39.582031 24.037969 34.551 25.694 28 26 L 28 37 L 22 37 L 22 26 C 15.449 25.694 10.417969 24.037969 10.417969 22.542969 C 10.417969 21.046969 13.875 19.749234 22 19.490234 L 22 16 L 13 16 L 12.957031 10.042969 z M 22 20.375 C 16.611 20.635 13 21.283 13 22.375 C 13 23.67 18.097 24.625 25 24.625 C 31.903 24.625 37 23.545 37 22.25 C 37 21.158 33.389 20.76 28 20.5 L 28 23 C 27 23.063 26.083 23.082031 25 23.082031 C 23.917 23.082031 23 23.062 22 23 L 22 20.375 z"
        fill="#26A17B"
      />
    </svg>
  </div>
);

type CryptoIconProps = { symbol: string; size?: number };

// Crypto Icon Component
const CryptoIcon = ({ symbol, size = 32 }: CryptoIconProps) => {
  if (symbol === 'USDT') {
    return <USDTIcon size={size} />;
  }

  // For other cryptos, return a colored circle with symbol
  const getColorForSymbol = (sym: string) => {
    const colors: Record<string, string> = {
      BTC: '#F7931A',
      ETH: '#627EEA',
      BNB: '#F3BA2F',
      ADA: '#0033AD',
      SOL: '#9945FF',
    };
    return colors[sym] ?? '#6B7280';
  };

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold text-xs"
      style={{
        width: size,
        height: size,
        backgroundColor: getColorForSymbol(symbol),
        fontSize: size * 0.35
      }}
    >
      {symbol.slice(0, symbol === 'BTC' || symbol === 'ETH' || symbol === 'BNB' || symbol === 'ADA' || symbol === 'SOL' ? 3 : 2)}
    </div>
  );
};
import WalletConnector from './WalletConnector';
import { useCryptoStore } from '@/store/cryptoStore';
import { fetchCryptoData } from '@/lib/cryptoApi';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  balance: string;
}

export default function WalletComponent() {
  const { data: session, status } = useSession();
  const { prices, setPrices } = useCryptoStore();
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedAssetForDeposit, setSelectedAssetForDeposit] = useState<Asset | null>(null);
  const [selectedAssetForWithdrawal, setSelectedAssetForWithdrawal] = useState<Asset | null>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);

  // Ensure live prices are loaded into the store
  useEffect(() => {
    if (prices.length === 0) {
      fetchCryptoData().then(data => {
        if (data.length > 0) setPrices(data);
      });
    }
  }, [prices.length, setPrices]);

  // Fetch wallet data (raw balances only — values computed from live prices)
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!session?.user?.id) {
        setIsLoadingAssets(false);
        return;
      }

      try {
        const response = await fetch('/api/wallet/balance');
        if (response.ok) {
          const data = await response.json();
          const walletsData: Asset[] = data.wallets.map((wallet: any) => ({
            id: wallet.id,
            symbol: wallet.symbol,
            name: wallet.name || wallet.symbol,
            balance: parseFloat(wallet.balance).toFixed(6),
          }));
          setAssets(walletsData);
        } else {
          console.error('Failed to fetch wallet data');
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setIsLoadingAssets(false);
      }
    };

    fetchWalletData();
  }, [session]);

  // Resolve live USD price for a wallet symbol using the Binance price store
  const getLivePrice = (symbol: string): number => {
    if (symbol === 'USDT') return 1;
    const ticker = prices.find(p => p.symbol === `${symbol}USDT`);
    return ticker ? parseFloat(ticker.price) : 0;
  };

  // Total portfolio value — recomputed whenever assets or live prices change
  const totalBalance = useMemo(() => {
    const total = assets.reduce((sum, asset) => {
      return sum + parseFloat(asset.balance) * getLivePrice(asset.symbol);
    }, 0);
    return total.toFixed(2);
  }, [assets, prices]);

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
          {isLoadingAssets ? (
            <div className="h-9 bg-white/20 rounded animate-pulse w-32"></div>
          ) : (
            showBalance ? `$${totalBalance}` : '****'
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex items-center bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Deposit
          </button>
          <button
            onClick={() => setShowWithdrawalModal(true)}
            className="flex items-center bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <Send size={16} className="mr-2" />
            Withdraw
          </button>
          <button
            onClick={() => window.location.href = '/trading'}
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
            {isLoadingAssets ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-right"><div className="h-4 bg-gray-200 rounded w-20 ml-auto animate-pulse"></div></div>
                  <div className="text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto animate-pulse"></div></div>
                  <div className="text-right"><div className="h-4 bg-gray-200 rounded w-12 ml-auto animate-pulse"></div></div>
                  <div className="text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto animate-pulse"></div></div>
                </div>
              ))
            ) : assets.length > 0 ? (
              assets.map((asset) => (
                <div key={asset.id} className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <CryptoIcon symbol={asset.symbol} size={32} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{asset.symbol}</div>
                      <div className="text-sm text-gray-500">{asset.name}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-gray-900">{asset.balance}</div>
                  <div className="text-right text-gray-900">
                    ${(parseFloat(asset.balance) * getLivePrice(asset.symbol)).toFixed(2)}
                  </div>
                  <div className="text-right font-medium text-gray-500">—</div>
                  <div className="text-right space-x-2">
                    <button
                      onClick={() => window.location.href = '/trading'}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Trade
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAssetForDeposit(asset);
                        setShowQRModal(true);
                      }}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Deposit
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Wallet size={48} className="mx-auto mb-4 text-gray-400" />
                <div className="text-lg font-medium mb-2">No assets yet</div>
                <div className="text-sm">Start by depositing some cryptocurrency to your wallet</div>
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Make your first deposit
                </button>
              </div>
            )}
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
              {isLoadingAssets ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-12 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : assets.length > 0 ? (
                assets.slice(0, 3).map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-3">
                        <CryptoIcon symbol={asset.symbol} size={32} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{asset.symbol}</div>
                        <div className="text-sm text-gray-500">{asset.balance}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        ${(parseFloat(asset.balance) * getLivePrice(asset.symbol)).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 text-right">
                        ${getLivePrice(asset.symbol).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-sm">No assets to display</div>
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Add your first asset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h3>
            <div className="space-y-4">
              <div className="text-center text-gray-500 py-8">
                <div className="text-sm">No recent transactions</div>
                <div className="text-xs text-gray-600 mt-1">Your transaction history will appear here</div>
              </div>
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
              <button
                disabled
                className="text-gray-400 text-sm cursor-not-allowed"
                title="Export feature coming soon"
              >
                Export
              </button>
            </div>
          </div>
          <div className="p-8 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowUpDown size={24} className="text-gray-500" />
            </div>
            <div className="text-lg font-medium mb-2">No transactions yet</div>
            <div className="text-sm text-gray-600 mb-4">Your transaction history will appear here once you start trading</div>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => setShowDepositModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Make a Deposit
              </button>
              <button
                onClick={() => window.location.href = '/trading'}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Start Trading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-gray-500/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-auto transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="relative px-6 py-5 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Download size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Deposit Cryptocurrency</h2>
                  <p className="text-sm text-gray-500">Add funds to your wallet</p>
                </div>
              </div>
              <button
                onClick={() => setShowDepositModal(false)}
                className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {/* Crypto Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Cryptocurrency
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 appearance-none cursor-pointer transition-all"
                    onChange={(e) => {
                      const asset = assets.find(a => a.symbol === e.target.value);
                      setSelectedAssetForDeposit(asset || null);
                    }}
                  >
                    <option value="" className="text-gray-500">Bitcoin (BTC)</option>
                    {assets.map((asset) => (
                      <option key={asset.symbol} value={asset.symbol} className="text-gray-900">
                        {asset.name} ({asset.symbol})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Default BTC or Selected Asset */}
              {(selectedAssetForDeposit || !selectedAssetForDeposit) && (
                <div className="space-y-6">
                  {/* Deposit Address Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <QrCode size={16} className="text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900">Deposit Address</span>
                      </div>
                      <div className="flex items-center text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {selectedAssetForDeposit?.symbol || 'BTC'} Network
                      </div>
                    </div>

                    <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="font-mono text-sm text-gray-800 break-all leading-relaxed">
                        {selectedAssetForDeposit?.symbol === 'BTC' && '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'}
                        {selectedAssetForDeposit?.symbol === 'ETH' && '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97'}
                        {selectedAssetForDeposit?.symbol === 'BNB' && '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97'}
                        {selectedAssetForDeposit?.symbol === 'USDT' && '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97'}
                        {selectedAssetForDeposit?.symbol === 'SOL' && 'J6aeP19UrwvWFDGorWADYqnA2BNw97fp4DT3KCaGEksn'}
                        {selectedAssetForDeposit?.symbol === 'POL' && '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97'}
                        {selectedAssetForDeposit?.symbol === 'TON' && 'UQCBIV4LfX01corjV1n3ubL2rwWKnUZxAR5cchsSvARhCUyq'}
                        {selectedAssetForDeposit?.symbol === 'TRX' && 'TYDyM9dgAdYXYGfBgezCzxHpLYaPdFYtxr'}
                        {!selectedAssetForDeposit && '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const getDepositAddress = (symbol?: string) => {
                          const addresses = {
                            'BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                            'ETH': '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97',
                            'BNB': '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97',
                            'USDT': '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97',
                            'SOL': 'J6aeP19UrwvWFDGorWADYqnA2BNw97fp4DT3KCaGEksn',
                            'POL': '0xad12d71e5a1323c9dfd1eddf911efbc86f40ab97',
                            'TON': 'UQCBIV4LfX01corjV1n3ubL2rwWKnUZxAR5cchsSvARhCUyq',
                            'TRX': 'TYDyM9dgAdYXYGfBgezCzxHpLYaPdFYtxr'
                          };
                          return addresses[symbol as keyof typeof addresses] || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
                        };
                        const addressToCopy = getDepositAddress(selectedAssetForDeposit?.symbol);

                        navigator.clipboard.writeText(addressToCopy);
                        const notification = document.createElement('div');
                        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center';
                        notification.innerHTML = `
                          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                          </svg>
                          Address copied to clipboard
                        `;
                        document.body.appendChild(notification);
                        setTimeout(() => document.body.contains(notification) && document.body.removeChild(notification), 3000);
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Copy size={16} className="mr-2" />
                      Copy Address
                    </button>
                  </div>

                  {/* QR Code Section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <QrCode size={16} className="text-gray-600" />
                      </div>
                      <span className="font-semibold text-gray-900">QR Code Payment</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedAssetForDeposit(selectedAssetForDeposit || { id: 'btc-default', symbol: 'BTC', name: 'Bitcoin', balance: '0' });
                        setShowQRModal(true);
                        setShowDepositModal(false);
                      }}
                      className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium border border-gray-300"
                    >
                      <QrCode size={16} className="mr-2" />
                      Generate QR Code
                    </button>
                  </div>

                  {/* Important Information */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                        <AlertCircle size={16} className="text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 mb-2">Important Notes</h4>
                        <ul className="space-y-2 text-sm text-amber-800">
                          <li className="flex items-start">
                            <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span>Only send <strong>{selectedAssetForDeposit?.symbol || 'BTC'}</strong> to this address</span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span>Minimum deposit: <strong>0.001 {selectedAssetForDeposit?.symbol || 'BTC'}</strong></span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span>Deposits require <strong>3 network confirmations</strong></span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowDepositModal(false);
                  setSelectedAssetForDeposit(null);
                }}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:border-gray-400 transition-all font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-gray-500/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-auto transform transition-all max-h-[90vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="relative px-6 py-5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <Send size={20} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Withdraw Cryptocurrency</h2>
                  <p className="text-sm text-gray-500">Send funds from your wallet</p>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="px-6 py-6 overflow-y-auto flex-1">
              {/* Crypto Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Cryptocurrency
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900 appearance-none cursor-pointer transition-all"
                    onChange={(e) => {
                      const asset = assets.find(a => a.symbol === e.target.value);
                      setSelectedAssetForWithdrawal(asset || null);
                    }}
                  >
                    <option value="" className="text-gray-500">Choose cryptocurrency...</option>
                    {assets.map((asset) => (
                      <option key={asset.symbol} value={asset.symbol} className="text-gray-900">
                        {asset.name} ({asset.symbol}) - Available: {asset.balance}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {selectedAssetForWithdrawal && (
                <div className="space-y-4">
                  {/* Available Balance */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mr-3 text-xs font-semibold">
                          {selectedAssetForWithdrawal.symbol.slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-gray-600">Available Balance</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{selectedAssetForWithdrawal.balance} {selectedAssetForWithdrawal.symbol}</div>
                        <div className="text-sm text-gray-500">
                          ${(parseFloat(selectedAssetForWithdrawal.balance) * getLivePrice(selectedAssetForWithdrawal.symbol)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Withdrawal Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Withdrawal Address
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm transition-all"
                      placeholder={`Enter ${selectedAssetForWithdrawal.symbol} withdrawal address...`}
                      value={withdrawalAddress}
                      onChange={(e) => setWithdrawalAddress(e.target.value)}
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full px-4 py-3 pr-16 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        placeholder="0.00000000"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        step="0.00000001"
                        min="0"
                        max={selectedAssetForWithdrawal.balance}
                      />
                      <button
                        onClick={() => setWithdrawalAmount(selectedAssetForWithdrawal.balance)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        MAX
                      </button>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">Network fee: 0.0005 {selectedAssetForWithdrawal.symbol}</span>
                      <span className="text-gray-600">≈ ${(parseFloat(withdrawalAmount || '0') * getLivePrice(selectedAssetForWithdrawal.symbol)).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* 2FA Code */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      2FA Authentication Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center font-mono text-lg tracking-widest transition-all"
                      placeholder="000000"
                      value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-2">Enter the 6-digit code from your authenticator app</p>
                  </div>

                  {/* Security Warning */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <AlertCircle size={14} className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 mb-1 text-sm">Security Warning</h4>
                        <ul className="space-y-1 text-xs text-red-800">
                          <li className="flex items-start">
                            <div className="w-1 h-1 bg-red-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                            <span>Double-check the address. <strong>Transactions cannot be reversed.</strong></span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-1 h-1 bg-red-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                            <span>Ensure you're sending to a <strong>{selectedAssetForWithdrawal.symbol}</strong> compatible address</span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-1 h-1 bg-red-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                            <span>Minimum: <strong>0.001 {selectedAssetForWithdrawal.symbol}</strong></span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Fixed */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex-shrink-0">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowWithdrawalModal(false);
                    setSelectedAssetForWithdrawal(null);
                    setWithdrawalAmount('');
                    setWithdrawalAddress('');
                    setTwoFACode('');
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:border-gray-400 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (withdrawalAmount && withdrawalAddress && twoFACode && selectedAssetForWithdrawal) {
                      const notification = document.createElement('div');
                      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
                      notification.innerHTML = `
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        Withdrawal of ${withdrawalAmount} ${selectedAssetForWithdrawal.symbol} initiated successfully
                      `;
                      document.body.appendChild(notification);
                      setTimeout(() => document.body.contains(notification) && document.body.removeChild(notification), 5000);
                      setShowWithdrawalModal(false);
                      setSelectedAssetForWithdrawal(null);
                      setWithdrawalAmount('');
                      setWithdrawalAddress('');
                      setTwoFACode('');
                    }
                  }}
                  disabled={!withdrawalAmount || !withdrawalAddress || !twoFACode || !selectedAssetForWithdrawal}
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center"
                >
                  <Send size={16} className="mr-2" />
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <WalletConnector
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedAssetForDeposit(null);
        }}
        selectedAsset={selectedAssetForDeposit}
      />

    </div>
  );
}