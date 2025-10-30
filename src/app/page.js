'use client'; // This page now needs to fetch data

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; // Re-enabled
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'; // Re-enabled
import Link from 'next/link'; // Re-enabled
import CampaignCard from '@/components/CampaignCard'; // Re-enabled

// --- Helper Icons (using inline SVG for portability) ---
// Using 'currentColor' so icons inherit the text color

const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className}
  >
    <path 
      fillRule="evenodd" 
      d="M5.75 3a.75.75 0 0 1 .75.75v.25h7V3.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5v-.25A.75.75 0 0 1 5.75 3ZM3.5 8.25v7a1.25 1.25 0 0 0 1.25 1.25h10.5a1.25 1.25 0 0 0 1.25-1.25v-7h-13Z" 
      clipRule="evenodd" 
    />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className}
  >
    <path 
      fillRule="evenodd" 
      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" 
      clipRule="evenodd" 
    />
  </svg>
);

const CheckBadgeIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={className}
  >
    <path 
      fillRule="evenodd" 
      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" 
      clipRule="evenodd" 
    />
  </svg>
);

// --- ICONS FOR FEATURES ---
const LockIcon = ({ className = "w-8 h-8" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path 
      fillRule="evenodd" 
      d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm-3.75 5.25v3h7.5v-3a3.75 3.75 0 1 0-7.5 0Z" 
      clipRule="evenodd" 
    />
  </svg>
);

const EyeIcon = ({ className = "w-8 h-8" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path 
      fillRule="evenodd" 
      d="M1.323 11.447C2.83 7.963 7.07 4.5 12 4.5s9.17 3.463 10.677 6.947a.75.75 0 1 1-1.354.606C20.04 12.441 16.5 9.75 12 9.75s-8.04 2.691-9.323 2.303a.75.75 0 1 1-.354-1.353ZM1.323 12.553a.75.75 0 0 1 1.354-.606C4.04 11.559 7.5 14.25 12 14.25s7.96-2.691 9.323-2.303a.75.75 0 1 1 .354 1.353C19.17 16.037 14.93 19.5 12 19.5s-7.17-3.463-8.677-6.947Z" 
      clipRule="evenodd" 
    />
  </svg>
);

const GlobeIcon = ({ className = "w-8 h-8" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path 
      fillRule="evenodd" 
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM.75 12a11.25 11.25 0 0 1 22.5 0 11.25 11.25 0 0 1-22.5 0ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" 
      clipRule="evenodd" 
    />
  </svg>
);

// Helper function to format dates
// You may want to move this to a shared utils file
const formatDate = (timestamp) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return 'N/A';
  }
  return timestamp.toDate().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};


// --- Loading Skeleton Components ---
// You may want to move this to its own component file
const CardSkeleton = () => (
  <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="h-48 w-full bg-slate-700"></div>
    <div className="p-6">
      <div className="h-6 w-3/4 bg-slate-700 rounded mb-3"></div>
      <div className="h-4 w-full bg-slate-700 rounded mb-2"></div>
      <div className="h-4 w-5/6 bg-slate-700 rounded mb-4"></div>
      <div className="h-4 w-1/2 bg-slate-700 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-slate-700 rounded mb-6"></div>
      <div className="h-12 w-full bg-slate-700 rounded-lg"></div>
    </div>
  </div>
);


// --- Feature Card Component ---
// You may want to move this to its own component file
const FeatureCard = ({ icon, title, description, colorClass }) => (
  <div className={`rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 transform ${colorClass}`}>
    <div className="p-4 rounded-full bg-black/10 mb-5 shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-sm leading-relaxed opacity-90">{description}</p>
  </div>
);


// --- Main Page Component ---
export default function Home() {
  // --- THIS IS YOUR ORIGINAL STATE AND LOGIC ---
  const [liveCampaigns, setLiveCampaigns] =useState([]);
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
  // --- END OF YOUR ORIGINAL LOGIC ---


  return (
    // Main background is deep, dark blue; text is light cyan
    <div className="min-h-screen bg-slate-900 text-cyan-200">
      {/* Styles for fade-in animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.8s ease-in-out forwards;
          }
        `}
      </style>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Solid slate background (MODIFIED) */}
        <div className="absolute inset-0 bg-slate-900 opacity-95"></div>
        <div 
          className="absolute inset-0 pattern-dots-md text-blue-700 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(currentColor 2px, transparent 2px)',
            backgroundSize: '32px 32px',
          }}
        ></div>

        <div className="relative text-center py-24 md:py-32 px-4 z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-cyan-100 mb-6 tracking-tight shadow-sm">
            Welcome to ClearVote
          </h1>
          <p className="text-xl md:text-2xl text-blue-300 mb-12 max-w-3xl mx-auto">
            Your voice, your vote. Securely, transparently, and effortlessly.
          </p>
          
          <div className="flex justify-center">
            <Link 
              href="/vote" 
              className="flex items-center space-x-2 px-8 py-4 bg-amber-400 text-amber-900 text-lg font-bold rounded-lg shadow-lg hover:bg-amber-300 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <CheckBadgeIcon className="w-6 h-6" />
              <span>Give Your Vote</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <>
            {/* Loading Skeletons */}
            <div className="mb-16">
              <div className="h-10 w-1/3 bg-slate-700 rounded-md mb-8 animate-pulse"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>
            <div>
              <div className="h-10 w-1/3 bg-slate-700 rounded-md mb-8 animate-pulse"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <CardSkeleton />
              </div>
            </div>
          </>
        ) : (
          <div className="animate-fade-in">
            {/* Live Campaigns Section */}
            <section className="mb-16" aria-labelledby="live-campaigns-title">
              <h2 id="live-campaigns-title" className="text-3xl font-bold text-cyan-200 mb-8 pb-2 border-b-4 border-cyan-600 inline-block">
                Live Campaigns
              </h2>
              {liveCampaigns.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {liveCampaigns.map(campaign => (
                    <CampaignCard key={campaign.id} campaign={campaign} isLive={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-800 rounded-lg shadow-sm">
                  <p className="text-lg text-blue-300">No live campaigns at the moment.</p>
                  <p className="text-blue-400 mt-2">Check back soon!</p>
                </div>
              )}
            </section>

            {/* Upcoming Campaigns Section */}
            <section className="mb-20" aria-labelledby="upcoming-campaigns-title">
              <h2 id="upcoming-campaigns-title" className="text-3xl font-bold text-cyan-200 mb-8 pb-2 border-b-4 border-slate-600 inline-block">
                Upcoming Campaigns
              </h2>
              {upcomingCampaigns.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingCampaigns.map(campaign => (
                    <CampaignCard key={campaign.id} campaign={campaign} isLive={false} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-800 rounded-lg shadow-sm">
                  <p className="text-lg text-blue-300">No upcoming campaigns scheduled.</p>
                </div>
              )}
            </section>

            {/* --- Features Section --- */}
            <section className="py-20 bg-slate-800 rounded-xl shadow-inner" aria-labelledby="features-title">
              <div className="text-center max-w-3xl mx-auto mb-12 px-4">
                <h2 id="features-title" className="text-3xl sm:text-4xl font-extrabold text-cyan-100 mb-4">
                  Why Choose ClearVote?
                </h2>
                <p className="text-lg text-blue-300">
                  A new era of secure, transparent, and accessible e-voting powered by decentralized technology.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                  icon={<LockIcon className="w-8 h-8" />}
                  title="Immutable Security"
                  description="Built on decentralized principles, every vote is permanently recorded and cryptographically secured. Once cast, a vote cannot be altered or removed."
                  colorClass="bg-slate-800"
                />
                <FeatureCard
                  icon={<EyeIcon className="w-8 h-8" />}
                  title="Complete Transparency"
                  description="Our public, verifiable ledger allows participants to audit the vote count, ensuring total transparency and building unmatched trust in the results."
                  colorClass="bg-slate-800"
                />
                <FeatureCard
                  icon={<GlobeIcon className="w-8 h-8" />}
                  title="Accessible & Convenient"
                  description="Cast your vote securely from anywhere in the world, on any device. We're removing barriers to participation to make your voice heard."
                  colorClass="bg-slate-800"
                />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}