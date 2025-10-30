'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ResultsChart from '@/components/ResultsChart';

// --- Loading Skeleton ---
const ResultsSkeleton = () => (
  <div className="max-w-5xl mx-auto animate-pulse">
    <div className="h-10 w-1/2 mx-auto bg-slate-700 rounded-md mb-8"></div>
    <div className="h-6 w-3/4 mx-auto bg-slate-700 rounded-md mb-12"></div>
    
    <div className="space-y-16">
      {/* Skeleton for one chart card */}
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg">
        <div className="h-8 w-1/3 mx-auto bg-slate-700 rounded-md mb-6"></div>
        <div className="h-[400px] w-full bg-slate-700 rounded-md"></div>
        <div className="h-4 w-1/2 mx-auto bg-slate-700 rounded-md mt-4"></div>
      </div>
      
      {/* Skeleton for a second chart card */}
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg">
        <div className="h-8 w-1/3 mx-auto bg-slate-700 rounded-md mb-6"></div>
        <div className="h-[400px] w-full bg-slate-700 rounded-md"></div>
        <div className="h-4 w-1/2 mx-auto bg-slate-700 rounded-md mt-4"></div>
      </div>
    </div>
  </div>
);

export default function PublicResultsPage() {
  const [publishedCampaigns, setPublishedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublishedResults = async () => {
      setLoading(true);
      try {
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
    // Add the container here (that was removed from layout.js)
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-cyan-100 mb-8">
          Official Election Results
        </h1>
        <p className="text-lg text-blue-300 text-center mb-12">
          Only results for completed and officially published campaigns are shown here.
        </p>

        {loading ? (
          <ResultsSkeleton />
        ) : (
          publishedCampaigns.length === 0 ? (
            <div className="text-center py-12 bg-slate-800 rounded-lg shadow-sm">
              <p className="text-lg text-blue-300">No published results are available at this time.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {publishedCampaigns.map((campaign) => (
                // Use the same bg-slate-800 as the ResultsChart component
                // to make it look like one seamless card.
                <div key={campaign.id} className="bg-slate-800 p-6 sm:p-8 rounded-lg shadow-lg">
                  <h2 className="text-3xl font-bold text-center text-cyan-100 mb-6">
                    {campaign.title}
                  </h2>
                  <ResultsChart data={campaign.candidates} />
                  <p className="text-sm text-slate-400 text-center mt-4">
                    These results are final and have been verified.
                  </p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
