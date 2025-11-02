// src/app/vote/[campaignId]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const CheckIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
);

const ShieldCheckIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
);

const LockIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm-3.75 5.25v3h7.5v-3a3.75 3.75 0 1 0-7.5 0Z" clipRule="evenodd" />
  </svg>
);

const ExclamationIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
  </svg>
);

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const campaignRef = doc(db, 'campaigns', campaignId);
        const campaignSnap = await getDoc(campaignRef);
        
        if (!campaignSnap.exists()) {
          setError('Campaign not found.');
          setLoading(false);
          return;
        }
        setCampaign({ id: campaignSnap.id, ...campaignSnap.data() });

        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (!profileSnap.exists()) {
          setError('User profile not found.');
          setLoading(false);
          return;
        }
        setProfile(profileSnap.data());

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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-2xl font-bold text-white">Loading Voting Booth...</p>
        </div>
      </div>
    );
  }
  
  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="relative group max-w-2xl w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl blur-xl opacity-50"></div>
          <div className="relative bg-slate-900 rounded-3xl p-12 text-center border border-red-500/30">
            <ExclamationIcon className="w-20 h-20 text-red-400 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-white mb-4">Error</h1>
            <p className="text-xl text-red-400 mb-8">{error}</p>
            <Link 
              href="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl hover:scale-105 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <style jsx>{`
          @keyframes success-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          .success-pulse { animation: success-pulse 2s ease-in-out infinite; }
        `}</style>
        
        <div className="relative group max-w-2xl w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-50 success-pulse"></div>
          <div className="relative bg-slate-900 rounded-3xl p-12 text-center border border-cyan-500/30">
            <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 mb-6 success-pulse">
              <CheckIcon className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-black mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {campaign.title}
              </span>
            </h1>
            <p className="text-3xl font-bold text-cyan-400 mb-4">
              Vote Recorded Successfully!
            </p>
            <p className="text-xl text-gray-300 mb-8">
              Your vote has been securely recorded on the blockchain. Thank you for participating!
            </p>
            <Link 
              href="/"
              className="inline-block px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-2xl hover:scale-105 transition-all shadow-2xl"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const now = new Date();
  if (campaign.endDate.toDate() < now) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="relative group max-w-2xl w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-xl opacity-50"></div>
          <div className="relative bg-slate-900 rounded-3xl p-12 text-center border border-orange-500/30">
            <LockIcon className="w-20 h-20 text-orange-400 mx-auto mb-6" />
            <h1 className="text-4xl font-black mb-4">
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {campaign.title}
              </span>
            </h1>
            <p className="text-2xl font-bold text-orange-400 mb-4">
              Campaign Ended
            </p>
            <p className="text-lg text-gray-300 mb-8">
              Voting for this campaign is now closed.
            </p>
            <Link 
              href="/"
              className="inline-block px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-2xl hover:scale-105 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden py-20 px-4">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
      `}</style>

      {/* Dynamic Mouse Gradient */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(6, 182, 212, 0.15), transparent 80%)`
        }}
      />

      {/* Background Grid */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black 40%, transparent 100%)'
        }} />
      </div>

      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-500/30 px-6 py-3 rounded-full mb-8 glow-pulse">
            <ShieldCheckIcon className="w-6 h-6 text-cyan-400" />
            <span className="text-sm font-bold text-cyan-300 tracking-wide">SECURE VOTING BOOTH</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {campaign.title}
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">{campaign.description}</p>
        </div>

        {/* Candidates Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-black mb-8 text-center">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Select Your Candidate
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {campaign.candidates.map((candidate) => (
              <div
                key={candidate.name}
                onClick={() => setSelectedCandidate(candidate)}
                className={`group relative cursor-pointer transition-all duration-300 ${
                  selectedCandidate?.name === candidate.name ? 'scale-105' : 'hover:scale-102'
                }`}
              >
                <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-xl transition-opacity duration-300 ${
                  selectedCandidate?.name === candidate.name ? 'opacity-75' : 'opacity-0 group-hover:opacity-50'
                }`}></div>
                
                <div className={`relative bg-slate-900/50 backdrop-blur-2xl border rounded-3xl p-8 transition-all duration-300 ${
                  selectedCandidate?.name === candidate.name 
                    ? 'border-cyan-500 shadow-2xl shadow-cyan-500/50' 
                    : 'border-white/10 hover:border-cyan-500/50'
                }`}>
                  {selectedCandidate?.name === candidate.name && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-full">
                        <CheckIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-6">
                    {candidate.photoURL ? (
                      <img 
                        src={candidate.photoURL} 
                        alt={candidate.name} 
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-cyan-500/30"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <span className="text-3xl font-black text-white">
                          {candidate.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white mb-2">{candidate.name}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{candidate.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation Form */}
        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500"></div>
          
          <div className="relative bg-slate-900 backdrop-blur-2xl border border-white/10 rounded-3xl p-10">
            <h2 className="text-3xl font-black text-center mb-8">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Confirm Your Vote
              </span>
            </h2>
            
            {selectedCandidate ? (
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6 mb-8 text-center">
                <p className="text-gray-300 text-lg mb-2">You have selected:</p>
                <p className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {selectedCandidate.name}
                </p>
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8 text-center">
                <p className="text-gray-400 text-lg">
                  Please select a candidate above to continue
                </p>
              </div>
            )}
            
            <form onSubmit={handleVoteSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-cyan-400 mb-3 text-center">
                  Enter Your 8-Digit Voter ID
                </label>
                <input
                  type="text"
                  value={voterIdInput}
                  onChange={(e) => setVoterIdInput(e.target.value)}
                  className="w-full bg-slate-800/50 border border-cyan-500/30 rounded-2xl p-6 text-center text-3xl font-mono tracking-widest text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  placeholder="••••••••"
                  maxLength={8}
                  required
                />
                <p className="text-sm text-gray-400 text-center mt-3">
                  Find your Voter ID on your{' '}
                  <Link href="/profile" className="text-cyan-400 hover:text-cyan-300 underline font-semibold">
                    Profile Page
                  </Link>
                </p>
              </div>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
                  <p className="text-red-400 font-semibold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedCandidate || isSubmitting || !voterIdInput}
                className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-black rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Vote...
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="w-7 h-7" />
                    Cast Final Vote
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <LockIcon className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-cyan-400 mb-2">Blockchain Security</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Your vote is cryptographically secured and recorded on an immutable blockchain. 
                    Once submitted, it cannot be altered or deleted, ensuring complete transparency and security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}