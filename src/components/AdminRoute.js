// src/components/AdminRoute.jsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in at all
        router.push('/auth');
      } else if (!isAdmin) {
        // Logged in, but NOT an admin
        router.push('/'); // Redirect to homepage
      }
    }
  }, [user, isAdmin, loading, router]);

  // Show loading or the protected content
  if (loading || !isAdmin) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-semibold">Checking credentials...</h1>
      </div>
    );
  }

  return children;
}