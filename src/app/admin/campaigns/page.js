// src/app/admin/campaigns/page.js
'use client'; // <--- FIX: This directive is required for client-side interactivity

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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

  // --- 1. Fetch Existing Campaigns ---
  useEffect(() => {
    setLoadingCampaigns(true);
    const q = collection(db, 'campaigns');
    
    // Use onSnapshot for real-time updates
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

    // Cleanup listener on unmount
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
      // 1. Upload candidate images to Firebase Storage
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
            votes: 0, // Initialize votes to 0
          };
        })
      );

      // 2. Determine campaign status
      const now = new Date();
      const start = new Date(startDate);
      const status = start > now ? 'upcoming' : 'live';

      // 3. Save the campaign to Firestore
      await addDoc(collection(db, 'campaigns'), {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        candidates: candidateData,
        status: status,
        createdAt: new Date(),
        published: false, // Results are not published by default
      });
      
      setMessage('Campaign created successfully!');
      clearForm();

    } catch (err) {
      console.error('Error creating campaign: ', err);
      setError(`Error: ${err.message}`);
    }
    setIsSubmitting(false);
  };

  // --- 4. Delete Campaign ---
  const handleDeleteCampaign = async (campaign) => {
    if (!window.confirm(`Are you sure you want to delete the campaign "${campaign.title}"? This is permanent.`)) {
      return;
    }
    
    try {
      // 1. Delete associated candidate photos from Storage
      for (const candidate of campaign.candidates) {
        if (candidate.photoURL) {
          try {
            const photoRef = ref(storage, candidate.photoURL);
            await deleteObject(photoRef);
          } catch (storageError) {
            // Log error but continue deletion of Firestore doc
            console.warn(`Could not delete photo ${candidate.photoURL}:`, storageError);
          }
        }
      }
      
      // 2. Delete the campaign document from Firestore
      await deleteDoc(doc(db, 'campaigns', campaign.id));
      setMessage('Campaign deleted successfully.');

    } catch (err) {
      console.error("Error deleting campaign:", err);
      setError(`Failed to delete campaign: ${err.message}`);
    }
  };


  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Campaigns</h1>
      
      {/* --- Create Campaign Form --- */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-12">
        <h2 className="text-2xl font-semibold mb-4">Create New Campaign</h2>
        
        {message && <p className="mb-4 p-3 rounded-md bg-green-100 text-green-700">{message}</p>}
        {error && <p className="mb-4 p-3 rounded-md bg-red-100 text-red-700">{error}</p>}

        {/* Campaign Details */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Campaign Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded-md" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded-md"></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Start Date & Time</label>
            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">End Date & Time</label>
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 border rounded-md" required />
          </div>
        </div>

        {/* Candidates Section */}
        <h3 className="text-xl font-semibold mb-3">Candidates</h3>
        {candidates.map((candidate, index) => (
          <div key={index} className="border p-4 rounded-md mb-4 bg-gray-50 relative">
            <h4 className="font-semibold mb-2">Candidate #{index + 1}</h4>
            <div className="mb-2">
              <label className="block text-gray-700 text-sm mb-1">Name</label>
              <input type="text" value={candidate.name} onChange={(e) => handleCandidateChange(index, 'name', e.target.value)} className="w-full p-2 border rounded-md" required />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 text-sm mb-1">Description / Slogan</label>
              <input type="text" value={candidate.desc} onChange={(e) => handleCandidateChange(index, 'desc', e.target.value)} className="w-full p-2 border rounded-md" />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 text-sm mb-1">Photo (Optional)</label>
              <input type="file" onChange={(e) => handleFileChange(index, e.target.files[0])} className="w-full p-2 border rounded-md" accept="image/*" />
            </div>
            
            {index > 0 && ( // Allow removing only if not the first one
              <button
                type="button"
                onClick={() => handleRemoveCandidate(index)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={handleAddCandidate} className="mb-4 text-blue-600 hover:text-blue-800 font-medium">
          + Add Another Candidate
        </button>

        <hr className="my-6" />

        <button type="submit" disabled={isSubmitting} className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:bg-gray-400">
          {isSubmitting ? 'Creating...' : 'Create Campaign'}
        </button>
      </form>
      
      {/* --- Existing Campaigns List --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Existing Campaigns</h2>
        {loadingCampaigns ? (
          <p>Loading campaigns...</p>
        ) : campaignsList.length === 0 ? (
          <p>No campaigns have been created yet.</p>
        ) : (
          <div className="space-y-4">
            {campaignsList.map((campaign) => (
              <div key={campaign.id} className="flex justify-between items-center p-4 border rounded-md">
                <div>
                  <h3 className="font-semibold text-lg">{campaign.title}</h3>
                  <p className="text-sm text-gray-500">
                    Ends: {new Date(campaign.endDate.toDate()).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteCampaign(campaign)}
                  className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}