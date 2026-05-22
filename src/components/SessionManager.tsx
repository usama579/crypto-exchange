'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SessionManager() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // Check session expiration
    const checkSessionExpiry = () => {
      const sessionExpiry = localStorage.getItem('sessionExpiry');
      const rememberMe = localStorage.getItem('rememberMe') === 'true';

      if (session && sessionExpiry) {
        const expiryDate = new Date(sessionExpiry);
        const now = new Date();

        if (now > expiryDate) {
          // Session has expired
          console.log('Session expired, signing out...');
          if (!rememberMe) {
            // Clear remember me data if session expired and remember me was not selected
            localStorage.removeItem('rememberedEmail');
          }
          signOut({ redirect: false });
          router.push('/login');
        }
      }
    };

    // Set up session expiry based on remember me
    if (session && status === 'authenticated') {
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      const existingExpiry = localStorage.getItem('sessionExpiry');

      if (!existingExpiry) {
        const sessionExpiry = new Date();
        if (rememberMe) {
          sessionExpiry.setDate(sessionExpiry.getDate() + 30); // 30 days
        } else {
          sessionExpiry.setHours(sessionExpiry.getHours() + 24); // 24 hours
        }
        localStorage.setItem('sessionExpiry', sessionExpiry.toISOString());
      }
    }

    // Check expiry on mount
    checkSessionExpiry();

    // Set up interval to check session expiry
    const interval = setInterval(checkSessionExpiry, 60000); // Check every minute

    // Clean up on unmount
    return () => clearInterval(interval);
  }, [session, status, router]);

  useEffect(() => {
    // Handle browser/tab focus to refresh session if needed
    const handleFocus = () => {
      const sessionExpiry = localStorage.getItem('sessionExpiry');
      if (session && sessionExpiry) {
        const expiryDate = new Date(sessionExpiry);
        const now = new Date();

        if (now > expiryDate) {
          signOut({ redirect: false });
          router.push('/login');
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [session, router]);

  // This component doesn't render anything
  return null;
}