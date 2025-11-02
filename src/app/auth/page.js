// src/app/auth/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { getOrCreateUser } from '@/lib/userService';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Handle redirect back from magic link
  useEffect(() => {
    // We wrap the async logic in a function inside useEffect
    const handleMagicLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let storedEmail = window.localStorage.getItem('emailForSignIn');
        if (!storedEmail) {
          storedEmail = window.prompt('Please provide your email for confirmation');
        }

        if (storedEmail) {
          setIsProcessing(true);
          try {
            const result = await signInWithEmailLink(auth, storedEmail, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            await getOrCreateUser(result.user);
            router.push('/profile');
          } catch (err) {
            setError(err.message);
            setIsProcessing(false);
          }
        }
      }
    };

    // Only run this logic if not loading and user is not logged in
    if (!loading && !user) {
      handleMagicLinkSignIn();
    }
  }, [loading, user, router]); // Dependencies are correct

  // 2. If user is already logged in, redirect them
  useEffect(() => {
    if (!loading && user) {
      router.push('/profile');
    }
  }, [user, loading, router]); // Dependencies are correct

  // 3. Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsProcessing(true); // Set processing state
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await getOrCreateUser(result.user);
      router.push('/profile');
    } catch (err) {
      setError(err.message);
    }
    setIsProcessing(false); // Unset processing state
  };

  // 4. Handle Magic Email Link
  const handleEmailLinkSignIn = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setMessage('');

    const actionCodeSettings = {
      url: `${window.location.origin}/auth`, // Handle link on this same page
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage(`A sign-in link has been sent to ${email}. Please check your inbox.`);
    } catch (err) {
      setError(err.message);
    }
    setIsProcessing(false);
  };

  // Show loading screen while checking auth, redirecting, or processing
  if (loading || user || isProcessing) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-semibold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Sign In / Sign Up</h1>
      <p className="text-gray-600 mb-8 text-center">
        Sign in to vote.
      </p>

      {message && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{message}</p>}
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}

      {/* Google Sign-In Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isProcessing} // Disable button while processing
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 mb-4 disabled:bg-gray-200"
      >
        <svg className="w-6 h-6 mr-2" viewBox="0 0 48 48">
          <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.16 6.26C12.06 13.5 17.63 9.5 24 9.5z"></path><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.51h12.8c-.57 2.87-2.3 5.47-4.79 7.2l7.8 6c4.6-4.2 7.3-10.2 7.3-17.16z"></path><path fill="#FBBC05" d="M10.72 29.7c-.74-2.22-1.16-4.6-1.16-7.2s.42-4.98 1.16-7.2L2.56 13.22C.94 16.61 0 20.2 0 24s.94 7.39 2.56 10.78l8.16-6.28z"></path><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.8-6c-2.18 1.47-5.04 2.32-8.09 2.32-6.37 0-11.94-4-13.9-9.48l-8.16 6.26C6.51 42.62 14.62 48 24 48z"></path>
        </svg>
        Sign in with Google
      </button>

      <div className="my-6 flex items-center justify-center">
        <span className="bg-white px-2 text-gray-500">OR</span>
      </div>

      {/* Email Link Form */}
      <form onSubmit={handleEmailLinkSignIn}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Sign in with Email Link
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="you@example.com"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isProcessing ? 'Sending...' : 'Send Magic Link'}
        </button>
      </form>
    </div>
  );
}