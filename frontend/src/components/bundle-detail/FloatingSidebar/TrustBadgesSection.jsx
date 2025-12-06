// frontend/src/components/bundle-detail/FloatingSidebar/TrustBadgesSection.jsx
import React from 'react';
import { ShieldCheck, RotateCcw, Headphones, Award } from 'lucide-react';

/**
 * TrustBadgesSection - Compact trust indicators
 * Shows why customers should feel confident purchasing
 */
const TrustBadgesSection = () => {
  const badges = [
    { 
      icon: ShieldCheck, 
      title: 'Secure Checkout',
      color: 'text-green-600 bg-green-50' 
    },
    { 
      icon: RotateCcw, 
      title: '30-Day Returns',
      color: 'text-blue-600 bg-blue-50' 
    }
  ];

  return (
    <div className="p-4">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
        Why Shop With Us
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-2 p-2 border border-slate-100 rounded-lg hover:border-tpppink/30 transition-colors"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${badge.color}`}>
                <Icon size={14} />
              </div>
              <p className="text-xs font-semibold text-gray-800 leading-tight">
                {badge.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustBadgesSection;