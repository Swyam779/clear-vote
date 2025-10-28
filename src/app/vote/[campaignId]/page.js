// src/app/vote/[campaignId]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link'; // <-- ADD THIS LINE

export default function VoteCampaignPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { campaignId } = params;

  const [campaign, setCampaign] = useState(null);
  const [profile, setProfile] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voterIdInput, setVoterIdInput] = useState('');

  // 1. Fetch all necessary data
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // A. Fetch campaign details
        const campaignRef = doc(db, 'campaigns', campaignId);
        const campaignSnap = await getDoc(campaignRef);
        
        if (!campaignSnap.exists()) {
          setError('Campaign not found.');
          setLoading(false);
          return;
        }
        setCampaign({ id: campaignSnap.id, ...campaignSnap.data() });

        // B. Fetch user profile (for Voter ID)
        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (!profileSnap.exists()) {
          setError('User profile not found.');
          setLoading(false);
          return;
        }
        setProfile(profileSnap.data());

        // C. Check if user has already voted
        const voteRef = doc(db, 'votes', `${campaignId}_${user.uid}`);
        const voteSnap = await getDoc(voteRef);
        
        if (voteSnap.exists()) {
          setHasVoted(true);
        }

      } catch (err) {
        console.error(err);
        setError('Failed to load voting data.');
      }
      setLoading(false);
    };

    fetchData();
  }, [user, authLoading, router, campaignId]);


  // 2. Handle the vote submission
  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCandidate) {
      setError('Please select a candidate to vote for.');
      return;
    }
    
    if (voterIdInput.trim() !== profile.voterId) {
      setError('The Voter ID you entered is incorrect. Please check your profile.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await runTransaction(db, async (transaction) => {
        const voteRef = doc(db, 'votes', `${campaignId}_${user.uid}`);
        const campaignRef = doc(db, 'campaigns', campaignId);

        const voteDoc = await transaction.get(voteRef);
        if (voteDoc.exists()) {
          throw new Error('You have already voted in this poll.');
        }

        const campaignDoc = await transaction.get(campaignRef);
        if (!campaignDoc.exists()) {
          throw new Error('Campaign not found.');
        }
        
        const campaignData = campaignDoc.data();
        const updatedCandidates = campaignData.candidates.map(c => {
          if (c.name === selectedCandidate.name) {
            return { ...c, votes: c.votes + 1 };
          }
          return c;
        });

        transaction.update(campaignRef, { candidates: updatedCandidates });

        transaction.set(voteRef, {
          userId: user.uid,
          campaignId: campaignId,
          candidateName: selectedCandidate.name,
          votedAt: new Date(),
        });
      });
      
      setHasVoted(true);

    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while casting your vote.');
    }
    
    setIsSubmitting(false);
  };

  // --- Render Logic ---

  if (loading || authLoading) {
    return <div className="text-center text-xl font-semibold">Loading Voting Booth...</div>;
  }
  
  if (error) {
    return <div className="text-center text-xl font-bold text-red-600">{error}</div>;
  }

  // A. Show this if user has ALREADY VOTED
  if (hasVoted) {
    return (
      <div className="max-w-2xl mx-auto text-center p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{campaign.title}</h1>
        <p className="text-2xl font-semibold text-green-600">
          Thank You!
        </p>
        <p className="text-lg text-gray-700">
          Your vote has been successfully recorded.
        </p>
        <Link href="/" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-md">
          Back to Home
        </Link>
      </div>
    );
  }

  // B. Show this if the poll is over (but user didn't vote)
  const now = new Date();
  if (campaign.endDate.toDate() < now) {
    return (
      <div className="max-w-2xl mx-auto text-center p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{campaign.title}</h1>
        <p className="text-2xl font-semibold text-red-600">
          This poll has ended.
        </p>
        <p className="text-lg text-gray-700">
          Voting for this campaign is now closed.
        </p>
      </div>
    );
  }

  // C. Show the main voting form
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-center mb-4">{campaign.title}</h1>
      <p className="text-lg text-gray-600 text-center mb-10">{campaign.description}</p>
      
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {campaign.candidates.map((candidate) => (
          <div
            key={candidate.name}
            onClick={() => setSelectedCandidate(candidate)}
            className={`p-6 bg-white rounded-lg shadow-md cursor-pointer transition-all ${
              selectedCandidate?.name === candidate.name
                ? 'ring-4 ring-blue-500'
                : 'hover:shadow-lg'
            }`}
          >
            <div className="flex items-center space-x-4">
              {candidate.photoURL && (
                <img src={candidate.photoURL} alt={candidate.name} className="w-20 h-20 rounded-full object-cover" />
              )}
              <div>
                <h3 className="text-2xl font-bold">{candidate.name}</h3>
                <p className="text-gray-600">{candidate.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleVoteSubmit} className="bg-white p-8 rounded-lg shadow-xl border">
        <h2 className="text-2xl font-bold text-center mb-6">Confirm Your Vote</h2>
        
        {selectedCandidate ? (
          <p className="text-center text-lg mb-6">
            You have selected: <span className="font-bold text-blue-600">{selectedCandidate.name}</span>
          </p>
        ) : (
          <p className="text-center text-lg mb-6 text-gray-500">
            Please select a candidate above.
          </p>
        )}
        
        <div className="mb-4 max-w-sm mx-auto">
          <label htmlFor="voterId" className="block text-sm font-medium text-gray-700 mb-1">
            Enter Your 8-Digit Voter ID
          </label>
          <input
            type="text"
            id="voterId"
            value={voterIdInput}
            onChange={(e) => setVoterIdInput(e.target.value)}
            className="w-full p-3 border rounded-md text-center text-2xl font-mono tracking-widest"
            placeholder="********"
            maxLength={8}
            required
          />
          <p className="text-xs text-gray-500 text-center mt-1">
            You can find this on your <Link href="/profile" className="text-blue-500 underline">Profile</Link> page.
          </p>
        </div>
        
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <button
          type="submit"
          disabled={!selectedCandidate || isSubmitting || !voterIdInput}
          className="w-full max-w-sm mx-auto flex justify-center py-3 px-4 bg-green-600 text-white text-lg font-bold rounded-md shadow-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Submitting...' : 'Cast Final Vote'}
        </button>
      </form>
    </div>
  );
}