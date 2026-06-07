'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'waiting'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    const userEmail = searchParams.get('email');

    if (userEmail) {
      setEmail(userEmail);
    }

    if (token) {
      verifyEmail(token);
    } else if (userEmail) {
      // User came from signup flow - show waiting for verification state
      setStatus('waiting');
      setMessage('We have sent a verification link to your email address. Please check your email and click the link to verify your account.');
      setCanResend(true);
    } else {
      // No token and no email - invalid link
      setStatus('error');
      setMessage('Invalid verification link');
      setCanResend(false);
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.message);
        setCanResend(data.message === 'Verification token has expired');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while verifying your email');
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setResending(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('New verification email sent! Please check your inbox.');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center mb-6">
          <Logo size={48} textClassName="text-3xl" />
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
                <h2 className="text-xl font-semibold text-gray-900">Verifying your email...</h2>
                <p className="text-gray-600">Please wait while we verify your email address.</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <h2 className="text-xl font-semibold text-gray-900">Email Verified!</h2>
                <p className="text-gray-600">{message}</p>
                <div className="pt-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Sign In to Your Account
                  </Link>
                </div>
              </div>
            )}

            {status === 'waiting' && (
              <div className="space-y-4">
                <Mail className="h-12 w-12 text-blue-600 mx-auto" />
                <h2 className="text-xl font-semibold text-gray-900">Check Your Email</h2>
                <p className="text-gray-600">{message}</p>

                <div className="pt-4 space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <button
                    onClick={resendVerificationEmail}
                    disabled={resending || !email}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </button>
                </div>

                <div className="pt-4">
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    Already verified? Sign In
                  </Link>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <XCircle className="h-12 w-12 text-red-600 mx-auto" />
                <h2 className="text-xl font-semibold text-gray-900">Verification Failed</h2>
                <p className="text-gray-600">{message}</p>

                {canResend && (
                  <div className="pt-4 space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    <button
                      onClick={resendVerificationEmail}
                      disabled={resending || !email}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Resend Verification Email'
                      )}
                    </button>
                  </div>
                )}

                <div className="pt-4">
                  <Link
                    href="/signup"
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    Back to Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}