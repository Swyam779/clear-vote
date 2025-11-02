'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const UserIcon = ({ className = "w-12 h-12" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
  </svg>
);

const ShieldCheckIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
);

const KeyIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M15.75 1.5a6.75 6.75 0 0 0-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 0 0-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 0 0 .75-.75v-1.5h1.5A.75.75 0 0 0 9 19.5V18h1.5a.75.75 0 0 0 .53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1 0 15.75 1.5Zm0 3a.75.75 0 0 0 0 1.5A2.25 2.25 0 0 1 18 8.25a.75.75 0 0 0 1.5 0 3.75 3.75 0 0 0-3.75-3.75Z" clipRule="evenodd" />
  </svg>
);

const EnvelopeIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
  </svg>
);

const ExclamationIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
  </svg>
);

const CopyIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z" />
    <path d="M15 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 17.25 7.5h-1.875A.375.375 0 0 1 15 7.125V5.25ZM4.875 6H6v10.125A3.375 3.375 0 0 0 9.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V7.875C3 6.839 3.84 6 4.875 6Z" />
  </svg>
);

const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto animate-pulse">
    <div className="relative group mb-8">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
      <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-3xl">
        <div className="flex items-center gap-8 mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20"></div>
          <div className="flex-1">
            <div className="h-8 w-64 bg-slate-700/50 rounded-xl mb-3"></div>
            <div className="h-5 w-80 bg-slate-700/50 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-xl"></div>
      <div className="relative bg-slate-900/50 backdrop-blur-xl border border-amber-500/30 p-10 rounded-3xl">
        <div className="h-8 w-64 bg-amber-500/20 rounded-xl mb-6"></div>
        <div className="h-24 w-full bg-slate-700/50 rounded-2xl"></div>
      </div>
    </div>
  </div>
);

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }

    if (user) {
      const fetchProfile = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            setProfileData(docSnap.data());
          } else {
            setError('Profile data not found. Please contact support.');
          }
        } catch (err) {
          console.error(err);
          setError('Failed to fetch profile data.');
        }
      };
      
      fetchProfile();
    }
  }, [user, loading, router]);

  const copyVoterId = () => {
    if (profileData?.voterId) {
      navigator.clipboard.writeText(profileData.voterId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || (user && !profileData && !error)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white py-20 px-4">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="relative group max-w-2xl w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl blur-xl opacity-50"></div>
          <div className="relative bg-slate-900 rounded-3xl p-12 text-center border border-red-500/30">
            <ExclamationIcon className="w-20 h-20 text-red-400 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-white mb-4">Error</h1>
            <p className="text-xl text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!profileData) {
    return null;
  }
    return (
      <div className="min-h-screen bg-slate-950 text-white overflow-hidden py-20 px-4">
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
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

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-500/30 px-6 py-3 rounded-full mb-8 animate-pulse-glow">
              <ShieldCheckIcon className="w-6 h-6 text-cyan-400" />
              <span className="text-sm font-bold text-cyan-300 tracking-wide">YOUR IDENTITY</span>
            </div>
            
            <h1 className="text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Your Profile
              </span>
            </h1>
          </div>

          {/* Profile Card */}
          <div className="relative group mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition-opacity duration-500"></div>
            
            <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 relative overflow-hidden">
                <div className="absolute inset-0 w-1/3 bg-white/30 shimmer"></div>
              </div>

              <div className="p-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                  {/* Profile Picture */}
                  {profileData.photoURL ? (
                    <div className="relative group/avatar">
                      <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur opacity-50 group-hover/avatar:opacity-75 transition duration-300"></div>
                      <img 
                        src={profileData.photoURL} 
                        alt="Profile" 
                        className="relative w-32 h-32 rounded-full shadow-2xl object-cover border-4 border-slate-900"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  ) : (
                    <div className="relative group/avatar">
                      <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur opacity-50"></div>
                      <div className="relative w-32 h-32 rounded-full shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border-4 border-slate-900">
                        <UserIcon className="w-16 h-16 text-slate-600" />
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-4xl font-black mb-4">
                      <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        {profileData.name}
                      </span>
                    </h2>
                    <div className="flex flex-col gap-3">
                      <div className="inline-flex items-center gap-3 bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-xl">
                        <EnvelopeIcon className="w-5 h-5 text-cyan-400" />
                        <span className="text-gray-300">{profileData.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Voter ID Card */}
          <div className="relative group animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            
            <div className="relative bg-slate-900/90 backdrop-blur-2xl border-2 border-amber-500/30 rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500 relative overflow-hidden">
                <div className="absolute inset-0 w-1/3 bg-white/30 shimmer"></div>
              </div>

              <div className="p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500">
                    <KeyIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black">
                      <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        Your Voter ID
                      </span>
                    </h3>
                    <p className="text-gray-400 text-sm">Unique identification number</p>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-amber-500/20 rounded-2xl p-6 mb-6">
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    <span className="text-amber-400 font-bold">⚠️ Keep this secure!</span> You will need this ID to cast your vote. Do not share it with anyone.
                  </p>
                  
                  <div className="relative group/id">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/50 to-orange-500/50 rounded-2xl blur opacity-0 group-hover/id:opacity-100 transition duration-300"></div>
                    <div className="relative bg-black/50 backdrop-blur-sm border border-amber-500/30 p-6 rounded-2xl">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-4xl sm:text-5xl font-mono font-black text-amber-400 tracking-widest break-all flex-1 text-center">
                          {profileData.voterId}
                        </p>
                        <button
                          onClick={copyVoterId}
                          className="flex-shrink-0 p-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-xl transition-all hover:scale-110"
                          title="Copy Voter ID"
                        >
                          <CopyIcon className="w-5 h-5 text-amber-400" />
                        </button>
                      </div>
                      {copied && (
                        <p className="text-center text-green-400 text-sm font-bold mt-3 animate-slide-up">
                          ✓ Copied to clipboard!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheckIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-400 text-sm mb-1">Blockchain Protected</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Your Voter ID is cryptographically secured and linked to your identity on an immutable blockchain.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;

