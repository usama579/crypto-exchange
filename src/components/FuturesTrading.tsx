'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useKycGate } from '@/hooks/useKycGate';
import { useCryptoStore } from '@/store/cryptoStore';
import { cryptoWebSocket } from '@/lib/websocket';
import { fetchCryptoData } from '@/lib/cryptoApi';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Calculator, X, LogIn } from 'lucide-react';

interface FuturesPosition {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  leverage: number;
  margin: number;
  liquidationPrice: number;
}

export default function FuturesTrading() {
  const { data: session } = useSession();
  const { blockIfIncomplete } = useKycGate();
  const { prices, setPrices, setIsConnected, isConnected } = useCryptoStore();

  const [selectedCrypto, setSelectedCrypto] = useState<any>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState<'long' | 'short'>('long');
  const [leverage, setLeverage] = useState(10);
  const [margin, setMargin] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [positions, setPositions] = useState<FuturesPosition[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const initialData = await fetchCryptoData();
        if (initialData.length > 0) {
          setPrices(initialData);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    cryptoWebSocket.connect();
    cryptoWebSocket.subscribe('futures', (data) => {
      if (data.length > 0) {
        setPrices(data);
      }
    });

    cryptoWebSocket.subscribeToStatus('futures', (connected) => {
      setIsConnected(connected);
    });

    return () => {
      cryptoWebSocket.unsubscribe('futures');
      cryptoWebSocket.unsubscribeFromStatus('futures');
    };
  }, [setPrices, setIsConnected]);

  const handleTrade = async () => {
    if (blockIfIncomplete()) return;
    if (!selectedCrypto || !margin || !session?.user?.id) return;

    try {
      const response = await fetch('/api/trading/futures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedCrypto.symbol,
          side: tradeType.toUpperCase(),
          margin: margin,
          leverage: leverage
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Trade failed');
      }

      // Add to local state for immediate UI update
      const newPosition: FuturesPosition = {
        id: data.position.id,
        symbol: data.position.symbol,
        side: data.position.side.toLowerCase() as 'long' | 'short',
        size: parseFloat(data.position.amount),
        entryPrice: parseFloat(data.position.entryPrice),
        leverage: data.position.leverage,
        margin: parseFloat(data.position.margin),
        liquidationPrice: parseFloat(data.position.liquidationPrice)
      };

      setPositions(prev => [...prev, newPosition]);
      setShowTradeModal(false);
      setMargin('');
      setSelectedCrypto(null);

      showNotification(`${tradeType.toUpperCase()} position opened!`, 'success');

    } catch (error) {
      console.error('Trade error:', error);
      showNotification(error instanceof Error ? error.message : 'Trade failed', 'error');
    }
  };

  const closePosition = async (positionId: string) => {
    try {
      const response = await fetch('/api/trading/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId, type: 'futures' })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to close position');
      }

      setPositions(prev => prev.filter(p => p.id !== positionId));
      showNotification(`Position closed. PnL: ${data.pnl ? '$' + data.pnl.toFixed(2) : 'N/A'}`, 'success');

    } catch (error) {
      console.error('Close position error:', error);
      showNotification(error instanceof Error ? error.message : 'Failed to close position', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          ${type === 'success'
            ? '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>'
            : '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>'
          }
        </svg>
        ${message}
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return num < 1 ? num.toFixed(6) : num.toFixed(2);
  };

  const formatSymbol = (symbol: string) => {
    if (symbol.endsWith('USDT')) {
      const base = symbol.slice(0, -4);
      return `${base}/USDT`;
    }
    return symbol;
  };

  if (!session) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto mt-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">Access futures trading with leverage up to 100x</p>
            <a href="/login" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <LogIn size={20} className="mr-2" />
              Sign In to Trade
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
          <h2 className="text-2xl font-bold text-gray-900">Futures Trading</h2>
          <p className="text-gray-600">Trade with leverage up to 100x</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">Positions: {positions.length}</div>
          {isConnected ? (
            <div className="flex items-center text-green-600 text-sm">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              Live
            </div>
          ) : (
            <div className="flex items-center text-orange-500 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              Connecting...
            </div>
          )}
        </div>
      </div>

      {/* Risk Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle size={20} className="text-red-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">High Risk Warning</h3>
            <p className="text-sm text-red-800">
              Futures trading involves substantial risk of loss. You can lose more than your initial investment.
              Only trade with money you can afford to lose.
            </p>
          </div>
        </div>
      </div>

      {/* Active Positions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Positions</h3>
        </div>

        {positions.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <Target size={48} className="mx-auto mb-4 text-gray-400" />
            <div className="text-lg font-medium mb-2">No active positions</div>
            <div className="text-sm">Open your first futures position to get started</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Side</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Entry Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">PnL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Margin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {positions.map((position) => {
                  const currentPrice = prices.find(p => p.symbol === position.symbol)?.price || position.entryPrice;
                  const pnl = position.side === 'long'
                    ? (parseFloat(currentPrice.toString()) - position.entryPrice) * position.size
                    : (position.entryPrice - parseFloat(currentPrice.toString())) * position.size;
                  const pnlPercent = (pnl / position.margin) * 100;

                  return (
                    <tr key={position.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatSymbol(position.symbol)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          position.side === 'long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {position.side === 'long' ? '↗ LONG' : '↘ SHORT'} {position.leverage}x
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {position.size.toFixed(6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${formatPrice(position.entryPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${formatPrice(currentPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className={pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                          <div className="font-medium">
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                          </div>
                          <div className="text-xs">
                            {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${position.margin.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => closePosition(position.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Market Data */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Futures Markets</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Symbol</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">24h Change</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Volume</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-20 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-16 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : (
                prices.slice(0, 20).map((crypto) => {
                  const isPositive = parseFloat(crypto.changePercent) >= 0;
                  return (
                    <tr key={crypto.symbol} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatSymbol(crypto.symbol)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-gray-900">
                        ${formatPrice(crypto.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className={`flex items-center justify-end ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isPositive ? (
                            <TrendingUp size={14} className="mr-1" />
                          ) : (
                            <TrendingDown size={14} className="mr-1" />
                          )}
                          {isPositive ? '+' : ''}{parseFloat(crypto.changePercent).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        ${(parseFloat(crypto.volume) / 1000000).toFixed(2)}M
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCrypto(crypto);
                              setTradeType('long');
                              setShowTradeModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1 rounded border border-green-200 hover:bg-green-50"
                          >
                            LONG
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCrypto(crypto);
                              setTradeType('short');
                              setShowTradeModal(true);
                            }}
                            className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                          >
                            SHORT
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && selectedCrypto && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {tradeType.toUpperCase()} {formatSymbol(selectedCrypto.symbol)}
              </h2>
              <button onClick={() => setShowTradeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Current Price</div>
                <div className="text-xl font-bold text-gray-900">${formatPrice(selectedCrypto.price)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leverage</label>
                <select
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 5, 10, 20, 25, 50, 75, 100].map(lev => (
                    <option key={lev} value={lev}>{lev}x</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Margin (USDT)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter margin amount"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  step="0.01"
                  min="1"
                />
              </div>

              {margin && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center text-blue-800 mb-2">
                    <Calculator size={16} className="mr-2" />
                    <span className="font-medium">Position Details</span>
                  </div>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Position Size:</span>
                      <span>{((parseFloat(margin) * leverage) / parseFloat(selectedCrypto.price)).toFixed(6)} {selectedCrypto.symbol.replace('USDT', '')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Notional Value:</span>
                      <span>${(parseFloat(margin) * leverage).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Liquidation Price:</span>
                      <span className="text-red-600">
                        ${(tradeType === 'long'
                          ? parseFloat(selectedCrypto.price) * (1 - (1 / leverage) * 0.9)
                          : parseFloat(selectedCrypto.price) * (1 + (1 / leverage) * 0.9)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertTriangle size={16} className="text-amber-600 mr-2 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <div className="font-medium mb-1">Risk Warning</div>
                    <div>You can lose up to {margin ? `$${margin}` : 'your entire margin'} on this position.
                    {leverage > 1 && ` With ${leverage}x leverage, small price movements can result in significant losses.`}</div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowTradeModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTrade}
                  disabled={!margin || parseFloat(margin) <= 0}
                  className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    tradeType === 'long' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Open {tradeType.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}