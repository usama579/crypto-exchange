'use client';

import { useSession } from 'next-auth/react';
import { AlertTriangle } from 'lucide-react';

interface KycBannerProps {
  onCompleteProfile: () => void;
}

export default function KycBanner({ onCompleteProfile }: KycBannerProps) {
  const { data: session, status } = useSession();

  // Only show for logged-in users who haven't completed their profile.
  if (status !== 'authenticated' || session?.user?.isProfileCompleted) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-start sm:items-center text-amber-800">
          <AlertTriangle size={18} className="mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
          <p className="text-sm">
            Your profile isn&apos;t verified yet. You can browse the app, but
            <strong> deposits, withdrawals and trading are locked</strong> until you verify your identity.
          </p>
        </div>
        <button
          onClick={onCompleteProfile}
          className="flex-shrink-0 px-4 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
        >
          Complete Profile
        </button>
      </div>
    </div>
  );
}
