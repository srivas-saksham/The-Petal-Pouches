// frontend/src/components/user/addresses/AddressEmptyState.jsx

import React from 'react';
import { Plus, MapPinned } from 'lucide-react';

/**
 * AddressEmptyState Component
 * Displays empty state when no addresses are saved
 * 
 * @param {Function} onAddAddress - Add address callback
 */
const AddressEmptyState = ({ onAddAddress }) => {
  return (
    <div className="bg-white rounded-lg border-2 border-dashed border-tppslate/20 p-16 text-center animate-in fade-in">
      <div className="w-20 h-20 bg-gradient-to-br from-tpppink/10 to-tpppink/5 rounded-full flex items-center justify-center mx-auto mb-5">
        <MapPinned className="w-10 h-10 text-tpppink" />
      </div>
      <h3 className="text-xl font-bold text-tppslate mb-2">
        No addresses saved yet
      </h3>
      <p className="text-tppslate/80 mb-6 max-w-md mx-auto">
        Add your first delivery address to make checkout faster and easier. You can save multiple addresses for different locations.
      </p>
      <button
        onClick={onAddAddress}
        className="inline-flex items-center gap-2 px-6 py-3 bg-tpppink text-white rounded-lg hover:bg-tpppink/90 transition-all duration-200 font-bold shadow-sm"
      >
        <Plus className="w-5 h-5" />
        Add Your First Address
      </button>
    </div>
  );
};

export default AddressEmptyState;