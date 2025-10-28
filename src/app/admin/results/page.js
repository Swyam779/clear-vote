// src/app/admin/results/page.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import ResultsChart from '@/components/ResultsChart';

export default function AdminResultsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Set up a REAL-TIME listener for all campaigns
  useEffect(() => {
    setLoading(true);
    const campaignsCollection = collection(db, 'campaigns');
    
    // onSnapshot listens for any changes in the collection
    const unsubscribe = onSnapshot(campaignsCollection, (querySnapshot) => {
      const campaignsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCampaigns(campaignsList);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to campaigns: ", error);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // 2. Handle publishing results
  const handlePublish = async (campaignId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'UN-PUBLISH' : 'PUBLISH'} these results?`)) {
      return;
    }
    
    try {
      const campaignRef = doc(db, 'campaigns', campaignId);
      await updateDoc(campaignRef, {
        published: !currentStatus // Toggle the published state
      });
      console.log('Publish status updated!');
    } catch (error) {
      console.error('Error updating publish status: ', error);
    }
  };

  if (loading) {
    return <div>Loading live results...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Live Campaign Results</h1>
      
      {campaigns.length === 0 ? (
        <p>No campaigns found.</p>
      ) : (
        <div className="space-y-12">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{campaign.title}</h2>
                  <p className="text-gray-500">
                    Status: <span className="font-medium capitalize">{campaign.status}</span>
                  </p>
                </div>
                <button
                  onClick={() => handlePublish(campaign.id, campaign.published)}
                  className={`px-4 py-2 rounded-md font-semibold text-white ${
                    campaign.published 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {campaign.published ? 'Un-publish Results' : 'Publish Results'}
                </button>
              </div>
              
              <ResultsChart data={campaign.candidates} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}