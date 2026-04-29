'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Calendar, Volume2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface CryptoDetailProps {
  crypto: any;
  onBack: () => void;
}

interface ChartData {
  time: string;
  price: number;
  volume: number;
}

export default function CryptoDetail({ crypto, onBack }: CryptoDetailProps) {
  const [timeRange, setTimeRange] = useState('24h');
  const [chartType, setChartType] = useState<'line' | 'area' | 'candlestick'>('area');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            <div className={`flex items-center text-lg font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? (
                <TrendingUp size={20} className="mr-1" />
              ) : (
                <TrendingDown size={20} className="mr-1" />
              )}
              {isPositive ? '+' : ''}{parseFloat(crypto.changePercent).toFixed(2)}%
            </div>
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
                    formatter={(value: number) => [`$${formatPrice(value)}`, 'Price']}
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
                    formatter={(value: number) => [`$${formatPrice(value)}`, 'Price']}
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
                  formatter={(value: number) => [formatVolume(value), 'Volume']}
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
    </div>
  );
}