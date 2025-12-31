// frontend/src/components/admin/customers/AdminCustomerCard.jsx
/**
 * Admin Customer Card Component
 * Layout: 60% Details | 40% Stats & Actions
 * Compact design with tpppink and tppslate only
 */

import { 
  User, Mail, Phone, Calendar, DollarSign, Package, 
  Clock, Activity, AlertTriangle, XCircle, CheckCircle
} from 'lucide-react';

export default function AdminCustomerCard({ customer, onViewDetails }) {
  
  // ==================== UTILITY FUNCTIONS ====================
  
  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
  
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const daysSince = (dateStr) => {
    if (!dateStr) return null;
    const days = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    return days;
  };

  // ==================== COMPUTED VALUES ====================
  
  const lastOrderDays = daysSince(customer.last_order_date);
  const avgOrderValue = customer.total_orders > 0 
    ? (customer.total_spent || 0) / customer.total_orders 
    : 0;

  const showInactiveWarning = lastOrderDays > 90;
  const showCancellationWarning = customer.cancelled_orders > 3;

  // ==================== RENDER ====================

  return (
    <div className="bg-white rounded-lg border border-tppslate/10 hover:border-tpppink/30 hover:shadow-md transition-all overflow-hidden group">
      <div className="flex">
        
        {/* ==================== LEFT: CUSTOMER DETAILS (60%) ==================== */}
        <div className="flex-1 p-5 border-r border-tppslate/10">
          
          {/* Customer Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-tpppink to-tppslate flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {customer.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-tppslate mb-1 truncate">
                {customer.name || 'Unknown User'}
              </h3>
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  customer.is_active 
                    ? 'bg-tppslate/10 text-tppslate' 
                    : 'bg-tppslate/5 text-tppslate/50'
                }`}>
                  {customer.is_active ? 'Active' : 'Inactive'}
                </span>
                
                {customer.email_verified && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-tpppink/10 text-tpppink font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-tppslate/70">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{customer.email || 'No email'}</span>
            </div>
            
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm text-tppslate/70">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{customer.phone}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-tppslate/70">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>Joined: {formatDate(customer.created_at)}</span>
            </div>
            
            {customer.last_login && (
              <div className="flex items-center gap-2 text-sm text-tppslate/70">
                <Activity className="w-4 h-4 flex-shrink-0" />
                <span>Last Login: {formatDate(customer.last_login)}</span>
              </div>
            )}
          </div>

          {/* Warning Indicators */}
          {(showInactiveWarning || showCancellationWarning) && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-tppslate/10">
              {showInactiveWarning && (
                <span className="text-xs px-2 py-1 rounded-full bg-tpppink/10 text-tpppink font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Inactive {lastOrderDays}+ days
                </span>
              )}
              
              {showCancellationWarning && (
                <span className="text-xs px-2 py-1 rounded-full bg-tppslate/10 text-tppslate font-semibold flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {customer.cancelled_orders} cancellations
                </span>
              )}
            </div>
          )}
        </div>

        {/* ==================== RIGHT: STATS & ACTIONS (40%) ==================== */}
        <div className="w-80 bg-gradient-to-br from-tppslate/5 to-white p-5 flex flex-col justify-between">
          
          {/* Stats Grid */}
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Total Orders */}
              <div className="bg-white rounded-lg p-3 border border-tppslate/10">
                <div className="flex items-center gap-1.5 text-tppslate/60 text-xs mb-1">
                  <Package className="w-3.5 h-3.5" />
                  <span>Orders</span>
                </div>
                <div className="text-2xl font-bold text-tppslate">
                  {customer.total_orders || 0}
                </div>
              </div>

              {/* Total Spent */}
              <div className="bg-white rounded-lg p-3 border border-tppslate/10">
                <div className="flex items-center gap-1.5 text-tppslate/60 text-xs mb-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Spent</span>
                </div>
                <div className="text-lg font-bold text-tpppink">
                  {formatCurrency(customer.total_spent)}
                </div>
              </div>
            </div>

            {/* Last Order Info */}
            {customer.last_order_date && (
              <div className="bg-tppslate/5 rounded-lg p-3 border border-tppslate/10 mb-4">
                <div className="flex items-center gap-1.5 text-tppslate/70 text-xs mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last Order</span>
                </div>
                <div className="text-sm font-bold text-tppslate">
                  {lastOrderDays === 0 ? 'Today' : 
                   lastOrderDays === 1 ? 'Yesterday' : 
                   `${lastOrderDays} days ago`}
                </div>
              </div>
            )}

            {/* Additional Stats */}
            {customer.total_orders > 0 && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-tppslate/60">Avg. Order Value:</span>
                  <span className="font-bold text-tppslate">
                    {formatCurrency(avgOrderValue)}
                  </span>
                </div>
                
                {customer.cancelled_orders > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-tppslate/60">Cancelled Orders:</span>
                    <span className="font-bold text-tpppink">
                      {customer.cancelled_orders}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-tppslate/60">Success Rate:</span>
                  <span className="font-bold text-tppslate">
                    {customer.total_orders > 0 
                      ? Math.round(((customer.total_orders - (customer.cancelled_orders || 0)) / customer.total_orders) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => onViewDetails(customer)}
            className="w-full mt-4 px-4 py-2.5 bg-tppslate text-white rounded-lg hover:bg-tppslate/90 font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <User className="w-4 h-4" />
            View Full Details
          </button>
        </div>
      </div>
    </div>
  );
}