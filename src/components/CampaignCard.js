// src/components/CampaignCard.jsx
'use client';

import Link from 'next/link';

export default function CampaignCard({ campaign, isLive }) {
  const { title, description, id } = campaign;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 truncate">{description}</p>
        
        {isLive ? (
          <Link 
            href={`/vote/${id}`}
            className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            Vote Now
          </Link>
        ) : (
          <span className="inline-block px-6 py-2 bg-gray-300 text-gray-500 font-semibold rounded-md">
            Voting Starts Soon
          </span>
        )}
      </div>
    </div>
  );
}