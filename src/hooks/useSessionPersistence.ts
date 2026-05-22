'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const useSessionPersistence = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      // User is logged in - check if remember me was selected
      const rememberMe = localStorage.getItem('rememberMe') === 'true';

      if (rememberMe) {
        // Extend session timestamp
        const sessionExpiry = new Date();
        sessionExpiry.setDate(sessionExpiry.getDate() + 30); // 30 days
        localStorage.setItem('sessionExpiry', sessionExpiry.toISOString());
      } else {
        // Standard session (shorter duration)
        const sessionExpiry = new Date();
        sessionExpiry.setHours(sessionExpiry.getHours() + 24); // 24 hours
        localStorage.setItem('sessionExpiry', sessionExpiry.toISOString());
      }
    } else {
      // No session - clean up
      const sessionExpiry = localStorage.getItem('sessionExpiry');
      if (sessionExpiry && new Date() > new Date(sessionExpiry)) {
        // Session has expired - clean up remember me if not persistent
        localStorage.removeItem('sessionExpiry');
      }
    }
  }, [session]);

  return session;
};