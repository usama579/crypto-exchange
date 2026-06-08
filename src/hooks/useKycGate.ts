'use client';

import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

const GATE_MESSAGE =
  'Complete your profile (ID verification + mobile number) to unlock deposits, withdrawals and trading.';

function showGateNotification(message: string) {
  if (typeof document === 'undefined') return;
  const notification = document.createElement('div');
  notification.className =
    'fixed top-4 right-4 bg-amber-500 text-white px-4 py-3 rounded-lg shadow-lg z-[100] max-w-sm text-sm';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(
    () => document.body.contains(notification) && document.body.removeChild(notification),
    4000
  );
}

/**
 * Gate for actions that require a completed profile (KYC).
 *
 * Usage in an action handler:
 *   const { completed, blockIfIncomplete } = useKycGate();
 *   const handleDeposit = () => {
 *     if (blockIfIncomplete()) return;   // shows a toast and stops
 *     ...proceed...
 *   };
 */
export function useKycGate() {
  const { data: session } = useSession();
  const completed = !!session?.user?.isProfileCompleted;

  const blockIfIncomplete = useCallback(
    (message: string = GATE_MESSAGE): boolean => {
      if (completed) return false;
      showGateNotification(message);
      return true;
    },
    [completed]
  );

  return { completed, blockIfIncomplete };
}
