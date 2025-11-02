'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import AdminRoute from '@/components/AdminRoute';

const DashboardIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
    <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
  </svg>
);

const UsersIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
  </svg>
);

const CampaignIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clipRule="evenodd" />
  </svg>
);

const ChartIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
  </svg>
);

const ChevronRightIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
  </svg>
);

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isActive = (path) => {
    if (path === '/admin') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: DashboardIcon, gradient: 'from-cyan-500 to-blue-500' },
    { path: '/admin/users', label: 'Registered Users', icon: UsersIcon, gradient: 'from-blue-500 to-purple-500' },
    { path: '/admin/campaigns', label: 'Campaigns', icon: CampaignIcon, gradient: 'from-purple-500 to-pink-500' },
    { path: '/admin/results', label: 'Live Results', icon: ChartIcon, gradient: 'from-pink-500 to-orange-500' },
  ];

  return (
    <AdminRoute>
      <div className="flex flex-grow min-h-screen bg-slate-950">
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
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Admin Sidebar */}
        <aside className="w-80 bg-slate-900/50 backdrop-blur-2xl border-r border-white/10 p-6 relative z-10">
          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-500/30 px-4 py-2 rounded-full mb-6 glow-pulse">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-xs font-bold text-cyan-300 tracking-wider">ADMIN MODE</span>
            </div>
            <h2 className="text-3xl font-black">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Control Panel
              </span>
            </h2>
          </div>

          {/* Navigation */}
          <nav>
            <ul className="space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const hovered = hoveredLink === item.path;
                
                return (
                  <li key={item.path}>
                    <Link 
                      href={item.path}
                      onMouseEnter={() => setHoveredLink(item.path)}
                      onMouseLeave={() => setHoveredLink(null)}
                      className="group relative block"
                    >
                      {/* Glow Effect */}
                      {(active || hovered) && (
                        <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition duration-300`}></div>
                      )}
                      
                      {/* Link Content */}
                      <div className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                        active 
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-${item.gradient.split(' ')[1]}/50` 
                          : 'bg-slate-800/30 text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      }`}>
                        <div className={`p-2 rounded-xl transition-all duration-300 ${
                          active 
                            ? 'bg-white/20 scale-110' 
                            : 'bg-slate-700/50 group-hover:bg-slate-700 group-hover:scale-110'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        <span className="font-bold text-sm flex-1">{item.label}</span>
                        
                        <ChevronRightIcon className={`w-4 h-4 transition-all duration-300 ${
                          active || hovered ? 'translate-x-1 opacity-100' : 'translate-x-0 opacity-0'
                        }`} />
                      </div>

                      {/* Active Indicator */}
                      {active && (
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b ${item.gradient} rounded-r-full`}></div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Accent */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-4"></div>
            <div className="text-center text-xs text-slate-500 font-semibold">
              <span className="text-cyan-400">ClearVote</span> Admin v1.0
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 relative z-10 overflow-auto">
          {children}
        </main>
      </div>
    </AdminRoute>
  );
}