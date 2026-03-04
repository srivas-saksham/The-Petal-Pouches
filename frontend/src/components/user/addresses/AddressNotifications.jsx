// frontend/src/components/user/addresses/AddressNotifications.jsx

import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const AddressNotifications = ({ success, error, onDismissSuccess, onDismissError }) => {
  return (
    <>
      {success && (
        <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-800 dark:text-emerald-400 font-medium">{success}</p>
          <button onClick={onDismissSuccess} className="ml-auto text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-400 font-medium">{error}</p>
          <button onClick={onDismissError} className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default AddressNotifications;