// src/app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext'; // Import this

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ClearVote - Online E-Voting System',
  description: 'A transparent and secure e-voting platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        <AuthProvider> {/* Wrap here */}
          <Header />
          <main className="flex-grow container mx-auto px-6 py-8">
            {children}
          </main>
          <Footer />
        </AuthProvider> {/* Close here */}
      </body>
    </html>
  );
}