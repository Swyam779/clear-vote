// src/app/results/page.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ResultsChart from '@/components/ResultsChart';

export default function PublicResultsPage() {
  const [publishedCampaigns, setPublishedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublishedResults = async () => {
      setLoading(true);
      try {
        // Query for campaigns ONLY where published == true
        const q = query(
          collection(db, 'campaigns'),
          where('published', '==', true)
        );
        
        const querySnapshot = await getDocs(q);
        const campaignsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPublishedCampaigns(campaignsList);
      } catch (error) {
        console.error("Error fetching published results: ", error);
      }
      setLoading(false);
    };

    fetchPublishedResults();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-extrabold text-center mb-8">
        Official Election Results
      </h1>
      <p className="text-lg text-gray-600 text-center mb-12">
        Only results for completed and officially published campaigns are shown here.
      </p>

      {loading ? (
        <div className="text-center text-xl font-semibold">Loading results...</div>
      ) : (
        publishedCampaigns.length === 0 ? (
          <p className="text-center text-gray-500">No published results are available at this time.</p>
        ) : (
          <div className="space-y-16">
            {publishedCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white p-8 rounded-lg shadow-xl border">
                <h2 className="text-3xl font-bold text-center mb-6">{campaign.title}</h2>
                <ResultsChart data={campaign.candidates} />
                <p className="text-sm text-gray-500 text-center mt-4">
                  These results are final and have been verified.
                </p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}