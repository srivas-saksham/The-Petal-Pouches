// frontend/src/components/admin/products/ProductStats.jsx

import { Package, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function ProductStats({ stats, loading = false }) {
  const cards = [
    {
      id: 'total',
      label: 'Total Products',
      value: stats?.total || 0,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      id: 'active',
      label: 'Active',
      value: stats?.active || 0,
      icon: CheckCircle,
      color: 'bg-admin-mint',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      id: 'low_stock',
      label: 'Low Stock',
      value: stats?.low_stock || 0,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      id: 'out_of_stock',
      label: 'Out of Stock',
      value: stats?.out_of_stock || 0,
      icon: XCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="card p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="w-16 h-8 bg-gray-200 rounded"></div>
              </div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        
        return (
          <div
            key={card.id}
            className="card p-6 hover:shadow-hover transition-shadow animate-fade-in"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              <div className={`text-3xl font-bold ${card.textColor}`}>
                {card.value}
              </div>
            </div>
            <div className="text-sm font-medium text-text-secondary">
              {card.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}