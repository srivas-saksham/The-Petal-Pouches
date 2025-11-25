// frontend/src/components/user/addresses/AddressList.jsx

import React, { useState } from 'react';
import { MapPin, Grid, List } from 'lucide-react';
import AddressCard from './AddressCard';

/**
 * AddressList Component
 * Display list of addresses with grid/list view toggle
 * 
 * @param {Array} addresses - Array of address objects
 * @param {boolean} loading - Loading state
 * @param {Function} onEdit - Edit address callback
 * @param {Function} onDelete - Delete address callback
 * @param {Function} onSetDefault - Set default callback
 * @param {boolean} selectable - Enable selection mode for checkout
 * @param {string} selectedId - ID of selected address
 * @param {Function} onSelect - Select callback
 */
const AddressList = ({ 
  addresses = [], 
  loading = false, 
  onEdit, 
  onDelete, 
  onSetDefault,
  selectable = false,
  selectedId = null,
  onSelect
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  /**
   * Sort addresses to show default first
   */
  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return 0;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-32 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-slate-200 rounded animate-pulse"></div>
        </div>

        {/* Loading Cards */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <div className="flex-1 h-8 bg-slate-200 rounded"></div>
                <div className="h-8 w-20 bg-slate-200 rounded"></div>
                <div className="h-8 w-20 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          No addresses found
        </h3>
        <p className="text-slate-600">
          {selectable 
            ? 'Please add a delivery address to continue'
            : 'Add your first address to get started'
          }
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with View Toggle */}
      {!selectable && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">
            {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved
          </p>

          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-white text-pink-500 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors duration-200 ${
                viewMode === 'list' 
                  ? 'bg-white text-pink-500 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Selectable mode header */}
      {selectable && (
        <div className="mb-4 p-4 bg-pink-50 border border-pink-200 rounded-lg">
          <p className="text-sm text-pink-900 font-medium">
            Select a delivery address
          </p>
          <p className="text-xs text-pink-700 mt-1">
            {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} available
          </p>
        </div>
      )}

      {/* Address Cards */}
      <div className={
        viewMode === 'grid' && !selectable
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4'
          : 'space-y-4'
      }>
        {sortedAddresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            onEdit={onEdit}
            onDelete={onDelete}
            onSetDefault={onSetDefault}
            selectable={selectable}
            selected={selectable && selectedId === address.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Info Footer */}
      {!selectable && addresses.length > 0 && (
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-slate-400 flex-shrink-0">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-700 font-medium mb-1">
                Address Tips
              </p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Set a default address for faster checkout</li>
                <li>• Include landmarks for easier delivery</li>
                <li>• Verify your phone number is correct</li>
                <li>• You can save multiple addresses</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressList;