// frontend/src/components/admin/coupons/AdminCouponCard.jsx
/**
 * Admin Coupon Card - Compact Two-Column Design
 * All functionality preserved in a more compact layout
 */

import React from 'react';
import { 
  Edit, Trash2, Power, Ticket, Calendar, Users, Percent,
  CheckCircle, XCircle, Clock, AlertCircle, Hash, IndianRupee
} from 'lucide-react';

export default function AdminCouponCard({ coupon, onEdit, onDelete, onToggle }) {

  // ==================== UTILITY FUNCTIONS ====================

  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getCouponStatus = () => {
    // ⭐ NEW: Use status field directly
    switch (coupon.status) {
      case 'active':
        return {
          label: 'ACTIVE',
          color: 'bg-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-300',
          icon: CheckCircle
        };
      case 'inactive':
        return {
          label: 'INACTIVE',
          color: 'bg-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-300',
          icon: XCircle
        };
      case 'expired':
        return {
          label: 'EXPIRED',
          color: 'bg-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          icon: AlertCircle
        };
      case 'scheduled':
        return {
          label: 'SCHEDULED',
          color: 'bg-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-300',
          icon: Clock
        };
      default:
        return {
          label: 'UNKNOWN',
          color: 'bg-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-300',
          icon: XCircle
        };
    }
  };

  const getDiscountDisplay = () => {
    if (coupon.discount_type === 'Percent') {
      return {
        value: `${coupon.discount_value}%`,
        label: coupon.max_discount ? `Max ₹${coupon.max_discount}` : 'No Cap',
        icon: Percent,
        color: 'text-yellow-700 bg-yellow-50 border-yellow-300'
      };
    } else {
      return {
        value: `${coupon.discount_value}`,
        label: 'Fixed',
        icon: IndianRupee,
        color: 'text-green-700 bg-green-50 border-green-300'
      };
    }
  };

  const getRemainingUses = () => {
    if (!coupon.usage_limit) return '∞';
    const remaining = coupon.usage_limit;
    return remaining > 0 ? remaining : 0;
  };

  // ==================== COMPONENT DATA ====================

  const status = getCouponStatus();
  const discount = getDiscountDisplay();
  const StatusIcon = status.icon;
  const DiscountIcon = discount.icon;
  const couponId = coupon.id?.substring(0, 8).toUpperCase() || '#N/A';
  const isActive = coupon.status === 'active';
  const isExpired = coupon.status === 'expired';
  
  // ==================== RENDER ====================

  return (
    <div className={`bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg ${
      !isActive ? 'border-gray-300 opacity-100' : 
      isExpired ? 'border-red-300' :
      'border-slate-200 hover:border-tpppink'
    }`}>
      {/* Status Bar */}
      <div className={`h-1.5 ${status.color}`} />

      <div className="p-4">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-3 pb-3 border-b-2 border-slate-100">
          <div className="flex-1 min-w-0">
            {/* Status Badge + ID */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-inter px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${status.color} text-white`}>
                {status.label}
              </span>
              <span className="text-[12px] text-slate-400 font-mono">#{couponId}</span>
            </div>

            {/* Coupon Code */}
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="w-4 h-4 text-tpppink flex-shrink-0" />
              <h3 className="text-lg font-bold text-slate-800 font-mono tracking-wide truncate">
                {coupon.code}
              </h3>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 line-clamp-2">
              {coupon.description}
            </p>
          </div>

          {/* Discount Badge */}
          <div className={`ml-3 px-3 py-2 rounded-lg border-2 ${discount.color} flex-shrink-0`}>
            <div className="flex items-center gap-1 mb-0.5">
              <DiscountIcon className="w-4 h-4" />
              <span className="text-lg font-bold leading-none">{discount.value}</span>
            </div>
            <span className="text-[10px] font-semibold uppercase">{discount.label}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-4 gap-3 mb-3 pb-3 border-b-2 border-slate-100">
          {/* Min Order */}
          <div className="text-center">
            <div className="text-[10px] text-slate-500 mb-1 font-medium">Min Order</div>
            <div className="text-xs font-bold text-slate-700">
              {coupon.min_order_value ? formatCurrency(coupon.min_order_value) : '—'}
            </div>
          </div>

          {/* Usage */}
          <div className="text-center">
            <div className="text-[10px] text-slate-500 mb-1 font-medium">Used/Limit</div>
            <div className="text-xs font-bold text-slate-700">
              {coupon.usage_count || 0}/{getRemainingUses()}
            </div>
          </div>

          {/* Per User */}
          <div className="text-center">
            <div className="text-[10px] text-slate-500 mb-1 font-medium">Per User</div>
            <div className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              {coupon.usage_per_user || 1}
            </div>
          </div>

          {/* Times Used */}
          <div className="text-center">
            <div className="text-[10px] text-slate-500 mb-1 font-medium">Times Used</div>
            <div className="text-xs font-bold text-tpppink">
              {coupon.usage_count || 0}
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="mb-3">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span className="text-slate-600 font-medium">
              {formatDate(coupon.start_date)}
            </span>
            <span className="text-slate-400">→</span>
            <span className="text-slate-600 font-medium">
              {formatDate(coupon.end_date)}
            </span>
            <span className="text-[10px] text-slate-400 ml-auto">
              Created {formatDate(coupon.created_at)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {/* Edit */}
          <button
            onClick={() => onEdit(coupon)}
            className="px-3 py-2 bg-slate-700 text-white text-xs rounded-lg hover:bg-slate-800 font-semibold transition-all flex items-center justify-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>

          {/* Toggle Active */}
          <button
            onClick={() => onToggle(coupon.id)}
            disabled={isExpired}
            className={`px-3 py-2 text-xs rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              isExpired
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                : isActive
                  ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-2 border-orange-300'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-300'
            }`}
            title={isExpired ? 'Cannot activate expired coupon' : (isActive ? 'Deactivate' : 'Activate')}
          >
            <Power className="w-3.5 h-3.5" />
            {isActive ? 'Deactivate' : 'On'}
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(coupon)}
            className="px-3 py-2 bg-white border-2 border-red-300 text-red-600 text-xs rounded-lg hover:bg-red-50 font-semibold transition-all flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}