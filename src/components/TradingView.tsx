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
  const [detailedCrypto, setDetailedCrypto] = useState<any>(null);

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

  const filteredPrices = prices.filter((crypto) => {
    if (!searchTerm.trim()) return true;
    return crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
    <div className="p-4 md:p-6">
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
        <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            className="w-full md:max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-4">
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
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredPrices.length)} of {filteredPrices.length} cryptocurrencies
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Desktop Header - Hidden on mobile */}
        <div className="hidden md:grid md:grid-cols-8 gap-4 p-4 bg-gray-50 font-semibold text-gray-700">
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
              <div key={crypto.symbol}>
                {/* Mobile Layout */}
                <div className="md:hidden p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-lg text-gray-900">{formatSymbol(crypto.symbol)}</div>
                      <div className="text-2xl font-mono font-bold text-gray-900">
                        ${formatPrice(crypto.price)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`flex items-center justify-end font-bold text-lg ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp size={20} className="mr-1" />
                        ) : (
                          <TrendingDown size={20} className="mr-1" />
                        )}
                        {isPositive ? '+' : ''}{formatPercent(crypto.changePercent)}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-700">24h Change:</span>
                      <div className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{formatPercent(crypto.change)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-700">Volume:</span>
                      <div className="font-medium text-gray-900">
                        {parseFloat(crypto.volume).toFixed(0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-700">High:</span>
                      <div className="font-medium text-gray-900">${formatPrice(crypto.high)}</div>
                    </div>
                    <div>
                      <span className="text-gray-700">Low:</span>
                      <div className="font-medium text-gray-900">${formatPrice(crypto.low)}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-center">
                    <button
                      onClick={() => setDetailedCrypto(crypto)}
                      className="w-full text-blue-600 hover:text-blue-800 text-sm px-4 py-2 rounded border border-blue-200 hover:bg-blue-50 transition-colors flex items-center justify-center"
                    >
                      <BarChart3 size={16} className="mr-2" />
                      View Details
                    </button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:grid md:grid-cols-8 gap-4 p-4 hover:bg-gray-50 transition-colors">
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
                      className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 rounded hover:bg-blue-50 transition-colors flex items-center"
                    >
                      <BarChart3 size={14} className="mr-1" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-center md:justify-start">
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-2">
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-1 text-sm text-gray-500 border border-gray-300 rounded hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>

                {/* Page numbers - Hide on very small screens */}
                <div className="hidden sm:flex items-center space-x-1">
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
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading cryptocurrency data...</div>
        </div>
      )}

      {!isLoading && filteredPrices.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          {prices.length === 0 ? 'No data available. Please check your connection.' : 'No results found for your search.'}
        </div>
      )}

      {!isLoading && paginatedPrices.length === 0 && filteredPrices.length > 0 && (
        <div className="text-center py-12 text-gray-600">
          No results on this page. Try going to page 1.
        </div>
      )}

    </div>
  );
}