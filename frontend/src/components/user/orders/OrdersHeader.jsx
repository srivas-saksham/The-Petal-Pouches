// frontend/src/components/user/orders/OrdersHeader.jsx

import { Package, Download } from 'lucide-react';

const OrdersHeader = ({ onExport, exportLoading }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-tppslate dark:text-tppdarkwhite flex items-center gap-3">
          <Package className="w-7 h-7 text-tpppink dark:text-tppdarkwhite" />
          My Orders
        </h1>
        <p className="text-sm text-tppslate/60 dark:text-tppdarkwhite/50 mt-1">Track and manage your orders</p>
      </div>
      {onExport && (
        <button
          onClick={onExport}
          disabled={exportLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-tppdarkgray border border-tppslate/20 dark:border-tppdarkwhite/10 text-tppslate dark:text-tppdarkwhite text-sm rounded-lg hover:border-tpppink dark:hover:border-tppdarkwhite hover:text-tpppink dark:hover:text-tppdarkwhite transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exportLoading ? (
            <><div className="w-4 h-4 border-2 border-tpppink dark:border-tppdarkwhite border-t-transparent rounded-full animate-spin"></div>Exporting...</>
          ) : (
            <><Download className="w-4 h-4" />Export Orders</>
          )}
        </button>
      )}
    </div>
  );
};

export default OrdersHeader;