'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import CampaignCard from '@/components/CampaignCard';

const RocketIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clipRule="evenodd" />
    <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
  </svg>
);

const BoltIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
  </svg>
);

const ClockIcon = ({ className = "w-20 h-20" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
  </svg>
);

const CardSkeleton = () => (
  <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-purple-400/5" />
    <div className="h-64 w-full bg-gradient-to-br from-cyan-300/20 to-purple-300/20"></div>
    <div className="p-8">
      <div className="h-8 w-3/4 bg-white/20 rounded-xl mb-4"></div>
      <div className="h-5 w-full bg-white/20 rounded-lg mb-3"></div>
      <div className="h-5 w-5/6 bg-white/20 rounded-lg mb-6"></div>
      <div className="h-14 w-full bg-white/20 rounded-2xl"></div>
    </div>
  </div>
);

const VotePageSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-16 w-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl mb-12"></div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);

export default function VotePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [liveCampaigns, setLiveCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

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
    return (
      <div className="min-h-screen bg-slate-950 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <VotePageSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden py-20 px-4">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .float-delay-1 { animation-delay: 1s; }
        .float-delay-2 { animation-delay: 2s; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
      `}</style>

      {/* Dynamic Mouse Gradient */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(6, 182, 212, 0.15), transparent 80%)`
        }}
      />

      {/* Animated Background Grid */}
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
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float float-delay-1" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float float-delay-2" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-500/30 px-6 py-3 rounded-full mb-8 animate-pulse-glow">
            <BoltIcon className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-bold text-cyan-300 tracking-wide">ACTIVE CAMPAIGNS</span>
          </div>
          
          <h1 className="text-6xl sm:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Live Polls
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Cast your vote on active campaigns and make your voice heard
          </p>

          {/* Live Indicator */}
          <div className="inline-flex items-center gap-3 mt-8 bg-slate-900/50 backdrop-blur-xl border border-red-500/30 px-6 py-3 rounded-full">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
            <span className="text-sm font-bold text-red-400 tracking-wide">
              {liveCampaigns.length} LIVE NOW
            </span>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {liveCampaigns.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {liveCampaigns.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} isLive={true} />
              ))}
            </div>
          ) : (
            <div className="relative group max-w-3xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-xl opacity-25"></div>
              <div className="relative bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-16 text-center">
                <ClockIcon className="w-20 h-20 text-cyan-400 mx-auto mb-6 opacity-50" />
                <h2 className="text-3xl font-black mb-4">
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    No Active Campaigns
                  </span>
                </h2>
                <p className="text-xl text-gray-400 mb-8">
                  There are no live campaigns to vote in right now.
                </p>
                <p className="text-gray-500">
                  Check back later or explore upcoming campaigns on the home page.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        {liveCampaigns.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mt-20 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                {liveCampaigns.length}
              </div>
              <div className="text-gray-400 text-sm font-semibold">Active Campaigns</div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-gray-400 text-sm font-semibold">Secure Voting</div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                <BoltIcon className="w-10 h-10 inline-block" />
              </div>
              <div className="text-gray-400 text-sm font-semibold">Instant Results</div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        {liveCampaigns.length > 0 && (
          <div className="mt-20 text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="relative group inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-slate-900 rounded-3xl px-12 py-8 border border-white/10">
                <h3 className="text-2xl font-black mb-3">
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Ready to Vote?
                  </span>
                </h3>
                <p className="text-gray-400 text-lg">
                  Select a campaign above and cast your vote securely on the blockchain
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}