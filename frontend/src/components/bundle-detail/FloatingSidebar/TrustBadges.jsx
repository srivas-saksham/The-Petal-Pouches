// frontend/src/components/bundle-detail/FloatingSidebar/TrustBadges.jsx
import React from 'react';
import { ShieldCheck, RotateCcw, Headphones, CreditCard } from 'lucide-react';

/**
 * TrustBadges - Security and trust indicators
 * Compact minimal design with icons
 */
const TrustBadges = () => {
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
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: CreditCard,
      title: 'Safe Payments',
      color: 'text-tpppink bg-pink-50'
    }
  ];

  return (
    <div className="p-4">
      <h3 className="text-sm font-bold text-tppslate uppercase tracking-wide mb-3">
        Why Shop With Us
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center text-center p-2.5 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${badge.color}`}>
                <Icon size={14} />
              </div>
              <p className="text-xs font-semibold text-tppslate leading-tight">
                {badge.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustBadges;