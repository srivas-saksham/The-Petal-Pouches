// frontend/src/components/admin/customers/CustomerDetailsSidebar.jsx
/**
 * Customer Details Sidebar - 70% Width, Two-Column Layout
 * Shows customer information and recent 3 orders only
 */

import { 
  X, User, Mail, Phone, Calendar, MapPin, 
  TrendingUp, Award, Package, AlertTriangle, 
  CheckCircle, XCircle, ShoppingBag, Eye,
  ArrowUpRight
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerOrdersList from './CustomerOrdersList';
import { useNavigate, Link } from 'react-router-dom';

export default function CustomerDetailsSidebar({ customer, details, loading, onClose }) {
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
      processing: 'bg-purple-100 text-purple-700 border-purple-200',
      shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      delivered: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200'
    };
    return configs[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  // ==================== RENDER ====================

  if (showAllOrders) {
    return (
      <CustomerOrdersList
        customerId={customer.id}
        customerName={customer.name}
        orders={details.orders}
        onClose={handleClose}
        onBack={() => setShowAllOrders(false)}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isClosing && (
        <motion.div 
          key="customer-details-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 z-50 flex justify-end" 
          onClick={handleClose}
        >
          <motion.div 
            key="customer-details-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-[70vw] bg-white h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* ==================== HEADER ==================== */}
            <div className="sticky top-0 bg-tppslate text-white p-4 flex items-center justify-between z-10 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {customer.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{customer.name || 'Unknown'}</h2>
                  <p className="text-xs text-white/90">{customer.email}</p>
                </div>
              </div>
              <button 
                onClick={handleClose} 
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ==================== CONTENT ==================== */}
            {loading ? (
              <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-tpppink border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-tppslate/60 text-sm">Loading customer details...</p>
                </div>
              </div>
            ) : details ? (
              <div className="p-5 bg-tppslate/90">
                
                {/* ==================== TWO COLUMN LAYOUT ==================== */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  
                  {/* ==================== LEFT COLUMN ==================== */}
                  <div className="space-y-4">
                    
                    {/* Account Information */}
                    <Section title="Account Information" icon={User}>
                      <InfoRow label="Customer ID" value={
                        <span className="font-inter text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          {details.customer.id.substring(0, 16)}...
                        </span>
                      } />
                      <InfoRow label="Email" value={details.customer.email} />
                      <InfoRow label="Phone" value={details.customer.phone || 'Not provided'} />
                      <InfoRow label="Status" value={
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          details.customer.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {details.customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      } />
                      <InfoRow label="Email Verified" value={
                        <span className={`flex items-center gap-1 font-semibold ${
                          details.customer.email_verified ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {details.customer.email_verified ? (
                            <><CheckCircle className="w-3 h-3" /> Verified</>
                          ) : (
                            <><XCircle className="w-3 h-3" /> Not Verified</>
                          )}
                        </span>
                      } />
                      <InfoRow label="Registered" value={formatDate(details.customer.created_at)} />
                      <InfoRow label="Last Login" value={formatDate(details.customer.last_login)} />
                    </Section>

                    {/* Customer Analytics */}
                    <Section title="Customer Analytics" icon={TrendingUp}>
                      <InfoRow 
                        label="Days Since Registration" 
                        value={<span className="font-bold text-tppslate">{details.stats.days_since_registration || 0}</span>} 
                      />
                      <InfoRow 
                        label="Days Since Last Order" 
                        value={
                          <span className={`font-bold ${
                            details.stats.days_since_last_order > 90 ? 'text-red-600' : 'text-tppslate'
                          }`}>
                            {details.stats.days_since_last_order || 'No orders yet'}
                          </span>
                        } 
                      />
                      <InfoRow 
                        label="Customer Lifetime Value" 
                        value={<span className="text-tpppink font-bold text-base">{formatCurrency(details.stats.clv)}</span>}
                      />
                      <InfoRow 
                        label="Avg Order Value" 
                        value={<span className="font-bold">{formatCurrency(details.stats.avg_order_value)}</span>} 
                      />
                      <InfoRow 
                        label="Preferred Payment" 
                        value={
                          <span className="px-1.5 py-0.5 bg-tppslate/10 rounded font-semibold text-tppslate text-xs">
                            {details.stats.preferred_payment_method?.toUpperCase() || 'N/A'}
                          </span>
                        } 
                      />
                      <InfoRow 
                        label="Common Location" 
                        value={details.stats.avg_delivery_location || 'N/A'} 
                      />
                      <InfoRow 
                        label="Payment Failure Rate" 
                        value={
                          <span className={`font-bold ${
                            details.stats.payment_failure_rate > 20 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {details.stats.payment_failure_rate || 0}%
                          </span>
                        } 
                      />
                      
                      {details.stats.is_inactive_90_days && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-1.5 text-red-700 mt-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs font-bold">⚠️ Inactive for 90+ days - Re-engagement needed!</span>
                        </div>
                      )}
                    </Section>

                  </div>

                  {/* ==================== RIGHT COLUMN ==================== */}
                  <div className="space-y-4">
                    
                    {/* Favorite Products */}
                    {details.stats.favorite_bundles?.length > 0 && (
                      <Section title="Favorite Products" icon={Award}>
                        <div className="space-y-1.5">
                          {details.stats.favorite_bundles.map((bundle, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between p-2 bg-gradient-to-r from-tpppink/5 to-transparent rounded-lg border border-tpppink/20 hover:border-tpppink/40 transition-colors"
                            >
                              <span className="text-xs font-semibold text-tppslate truncate flex-1">
                                {bundle.bundle_title}
                              </span>
                              <span className="text-xs bg-tpppink text-white px-2 py-0.5 rounded-full font-bold shadow-sm ml-2">
                                {bundle.count}× Purchased
                              </span>
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}

                    {/* Order Statistics */}
                    <Section title="Order Statistics" icon={Package}>
                      <div className="grid grid-cols-2 gap-2">
                        <StatCard 
                          label="Total Orders" 
                          value={details.stats.total_orders || 0}
                          color="bg-blue-50 text-blue-700 border-blue-200"
                        />
                        <StatCard 
                          label="Completed" 
                          value={details.stats.completed_orders || 0}
                          color="bg-green-50 text-green-700 border-green-200"
                        />
                        <StatCard 
                          label="Cancelled" 
                          value={details.stats.cancelled_orders || 0}
                          color="bg-red-50 text-red-700 border-red-200"
                        />
                        <StatCard 
                          label="Total Spent" 
                          value={formatCurrency(details.stats.total_spent)}
                          color="bg-tpppink/10 text-tpppink border-tpppink/30"
                        />
                      </div>
                      <div className="mt-3 space-y-1.5">
                        <InfoRow label="First Order" value={formatDate(details.stats.first_order_date)} />
                        <InfoRow label="Last Order" value={formatDate(details.stats.last_order_date)} />
                      </div>
                    </Section>

                  </div>
                </div>

                {/* ==================== RECENT ORDERS (Full Width) ==================== */}
                <Section title="Recent Orders" icon={ShoppingBag}>
                  {details.orders?.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        {details.orders.slice(0, 3).map(order => (
                          <div
                            key={order.id} 
                            className="border border-tppslate/50 rounded-lg p-3 hover:border-tpppink/50 hover:shadow-md transition-all bg-tppslate/10"
                          >
                            {/* Order Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-inter bg-tppslate/90 text-white px-2 py-0.5 rounded-full font-bold hover:scale-105 transition-transform cursor-pointer">
                                  <Link
                                    to={`/admin/orders?search=${order?.id || ''}`} >
                                    #{order.id.substring(0, 8).toUpperCase()} <ArrowUpRight className="w-3.5 h-3.5 inline-block ml-0.5" />
                                  </Link>
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getStatusConfig(order.status)}`}>
                                  {order.status?.toUpperCase()}
                                </span>
                              </div>
                              <span className="text-base font-bold text-tpppink">
                                {formatCurrency(order.final_total)}
                              </span>
                            </div>
                            
                            {/* Order Details */}
                            <div className="grid grid-cols-3 gap-3 text-xs mb-2">
                              <div>
                                <span className="text-gray-500 block text-xs mb-0.5">Items</span>
                                <span className="font-bold text-tppslate">
                                  {order.Order_items?.length || 0} items
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 block text-xs mb-0.5">Order Date</span>
                                <span className="font-semibold text-tppslate">
                                  {formatDate(order.created_at)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 block text-xs mb-0.5">Payment</span>
                                <span className="font-semibold text-tppslate">
                                  {order.payment_method?.toUpperCase() || 'COD'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Order Items */}
                            {order.Order_items?.length > 0 && (
                              <div className="pt-2 border-t border-gray-200">
                                <div className="text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-wide">Order Items:</div>
                                <div className="space-y-1">
                                  {order.Order_items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs bg-white rounded-lg px-2 py-1.5 border border-gray-100">
                                      <span className="text-tppslate font-medium truncate flex-1">{item.bundle_title}</span>
                                      <span className="font-bold text-tppslate ml-2">×{item.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* View All Orders Button */}
                      {details.orders.length > 3 && (
                        <button
                          onClick={() => setShowAllOrders(true)}
                          className="w-full mt-3 px-3 py-2 bg-gradient-to-r from-tppslate to-tppslate/90 text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2 group text-sm"
                        >
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          View All {details.orders.length} Orders
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 font-medium">No orders yet</p>
                    </div>
                  )}
                </Section>
              </div>
            ) : (
              <div className="p-6 text-center text-tppslate/60">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-base font-semibold">Failed to load customer details</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==================== HELPER COMPONENTS ====================

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 shadow-sm">
    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
      <div className="p-1.5 bg-gradient-to-br from-tpppink to-tpppink/80 rounded-lg shadow-sm">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h3 className="font-bold text-tppslate text-sm uppercase tracking-wide">{title}</h3>
    </div>
    <div className="space-y-1.5">
      {children}
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
    <span className="text-xs text-gray-600 font-medium">{label}:</span>
    <span className="text-xs font-semibold text-tppslate text-right">{value}</span>
  </div>
);

const StatCard = ({ label, value, color }) => (
  <div className={`p-2 rounded-lg border ${color} text-center shadow-sm`}>
    <div className="text-lg font-bold mb-0.5">{value}</div>
    <div className="text-xs font-semibold uppercase tracking-wide">{label}</div>
  </div>
);