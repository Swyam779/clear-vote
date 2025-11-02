'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ResultsChart from '@/components/ResultsChart';

const ChartIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
  </svg>
);

const CheckBadgeIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
);

const TrophyIcon = ({ className = "w-20 h-20" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clipRule="evenodd" />
  </svg>
);

const ResultsSkeleton = () => (
  <div className="max-w-5xl mx-auto animate-pulse space-y-12">
    {[1, 2].map((i) => (
      <div key={i} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-3xl">
          <div className="h-10 w-2/3 mx-auto bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl mb-8"></div>
          <div className="h-96 w-full bg-slate-800/50 rounded-2xl mb-6"></div>
          <div className="h-4 w-1/2 mx-auto bg-slate-700/50 rounded-xl"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function PublicResultsPage() {
  const [publishedCampaigns, setPublishedCampaigns] = useState([]);
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
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .float-delay-1 { animation-delay: 1s; }
        .float-delay-2 { animation-delay: 2s; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
        .shimmer { animation: shimmer 2s infinite; }
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

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-500/30 px-6 py-3 rounded-full mb-8 animate-pulse-glow">
            <CheckBadgeIcon className="w-6 h-6 text-cyan-400" />
            <span className="text-sm font-bold text-cyan-300 tracking-wide">OFFICIAL RESULTS</span>
          </div>
          
          <h1 className="text-6xl sm:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Election Results
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Verified and officially published campaign results
          </p>

          {/* Stats Bar */}
          {!loading && publishedCampaigns.length > 0 && (
            <div className="inline-flex items-center gap-3 bg-slate-900/50 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full">
              <ChartIcon className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold text-gray-300">
                {publishedCampaigns.length} {publishedCampaigns.length === 1 ? 'Campaign' : 'Campaigns'} Published
              </span>
            </div>
          )}
        </div>

        {/* Results Content */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {loading ? (
            <ResultsSkeleton />
          ) : publishedCampaigns.length === 0 ? (
            <div className="relative group max-w-3xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-xl opacity-25"></div>
              <div className="relative bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-16 text-center">
                <TrophyIcon className="w-20 h-20 text-cyan-400 mx-auto mb-6 opacity-50" />
                <h2 className="text-3xl font-black mb-4">
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    No Results Yet
                  </span>
                </h2>
                <p className="text-xl text-gray-400">
                  No published results are available at this time.
                </p>
                <p className="text-gray-500 mt-4">
                  Check back later for official election results.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {publishedCampaigns.map((campaign, index) => (
                <div 
                  key={campaign.id} 
                  className="relative group animate-slide-up"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  {/* Glowing Border */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition-opacity duration-500"></div>
                  
                  {/* Card Content */}
                  <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden">
                    {/* Top Gradient Bar with Shimmer */}
                    <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 relative overflow-hidden">
                      <div className="absolute inset-0 w-1/3 bg-white/30 shimmer"></div>
                    </div>

                    {/* Header */}
                    <div className="p-8 sm:p-10 border-b border-white/10">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600">
                          <TrophyIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <h2 className="text-4xl font-black text-center mb-4">
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                          {campaign.title}
                        </span>
                      </h2>
                      <div className="flex items-center justify-center gap-2">
                        <CheckBadgeIcon className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-bold text-green-400">Verified Results</span>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="p-8 sm:p-10">
                      <ResultsChart data={campaign.candidates} />
                    </div>

                    {/* Footer */}
                    <div className="px-8 pb-8">
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm font-bold text-gray-400">
                            FINAL RESULTS • BLOCKCHAIN VERIFIED
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          These results have been officially verified and are immutable
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Info Section */}
        {!loading && publishedCampaigns.length > 0 && (
          <div className="mt-20 text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="relative group inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-slate-900 rounded-3xl px-12 py-8 border border-white/10">
                <h3 className="text-2xl font-black mb-3">
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Transparency Guaranteed
                  </span>
                </h3>
                <p className="text-gray-400 text-lg">
                  All results are recorded on an immutable blockchain ledger
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}