// frontend/src/pages/user/Addresses.jsx

import React, { useState, useEffect } from 'react';
import { Plus, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { getAddresses, deleteAddress, setDefaultAddress } from '../../services/addressService';
import AddressList from '../../components/user/addresses/AddressList';
import AddressForm from '../../components/user/addresses/AddressForm';
import { AddressesSkeleton } from '../../components/user/layout/userSkeletons'; // ✅ Import skeleton

/**
 * Addresses Page Component
 * Main page for managing user delivery addresses
 */
const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  /**
   * Fetch all addresses on component mount
   */
  useEffect(() => {
    fetchAddresses();
  }, []);

  /**
   * Auto-hide success/error messages after 5 seconds
   */
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  /**
   * Fetch addresses from API
   */
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAddresses();

      if (response.success) {
        setAddresses(response.data || []);
      } else {
        setError(response.error || 'Failed to load addresses');
      }
      
    } catch (err) {
      setError('Error loading addresses. Please try again.');
      console.error('Fetch addresses error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle add new address
   */
  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddForm(true);
    setError(null);
    setSuccess(null);
  };

  /**
   * Handle edit address
   */
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddForm(true);
    setError(null);
    setSuccess(null);
  };

  /**
   * Handle delete address
   */
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setError(null);
      const response = await deleteAddress(addressId);

      if (response.success) {
        setSuccess('Address deleted successfully');
        // Remove from local state
        setAddresses(addresses.filter(addr => addr.id !== addressId));
      } else {
        setError(response.error || 'Failed to delete address');
      }
    } catch (err) {
      setError('Error deleting address. Please try again.');
      console.error('Delete address error:', err);
    }
  };

  /**
   * Handle set default address
   */
  const handleSetDefault = async (addressId) => {
    try {
      setError(null);
      const response = await setDefaultAddress(addressId);

      if (response.success) {
        setSuccess('Default address updated');
        // Update local state
        setAddresses(addresses.map(addr => ({
          ...addr,
          is_default: addr.id === addressId
        })));
      } else {
        setError(response.error || 'Failed to set default address');
      }
    } catch (err) {
      setError('Error updating default address. Please try again.');
      console.error('Set default address error:', err);
    }
  };

  /**
   * Handle form submit (add or edit)
   */
  const handleFormSubmit = async () => {
    setShowAddForm(false);
    setEditingAddress(null);
    setSuccess(editingAddress ? 'Address updated successfully' : 'Address added successfully');
    // Refresh addresses list
    await fetchAddresses();
  };

  /**
   * Handle form cancel
   */
  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingAddress(null);
    setError(null);
  };

  // ✅ SKELETON LOADING STATE - Show skeleton while loading
  if (loading && !showAddForm) {
    return (
      <div className="max-w-6xl mx-auto">
        <AddressesSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-pink-500" />
              My Addresses
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage your delivery addresses
            </p>
          </div>

          {!showAddForm && (
            <button
              onClick={handleAddAddress}
              className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-800">{success}</p>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-emerald-600 hover:text-emerald-800"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Add/Edit Address Form */}
      {showAddForm && (
        <div className="mb-6 animate-in fade-in slide-in-from-top">
          <AddressForm
            address={editingAddress}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Addresses List */}
      {!showAddForm && (
        <AddressList
          addresses={addresses}
          loading={false} // ✅ Set to false since we're showing skeleton above
          onEdit={handleEditAddress}
          onDelete={handleDeleteAddress}
          onSetDefault={handleSetDefault}
        />
      )}

      {/* Empty State - shown when not loading and no addresses */}
      {!loading && !showAddForm && addresses.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center animate-in fade-in">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No addresses saved
          </h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Add a delivery address to make checkout faster and easier
          </p>
          <button
            onClick={handleAddAddress}
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            Add Your First Address
          </button>
        </div>
      )}
    </div>
  );
};

export default Addresses; 