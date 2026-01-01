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
    // Compare calendar dates, not exact timestamps
    const orderDate = new Date(dateStr);
    const today = new Date();
    
    // Reset time to midnight for both dates
    orderDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const days = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
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
        <div className="w-[60%] p-3 border-r border-tppslate/10">
          
          {/* Customer Header */}
          <div className="flex items-start gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tpppink to-tppslate flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(() => {
                if (!customer.name) return 'U';
                const nameParts = customer.name.trim().split(' ').filter(Boolean);
                if (nameParts.length >= 2) {
                  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
                }
                return nameParts[0].substring(0, 2).toUpperCase();
              })()}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-tppslate mb-0.5 truncate">
                {customer.name || 'Unknown User'}
              </h3>
              
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  customer.is_active 
                    ? 'bg-tppslate/10 text-tppslate' 
                    : 'bg-tppslate/5 text-tppslate/50'
                }`}>
                  {customer.is_active ? 'Active' : 'Inactive'}
                </span>
                
                {customer.email_verified && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-tpppink/10 text-tpppink font-semibold flex items-center gap-0.5">
                    <CheckCircle className="w-2.5 h-2.5" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-1.5 text-[11px] text-tppslate/70">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{customer.email || 'No email'}</span>
            </div>
            
            {customer.phone && (
              <div className="flex items-center gap-1.5 text-[11px] text-tppslate/70">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{customer.phone}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 text-[11px] text-tppslate/70">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Joined: {formatDate(customer.created_at)}</span>
            </div>
            
            {customer.last_login && (
              <div className="flex items-center gap-1.5 text-[11px] text-tppslate/70">
                <Activity className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Last Login: {formatDate(customer.last_login)}</span>
              </div>
            )}
          </div>

          {/* Warning Indicators */}
          {(showInactiveWarning || showCancellationWarning) && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-tppslate/10">
              {showInactiveWarning && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-tpppink/10 text-tpppink font-semibold flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  Inactive {lastOrderDays}+ days
                </span>
              )}
              
              {showCancellationWarning && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-tppslate/10 text-tppslate font-semibold flex items-center gap-0.5">
                  <XCircle className="w-2.5 h-2.5" />
                  {customer.cancelled_orders} cancellations
                </span>
              )}
            </div>
          )}
        </div>

        {/* ==================== RIGHT: STATS & ACTIONS (40%) ==================== */}
        <div className="w-[40%] bg-gradient-to-br from-tppslate/5 to-white p-3 flex flex-col justify-between">
          
          {/* Stats Grid */}
          <div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* Total Orders */}
              <div className="bg-white rounded-lg p-2 border border-tppslate/10">
                <div className="flex items-center gap-1 text-tppslate/60 text-[10px] mb-0.5">
                  <Package className="w-3 h-3" />
                  <span>Orders</span>
                </div>
                <div className="text-lg font-bold text-tppslate">
                  {customer.total_orders || 0}
                </div>
              </div>

              {/* Total Spent */}
              <div className="bg-white rounded-lg p-2 border border-tppslate/10">
                <div className="flex items-center gap-1 text-tppslate/60 text-[10px] mb-0.5">
                  <DollarSign className="w-3 h-3" />
                  <span>Spent</span>
                </div>
                <div className="text-sm font-bold text-tpppink break-words">
                  {formatCurrency(customer.total_spent)}
                </div>
              </div>
            </div>

            {/* Last Order Info */}
            {customer.last_order_date && (
              <div className="bg-tppslate/5 rounded-lg p-2 border border-tppslate/10 mb-3">
                <div className="flex items-center gap-1 text-tppslate/70 text-[10px] mb-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Last Order</span>
                </div>
                <div className="text-xs font-bold text-tppslate">
                  {lastOrderDays === 0 ? 'Today' : 
                   lastOrderDays === 1 ? 'Yesterday' : 
                   `${lastOrderDays} days ago`}
                  <span className="text-[9px] text-tppslate/50 font-normal">
                    {' • '}
                    {new Date(customer.last_order_date).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Additional Stats */}
            {customer.total_orders > 0 && (
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between items-center gap-1">
                  <span className="text-tppslate/60 truncate">Avg. Order Value:</span>
                  <span className="font-bold text-tppslate flex-shrink-0">
                    {formatCurrency(avgOrderValue)}
                  </span>
                </div>
                
                {customer.cancelled_orders > 0 && (
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-tppslate/60 truncate">Cancelled Orders:</span>
                    <span className="font-bold text-tpppink flex-shrink-0">
                      {customer.cancelled_orders}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center gap-1">
                  <span className="text-tppslate/60 truncate">Success Rate:</span>
                  <span className="font-bold text-tppslate flex-shrink-0">
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
            className="w-full mt-3 px-3 py-1.5 bg-tppslate text-white rounded-lg hover:bg-tppslate/90 font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm text-xs"
          >
            <User className="w-3 h-3" />
            View Full Details
          </button>
        </div>
      </div>
    </div>
  );
}