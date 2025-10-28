// src/app/profile/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // This state will hold data from Firestore (including the Voter ID)
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Check auth state
    if (!loading && !user) {
      // If not logged in, redirect to auth page
      router.push('/auth');
    }

    // 2. If logged in, fetch profile data from Firestore
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
      <div className="text-center p-10">
        <h1 className="text-2xl font-semibold">Loading your profile...</h1>
      </div>
    );
  }

  // Handle errors
  if (error) {
    return (
      <div className="text-center p-10 bg-red-100 border border-red-400 text-red-700 rounded-md">
        <h1 className="text-2xl font-semibold">Error</h1>
        <p>{error}</p>
      </div>
    );
  }
  
  // Display profile
  if (profileData) {
    return (
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Profile</h1>
        
        <div className="flex items-center space-x-6 mb-8">
          {profileData.photoURL && (
            <img 
              src={profileData.photoURL} 
              alt="Profile" 
              className="w-24 h-24 rounded-full shadow-md"
            />
          )}
          <div>
            <h2 className="text-2xl font-semibold">{profileData.name}</h2>
            <p className="text-gray-600">{profileData.email}</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Your Unique Voter ID
          </h3>
          <p className="text-gray-700 mb-4">
            This is your secret ID. You will need it to cast your vote.
            Do not share it with anyone.
          </p>
          <p className="text-4xl font-mono font-bold text-center bg-gray-100 p-4 rounded-md text-blue-900 tracking-widest">
            {profileData.voterId}
          </p>
        </div>
      </div>
    );
  }

  // Fallback for cases where user is null but loading is false
  return null;
}