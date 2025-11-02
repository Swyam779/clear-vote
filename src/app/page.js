'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import CampaignCard from '@/components/CampaignCard';

// Icons
const CheckBadgeIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
  </svg>
);

const RocketIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clipRule="evenodd" />
    <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
  </svg>
);

const ShieldIcon = ({ className = "w-16 h-16" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
);

const EyeIcon = ({ className = "w-16 h-16" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
  </svg>
);

const LightningIcon = ({ className = "w-16 h-16" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
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

const FeatureCard = ({ icon, title, description, color, delay }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`group relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      <div className={`absolute -inset-1 bg-gradient-to-r ${color} rounded-3xl blur-2xl opacity-25 group-hover:opacity-50 transition duration-500`}></div>
      <div className="relative bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 transition-all duration-500 hover:scale-105 hover:border-white/30">
        <div className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${color} mb-6 transform transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110`}>
          {icon}
        </div>
        <h3 className="text-3xl font-black text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-lg text-gray-300 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default function Home() {
  const [liveCampaigns, setLiveCampaigns] = useState([]);
  const [upcomingCampaigns, setUpcomingCampaigns] = useState([]);
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

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
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

      {/* Hero Section */}
      <div className="relative z-10 pt-32 pb-40 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-500/30 px-6 py-3 rounded-full mb-12 animate-pulse-glow">
            <RocketIcon className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-bold text-cyan-300 tracking-wide">NEXT-GEN VOTING PLATFORM</span>
          </div>
          
          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black mb-8 animate-slide-up">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
              ClearVote
            </span>
          </h1>
          
          <p className="text-2xl sm:text-3xl text-gray-300 mb-6 max-w-4xl mx-auto font-light leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            The blockchain-powered revolution in democratic participation.
          </p>
          <p className="text-xl text-cyan-400 mb-16 font-semibold animate-slide-up" style={{ animationDelay: '0.3s' }}>
            Secure • Transparent • Unstoppable
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link 
              href="/vote" 
              className="group relative px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-black rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-cyan-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-3">
                <CheckBadgeIcon className="w-7 h-7" />
                VOTE NOW
              </span>
            </Link>
          </div>

          {/* Floating Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto mt-24 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
              <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">10K+</div>
              <div className="text-gray-400 mt-2 text-sm font-semibold">Active Voters</div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
              <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">100%</div>
              <div className="text-gray-400 mt-2 text-sm font-semibold">Secure</div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
              <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">24/7</div>
              <div className="text-gray-400 mt-2 text-sm font-semibold">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 pb-20">
        {loading ? (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
              <div className="h-16 w-80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl mb-12 animate-pulse"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Live Campaigns */}
            <section className="mb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12">
                <h2 className="text-6xl font-black mb-4">
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Live Campaigns
                  </span>
                </h2>
                <div className="h-2 w-32 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
              </div>
              
              {liveCampaigns.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {liveCampaigns.map(campaign => (
                    <CampaignCard key={campaign.id} campaign={campaign} isLive={true} />
                  ))}
                </div>
              ) : (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-xl opacity-25"></div>
                  <div className="relative text-center py-24 bg-slate-900/50 backdrop-blur-2xl rounded-3xl border border-white/10">
                    <RocketIcon className="w-20 h-20 text-cyan-400 mx-auto mb-6" />
                    <p className="text-2xl font-bold text-white mb-2">No Live Campaigns</p>
                    <p className="text-gray-400">New campaigns launching soon!</p>
                  </div>
                </div>
              )}
            </section>

            {/* Upcoming Campaigns */}
            <section className="mb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12">
                <h2 className="text-6xl font-black mb-4">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Upcoming Campaigns
                  </span>
                </h2>
                <div className="h-2 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>
              
              {upcomingCampaigns.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingCampaigns.map(campaign => (
                    <CampaignCard key={campaign.id} campaign={campaign} isLive={false} />
                  ))}
                </div>
              ) : (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-25"></div>
                  <div className="relative text-center py-24 bg-slate-900/50 backdrop-blur-2xl rounded-3xl border border-white/10">
                    <RocketIcon className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                    <p className="text-2xl font-bold text-white mb-2">No Upcoming Campaigns</p>
                    <p className="text-gray-400">Check back later for updates</p>
                  </div>
                </div>
              )}
            </section>

            {/* Features Section */}
            <section className="py-32 relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                  <h2 className="text-6xl font-black mb-6">
                    <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Powered by Innovation
                    </span>
                  </h2>
                  <p className="text-2xl text-gray-400 max-w-3xl mx-auto">
                    Experience voting built for the future
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-10">
                  <FeatureCard
                    icon={<ShieldIcon className="w-16 h-16 text-white" />}
                    title="Military-Grade Security"
                    description="Your vote is encrypted with blockchain technology, making it mathematically impossible to tamper with or hack."
                    color="from-cyan-500 to-blue-500"
                    delay={0}
                  />
                  <FeatureCard
                    icon={<EyeIcon className="w-16 h-16 text-white" />}
                    title="Radical Transparency"
                    description="Every vote is verifiable on a public ledger. Audit results in real-time and trust the democratic process."
                    color="from-blue-500 to-purple-500"
                    delay={200}
                  />
                  <FeatureCard
                    icon={<LightningIcon className="w-16 h-16 text-white" />}
                    title="Instant Access"
                    description="Vote from anywhere, anytime, on any device. Democracy shouldn't be limited by location or time."
                    color="from-purple-500 to-pink-500"
                    delay={400}
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* CTA Section */}
      <div className="relative z-10 py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-slate-900 rounded-3xl p-16 text-center border border-white/10">
              <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Join the Revolution
              </h2>
              <p className="text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Be part of the movement reshaping democracy for the digital age
              </p>
              <Link 
                href="/vote"
                className="inline-block px-14 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-black rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110"
              >
                START VOTING NOW
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}