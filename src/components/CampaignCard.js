// src/components/CampaignCard.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

const BoltIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
  </svg>
);

const SparklesIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5Z" clipRule="evenodd" />
  </svg>
);

const ChevronRightIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
  </svg>
);

export default function CampaignCard({ campaign, isLive }) {
  const { title, description, id } = campaign;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* Glowing Border Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${
        isLive 
          ? 'from-cyan-500 via-blue-500 to-purple-500' 
          : 'from-slate-600 to-slate-700'
      } rounded-3xl blur-lg opacity-0 group-hover:opacity-75 transition-opacity duration-500`}></div>
      
      {/* Main Card */}
      <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden transition-all duration-500 group-hover:border-cyan-500/50 group-hover:shadow-2xl group-hover:shadow-cyan-500/20">
        {/* Top Gradient Bar */}
        <div className={`h-2 bg-gradient-to-r ${
          isLive 
            ? 'from-cyan-500 via-blue-500 to-purple-500' 
            : 'from-slate-600 to-slate-700'
        }`}>
          {isLive && (
            <div className="h-full w-1/3 bg-white/30 shimmer"></div>
          )}
        </div>

        {/* Live Badge */}
        {isLive && (
          <div className="absolute top-6 right-6 z-10">
            <div className="flex items-center gap-2 bg-red-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-red-400/50 shadow-lg shadow-red-500/50">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </div>
              <span className="text-xs font-black text-white tracking-wider">LIVE</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className={`inline-flex p-3 rounded-2xl mb-6 transition-all duration-500 ${
            isHovered ? 'scale-110 rotate-6' : ''
          } ${
            isLive 
              ? 'bg-gradient-to-br from-cyan-500 to-blue-600' 
              : 'bg-gradient-to-br from-slate-700 to-slate-800'
          }`}>
            {isLive ? (
              <BoltIcon className="w-6 h-6 text-white" />
            ) : (
              <ClockIcon className="w-6 h-6 text-slate-400" />
            )}
          </div>

          {/* Title */}
          <h3 className={`text-2xl font-black mb-3 transition-all duration-300 ${
            isLive 
              ? 'text-white group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent'
              : 'text-gray-400'
          }`}>
            {title}
          </h3>
          
          {/* Description */}
          <p className={`text-sm leading-relaxed mb-6 line-clamp-2 transition-colors duration-300 ${
            isLive ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500'
          }`}>
            {description}
          </p>

          {/* Divider */}
          <div className={`h-px mb-6 transition-all duration-500 ${
            isLive 
              ? 'bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent group-hover:via-cyan-500' 
              : 'bg-gradient-to-r from-transparent via-slate-700 to-transparent'
          }`}></div>
          
          {/* Action Button */}
          {isLive ? (
            <Link 
              href={`/vote/${id}`}
              className="group/btn relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                Vote Now
                <ChevronRightIcon className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </span>
            </Link>
          ) : (
            <div className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-800/50 border border-slate-700 text-slate-500 font-bold rounded-2xl cursor-not-allowed">
              <ClockIcon className="w-5 h-5" />
              Voting Starts Soon
            </div>
          )}
        </div>

        {/* Bottom Accent Line */}
        {isLive && (
          <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        )}
      </div>

      {/* Hover Glow Effect */}
      {isLive && isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-3xl pointer-events-none"></div>
      )}
    </div>
  );
}