// src/components/Footer.jsx
import Link from 'next/link';

export default function Footer() {
  // Style for footer navigation links (Updated for dark mode)
  const linkStyle = "text-sm text-slate-300 hover:text-cyan-200 transition-colors duration-200";

  return (
    <footer className="bg-slate-900 border-t border-slate-700 mt-16"> {/* Changed background and border */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          {/* Logo and Copyright (Updated for dark mode) */}
          <div className="text-center md:text-left">
            <Link href="/" className="text-xl font-bold text-cyan-200"> {/* Changed color */}
              ClearVote
            </Link>
            <p className="text-sm text-slate-400 mt-1"> {/* Changed color */}
              &copy; {new Date().getFullYear()} ClearVote. All rights reserved.
            </p>
          </div>
          
          {/* Navigation Links (Updated for dark mode) */}
          <nav className="flex flex-wrap justify-center space-x-6">
            <Link href="/" className={linkStyle}>
              Home
            </Link>
            <Link href="/results" className={linkStyle}>
              Results
            </Link>
            <Link href="/profile" className={linkStyle}>
              Profile
            </Link>
            {/* You could add 'Privacy Policy' or 'Terms' links here later */}
          </nav>

        </div>
      </div>
    </footer>
  );
}
