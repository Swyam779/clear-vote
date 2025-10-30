'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// --- Loading Skeleton (Optional, but nice) ---
// This is a simple pulse for the content area while profileData loads
const ProfileSkeleton = () => (
  <div className="max-w-2xl mx-auto bg-slate-800 shadow-lg rounded-lg overflow-hidden p-8 animate-pulse">
    <div className="h-8 w-1/3 bg-slate-700 rounded-md mb-6"></div>
    <div className="flex items-center space-x-6 mb-8">
      <div className="w-24 h-24 rounded-full bg-slate-700 shadow-md"></div>
      <div>
        <div className="h-7 w-48 bg-slate-700 rounded-md mb-2"></div>
        <div className="h-5 w-64 bg-slate-700 rounded-md"></div>
      </div>
    </div>
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      <div className="h-6 w-1/2 bg-slate-700 rounded-md mb-2"></div>
      <div className="h-4 w-full bg-slate-700 rounded-md mb-4"></div>
      <div className="h-4 w-3/4 bg-slate-700 rounded-md mb-6"></div>
      <div className="h-16 w-full bg-slate-700 p-4 rounded-md"></div>
    </div>
  </div>
);

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }

    if (user) {
      const fetchProfile = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            setProfileData(docSnap.data());
          } else {
            setError('Profile data not found. Please contact support.');
          }
        } catch (err) {
          console.error(err);
          setError('Failed to fetch profile data.');
        }
      };
      
      fetchProfile();
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading || (user && !profileData && !error)) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  // Handle errors
  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto text-center p-10 bg-red-900/50 border border-red-700 text-red-300 rounded-md">
          <h1 className="text-2xl font-semibold">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  // Display profile
  if (profileData) {
    return (
      // Add the container here (that was removed from layout.js)
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto bg-slate-800 shadow-lg rounded-lg overflow-hidden p-8">
          <h1 className="text-3xl font-bold text-cyan-100 mb-6">Your Profile</h1>
          
          <div className="flex items-center space-x-6 mb-8">
            {profileData.photoURL ? (
              <img 
                src={profileData.photoURL} 
                alt="Profile" 
                className="w-24 h-24 rounded-full shadow-md object-cover bg-slate-700"
                onError={(e) => e.target.style.display = 'none'} // Hide if image fails
              />
            ) : (
              // Fallback icon if no photoURL
              <div className="w-24 h-24 rounded-full shadow-md bg-slate-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-slate-500">
                  <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-white">{profileData.name}</h2>
              <p className="text-blue-300">{profileData.email}</p>
            </div>
          </div>

          {/* VOTER ID BOX - Styled with theme's "amber" accent */}
          <div className="bg-slate-900 border-2 border-amber-400/50 rounded-lg p-6 shadow-inner">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">
              Your Unique Voter ID
            </h3>
            <p className="text-slate-300 mb-4">
              This is your secret ID. You will need it to cast your vote.
              Do not share it with anyone.
            </p>
            <p className="text-4xl font-mono font-bold text-center bg-black/30 p-4 rounded-md text-amber-300 tracking-widest break-all">
              {profileData.voterId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
