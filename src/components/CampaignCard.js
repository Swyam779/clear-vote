// src/components/CampaignCard.jsx
'use client';

import Link from 'next/link';

export default function CampaignCard({ campaign, isLive }) {
  const { title, description, id } = campaign;

  return (
    <div className="bg-slate-800 shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-cyan-900/50 hover:bg-slate-700"> {/* Changed background & added hover */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-cyan-100 mb-2">{title}</h3> {/* Changed text color */}
        <p className="text-blue-300 mb-4 h-6 overflow-hidden text-ellipsis whitespace-nowrap">{description}</p> {/* Changed text color & ensured single line truncate */}
        
        {isLive ? (
          <Link 
            href={`/vote/${id}`}
            className="inline-block px-6 py-2 bg-amber-400 text-amber-900 font-semibold rounded-md hover:bg-amber-300 transition-colors" // Matched homepage primary button
          >
            Vote Now
          </Link>
        ) : (
          <span className="inline-block px-6 py-2 bg-slate-700 text-slate-400 font-semibold rounded-md cursor-not-allowed"> {/* Styled for dark mode "disabled" state */}
            Voting Starts Soon
          </span>
        )}
      </div>
    </div>
  );
}
