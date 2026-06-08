'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Calendar, Volume2, ShoppingCart, DollarSign, Wallet, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { useKycGate } from '@/hooks/useKycGate';

interface CryptoDetailProps {
  crypto: any;
  onBack: () => void;
}

interface ChartData {
  time: string;
  price: number;
  volume: number;
}

interface UserWallet {
  id: string;
  symbol: string;
  balance: string;
  name: string;
}

export default function CryptoDetail({ crypto, onBack }: CryptoDetailProps) {
  const { data: session } = useSession();
  const { blockIfIncomplete } = useKycGate();
  const [timeRange, setTimeRange] = useState('24h');
  const [chartType, setChartType] = useState<'line' | 'area' | 'candlestick'>('area');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Trading state
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState('');
  const [userWallets, setUserWallets] = useState<UserWallet[]>([]);
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null);

  useEffect(() => {
    // Simulate loading chart data
    setIsLoading(true);

    const generateMockData = () => {
      const basePrice = parseFloat(crypto.price);
      const dataPoints = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : timeRange === '30d' ? 720 : 8760;
      const data = [];

      for (let i = 0; i < dataPoints; i++) {
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        const price = basePrice * (1 + variation * (i / dataPoints));
        const date = new Date();

        if (timeRange === '24h') {
          date.setHours(date.getHours() - (24 - i));
        } else if (timeRange === '7d') {
          date.setHours(date.getHours() - (168 - i));
        } else if (timeRange === '30d') {
          date.setHours(date.getHours() - (720 - i));
        } else {
          date.setHours(date.getHours() - (8760 - i));
        }

        data.push({
          time: timeRange === '24h' ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString(),
          price: Math.max(0, price + (Math.random() - 0.5) * basePrice * 0.02),
          volume: Math.floor(Math.random() * 1000000) + 100000
        });
      }

      return data;
    };

    // Simulate API delay
    setTimeout(() => {
      setChartData(generateMockData());
      setIsLoading(false);
    }, 500);
  }, [crypto, timeRange]);

  // Fetch user wallets
  useEffect(() => {
    const fetchWallets = async () => {
      if (!session?.user?.id) return;

      setIsLoadingWallets(true);
      try {
        const response = await fetch('/api/wallet/balance');
        if (response.ok) {
          const data = await response.json();
          const walletsData = data.wallets.map((wallet: any) => ({
            id: wallet.id,
            symbol: wallet.symbol,
            balance: wallet.balance,
            name: wallet.name || wallet.symbol
          }));
          setUserWallets(walletsData);

          // Set default wallet based on trade type
          const cryptoSymbol = crypto.symbol.replace('USDT', '').replace('BTC', '').replace('ETH', '');
          if (tradeType === 'buy') {
            const usdtWallet = walletsData.find((w: UserWallet) => w.symbol === 'USDT');
            setSelectedWallet(usdtWallet || null);
          } else {
            const cryptoWallet = walletsData.find((w: UserWallet) => w.symbol === cryptoSymbol);
            setSelectedWallet(cryptoWallet || null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch wallets:', error);
      } finally {
        setIsLoadingWallets(false);
      }
    };

    if (showTradeModal) {
      fetchWallets();
    }
  }, [showTradeModal, session, crypto.symbol, tradeType]);

  const handleTrade = async () => {
    if (blockIfIncomplete()) return;
    if (!selectedWallet || !tradeAmount || !session?.user?.id) return;

    const amount = parseFloat(tradeAmount);
    const cryptoPrice = parseFloat(crypto.price);
    const cryptoSymbol = crypto.symbol.replace('USDT', '').replace('BTC', '').replace('ETH', '');

    const postWallet = async (walletId: string, amt: number, type: 'WITHDRAW' | 'DEPOSIT') => {
      const res = await fetch('/api/wallet/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId, amount: amt.toString(), type })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Wallet update failed');
      }
      return res.json();
    };

    try {
      if (tradeType === 'buy') {
        const totalCost = amount * cryptoPrice;
        if (totalCost > parseFloat(selectedWallet.balance)) {
          alert('Insufficient USDT balance');
          return;
        }
        // Deduct USDT
        await postWallet(selectedWallet.id, totalCost, 'WITHDRAW');
        // Add crypto to crypto wallet if it exists
        const cryptoWallet = userWallets.find(w => w.symbol === cryptoSymbol);
        if (cryptoWallet) {
          await postWallet(cryptoWallet.id, amount, 'DEPOSIT');
        }
      } else {
        if (amount > parseFloat(selectedWallet.balance)) {
          alert('Insufficient crypto balance');
          return;
        }
        // Deduct crypto
        await postWallet(selectedWallet.id, amount, 'WITHDRAW');
        // Add USDT to USDT wallet
        const usdtWallet = userWallets.find(w => w.symbol === 'USDT');
        if (usdtWallet) {
          await postWallet(usdtWallet.id, amount * cryptoPrice, 'DEPOSIT');
        }
      }

      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform';
      notification.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          <div>
            <div class="font-medium">${tradeType.toUpperCase()} order completed!</div>
            <div class="text-sm opacity-90">${amount} ${tradeType === 'buy' ? formatSymbol(crypto.symbol).split('/')[0] : 'USDT'}</div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(notification)) document.body.removeChild(notification);
        }, 300);
      }, 3000);

      setShowTradeModal(false);
      setTradeAmount('');
    } catch (error) {
      console.error('Trade error:', error);
      alert(error instanceof Error ? error.message : 'Trade failed. Please try again.');
    }
  };

  const formatSymbol = (symbol: string) => {
    if (symbol.endsWith('USDT')) {
      const base = symbol.slice(0, -4);
      return `${base}/USDT`;
    }
    if (symbol.endsWith('BTC')) {
      const base = symbol.slice(0, -3);
      return `${base}/BTC`;
    }
    if (symbol.endsWith('ETH')) {
      const base = symbol.slice(0, -3);
      return `${base}/ETH`;
    }
    return symbol;
  };

  const formatPrice = (price: number) => {
    return price < 1 ? price.toFixed(6) : price.toFixed(2);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(1)}B`;
    }
    if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(1)}M`;
    }
    if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const isPositive = parseFloat(crypto.changePercent) >= 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Market
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{formatSymbol(crypto.symbol)}</h1>
            <p className="text-gray-600">Real-time price and market data</p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              ${formatPrice(parseFloat(crypto.price))}
            </div>
            <div className={`flex items-center text-lg font-medium mb-4 ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? (
                <TrendingUp size={20} className="mr-1" />
              ) : (
                <TrendingDown size={20} className="mr-1" />
              )}
              {isPositive ? '+' : ''}{parseFloat(crypto.changePercent).toFixed(2)}%
            </div>

            {session ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setTradeType('buy');
                    setShowTradeModal(true);
                  }}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <ShoppingCart size={16} className="mr-1" />
                  Buy
                </button>
                <button
                  onClick={() => {
                    setTradeType('sell');
                    setShowTradeModal(true);
                  }}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <DollarSign size={16} className="mr-1" />
                  Sell
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                <a href="/login" className="text-blue-600 hover:text-blue-800">Login</a> to trade
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">24h High</div>
          <div className="text-lg font-bold text-gray-900">
            ${formatPrice(parseFloat(crypto.high))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">24h Low</div>
          <div className="text-lg font-bold text-gray-900">
            ${formatPrice(parseFloat(crypto.low))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">24h Volume</div>
          <div className="text-lg font-bold text-gray-900">
            {formatVolume(parseFloat(crypto.volume))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">24h Change</div>
          <div className={`text-lg font-bold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '+' : ''}${parseFloat(crypto.change).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Price Chart</h3>

          <div className="flex items-center space-x-4">
            {/* Chart Type Selector */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded ${
                  chartType === 'line' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 size={16} />
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`p-2 rounded ${
                  chartType === 'area' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp size={16} />
              </button>
            </div>

            {/* Time Range Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['24h', '7d', '30d', '1y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-white text-blue-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="time"
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    domain={['dataMin - 100', 'dataMax + 100']}
                    tickFormatter={(value) => `$${formatPrice(value)}`}
                  />
                  <Tooltip
                    formatter={(value) => [`$${formatPrice(Number(value))}`, 'Price']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? "#10b981" : "#ef4444"}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="time"
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    domain={['dataMin - 100', 'dataMax + 100']}
                    tickFormatter={(value) => `$${formatPrice(value)}`}
                  />
                  <Tooltip
                    formatter={(value) => [`$${formatPrice(Number(value))}`, 'Price']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? "#10b981" : "#ef4444"}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center mb-4">
          <Volume2 size={20} className="text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Trading Volume</h3>
        </div>

        <div className="h-48">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="time"
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => formatVolume(value)}
                />
                <Tooltip
                  formatter={(value) => [formatVolume(Number(value)), 'Volume']}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar
                  dataKey="volume"
                  fill="#3b82f6"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Trading Modal */}
      {showTradeModal && session && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-gray-900 font-bold">
                {tradeType === 'buy' ? 'Buy' : 'Sell'} {formatSymbol(crypto.symbol)}
              </h2>
              <button
                onClick={() => setShowTradeModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <div className="text-2xl font-bold text-gray-900">
                ${formatPrice(parseFloat(crypto.price))}
              </div>
              <div className={`text-sm ${parseFloat(crypto.changePercent) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {parseFloat(crypto.changePercent) >= 0 ? '+' : ''}{parseFloat(crypto.changePercent).toFixed(2)}% (24h)
              </div>
            </div>

            {isLoadingWallets ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <div className="text-gray-500 mt-2">Loading wallets...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Wallet Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {tradeType === 'buy' ? 'Pay with' : 'Sell from'}
                  </label>
                  <select
                    value={selectedWallet?.id || ''}
                    onChange={(e) => {
                      const wallet = userWallets.find(w => w.id === e.target.value);
                      setSelectedWallet(wallet || null);
                    }}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!selectedWallet ? 'text-gray-500' : 'text-gray-900'}`}
                  >
                    <option value="">Select wallet...</option>
                    {userWallets
                      .filter(wallet =>
                        tradeType === 'buy'
                          ? wallet.symbol === 'USDT'
                          : wallet.symbol === crypto.symbol.replace('USDT', '').replace('BTC', '').replace('ETH', '')
                      )
                      .map((wallet) => (
                        <option key={wallet.id} value={wallet.id}>
                          {wallet.symbol} - Balance: {parseFloat(wallet.balance).toFixed(6)}
                        </option>
                      ))
                    }
                  </select>
                </div>

                {selectedWallet && (
                  <>
                    {/* Available Balance */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Available Balance</span>
                        <div className="text-right">
                          <div className="font-medium">{parseFloat(selectedWallet.balance).toFixed(6)} {selectedWallet.symbol}</div>
                        </div>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount ({tradeType === 'buy' ? formatSymbol(crypto.symbol).split('/')[0] : 'Amount to sell'})
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00000000"
                          value={tradeAmount}
                          onChange={(e) => setTradeAmount(e.target.value)}
                          step="0.00000001"
                          min="0"
                        />
                        {tradeType === 'sell' && (
                          <button
                            onClick={() => setTradeAmount(selectedWallet.balance)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600"
                          >
                            MAX
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Calculation Display */}
                    {tradeAmount && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-blue-800">
                          {tradeType === 'buy' ? (
                            <>
                              <div>Cost: <strong>${(parseFloat(tradeAmount) * parseFloat(crypto.price)).toFixed(2)} USDT</strong></div>
                              <div className="text-xs mt-1">
                                You will receive: {tradeAmount} {formatSymbol(crypto.symbol).split('/')[0]}
                              </div>
                            </>
                          ) : (
                            <>
                              <div>You will receive: <strong>${(parseFloat(tradeAmount) * parseFloat(crypto.price)).toFixed(2)} USDT</strong></div>
                              <div className="text-xs mt-1">
                                Selling: {tradeAmount} {formatSymbol(crypto.symbol).split('/')[0]}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Balance Check Warning */}
                    {tradeAmount && (
                      <div>
                        {tradeType === 'buy' && parseFloat(tradeAmount) * parseFloat(crypto.price) > parseFloat(selectedWallet.balance) && (
                          <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertTriangle size={16} className="text-red-600 mr-2 mt-0.5" />
                            <div className="text-sm text-red-800">
                              Insufficient USDT balance. You need ${(parseFloat(tradeAmount) * parseFloat(crypto.price)).toFixed(2)} but only have ${parseFloat(selectedWallet.balance).toFixed(2)}
                            </div>
                          </div>
                        )}
                        {tradeType === 'sell' && parseFloat(tradeAmount) > parseFloat(selectedWallet.balance) && (
                          <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertTriangle size={16} className="text-red-600 mr-2 mt-0.5" />
                            <div className="text-sm text-red-800">
                              Insufficient balance. You are trying to sell {tradeAmount} but only have {parseFloat(selectedWallet.balance).toFixed(6)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setShowTradeModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTrade}
                    disabled={
                      !selectedWallet ||
                      !tradeAmount ||
                      parseFloat(tradeAmount) <= 0 ||
                      (tradeType === 'buy' && parseFloat(tradeAmount) * parseFloat(crypto.price) > parseFloat(selectedWallet.balance)) ||
                      (tradeType === 'sell' && parseFloat(tradeAmount) > parseFloat(selectedWallet.balance))
                    }
                    className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                      tradeType === 'buy'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {tradeType === 'buy' ? 'Buy' : 'Sell'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}