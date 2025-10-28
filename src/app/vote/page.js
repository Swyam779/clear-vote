// src/app/vote/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import CampaignCard from '@/components/CampaignCard';

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

  if (authLoading || loading) {
    return <div className="text-center text-xl font-semibold">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Live Polls</h1>
      {liveCampaigns.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {liveCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} isLive={true} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-lg">There are no live campaigns to vote in right now.</p>
      )}
    </div>
  );
}