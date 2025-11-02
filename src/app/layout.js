import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext'; // Import this

// Load the Inter font with a CSS variable
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans', // This makes the font available as a variable
});

export const metadata = {
  title: 'ClearVote - Online E-Voting System',
  description: 'A transparent and secure e-voting platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      {/* This comment is a deliberate fix.
        It "absorbs" the whitespace between <html> and <body>
        to prevent a common Next.js hydration error.
      */}
      {/* This body has no styling. */}
      <body>
        {/*
          THE FIX: We've changed bg-white to bg-slate-50.
          This "off-white" color will trick the browser's 
          "Force Dark Mode" and stop it from inverting.
        */}
        <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
          <AuthProvider>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}

