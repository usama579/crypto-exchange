'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { TrendingUp, Target, Users, ArrowLeft, LogIn } from 'lucide-react';
import TradingView from '@/components/TradingView';
import FuturesTrading from '@/components/FuturesTrading';
import CopyTrading from '@/components/CopyTrading';

export default function TradingPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'spot' | 'futures' | 'copy'>('spot');

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto mt-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access trading features and manage your portfolio.</p>
            <div className="space-y-3">
              <a
                href="/login"
                className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In to Trade
              </a>
              <a
                href="/"
                className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Market Data
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderActiveTrading = () => {
    switch (activeTab) {
      case 'spot':
        return <TradingView />;
      case 'futures':
        return <FuturesTrading />;
      case 'copy':
        return <CopyTrading />;
      default:
        return <TradingView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <a
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Home
            </a>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading Center</h1>
          <p className="text-gray-600">Trade cryptocurrencies with advanced tools and features</p>
        </div>

        {/* Trading Type Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex">
            {/* Spot Trading Tab */}
            <button
              onClick={() => setActiveTab('spot')}
              className={`flex-1 flex items-center justify-center px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'spot'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <TrendingUp size={20} className="mr-2" />
              <div className="text-left">
                <div className="font-semibold">Spot Trading</div>
                <div className="text-sm opacity-75">Buy & sell instantly</div>
              </div>
            </button>

            {/* Futures Trading Tab */}
            <button
              onClick={() => setActiveTab('futures')}
              className={`flex-1 flex items-center justify-center px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'futures'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Target size={20} className="mr-2" />
              <div className="text-left">
                <div className="font-semibold">Futures Trading</div>
                <div className="text-sm opacity-75">Leverage up to 100x</div>
              </div>
            </button>

            {/* Copy Trading Tab */}
            <button
              onClick={() => setActiveTab('copy')}
              className={`flex-1 flex items-center justify-center px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'copy'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Users size={20} className="mr-2" />
              <div className="text-left">
                <div className="font-semibold">Copy Trading</div>
                <div className="text-sm opacity-75">Follow top traders</div>
              </div>
            </button>
          </div>
        </div>

        {/* Trading Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {renderActiveTrading()}
        </div>
      </div>
    </div>
  );
}