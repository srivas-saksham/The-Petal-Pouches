import { useState, useEffect } from 'react';
import { 
  X, Search, Package, Calendar, DollarSign, 
  ChevronLeft, ShoppingBag, AlertCircle, CheckCircle,
  XCircle, Clock, Truck, Filter, MapPin, Phone, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Pagination Component
const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default function CustomerOrdersList({ customerId, customerName, orders: allOrders = [], onClose, onBack }) {
  const [filteredOrders, setFilteredOrders] = useState(allOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isClosing, setIsClosing] = useState(false);
  
  const ITEMS_PER_PAGE = 5;

  // ==================== SYNC ORDERS ====================
  
  useEffect(() => {
    setFilteredOrders(allOrders);
  }, [allOrders]);

  // ==================== SEARCH & FILTER ====================
  
  useEffect(() => {
    let result = allOrders;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(order => {
        const orderId = order.id.toLowerCase();
        if (orderId.includes(search)) return true;

        const hasMatchingItem = order.Order_items?.some(item => 
          item.bundle_title?.toLowerCase().includes(search)
        );
        if (hasMatchingItem) return true;

        return false;
      });
    }

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, allOrders]);

  // ==================== PAGINATION ====================
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

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

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: Clock 
      },
      confirmed: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: CheckCircle 
      },
      processing: { 
        bg: 'bg-purple-100', 
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: Package 
      },
      shipped: { 
        bg: 'bg-indigo-100', 
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        icon: Truck 
      },
      delivered: { 
        bg: 'bg-green-100', 
        text: 'text-green-700',
        border: 'border-green-200',
        icon: CheckCircle 
      },
      cancelled: { 
        bg: 'bg-red-100', 
        text: 'text-red-700',
        border: 'border-red-200',
        icon: XCircle 
      }
    };
    return configs[status] || configs.pending;
  };

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const handleBack = () => {
    setIsClosing(true);
    setTimeout(() => {
      onBack();
    }, 300); // Match animation duration
  };

  // ==================== RENDER ====================

  return (
    <AnimatePresence mode="wait">
      {!isClosing && (
        <motion.div 
          key="orders-list-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/30 z-[60] flex justify-end" 
          onClick={handleClose}
        >
          <motion.div 
            key="orders-list-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-[40vw] bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* ==================== HEADER ==================== */}
            <div className="sticky top-0 bg-tppslate text-white p-4 shadow-lg z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBack}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold">Order History</h2>
                    <p className="text-xs text-white/90">{customerName}</p>
                  </div>
                </div>
                <button 
                  onClick={handleClose} 
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex gap-2">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search by Order ID or Product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="font-inter pl-9 pr-7 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value} className="font-inter bg-tppslate text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-2 text-xs text-white/80">
                Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                {searchTerm && ` matching "${searchTerm}"`}
                {statusFilter !== 'all' && ` with status "${statusFilter}"`}
              </div>
            </div>

            {/* ==================== ORDERS LIST ==================== */}
            <div className="flex-1 p-4 bg-tppslate/90">
              {allOrders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-700 mb-2">No Orders Found</h3>
                  <p className="text-xs text-gray-500">
                    This customer has not placed any orders yet
                  </p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-700 mb-2">No Orders Found</h3>
                  <p className="text-xs text-gray-500">
                    {searchTerm 
                      ? `No orders match "${searchTerm}"`
                      : statusFilter !== 'all'
                      ? `No ${statusFilter} orders found`
                      : 'No orders to display'
                    }
                  </p>
                  {(searchTerm || statusFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                      className="mt-3 px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-semibold"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Orders Grid */}
                  <div className="space-y-3 mb-4">
                    {paginatedOrders.map(order => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        getStatusConfig={getStatusConfig}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Pagination
                        currentPage={currentPage}
                        totalItems={filteredOrders.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==================== ORDER CARD COMPONENT ====================

function OrderCard({ order, formatCurrency, formatDate, getStatusConfig }) {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const parseShippingAddress = () => {
    if (!order.shipping_address) return null;
    if (typeof order.shipping_address === 'object') return order.shipping_address;
    if (typeof order.shipping_address === 'string') {
      try {
        return JSON.parse(order.shipping_address);
      } catch (error) {
        console.error('Failed to parse shipping_address:', error);
        return null;
      }
    }
    return null;
  };

  const shippingAddress = parseShippingAddress();

  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:border-tpppink hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-inter bg-tppslate/90 text-white px-2 py-0.5 rounded-full font-bold hover:scale-105 transition-transform cursor-pointer">
            <Link
              to={`/admin/orders?search=${order?.id || ''}`} >
              #{order.id.substring(0, 8).toUpperCase()} <ArrowUpRight className="w-3.5 h-3.5 inline-block ml-0.5" />
            </Link>
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} flex items-center gap-1`}>
            <StatusIcon className="w-3 h-3" />
            {order.status?.toUpperCase()}
          </span>
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-tpppink">
            {formatCurrency(order.final_total)}
          </div>
          <div className="text-xs text-gray-500">
            {order.payment_method?.toUpperCase() || 'COD'}
          </div>
        </div>
      </div>

      {/* Order Info Grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="flex items-start gap-1.5">
          <Calendar className="w-3 h-3 text-slate-700/60 mt-0.5" />
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Order Date</div>
            <div className="text-xs font-semibold text-slate-700">
              {formatDate(order.created_at)}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-1.5">
          <Package className="w-3 h-3 text-slate-700/60 mt-0.5" />
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Items</div>
            <div className="text-xs font-semibold text-slate-700">
              {order.Order_items?.length || 0} {order.Order_items?.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-1.5">
          <DollarSign className="w-3 h-3 text-slate-700/60 mt-0.5" />
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Payment Status</div>
            <div className={`text-xs font-bold ${
              order.payment_status === 'paid' ? 'text-green-600' : 
              order.payment_status === 'failed' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {order.payment_status?.toUpperCase() || 'PENDING'}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      {order.Order_items && order.Order_items.length > 0 && (
        <div className="mb-3 pb-3 border-b border-gray-200">
          <div className="text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-wide">Order Items:</div>
          <div className="space-y-1.5">
            {order.Order_items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white rounded-lg px-2 py-1.5 border border-gray-100">
                <span className="text-xs text-slate-700 font-medium truncate flex-1">{item.bundle_title}</span>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs text-gray-500">×{item.quantity}</span>
                  <span className="text-xs font-bold text-slate-700">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipping Address */}
      {shippingAddress && (
        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3 h-3 text-slate-700/60 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Shipping Address</div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {shippingAddress.line1}
                {shippingAddress.line2 && `, ${shippingAddress.line2}`}
              </p>
              {shippingAddress.landmark && (
                <p className="text-xs text-gray-600">Near: {shippingAddress.landmark}</p>
              )}
              <p className="text-xs text-gray-600">
                {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.zip_code}
              </p>
              {shippingAddress.phone && (
                <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" />
                  {shippingAddress.phone}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}