'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import CampaignCard from '@/components/CampaignCard';

// --- Loading Skeleton ---
const CardSkeleton = () => (
  <div className="bg-slate-800 shadow-lg rounded-lg overflow-hidden animate-pulse">
    <div className="p-6">
      {/* Skeleton for Title */}
      <div className="h-7 w-3/4 bg-slate-700 rounded-md mb-3"></div>
      {/* Skeleton for Description */}
      <div className="h-5 w-full bg-slate-700 rounded-md mb-6"></div>
      {/* Skeleton for Button */}
      <div className="h-10 w-1/2 bg-slate-700 rounded-md"></div>
    </div>
  </div>
);

const VotePageSkeleton = () => (
  <div className="animate-pulse">
    {/* Skeleton for Title */}
    <div className="h-10 w-1/3 bg-slate-700 rounded-md mb-8"></div>
    {/* Skeleton for Card Grid */}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);
// --- End Loading Skeleton ---

export default function VotePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [liveCampaigns, setLiveCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for authentication
    if (!authLoading && !user) {
      router.push('/auth'); // Redirect to sign-in if not logged in
      return;
    }

    // 2. Fetch campaigns if user is logged in
    if (user) {
      const fetchCampaigns = async () => {
        setLoading(true);
        const now = Timestamp.now();
        
        try {
          const liveQuery = query(
            collection(db, 'campaigns'),
            where('startDate', '<=', now),
            where('endDate', '>=', now)
          );
          const liveSnapshot = await getDocs(liveQuery);
          const liveList = liveSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setLiveCampaigns(liveList);
        } catch (error) {
          console.error("Error fetching campaigns: ", error);
        }
        setLoading(false);
      };

      fetchCampaigns();
    }
  }, [user, authLoading, router]);

  // Use the consistent skeleton loader
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <VotePageSkeleton />
      </div>
    );
  }

  return (
    // Add the container here (that was removed from layout.js)
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-4xl font-extrabold text-cyan-100 mb-8">
        Live Polls
      </h1>
      {liveCampaigns.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {liveCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} isLive={true} />
          ))}
        </div>
      ) : (
        // Styled empty-state box, consistent with results page
        <div className="text-center py-12 bg-slate-800 rounded-lg shadow-sm">
          <p className="text-lg text-blue-300">
            There are no live campaigns to vote in right now.
          </p>
        </div>
      )}
    </div>
  );
}
