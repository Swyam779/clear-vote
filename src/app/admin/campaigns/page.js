'use client'; // This directive is required for client-side interactivity

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// --- Delete Confirmation Modal ---
const DeleteConfirmationModal = ({ campaign, onClose, onConfirm }) => {
  if (!campaign) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full border border-slate-700">
        <h3 className="text-xl font-bold text-red-300 mb-4">Confirm Deletion</h3>
        <p className="text-slate-300 mb-6">
          Are you sure you want to permanently delete:
          <br />
          <strong className="text-cyan-100 font-medium">{campaign.title}</strong>?
          <br />
          <span className="text-sm text-amber-300">This action cannot be undone.</span>
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
            className="px-4 py-2 rounded-md font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Loading Skeleton for Campaign List ---
const CampaignListSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex justify-between items-center p-4 border border-slate-700 rounded-md">
        <div>
          <div className="h-6 w-48 bg-slate-700 rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-slate-700 rounded-md"></div>
        </div>
        <div className="h-9 w-20 bg-slate-700 rounded-md"></div>
      </div>
    ))}
  </div>
);


export default function AdminCampaignsPage() {
  // State for the form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [candidates, setCandidates] = useState([{ name: '', desc: '', file: null, photoURL: '' }]);
  
  // State for UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // State for existing campaigns
  const [campaignsList, setCampaignsList] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // State for Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);

  // --- 1. Fetch Existing Campaigns ---
  useEffect(() => {
    setLoadingCampaigns(true);
    const q = collection(db, 'campaigns');
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const campaigns = [];
      querySnapshot.forEach((doc) => {
        campaigns.push({ id: doc.id, ...doc.data() });
      });
      setCampaignsList(campaigns);
      setLoadingCampaigns(false);
    }, (err) => {
      console.error(err);
      setError("Failed to load campaigns.");
      setLoadingCampaigns(false);
    });

    return () => unsubscribe();
  }, []);

  // --- 2. Form Handlers ---
  const handleAddCandidate = () => {
    setCandidates([...candidates, { name: '', desc: '', file: null, photoURL: '' }]);
  };

  const handleCandidateChange = (index, field, value) => {
    const newCandidates = [...candidates];
    newCandidates[index][field] = value;
    setCandidates(newCandidates);
  };
  
  const handleFileChange = (index, file) => {
    const newCandidates = [...candidates];
    newCandidates[index].file = file;
    setCandidates(newCandidates);
  };
  
  const handleRemoveCandidate = (index) => {
    const newCandidates = [...candidates];
    newCandidates.splice(index, 1);
    setCandidates(newCandidates);
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setCandidates([{ name: '', desc: '', file: null, photoURL: '' }]);
  };

  // --- 3. Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (candidates.length < 2) {
      setError('A campaign must have at least two candidates.');
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');
    setError('');
    
    try {
      // 1. Upload candidate images
      const candidateData = await Promise.all(
        candidates.map(async (candidate) => {
          let photoURL = '';
          if (candidate.file) {
            const storageRef = ref(storage, `campaigns/${Date.now()}_${candidate.file.name}`);
            const snapshot = await uploadBytes(storageRef, candidate.file);
            photoURL = await getDownloadURL(snapshot.ref);
          }
          return {
            name: candidate.name,
            description: candidate.desc,
            photoURL: photoURL,
            votes: 0,
          };
        })
      );

      // 2. Determine campaign status
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      let status = 'upcoming';
      if (start <= now && end > now) {
        status = 'live';
      } else if (end <= now) {
        status = 'ended';
      }

      // 3. Save the campaign to Firestore
      await addDoc(collection(db, 'campaigns'), {
        title,
        description,
        startDate: start,
        endDate: end,
        candidates: candidateData,
        status: status,
        createdAt: new Date(),
        published: false,
      });
      
      setMessage('Campaign created successfully!');
      clearForm();

    } catch (err) {
      console.error('Error creating campaign: ', err);
      setError(`Error: ${err.message}`);
    }
    setIsSubmitting(false);
  };

  // --- 4. Delete Campaign Logic ---
  
  // 4a. Open the modal
  const openDeleteModal = (campaign) => {
    setCampaignToDelete(campaign);
    setIsDeleteModalOpen(true);
  };
  
  // 4b. Close the modal
  const closeDeleteModal = () => {
    setCampaignToDelete(null);
    setIsDeleteModalOpen(false);
  };
  
  // 4c. Confirm and execute deletion
  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return;
    
    try {
      // 1. Delete associated candidate photos from Storage
      for (const candidate of campaignToDelete.candidates) {
        if (candidate.photoURL) {
          try {
            const photoRef = ref(storage, candidate.photoURL);
            await deleteObject(photoRef);
          } catch (storageError) {
            console.warn(`Could not delete photo ${candidate.photoURL}:`, storageError);
          }
        }
      }
      
      // 2. Delete the campaign document from Firestore
      await deleteDoc(doc(db, 'campaigns', campaignToDelete.id));
      setMessage('Campaign deleted successfully.');

    } catch (err) {
      console.error("Error deleting campaign:", err);
      setError(`Failed to delete campaign: ${err.message}`);
    } finally {
      closeDeleteModal(); // Close the modal regardless of outcome
    }
  };

  // --- Reusable Input Style ---
  const inputStyle = "w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-600 focus:border-transparent focus:outline-none";
  const fileInputStyle = "w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 transition-colors";

  return (
    <div>
      <h1 className="text-3xl font-bold text-cyan-100 mb-6">Manage Campaigns</h1>
      
      {/* --- Create Campaign Form --- */}
      <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg shadow-md mb-12 border border-slate-700">
        <h2 className="text-2xl font-semibold text-white mb-4">Create New Campaign</h2>
        
        {message && <p className="mb-4 p-3 rounded-md bg-green-500/20 text-green-300 border border-green-500/30">{message}</p>}
        {error && <p className="mb-4 p-3 rounded-md bg-red-500/20 text-red-300 border border-red-500/30">{error}</p>}

        {/* Campaign Details */}
        <div className="mb-4">
          <label className="block text-slate-300 font-medium mb-1">Campaign Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputStyle} required />
        </div>
        <div className="mb-4">
          <label className="block text-slate-300 font-medium mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputStyle}></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Start Date & Time</label>
            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputStyle} required />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">End Date & Time</label>
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputStyle} required />
          </div>
        </div>

        {/* Candidates Section */}
        <h3 className="text-xl font-semibold text-white mb-3">Candidates</h3>
        {candidates.map((candidate, index) => (
          <div key={index} className="border border-slate-700 p-4 rounded-md mb-4 bg-slate-900/50 relative">
            <h4 className="font-semibold text-cyan-100 mb-2">Candidate #{index + 1}</h4>
            <div className="mb-2">
              <label className="block text-slate-400 text-sm mb-1">Name</label>
              <input type="text" value={candidate.name} onChange={(e) => handleCandidateChange(index, 'name', e.target.value)} className={inputStyle} required />
            </div>
            <div className="mb-2">
              <label className="block text-slate-400 text-sm mb-1">Description / Slogan</label>
              <input type="text" value={candidate.desc} onChange={(e) => handleCandidateChange(index, 'desc', e.target.value)} className={inputStyle} />
            </div>
            <div className="mb-2">
              <label className="block text-slate-400 text-sm mb-1">Photo (Optional)</label>
              <input type="file" onChange={(e) => handleFileChange(index, e.target.files[0])} className={fileInputStyle} accept="image/*" />
            </div>
            
            {index > 0 && ( // Allow removing only if not the first one
              <button
                type="button"
                onClick={() => handleRemoveCandidate(index)}
                className="absolute top-4 right-4 text-red-400 hover:text-red-300 font-medium text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={handleAddCandidate} className="mb-4 text-cyan-400 hover:text-cyan-300 font-medium">
          + Add Another Candidate
        </button>

        <hr className="my-6 border-slate-700" />

        <button type="submit" disabled={isSubmitting} className="w-full px-6 py-3 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-700 disabled:bg-slate-600 transition-colors">
          {isSubmitting ? 'Creating...' : 'Create Campaign'}
        </button>
      </form>
      
      {/* --- Existing Campaigns List --- */}
      <div className="bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700">
        <h2 className="text-2xl font-semibold text-white mb-4">Existing Campaigns</h2>
        {loadingCampaigns ? (
          <CampaignListSkeleton />
        ) : campaignsList.length === 0 ? (
          <p className="text-slate-400">No campaigns have been created yet.</p>
        ) : (
          <div className="space-y-4">
            {campaignsList.map((campaign) => (
              <div key={campaign.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-slate-700 rounded-md hover:bg-slate-700/50 transition-colors">
                <div className="mb-3 sm:mb-0">
                  <h3 className="font-semibold text-lg text-cyan-100">{campaign.title}</h3>
                  <p className="text-sm text-slate-400">
                    Ends: {new Date(campaign.endDate.toDate()).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => openDeleteModal(campaign)}
                  className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors self-start sm:self-center"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Delete Modal --- */}
      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          campaign={campaignToDelete}
          onClose={closeDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
