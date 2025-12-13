// frontend/src/components/admin/orders/AdminOrdersAnalytics.jsx
import { TrendingUp, DollarSign, Package, Truck, CreditCard, PieChart } from 'lucide-react';

export default function AdminOrdersAnalytics({ orders, filters }) {
  // Calculate analytics from filtered orders
  const calculateAnalytics = () => {
    if (!orders || orders.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        statusBreakdown: {},
        paymentBreakdown: {},
        deliveryBreakdown: {},
        topBundles: []
      };
    }

    const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.final_total) || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Status breakdown
    const statusBreakdown = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    // Payment breakdown
    const paymentBreakdown = {
      paid: orders.filter(o => o.payment_status === 'paid').length,
      unpaid: orders.filter(o => o.payment_status === 'unpaid').length,
      refunded: orders.filter(o => o.payment_status === 'refunded').length
    };

    // Delivery breakdown
    const deliveryBreakdown = {
      surface: orders.filter(o => o.delivery_metadata?.mode === 'surface').length,
      express: orders.filter(o => o.delivery_metadata?.mode === 'express').length
    };

    // Top bundles from items_preview
    const bundleMap = {};
    orders.forEach(order => {
      (order.items_preview || []).forEach(item => {
        const bundleId = item.bundle_id || item.bundle_title;
        if (bundleId) {
          if (!bundleMap[bundleId]) {
            bundleMap[bundleId] = {
              title: item.bundle_title || 'Unknown',
              count: 0,
              revenue: 0
            };
          }
          bundleMap[bundleId].count += item.quantity || 1;
          bundleMap[bundleId].revenue += (item.price || 0) * (item.quantity || 1);
        }
      });
    });

    const topBundles = Object.values(bundleMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      statusBreakdown,
      paymentBreakdown,
      deliveryBreakdown,
      topBundles
    };
  };

  const analytics = calculateAnalytics();
  const formatCurrency = (amount) => `₹${parseFloat(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const StatCard = ({ icon: Icon, label, value, color = 'text-tppslate' }) => (
    <div className="bg-white rounded-lg border border-tppslate/10 p-3 hover:border-tpppink/30 transition-all">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-tppslate/60">{label}</span>
      </div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );

  const ProgressBar = ({ label, count, total, color = 'bg-tppslate' }) => {
    const percent = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-tppslate/70">{label}</span>
          <span className="font-semibold text-tppslate">{count}</span>
        </div>
        <div className="h-2 bg-tppslate/10 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg border border-tppslate/10 p-4">
        <h3 className="text-sm font-bold text-tppslate flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-tpppink" />
          Analytics
        </h3>
        <p className="text-xs text-tppslate/60">
          Based on {analytics.totalOrders} filtered orders
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="space-y-2">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          color="text-tpppink"
        />
        <StatCard
          icon={Package}
          label="Avg Order Value"
          value={formatCurrency(analytics.avgOrderValue)}
          color="text-tppslate"
        />
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-lg border border-tppslate/10 p-4">
        <h4 className="text-xs font-bold text-tppslate mb-3 flex items-center gap-2">
          <PieChart className="w-3.5 h-3.5" />
          Order Status
        </h4>
        <div className="space-y-2">
          {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
            <ProgressBar
              key={status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              count={count}
              total={analytics.totalOrders}
              color={
                status === 'delivered' ? 'bg-green-500' :
                status === 'shipped' ? 'bg-blue-500' :
                status === 'cancelled' ? 'bg-red-500' :
                'bg-yellow-500'
              }
            />
          ))}
        </div>
      </div>

      {/* Payment Status */}
      <div className="bg-white rounded-lg border border-tppslate/10 p-4">
        <h4 className="text-xs font-bold text-tppslate mb-3 flex items-center gap-2">
          <CreditCard className="w-3.5 h-3.5" />
          Payment Status
        </h4>
        <div className="space-y-2">
          <ProgressBar
            label="Paid"
            count={analytics.paymentBreakdown.paid}
            total={analytics.totalOrders}
            color="bg-green-500"
          />
          <ProgressBar
            label="Unpaid"
            count={analytics.paymentBreakdown.unpaid}
            total={analytics.totalOrders}
            color="bg-yellow-500"
          />
          {analytics.paymentBreakdown.refunded > 0 && (
            <ProgressBar
              label="Refunded"
              count={analytics.paymentBreakdown.refunded}
              total={analytics.totalOrders}
              color="bg-blue-500"
            />
          )}
        </div>
      </div>

      {/* Delivery Mode */}
      <div className="bg-white rounded-lg border border-tppslate/10 p-4">
        <h4 className="text-xs font-bold text-tppslate mb-3 flex items-center gap-2">
          <Truck className="w-3.5 h-3.5" />
          Delivery Mode
        </h4>
        <div className="space-y-2">
          <ProgressBar
            label="Surface"
            count={analytics.deliveryBreakdown.surface}
            total={analytics.totalOrders}
            color="bg-tppslate"
          />
          <ProgressBar
            label="Express"
            count={analytics.deliveryBreakdown.express}
            total={analytics.totalOrders}
            color="bg-tpppink"
          />
        </div>
      </div>

      {/* Top Bundles */}
      {analytics.topBundles.length > 0 && (
        <div className="bg-white rounded-lg border border-tppslate/10 p-4">
          <h4 className="text-xs font-bold text-tppslate mb-3">
            Top Bundles
          </h4>
          <div className="space-y-2">
            {analytics.topBundles.map((bundle, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="text-tppslate truncate flex-1">{bundle.title}</span>
                <span className="font-semibold text-tppslate ml-2">{bundle.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}