'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Users, Gift, Lock, Unlock, Copy, Share2, LogIn } from 'lucide-react';

interface ReferralStats {
  totalReferred: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalLocked: number;
  totalUnlocked: number;
  referrals: any[];
  lockedBalances: any[];
}

interface ReferralData {
  referralCode: string;
  stats: ReferralStats;
}

export default function ReferralDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session) {
      fetchReferralData();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [session, status]);

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/referral');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const referralUrl = `${window.location.origin}/signup?ref=${data?.referralCode}`;
    navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareReferral = () => {
    const referralUrl = `${window.location.origin}/signup?ref=${data?.referralCode}`;
    const text = `Join our crypto exchange and get $100 USDT bonus! Use my referral code: ${data?.referralCode}`;

    if (navigator.share) {
      navigator.share({
        title: 'Crypto Exchange Referral',
        text,
        url: referralUrl,
      });
    } else {
      copyReferralLink();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn size={32} className="text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
        <p className="text-gray-600 mb-6">Please log in to view your referral dashboard and manage your referral program.</p>
        <div className="space-y-3">
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
          <div>
            <span className="text-gray-500">Don't have an account? </span>
            <a href="/signup" className="text-blue-600 hover:text-blue-700">
              Sign up
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-500">Error loading referral data</p>
      </div>
    );
  }

  const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${data.referralCode}`;
  const unlockedAmount = data.stats.totalUnlocked;
  const lockedAmount = data.stats.totalLocked;
  const neededReferrals = Math.max(0, 2 - data.stats.activeReferrals);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Referral Program</h2>
        <p className="opacity-90">
          Earn $100 USDT for each friend who joins and makes a deposit!
        </p>
      </div>

      {/* Referral Code Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex text-gray-900 items-center">
          <Share2 className="h-5 w-5 mr-2 text-blue-500" />
          Your Referral Code
        </h3>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900">Referral Code</span>
            <span className="text-lg font-bold text-blue-600">{data.referralCode}</span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900">Referral Link</span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={referralUrl}
                readOnly
                className="text-xs bg-white border rounded px-2 py-1 w-80 text-gray-900"
              />
              <button
                onClick={copyReferralLink}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors flex items-center"
              >
                <Copy className="h-3 w-3 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={shareReferral}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share with Friends
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalReferred}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Active Referrals</p>
              <p className="text-2xl font-bold text-green-600">{data.stats.activeReferrals}</p>
            </div>
            <Gift className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Unlocked Bonus</p>
              <p className="text-2xl font-bold text-green-600">${unlockedAmount}</p>
            </div>
            <Unlock className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Locked Bonus</p>
              <p className="text-2xl font-bold text-orange-600">${lockedAmount}</p>
            </div>
            <Lock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How the Referral Program Works</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <p className="font-medium text-gray-900">Share Your Code</p>
              <p className="text-gray-700 text-sm">Share your referral code or link with friends</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <p className="font-medium text-gray-900">Friend Signs Up</p>
              <p className="text-gray-700 text-sm">Your friend creates an account using your referral code</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <p className="font-medium text-gray-900">Both Get $100</p>
              <p className="text-gray-700 text-sm">You and your friend both receive $100 USDT bonus (locked initially)</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
            <div>
              <p className="font-medium text-gray-900">Make a Deposit</p>
              <p className="text-gray-700 text-sm">When your friend makes their first deposit, their bonus unlocks</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</div>
            <div>
              <p className="font-medium text-gray-900">Unlock Your Bonus</p>
              <p className="text-gray-700 text-sm">Your bonus unlocks after 2 of your referred friends make deposits</p>
            </div>
          </div>
        </div>

        {neededReferrals > 0 && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-orange-900 font-medium">
              You need {neededReferrals} more active referral{neededReferrals > 1 ? 's' : ''} to unlock your bonus!
            </p>
            <p className="text-orange-800 text-sm mt-1">
              Active referrals are friends who have signed up using your code and made a deposit.
            </p>
          </div>
        )}
      </div>

      {/* Recent Referrals */}
      {data.stats.referrals.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Referrals</h3>
          <div className="space-y-3">
            {data.stats.referrals.map((referral, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {referral.referrer?.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{referral.referrer?.email || 'User'}</p>
                    <p className="text-sm text-gray-700">
                      Joined {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    referral.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {referral.status}
                  </span>
                  <p className="text-sm text-gray-700 mt-1">$100 USDT</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}