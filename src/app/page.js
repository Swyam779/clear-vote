// src/app/page.js
'use client'; // This page now needs to fetch data

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import CampaignCard from '@/components/CampaignCard';
import Link from 'next/link';

export default function Home() {
  const [liveCampaigns, setLiveCampaigns] = useState([]);
  const [upcomingCampaigns, setUpcomingCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      const now = Timestamp.now();
      
      try {
        // Query for Live Campaigns
        const liveQuery = query(
          collection(db, 'campaigns'),
          where('startDate', '<=', now),
          where('endDate', '>=', now)
        );
        const liveSnapshot = await getDocs(liveQuery);
        const liveList = liveSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLiveCampaigns(liveList);

        // Query for Upcoming Campaigns
        const upcomingQuery = query(
          collection(db, 'campaigns'),
          where('startDate', '>', now)
        );
        const upcomingSnapshot = await getDocs(upcomingQuery);
        const upcomingList = upcomingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUpcomingCampaigns(upcomingList);

      } catch (error) {
        console.error("Error fetching campaigns: ", error);
      }
      setLoading(false);
    };

    fetchCampaigns();
  }, []);

  return (
    <div>
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Welcome to ClearVote
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your voice, your vote. Securely and transparently.
        </p>
        
        <div className="flex justify-center">
          <Link 
            href="/vote" 
            className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            Give Your Vote
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-xl font-semibold">Loading campaigns...</div>
      ) : (
        <>
          {/* Live Campaigns Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-6">Live Campaigns</h2>
            {liveCampaigns.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {liveCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} isLive={true} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No live campaigns at the moment.</p>
            )}
          </div>

          {/* Upcoming Campaigns Section */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6">Upcoming Campaigns</h2>
            {upcomingCampaigns.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} isLive={false} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No upcoming campaigns scheduled.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}