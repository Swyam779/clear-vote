// src/components/Header.jsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Fragment } from 'react'; // Used for the conditional rendering

export default function Header() {
  const { user, isAdmin } = useAuth(); // Get user and admin status

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // AuthProvider will handle the state change
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // --- Base Styles for Consistency ---
  
  // Style for main navigation links (Home, Results)
  const navLinkStyle = "font-medium text-gray-500 hover:text-indigo-600 transition-colors duration-200";
  
  // Base style for all buttons
  const buttonBaseStyle = "inline-block px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";
  
  // Primary button style (Sign Up)
  const primaryButtonStyle = `${buttonBaseStyle} bg-indigo-600 text-white shadow-sm hover:bg-indigo-700`;
  
  // Secondary button style (Profile)
  const secondaryButtonStyle = `${buttonBaseStyle} bg-gray-100 text-indigo-700 hover:bg-gray-200`;
  
  // Destructive button style (Sign Out)
  const destructiveButtonStyle = `${buttonBaseStyle} bg-red-600 text-white shadow-sm hover:bg-red-700`;

  return (
    <header className="bg-white/95 border-b border-gray-200 shadow-sm sticky top-0 z-50 backdrop-blur-sm">
      <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          ClearVote
        </Link>

        {/* Navigation */}
        <div className="flex items-center space-x-6">
          <Link href="/" className={navLinkStyle}>
            Home
          </Link>
          <Link href="/results" className={navLinkStyle}>
            Results
          </Link>

         

          {/* Spacer */}
          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

          {/* Dynamic Auth Section */}
          {user ? (
            <div className="flex items-center space-x-3">
              <Link href="/profile" className={secondaryButtonStyle}>
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className={destructiveButtonStyle}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/auth" className={primaryButtonStyle}>
              Sign Up to Vote
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}