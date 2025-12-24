// frontend/src/components/admin/shipments/AdminShipmentCard.jsx
/**
 * Professional Admin Shipment Card - Compact 4-Column Layout
 * Column 1: Delivery Details | Column 2: Order Details | Column 3: Cost Summary | Column 4: Actions
 */

import { 
  Eye, User, Package, MapPin, Calendar, Truck, ChevronRight,
  Clock, CheckCircle, XCircle, Phone, AlertCircle, Hash, Mail,
  Edit, DollarSign, Box, Plane, Weight, Ruler, ArrowUpRight,
  Download, ExternalLink, RefreshCw, FileText, Shield
} from 'lucide-react';

import { Link } from 'react-router-dom';

export default function AdminShipmentCard({ 
  shipment, 
  selected, 
  onToggleSelect, 
  onApprove,
  onSchedulePickup,
  onEditPickup,
  onEdit,
  onViewDetails 
}) {
  
  // ==================== UTILITY FUNCTIONS ====================
  
  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
  
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getTimeSince = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending_review: { 
        bg: 'bg-yellow-50', 
        border: 'border-yellow-200',
        text: 'text-yellow-700', 
        label: 'Pending',
        icon: Clock
      },
      approved: { 
        bg: 'bg-blue-50',
        border: 'border-blue-200', 
        text: 'text-blue-700', 
        label: 'Approved',
        icon: Shield
      },
      placed: { 
        bg: 'bg-green-50',
        border: 'border-green-200', 
        text: 'text-green-700', 
        label: 'Placed',
        icon: CheckCircle
      },
      pending_pickup: { 
        bg: 'bg-purple-50',
        border: 'border-purple-200', 
        text: 'text-purple-700', 
        label: 'Pending Pickup',
        icon: Package
      },
      picked_up: { 
        bg: 'bg-indigo-50',
        border: 'border-indigo-200', 
        text: 'text-indigo-700', 
        label: 'Picked Up',
        icon: Truck
      },
      in_transit: { 
        bg: 'bg-blue-50',
        border: 'border-blue-200', 
        text: 'text-blue-700', 
        label: 'In Transit',
        icon: Truck
      },
      out_for_delivery: { 
        bg: 'bg-teal-50',
        border: 'border-teal-200', 
        text: 'text-teal-700', 
        label: 'Out for Delivery',
        icon: Truck
      },
      delivered: { 
        bg: 'bg-green-50',
        border: 'border-green-200', 
        text: 'text-green-700', 
        label: 'Delivered',
        icon: CheckCircle
      },
      failed: { 
        bg: 'bg-orange-50',
        border: 'border-orange-200', 
        text: 'text-orange-700', 
        label: 'Failed',
        icon: XCircle
      },
      rto_initiated: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        label: 'Return Initiated',
        icon: AlertCircle
      },
      rto_delivered: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        label: 'Returned',
        icon: Package
      },
      cancelled: { 
        bg: 'bg-red-50',
        border: 'border-red-200', 
        text: 'text-red-600', 
        label: 'Cancelled',
        icon: XCircle
      },
    };
    return configs[status] || configs.pending_review;
  };

  const getPriorityIndicator = () => {
    // 🔴 HIGH: Express + Pending Review
    if (shipment.shipping_mode === 'Express' && shipment.status === 'pending_review') {
      return { color: 'bg-red-500', label: 'Express - Urgent', show: true };
    }
    
    // 🟡 MEDIUM: High value + Pending
    if (shipment.estimated_cost > 200 && shipment.status === 'pending_review') {
      return { color: 'bg-orange-500', label: 'High Cost', show: true };
    }
    
    // 🟢 NORMAL
    return { color: 'bg-green-500', label: 'Normal', show: false };
  };

  // ==================== PARSE DATA ====================
  
  const parseAddress = () => {
    const addr = shipment.Orders?.shipping_address;
    if (!addr) return null;
    if (typeof addr === 'object') return addr;
    try {
      return JSON.parse(addr);
    } catch {
      return null;
    }
  };

  const getCostSource = () => {
    const breakdown = shipment.cost_breakdown;
    if (!breakdown) return 'estimated';
    return breakdown.source || 'estimated';
  };

  const getCostVariance = () => {
    if (!shipment.actual_cost || !shipment.estimated_cost) return null;
    const diff = shipment.actual_cost - shipment.estimated_cost;
    const percent = ((diff / shipment.estimated_cost) * 100).toFixed(1);
    return { diff, percent };
  };

  const getFinalCost = () => {
    // Use actual cost if available, otherwise estimated
    const baseCost = shipment.actual_cost || shipment.estimated_cost || 0;
    let finalCost = baseCost;

    // Add express surcharge if applicable
    if (shipment.cost_breakdown?.express_surcharge) {
      finalCost += shipment.cost_breakdown.express_surcharge;
    }

    // Add COD charges if applicable
    if (shipment.cost_breakdown?.cod_charges) {
      finalCost += shipment.cost_breakdown.cod_charges;
    }

    return finalCost;
  };

  // ==================== COMPONENT DATA ====================
  
  const statusConfig = getStatusConfig(shipment.status);
  const StatusIcon = statusConfig.icon;
  const orderId = shipment.Orders?.id?.substring(0, 8).toUpperCase() || '#N/A';
  const shipmentId = shipment.id?.substring(0, 8).toUpperCase();
  const address = parseAddress();
  const customer = shipment.Orders?.Users;
  const order = shipment.Orders;
  const priority = getPriorityIndicator();
  const costSource = getCostSource();
  const costVariance = getCostVariance();
  const isExpress = shipment.shipping_mode === 'Express';
  const weightKg = (shipment.weight_grams / 1000).toFixed(2);
  const finalCost = getFinalCost();

  // Calculate if shipment is editable
  const canEdit = shipment.editable && 
                  ['pending_review', 'approved'].includes(shipment.status);

  // Check if ready to approve
  const canApprove = shipment.status === 'pending_review';

  // ==================== RENDER ====================

  return (
    <div className="bg-white rounded-lg border border-tppslate/30 hover:border-tpppink/30 hover:shadow-md transition-all overflow-hidden group relative">
      
      {/* Checkbox - Peeking from top-left */}
      {canApprove && onToggleSelect && (
        <div className="absolute -left-0 top-0 bg-blue-50 border-r border-b border-blue-200 rounded-br-lg px-2 py-2 z-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
          />
        </div>
      )}

      <div className="grid grid-cols-4 gap-0">
        
        {/* ==================== COLUMN 1: DELIVERY DETAILS ==================== */}
        <div className="p-4 border-r border-tppslate/30">
          {/* Header with Shipment ID and Status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-3.5 h-3.5 text-tppslate/80" />
                <h3 className="text-sm font-bold text-tppslate">
                  {shipmentId}
                </h3>
              </div>
              <span className="text-xs text-tppslate/70">{getTimeSince(shipment.created_at)}</span>
            </div>
            
            {/* Status Badge - Top Right */}
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </span>
          </div>

          {/* Shipping Mode Badge */}
          <div className="mb-3">
            <div className={`inline-flex items-center gap-1.5 ${
              isExpress ? 'bg-tpppink' : 'bg-tppslate'
            } text-white px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}>
              {isExpress ? <Plane className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
              {shipment.shipping_mode}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-3">
            <div className="text-[10px] text-tppslate/80 uppercase tracking-wide font-semibold mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Delivery Address
            </div>
            {address ? (
              <div className="text-xs text-tppslate space-y-0.5">
                <p className="font-medium leading-relaxed">{address.line1}</p>
                {address.line2 && <p className="leading-relaxed">{address.line2}</p>}
                {address.landmark && (
                  <p className="text-tppslate/70">Near: {address.landmark}</p>
                )}
                <p className="text-tppslate/80">
                  {shipment.destination_city}, {shipment.destination_state} - {shipment.destination_pincode}
                </p>
              </div>
            ) : (
              <p className="text-xs text-tppslate/70">No address available</p>
            )}
          </div>
          
          {/* Expected Delivery */}
          {shipment.estimated_delivery && (
            <div className="flex items-start gap-1.5 text-tppslate text-[11px]">
              <div>
                <span className="text-tppslate/80">Expected:</span>
                <span className="ml-1 font-semibold">{formatDateShort(shipment.estimated_delivery)}</span>
              </div>
            </div>
          )}

          {/* AWB Badge (if available) */}
          {shipment.awb && (
            <div className="bg-tppslate/30 rounded px-2.5 py-1.5 mt-3">
              <div className="text-[10px] text-tppslate/80 uppercase tracking-wide font-semibold mb-0.5">
                AWB Number
              </div>
              <div className="font-mono font-bold text-tppslate text-xs">{shipment.awb}</div>
            </div>
          )}
        </div>

        {/* ==================== COLUMN 2: ORDER DETAILS ==================== */}
        <div className="p-4 border-r border-tppslate/30">
          
          {/* Order Reference - Clickable */}
          <Link
            to={`/admin/orders?search=${order?.id || ''}`}
            className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-100 block hover:bg-blue-100 hover:border-blue-200 transition-all group"
          >
            <div className="text-[10px] text-blue-600/80 uppercase tracking-wide font-semibold mb-1 flex justify-between items-center group-hover:underline">
              Order Reference
              
              <ArrowUpRight className="w-4 h-4 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-blue-700">#{orderId}</span>
              <div className="flex items-center gap-2">
                <span className="text-md font-bold text-blue-600">
                  {formatCurrency(order?.final_total || 0)}
                </span>
              </div>
            </div>
          </Link>

          {/* Customer Info */}
          {customer && (
            <div className="mb-3 p-2 bg-tppslate/5 rounded-lg">
              <div className="text-[10px] text-tppslate/80 uppercase tracking-wide font-semibold mb-2 flex items-center gap-1">
                <User className="w-3 h-3" />
                Customer
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-tppslate truncate">
                  {customer.name}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-tppslate/70">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-tppslate/70">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Package Details */}
          <div className="mb-3 p-2 bg-white border border-tppslate/30 rounded-lg">
            <div className="text-[10px] text-tppslate/80 uppercase tracking-wide font-semibold mb-2 flex items-center gap-1">
              <Box className="w-3 h-3" />
              Package Details
            </div>
            <div className="space-y-1.5">
              {/* ✅ Show Bundle Items Count from Order */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-tppslate/70">
                  <span>Items</span>
                </div>
                <span className="font-bold text-tppslate">
                  ×{order?.item_count || 1} {(order?.item_count || 1) === 1 ? 'bundle' : 'bundles'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-tppslate/70">
                  <span>Weight</span>
                </div>
                <span className="font-bold text-tppslate">{weightKg} kg</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-tppslate/70">
                  <span>Size</span>
                </div>
                <span className="font-bold text-tppslate text-[11px]">
                  {shipment.dimensions_cm?.length || 30}×{shipment.dimensions_cm?.width || 25}×{shipment.dimensions_cm?.height || 10}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-1.5 text-[11px]">
            {/* Created */}
            <div className="flex items-start gap-1.5 text-tppslate/70">
              <div>
                <span className="text-tppslate/80">Created:</span>
                <span className="ml-1 text-tppslate font-semibold">{formatDate(shipment.created_at)}</span>
              </div>
            </div>

            {/* Approved At */}
            {shipment.approved_at && (
              <div className="flex items-start gap-1.5 text-blue-600">
                <Shield className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-blue-600/80">Approved:</span>
                  <span className="ml-1 font-semibold">{formatDate(shipment.approved_at)}</span>
                </div>
              </div>
            )}

            {/* Placed At */}
            {shipment.placed_at && (
              <div className="flex items-start gap-1.5 text-green-600">
                <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-green-600/80">Placed:</span>
                  <span className="ml-1 font-semibold">{formatDate(shipment.placed_at)}</span>
                </div>
              </div>
            )}

            {/* Pickup Scheduled */}
            {shipment.pickup_scheduled_date && (
              <div className="flex items-start gap-1.5 text-purple-600">
                <Package className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-purple-600/80">Pickup:</span>
                  <span className="ml-1 font-semibold">{formatDateShort(shipment.pickup_scheduled_date)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Tracking Info (if placed) */}
          {shipment.awb && shipment.tracking_url && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-[10px] text-green-600/80 uppercase tracking-wide font-semibold mb-1">
                Tracking Active
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-green-600">
                  {shipment.courier || 'Delhivery'}
                </div>
                <a
                  href={shipment.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ==================== COLUMN 3: COST SUMMARY ==================== */}
        <div className="p-4 border-r-2 border-dashed border-tppslate/30 bg-gradient-to-br from-gray-50 to-white">
          
          {/* Cost Summary Header */}
          <div className="text-[10px] text-tppslate/80 uppercase tracking-wide font-semibold mb-3 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Shipping Cost Breakdown
          </div>

          {/* Detailed Cost Breakdown */}
          <div className="space-y-2 mb-3">
            {/* Base Delivery Charge */}
            {shipment.cost_breakdown?.base_delivery_charge && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-tppslate/70">Base Delivery:</span>
                <span className="font-semibold text-tppslate">{formatCurrency(shipment.cost_breakdown.base_delivery_charge)}</span>
              </div>
            )}

            {/* COD Charges */}
            {shipment.cost_breakdown?.cod_charges > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-tppslate/70">COD Charges:</span>
                <span className="font-semibold text-tppslate">{formatCurrency(shipment.cost_breakdown.cod_charges)}</span>
              </div>
            )}

            {/* Other Charges */}
            {shipment.cost_breakdown?.other_charges > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-tppslate/70">Other Charges:</span>
                <span className="font-semibold text-tppslate">{formatCurrency(shipment.cost_breakdown.other_charges)}</span>
              </div>
            )}

            {/* Gross Amount */}
            {shipment.cost_breakdown?.gross_amount && (
              <div className="flex justify-between items-center text-xs pt-1 border-t border-tppslate/30">
                <span className="text-tppslate/70">Gross Amount:</span>
                <span className="font-semibold text-tppslate">{formatCurrency(shipment.cost_breakdown.gross_amount)}</span>
              </div>
            )}

            {/* GST */}
            {shipment.cost_breakdown?.total_tax > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-tppslate/70">GST (CGST + SGST):</span>
                <span className="font-semibold text-tppslate">{formatCurrency(shipment.cost_breakdown.total_tax)}</span>
              </div>
            )}

            {/* Estimated Total */}
            <div className="flex justify-between items-center text-xs pt-1 border-t border-tppslate/30">
              <span className="text-tppslate/80 font-semibold">Estimated Total:</span>
              <span className="font-bold text-tppslate">{formatCurrency(shipment.estimated_cost)}</span>
            </div>

            {/* Actual Cost (if different) */}
            {shipment.actual_cost && shipment.actual_cost !== shipment.estimated_cost && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-green-600/80 font-semibold">Actual Cost:</span>
                <span className="font-bold text-green-600">{formatCurrency(shipment.actual_cost)}</span>
              </div>
            )}

            {/* Cost Variance */}
            {costVariance && (
              <div className={`flex justify-between items-center text-[11px] ${
                costVariance.diff > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                <span>Variance:</span>
                <span className="font-bold">
                  {costVariance.diff > 0 ? '+' : ''}{formatCurrency(costVariance.diff)} ({costVariance.percent}%)
                </span>
              </div>
            )}
          </div>

          {/* Cost Source Badge */}
          <div className="mb-3">
            <div className={`text-[10px] px-2 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
              costSource === 'api' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {costSource === 'api' ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Live API Rate
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Estimated Rate
                </>
              )}
            </div>
          </div>
        </div>

        {/* ==================== COLUMN 4: ACTIONS ==================== */}
        <div className="p-4 flex flex-col items-start">
          
          <div className="space-y-2 w-full">
            <div className="mb-[10px] border-b-2 border-tppslate/30 pb-3 w-full border-dashed">
              {/* Final Total Cost */}
              <div className="bg-tppslate text-white rounded-lg px-3 py-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide">Final Cost:</span>
                  <span className="text-base font-bold">{formatCurrency(shipment.estimated_cost)}</span>
                </div>
              </div>

              {/* Mode Comparison Note */}
              {shipment.cost_breakdown?.mode_comparison && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-2 mb-3">
                  <div className="text-[10px] text-blue-600/80 uppercase tracking-wide font-semibold mb-1.5">
                    Delivery Mode Comparison
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between items-center text-blue-700">
                      <span>Surface:</span>
                      <span className="font-semibold">{formatCurrency(shipment.cost_breakdown.mode_comparison.surface_cost)}</span>
                    </div>
                    <div className="flex justify-between items-center text-blue-700">
                      <span>Express:</span>
                      <span className="font-semibold">{formatCurrency(shipment.cost_breakdown.mode_comparison.express_cost)}</span>
                    </div>
                    {shipment.cost_breakdown.mode_comparison.customer_paid_extra > 0 && (
                      <div className="flex justify-between items-center text-blue-800 pt-1 border-t border-blue-200">
                        <span className="font-semibold">Customer Paid Extra:</span>
                        <span className="font-bold text-blue-900">
                          +{formatCurrency(shipment.cost_breakdown.mode_comparison.customer_paid_extra)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Failed Reason (if failed) */}
              {shipment.failed_reason && (
                <div className="bg-red-50 border border-red-200 rounded px-2 py-1.5 mb-2">
                  <div className="flex items-start gap-1 text-[11px] text-red-700">
                    <XCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold">Failed</div>
                      <div className="text-red-600 mt-0.5">{shipment.failed_reason}</div>
                      {shipment.retry_count > 0 && (
                        <div className="text-red-500 mt-1">Retries: {shipment.retry_count}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {shipment.admin_notes && (
                <div className="bg-purple-50 border border-purple-200 rounded px-2 py-1.5">
                  <div className="text-[10px] text-purple-600 font-semibold mb-0.5">Admin Notes</div>
                  <div className="text-[11px] text-purple-700 leading-relaxed">{shipment.admin_notes}</div>
                </div>
              )}
            </div>
          
            {/* Approve & Place (if pending_review) */}
            {canApprove && onApprove && (
              <button
                onClick={() => onApprove(shipment.id)}
                className="w-full px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve & Place
              </button>
            )}

            {/* Schedule Pickup (if placed) */}
            {shipment.status === 'placed' && (
              <button
                onClick={() => onSchedulePickup && onSchedulePickup(shipment.id)}
                className="w-full px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 font-bold flex items-center justify-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5" />
                Schedule Pickup - Tomorrow
              </button>
            )}

            {/* Edit Pickup Date (if pending_pickup) */}
            {shipment.status === 'pending_pickup' && shipment.pickup_scheduled_date && (
              <button
                onClick={() => onEditPickup && onEditPickup(shipment.id)}
                className="w-full px-3 py-2 bg-amber-600 text-white text-xs rounded-lg hover:bg-amber-700 font-bold flex items-center justify-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Pickup: {formatDateShort(shipment.pickup_scheduled_date)}
              </button>
            )}

            {/* Edit Details (if editable) */}
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(shipment.id)}
                className="w-full px-3 py-2 bg-white border border-tppslate/20 text-tppslate text-xs rounded-lg hover:bg-gray-50 font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Details
              </button>
            )}

            {/* Download Label (if available) */}
            {shipment.awb && (
              <a
                href={`/api/admin/shipments/${shipment.id}/label`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-3 py-2 bg-white border border-tppslate/20 text-tppslate text-xs rounded-lg hover:bg-gray-50 font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Label
              </a>
            )}

            {/* Download Invoice (if available) */}
            {shipment.awb && (
              <a
                href={`/api/admin/shipments/${shipment.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50 font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Invoice
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}