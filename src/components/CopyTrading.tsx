'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Users, TrendingUp, TrendingDown, Star, Copy, UserPlus, DollarSign, Activity, Trophy, X, LogIn, AlertCircle } from 'lucide-react';

interface Trader {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  followers: number;
  totalReturn: number;
  monthlyReturn: number;
  winRate: number;
  tradingPairs: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  minCopy: number;
  description: string;
  joinedDate: string;
  recentTrades: RecentTrade[];
}

interface RecentTrade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  profit: number;
  date: string;
}

interface CopyPosition {
  id: string;
  traderId: string;
  traderName: string;
  amount: number;
  profit: number;
  profitPercent: number;
  startDate: string;
  status: 'active' | 'paused';
}

export default function CopyTrading() {
  const { data: session } = useSession();
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyAmount, setCopyAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'performance' | 'followers'>('all');

  // Mock data for top traders
  const [topTraders] = useState<Trader[]>([
    {
      id: '1',
      name: 'CryptoPro_Alex',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      verified: true,
      followers: 12420,
      totalReturn: 245.6,
      monthlyReturn: 18.3,
      winRate: 78.5,
      tradingPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
      riskLevel: 'Medium',
      minCopy: 100,
      description: 'Professional trader with 5+ years experience in crypto markets. Specializing in swing trading and technical analysis.',
      joinedDate: '2021-03-15',
      recentTrades: [
        { id: '1', symbol: 'BTCUSDT', side: 'buy', amount: 0.5, price: 45000, profit: 1250, date: '2024-01-15' },
        { id: '2', symbol: 'ETHUSDT', side: 'sell', amount: 2.0, price: 3000, profit: -150, date: '2024-01-14' },
      ]
    },
    {
      id: '2',
      name: 'DefiMaster_Sarah',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      verified: true,
      followers: 8745,
      totalReturn: 189.2,
      monthlyReturn: 15.7,
      winRate: 72.1,
      tradingPairs: ['ETH/USDT', 'ADA/USDT', 'SOL/USDT'],
      riskLevel: 'Low',
      minCopy: 50,
      description: 'Conservative trader focused on long-term growth. Expert in DeFi protocols and fundamental analysis.',
      joinedDate: '2021-07-22',
      recentTrades: [
        { id: '3', symbol: 'ETHUSDT', side: 'buy', amount: 1.5, price: 2950, profit: 450, date: '2024-01-15' },
        { id: '4', symbol: 'SOLUSDT', side: 'buy', amount: 10, price: 100, profit: 200, date: '2024-01-13' },
      ]
    },
    {
      id: '3',
      name: 'RiskTaker_Mike',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      verified: false,
      followers: 5230,
      totalReturn: 412.8,
      monthlyReturn: 28.5,
      winRate: 65.3,
      tradingPairs: ['BTC/USDT', 'ETH/USDT', 'DOGE/USDT'],
      riskLevel: 'High',
      minCopy: 200,
      description: 'High-risk high-reward trading strategy. Perfect for experienced traders looking for aggressive growth.',
      joinedDate: '2022-01-10',
      recentTrades: [
        { id: '5', symbol: 'BTCUSDT', side: 'buy', amount: 1.0, price: 44500, profit: 2250, date: '2024-01-15' },
        { id: '6', symbol: 'DOGEUSDT', side: 'sell', amount: 1000, price: 0.08, profit: -50, date: '2024-01-14' },
      ]
    },
    {
      id: '4',
      name: 'TechAnalyst_Emma',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
      verified: true,
      followers: 15680,
      totalReturn: 167.3,
      monthlyReturn: 12.9,
      winRate: 81.2,
      tradingPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT'],
      riskLevel: 'Medium',
      minCopy: 75,
      description: 'Technical analysis expert with consistent profits. Known for precise entry and exit points.',
      joinedDate: '2020-11-08',
      recentTrades: [
        { id: '7', symbol: 'BTCUSDT', side: 'sell', amount: 0.3, price: 45500, profit: 650, date: '2024-01-15' },
        { id: '8', symbol: 'ADAUSDT', side: 'buy', amount: 500, price: 0.5, profit: 125, date: '2024-01-14' },
      ]
    }
  ]);

  const [myPositions, setMyPositions] = useState<CopyPosition[]>([
    {
      id: '1',
      traderId: '1',
      traderName: 'CryptoPro_Alex',
      amount: 500,
      profit: 67.5,
      profitPercent: 13.5,
      startDate: '2024-01-10',
      status: 'active'
    },
    {
      id: '2',
      traderId: '2',
      traderName: 'DefiMaster_Sarah',
      amount: 300,
      profit: -15.2,
      profitPercent: -5.1,
      startDate: '2024-01-12',
      status: 'active'
    }
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const handleCopyTrader = async () => {
    if (!selectedTrader || !copyAmount || !session?.user?.id) return;

    const amount = parseFloat(copyAmount);
    if (amount < selectedTrader.minCopy) {
      alert(`Minimum copy amount is $${selectedTrader.minCopy}`);
      return;
    }

    const newPosition: CopyPosition = {
      id: Date.now().toString(),
      traderId: selectedTrader.id,
      traderName: selectedTrader.name,
      amount: amount,
      profit: 0,
      profitPercent: 0,
      startDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setMyPositions(prev => [...prev, newPosition]);
    setShowCopyModal(false);
    setCopyAmount('');
    setSelectedTrader(null);

    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        <div>
          <div class="font-medium">Successfully copying ${selectedTrader.name}!</div>
          <div class="text-sm opacity-90">Investment: $${amount}</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const stopCopying = (positionId: string) => {
    setMyPositions(prev => prev.map(pos =>
      pos.id === positionId ? { ...pos, status: 'paused' as const } : pos
    ));

    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-orange-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>
        Copy trading paused
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const filteredTraders = topTraders
    .filter(trader =>
      trader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trader.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (filterBy === 'performance') return b.totalReturn - a.totalReturn;
      if (filterBy === 'followers') return b.followers - a.followers;
      return 0;
    });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!session) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto mt-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn size={32} className="text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">Access copy trading to follow successful traders automatically</p>
            <a href="/login" className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <LogIn size={20} className="mr-2" />
              Sign In to Copy Trade
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Copy Trading</h2>
          <p className="text-gray-600">Follow and automatically copy trades from successful traders</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">Active Copies: {myPositions.filter(p => p.status === 'active').length}</div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle size={20} className="text-purple-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-purple-900 mb-1">How Copy Trading Works</h3>
            <p className="text-sm text-purple-800">
              When you copy a trader, their trades are automatically replicated in your account proportionally to your investment amount.
              You can stop copying at any time.
            </p>
          </div>
        </div>
      </div>

      {/* My Copy Positions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">My Copy Positions</h3>
        </div>

        {myPositions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <div className="text-lg font-medium mb-2">No copy positions</div>
            <div className="text-sm">Start copying successful traders to diversify your portfolio</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trader</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Investment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit/Loss</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myPositions.map((position) => (
                  <tr key={position.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{position.traderName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${position.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={position.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        <div className="font-medium">
                          {position.profit >= 0 ? '+' : ''}${position.profit.toFixed(2)}
                        </div>
                        <div className="text-xs">
                          {position.profit >= 0 ? '+' : ''}{position.profitPercent.toFixed(2)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(position.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        position.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {position.status === 'active' ? '● Active' : '⏸ Paused'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {position.status === 'active' ? (
                        <button
                          onClick={() => stopCopying(position.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Stop
                        </button>
                      ) : (
                        <span className="text-gray-400">Stopped</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search traders..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Traders</option>
            <option value="performance">Best Performance</option>
            <option value="followers">Most Followers</option>
          </select>
        </div>
      </div>

      {/* Top Traders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))
        ) : (
          filteredTraders.map((trader) => (
            <div key={trader.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              {/* Trader Header */}
              <div className="flex items-center mb-4">
                <img
                  src={trader.avatar}
                  alt={trader.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-semibold text-gray-900 mr-2">{trader.name}</h3>
                    {trader.verified && (
                      <Star size={16} className="text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users size={14} className="mr-1" />
                    {trader.followers.toLocaleString()} followers
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+{trader.totalReturn}%</div>
                  <div className="text-xs text-gray-500">Total Return</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{trader.winRate}%</div>
                  <div className="text-xs text-gray-500">Win Rate</div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Monthly Return:</span>
                  <span className={`font-medium ${trader.monthlyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trader.monthlyReturn >= 0 ? '+' : ''}{trader.monthlyReturn}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Risk Level:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(trader.riskLevel)}`}>
                    {trader.riskLevel}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Min. Copy:</span>
                  <span className="font-medium">${trader.minCopy}</span>
                </div>
              </div>

              {/* Trading Pairs */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Trading Pairs:</div>
                <div className="flex flex-wrap gap-1">
                  {trader.tradingPairs.slice(0, 3).map((pair, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                      {pair}
                    </span>
                  ))}
                  {trader.tradingPairs.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-xs rounded">
                      +{trader.tradingPairs.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Copy Button */}
              <button
                onClick={() => {
                  setSelectedTrader(trader);
                  setShowCopyModal(true);
                }}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Copy size={16} className="mr-2" />
                Copy Trader
              </button>
            </div>
          ))
        )}
      </div>

      {/* Copy Modal */}
      {showCopyModal && selectedTrader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Copy {selectedTrader.name}
              </h2>
              <button onClick={() => setShowCopyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Trader Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <img src={selectedTrader.avatar} alt={selectedTrader.name} className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <div className="font-medium">{selectedTrader.name}</div>
                    <div className="text-sm text-gray-500">Total Return: +{selectedTrader.totalReturn}%</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{selectedTrader.description}</p>
              </div>

              {/* Copy Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Copy Amount (USDT)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={`Minimum: $${selectedTrader.minCopy}`}
                  value={copyAmount}
                  onChange={(e) => setCopyAmount(e.target.value)}
                  step="1"
                  min={selectedTrader.minCopy}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Minimum copy amount: ${selectedTrader.minCopy}
                </div>
              </div>

              {/* Risk Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle size={16} className="text-amber-600 mr-2 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <div className="font-medium mb-1">Risk Disclosure</div>
                    <div>Copy trading involves risk. Past performance does not guarantee future results.
                    You may lose some or all of your investment.</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowCopyModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCopyTrader}
                  disabled={!copyAmount || parseFloat(copyAmount) < selectedTrader.minCopy}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Start Copying
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}