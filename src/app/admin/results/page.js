'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import ResultsChart from '@/components/ResultsChart';

// --- Loading Skeleton ---
const ResultCardSkeleton = () => (
  <div className="bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div>
        <div className="h-7 w-48 bg-slate-700 rounded-md mb-2"></div>
        <div className="h-5 w-24 bg-slate-700 rounded-full"></div>
      </div>
      <div className="h-10 w-32 bg-slate-700 rounded-md"></div>
    </div>
    <div className="h-[400px] w-full bg-slate-700 rounded-md"></div>
  </div>
);

const ResultsPageSkeleton = () => (
  <div>
    <div className="h-9 w-1/3 bg-slate-700 rounded-md mb-6"></div>
    <div className="space-y-12">
      <ResultCardSkeleton />
      <ResultCardSkeleton />
    </div>
  </div>
);

// --- Confirmation Modal (Replaces browser 'confirm()') ---
const ConfirmationModal = ({ campaign, onClose, onConfirm }) => {
  if (!campaign) return null;

  const actionText = campaign.published ? 'UN-PUBLISH' : 'PUBLISH';
  const buttonClass = campaign.published 
    ? 'bg-amber-500 text-amber-900 font-semibold hover:bg-amber-600' // Un-publish
    : 'bg-cyan-600 text-white font-semibold hover:bg-cyan-700'; // Publish

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Confirm Action</h3>
        <p className="text-slate-300 mb-6">
          Are you sure you want to {actionText} the results for:
          <br />
          <strong className="text-cyan-100 font-medium">{campaign.title}</strong>?
        </p>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-md font-semibold bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${buttonClass}`}
          >
            Confirm {actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Helper for Status Badge ---
const getStatusClass = (status) => {
  const lowerStatus = status?.toLowerCase();
  if (lowerStatus === 'live') {
    return 'bg-green-500/20 text-green-300 border border-green-500/30';
  }
  if (lowerStatus === 'upcoming') {
    return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
  }
  // for 'ended' or other statuses
  return 'bg-slate-600/50 text-slate-300 border border-slate-600/80';
};


export default function AdminResultsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null); // Store campaign to act on

  // 1. Set up a REAL-TIME listener for all campaigns
  useEffect(() => {
    setLoading(true);
    const campaignsCollection = collection(db, 'campaigns');
    
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

    return () => unsubscribe();
  }, []);

  // 2. Open confirmation modal
  const handlePublishClick = (campaign) => {
    setSelectedCampaign(campaign); // Set the campaign to be acted upon
    setIsModalOpen(true);
  };

  // 3. Handle the actual publish logic (called by modal)
  const handleConfirmPublish = async () => {
    if (!selectedCampaign) return;
    
    try {
      const campaignRef = doc(db, 'campaigns', selectedCampaign.id);
      await updateDoc(campaignRef, {
        published: !selectedCampaign.published // Toggle the published state
      });
      console.log('Publish status updated!');
    } catch (error) {
      console.error('Error updating publish status: ', error);
    } finally {
      // Close and reset modal state
      setIsModalOpen(false);
      setSelectedCampaign(null);
    }
  };

  // 4. Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
  };

  if (loading) {
    return <ResultsPageSkeleton />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-cyan-100 mb-6">Live Campaign Results</h1>
      
      {campaigns.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-lg shadow-sm border border-slate-700">
          <p className="text-lg text-slate-400">No campaigns found.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-2xl font-bold text-cyan-100">{campaign.title}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-slate-400">Status:</p>
                    <span 
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusClass(campaign.status)}`}
                    >
                      {campaign.status || 'N/A'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handlePublishClick(campaign)}
                  className={`px-4 py-2 rounded-md font-semibold transition-colors w-full sm:w-auto ${
                    campaign.published 
                      ? 'bg-amber-500 text-amber-900 hover:bg-amber-600' 
                      : 'bg-cyan-600 text-white hover:bg-cyan-700'
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

      {/* Confirmation Modal */}
      {isModalOpen && (
        <ConfirmationModal 
          campaign={selectedCampaign}
          onClose={handleCloseModal}
          onConfirm={handleConfirmPublish}
        />
      )}
    </div>
  );
}
