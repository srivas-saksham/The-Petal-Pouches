// frontend/src/components/shop/BundleLoading.jsx

import React from 'react';

const BundleLoading = () => {
  return (
    <div className="bg-white dark:bg-tppdarkgray rounded-lg shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200 dark:bg-tppdarkwhite/10" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-tppdarkwhite/10 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-tppdarkwhite/10 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-tppdarkwhite/10 rounded w-2/3" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-tppdarkwhite/10 rounded w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-8 bg-gray-200 dark:bg-tppdarkwhite/10 rounded w-24" />
          <div className="h-4 bg-gray-200 dark:bg-tppdarkwhite/10 rounded w-20" />
        </div>
      </div>
    </div>
  );
};

export default BundleLoading;