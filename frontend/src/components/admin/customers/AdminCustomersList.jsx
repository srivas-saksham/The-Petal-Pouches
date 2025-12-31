// frontend/src/components/admin/customers/AdminCustomersList.jsx
/**
 * Admin Customers List Component
 * Two-column grid layout with loading and empty states
 */

import AdminCustomerCard from './AdminCustomerCard';
import { Users } from 'lucide-react';

export default function AdminCustomersList({ 
  customers, 
  loading, 
  onViewDetails,
  emptyMessage = "No customers found" 
}) {
  
  // Loading State
  if (loading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="bg-white rounded-lg border border-tppslate/10 p-5 animate-pulse">
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-tppslate/10 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-tppslate/10 rounded w-1/3"></div>
                <div className="h-4 bg-tppslate/10 rounded w-1/2"></div>
                <div className="h-4 bg-tppslate/10 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (!customers || customers.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-tppslate/20 p-12 text-center">
        <Users className="w-16 h-16 text-tppslate/20 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-tppslate mb-2">No Customers</h3>
        <p className="text-sm text-tppslate/60">{emptyMessage}</p>
      </div>
    );
  }

  // Customers Grid - Two Columns
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {customers.map((customer) => (
        <AdminCustomerCard
          key={customer.id}
          customer={customer}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}