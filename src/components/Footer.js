// src/components/Footer.jsx
import Link from 'next/link';

export default function Footer() {
  // Style for footer navigation links
  const linkStyle = "text-sm text-gray-500 hover:text-indigo-600 transition-colors duration-200";

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          {/* Logo and Copyright */}
          <div className="text-center md:text-left">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              ClearVote
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              &copy; {new Date().getFullYear()} ClearVote. All rights reserved.
            </p>
          </div>
          
          {/* Navigation Links */}
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