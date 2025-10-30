// src/components/Header.jsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useState, Fragment } from 'react'; // Import useState for mobile menu

// --- SVG Icons for Hamburger Menu (no extra libraries needed) ---
const MenuIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const XIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
// --- End SVG Icons ---

export default function Header() {
  const { user, isAdmin } = useAuth(); // Get user and admin status
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsMenuOpen(false); // Close menu on sign out
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // --- Base Styles for Consistency (Updated for Dark Mode) ---
  const navLinkStyle = "font-medium text-slate-300 hover:text-cyan-200 transition-colors duration-200";
  const buttonBaseStyle = "inline-block px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900";
  
  // Primary button matches the homepage CTA
  const primaryButtonStyle = `${buttonBaseStyle} bg-amber-400 text-amber-900 shadow-sm hover:bg-amber-300`;
  
  // Secondary button for dark mode
  const secondaryButtonStyle = `${buttonBaseStyle} bg-slate-700 text-cyan-200 hover:bg-slate-600`;
  
  // Destructive button is fine as-is
  const destructiveButtonStyle = `${buttonBaseStyle} bg-red-600 text-white shadow-sm hover:bg-red-700`;
  
  // --- New Styles for Mobile Menu (Updated for Dark Mode) ---
  const mobileNavLinkStyle = "block w-full text-left py-2 px-3 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-cyan-200";
  const mobilePrimaryButtonStyle = `${primaryButtonStyle} w-full text-center`;
  const mobileSecondaryButtonStyle = `${secondaryButtonStyle} w-full text-center`;
  const mobileDestructiveButtonStyle = `${destructiveButtonStyle} w-full text-center`;

  return (
    <header className="bg-slate-900/95 border-b border-slate-700 shadow-sm sticky top-0 z-50 backdrop-blur-sm">
      {/* Main Nav Bar */}
      <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        
        {/* Logo (Updated to theme color) */}
        <Link 
          href="/" 
          className="text-2xl font-bold text-cyan-200" // Changed color
          onClick={() => setIsMenuOpen(false)} // Close menu on logo click
        >
          ClearVote
        </Link>

        {/* Desktop Navigation (Hidden on mobile) */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className={navLinkStyle}>Home</Link>
          <Link href="/results" className={navLinkStyle}>Results</Link>
          {isAdmin && (
            <Link href="/admin" className={`${navLinkStyle} text-amber-400 hover:text-amber-300`}> {/* Changed color */}
              Admin Panel
            </Link>
          )}
          <div className="w-px h-6 bg-slate-700"></div> {/* Changed color */}
          {user ? (
            <div className="flex items-center space-x-3">
              <Link href="/profile" className={secondaryButtonStyle}>Profile</Link>
              <button onClick={handleSignOut} className={destructiveButtonStyle}>Sign Out</button>
            </div>
          ) : (
            <Link href="/auth" className={primaryButtonStyle}>Sign Up to Vote</Link>
          )}
        </div>

        {/* Mobile Menu Button (Visible on mobile) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-cyan-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-400" // Changed colors
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu (Dropdown) */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-700 shadow-lg transition-all duration-300 ease-in-out transform ${ // Changed colors
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-4 pt-2 pb-4 space-y-3">
          <Link href="/" className={mobileNavLinkStyle} onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link href="/results" className={mobileNavLinkStyle} onClick={() => setIsMenuOpen(false)}>Results</Link>
          {isAdmin && (
            <Link href="/admin" className={`${mobileNavLinkStyle} text-amber-400`} onClick={() => setIsMenuOpen(false)}> {/* Changed color */}
              Admin Panel
            </Link>
          )}
          
          {/* Auth buttons for mobile */}
          <div className="border-t border-slate-700 pt-3 space-y-3"> {/* Changed color */}
            {user ? (
              <>
                <Link href="/profile" className={mobileSecondaryButtonStyle} onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
                <button onClick={handleSignOut} className={mobileDestructiveButtonStyle}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth" className={mobilePrimaryButtonStyle} onClick={() => setIsMenuOpen(false)}>
                Sign Up to Vote
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
