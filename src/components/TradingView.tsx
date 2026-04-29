'use client';

import { useEffect, useState } from 'react';
import { useCryptoStore } from '@/store/cryptoStore';
import { cryptoWebSocket } from '@/lib/websocket';
import { fetchCryptoData } from '@/lib/cryptoApi';
import { TrendingUp, TrendingDown, Wifi, WifiOff, X, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import CryptoDetail from './CryptoDetail';

export default function TradingView() {
  const {
    prices,
    setPrices,
    setIsConnected,
    isConnected,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage
  } = useCryptoStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState<any>(null);
  const [detailedCrypto, setDetailedCrypto] = useState<any>(null);
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    // First, load data from REST API for immediate display
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const initialData = await fetchCryptoData();
        if (initialData.length > 0) {
          setPrices(initialData);
          console.log(`Loaded ${initialData.length} cryptocurrencies from REST API`);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    // Then set up WebSocket for real-time updates
    cryptoWebSocket.connect();
    cryptoWebSocket.subscribe('main', (data) => {
      if (data.length > 0) {
        setPrices(data);
        console.log(`WebSocket updated with ${data.length} prices`);
      }
    });

    // Subscribe to WebSocket connection status
    cryptoWebSocket.subscribeToStatus('main', (connected) => {
      setIsConnected(connected);
    });

    // Fallback: refresh data every 10 seconds if WebSocket fails
    const fallbackInterval = setInterval(async () => {
      if (!isConnected) {
        try {
          const fallbackData = await fetchCryptoData();
          if (fallbackData.length > 0) {
            setPrices(fallbackData);
          }
        } catch (error) {
          console.error('Fallback data fetch failed:', error);
        }
      }
    }, 10000);

    return () => {
      cryptoWebSocket.unsubscribe('main');
      cryptoWebSocket.unsubscribeFromStatus('main');
      clearInterval(fallbackInterval);
    };
  }, [setPrices, setIsConnected, isConnected]);

  const filteredPrices = prices.filter(
    (crypto) =>
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.includes('USDT')
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredPrices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPrices = filteredPrices.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, setCurrentPage]);

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num < 1 ? num.toFixed(6) : num.toFixed(2);
  };

  const formatPercent = (percent: string) => {
    const num = parseFloat(percent);
    return num.toFixed(2);
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

  const handleTrade = () => {
    if (!selectedCrypto || !tradeAmount) return;

    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        <div>
          <div class="font-medium">${tradeType.toUpperCase()} order placed successfully!</div>
          <div class="text-sm opacity-90">${tradeAmount} USDT for ${formatSymbol(selectedCrypto.symbol)}</div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);

    setSelectedCrypto(null);
    setTradeAmount('');
  };

  // Show detailed view if a crypto is selected for details
  if (detailedCrypto) {
    return (
      <CryptoDetail
        crypto={detailedCrypto}
        onBack={() => setDetailedCrypto(null)}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Live Trading</h1>
          <div className="flex items-center">
            {isConnected ? (
              <div className="flex items-center text-green-600">
                <Wifi size={20} className="mr-2" />
                <span className="text-sm font-medium">Live</span>
              </div>
            ) : (
              <div className="flex items-center text-orange-500">
                <WifiOff size={20} className="mr-2" />
                <span className="text-sm font-medium">Connecting...</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex items-center space-x-4">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
              <option value={200}>200 per page</option>
            </select>
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredPrices.length)} of {filteredPrices.length} cryptocurrencies
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-8 gap-4 p-4 bg-gray-50 font-semibold text-gray-700">
          <div>Symbol</div>
          <div className="text-right">Price (USDT)</div>
          <div className="text-right">24h Change</div>
          <div className="text-right">24h %</div>
          <div className="text-right">High</div>
          <div className="text-right">Low</div>
          <div className="text-right">Volume</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-200">
          {paginatedPrices.map((crypto) => {
            const isPositive = parseFloat(crypto.changePercent) >= 0;
            return (
              <div
                key={crypto.symbol}
                className="grid grid-cols-8 gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">{formatSymbol(crypto.symbol)}</div>
                <div className="text-right font-mono font-semibold text-gray-900">
                  ${formatPrice(crypto.price)}
                </div>
                <div
                  className={`text-right flex items-center justify-end font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp size={16} className="mr-1" />
                  ) : (
                    <TrendingDown size={16} className="mr-1" />
                  )}
                  {isPositive ? '+' : ''}{formatPercent(crypto.change)}
                </div>
                <div
                  className={`text-right font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isPositive ? '+' : ''}{formatPercent(crypto.changePercent)}%
                </div>
                <div className="text-right text-gray-700 font-medium">
                  ${formatPrice(crypto.high)}
                </div>
                <div className="text-right text-gray-700 font-medium">
                  ${formatPrice(crypto.low)}
                </div>
                <div className="text-right text-gray-700 font-medium">
                  {parseFloat(crypto.volume).toFixed(0)}
                </div>
                <div className="text-right flex items-center justify-end space-x-2">
                  <button
                    onClick={() => setDetailedCrypto(crypto)}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    title="View detailed chart"
                  >
                    <BarChart3 size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedCrypto(crypto)}
                    className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                  >
                    Trade
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-1 text-sm text-gray-500 border border-gray-300 rounded hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === pageNumber
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'text-gray-500 border-gray-300 hover:text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-1 text-sm text-gray-500 border border-gray-300 rounded hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Loading cryptocurrency data...</div>
        </div>
      )}

      {!isLoading && filteredPrices.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {prices.length === 0 ? 'No data available. Please check your connection.' : 'No results found for your search.'}
        </div>
      )}

      {!isLoading && paginatedPrices.length === 0 && filteredPrices.length > 0 && (
        <div className="text-center py-12 text-gray-500">
          No results on this page. Try going to page 1.
        </div>
      )}

      {/* Trading Modal */}
      {selectedCrypto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Trade {formatSymbol(selectedCrypto.symbol)}</h2>
              <button
                onClick={() => setSelectedCrypto(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <div className="text-2xl font-bold text-gray-900">
                ${formatPrice(selectedCrypto.price)}
              </div>
              <div className={`text-sm ${parseFloat(selectedCrypto.changePercent) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {parseFloat(selectedCrypto.changePercent) >= 0 ? '+' : ''}{formatPercent(selectedCrypto.changePercent)}% (24h)
              </div>
            </div>

            <div className="mb-4">
              <div className="flex rounded-lg bg-gray-100 p-1 mb-3">
                <button
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    tradeType === 'buy'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setTradeType('buy')}
                >
                  Buy
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    tradeType === 'sell'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setTradeType('sell')}
                >
                  Sell
                </button>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (USDT)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount..."
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                />
              </div>

              {tradeAmount && (
                <div className="text-sm text-gray-600 mb-4">
                  You will {tradeType} approximately{' '}
                  <span className="font-medium">
                    {(parseFloat(tradeAmount) / parseFloat(selectedCrypto.price)).toFixed(6)}
                  </span>{' '}
                  {formatSymbol(selectedCrypto.symbol).split('/')[0]}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedCrypto(null)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTrade}
                className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors ${
                  tradeType === 'buy'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={!tradeAmount}
              >
                {tradeType === 'buy' ? 'Buy' : 'Sell'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}