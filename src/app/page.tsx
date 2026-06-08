'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import KycBanner from '@/components/KycBanner';
import TradingView from '@/components/TradingView';
import WalletComponent from '@/components/Wallet';
import ReferralDashboard from '@/components/ReferralDashboard';
import Profile from '@/components/Profile';
import About from '@/components/About';
import Blog from '@/components/Blog';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'home':
        return <TradingView />;
      case 'wallet':
        return <WalletComponent />;
      case 'referral':
        return <ReferralDashboard />;
      case 'profile':
        return <Profile />;
      case 'about':
        return <About />;
      case 'blog':
        return <Blog />;
      default:
        return <TradingView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <KycBanner onCompleteProfile={() => setActiveTab('profile')} />
      <main className="max-w-7xl mx-auto">
        {renderActiveComponent()}
      </main>
    </div>
  );
}
