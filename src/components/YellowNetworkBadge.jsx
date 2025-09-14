import React from 'react';
import Link from 'next/link';

const YellowNetworkBadge = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link 
        href="/yellow-network"
        className="flex items-center gap-2 px-3 py-2 bg-yellow-600/90 hover:bg-yellow-500/90 transition-colors rounded-full shadow-lg border border-yellow-500/50 text-black font-medium"
      >
        <div className="w-4 h-4 bg-yellow-300 rounded-full animate-pulse"></div>
        <span className="text-sm">Yellow Network Powered</span>
      </Link>
    </div>
  );
};

export default YellowNetworkBadge;
