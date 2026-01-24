// frontend/src/pages/user/Addresses.jsx

import React, { useState, useEffect } from 'react';
import { Plus, MapPinned, LayoutGrid, Columns3 } from 'lucide-react';
import { getAddresses, deleteAddress, setDefaultAddress } from '../../services/addressService';
import AddressForm from '../../components/user/addresses/AddressForm';
import AddressList from '../../components/user/addresses/AddressList';
import { AddressesSkeleton } from '../../components/user/layout/userSkeletons';
import AddressNotifications from '../../components/user/addresses/AddressNotifications';
import AddressEmptyState from '../../components/user/addresses/AddressEmptyState';
import AddressFormSidebar from '../../components/user/addresses/AddressFormSidebar';

/**
 * Addresses Page Component - Refactored with Component Structure
 * Main container that orchestrates all address management functionality
 */
const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [layoutColumns, setLayoutColumns] = useState(2); // 2 or 3 columns
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarEditingAddress, setSidebarEditingAddress] = useState(null);
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
    setSidebarEditingAddress(null);
    setSidebarOpen(true);
    setError(null);
    setSuccess(null);
  };

  /**
   * Handle edit address
   */
  const handleEditAddress = (address) => {
    setSidebarEditingAddress(address);
    setSidebarOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleSidebarSuccess = async () => {
    setSuccess(sidebarEditingAddress ? 'Address updated successfully' : 'Address added successfully');
    await fetchAddresses();
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

  // Skeleton loading state
  if (loading && !showAddForm) {
    return (
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">
        <AddressesSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-4">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-tppslate flex items-center gap-2 md:gap-3">
              <MapPinned className="w-5 h-5 md:w-7 md:h-7 text-tpppink" />
              My Addresses
            </h1>
            <p className="text-xs md:text-sm text-tppslate/80 mt-0.5 md:mt-1">
              Manage your delivery addresses
            </p>
            <p className="text-xs md:text-sm text-tppslate/80 mt-0.5 md:mt-1">
              • {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Layout Toggle - HIDDEN ON MOBILE */}
            {!showAddForm && addresses.length > 0 && (
              <div className="hidden md:flex items-center gap-1 bg-tppslate/5 rounded-lg p-1 border border-tppslate/10">
                <button
                  onClick={() => setLayoutColumns(2)}
                  className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-1.5 text-xs font-bold ${
                    layoutColumns === 2
                      ? 'bg-white text-tppslate shadow-sm'
                      : 'text-tppslate/80 hover:text-tppslate'
                  }`}
                  title="2 Columns"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">2 Columns</span>
                </button>
                <button
                  onClick={() => setLayoutColumns(3)}
                  className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-1.5 text-xs font-bold ${
                    layoutColumns === 3
                      ? 'bg-white text-tppslate shadow-sm'
                      : 'text-tppslate/80 hover:text-tppslate'
                  }`}
                  title="3 Columns"
                >
                  <Columns3 className="w-4 h-4" />
                  <span className="hidden sm:inline">3 Columns</span>
                </button>
              </div>
            )}

            {!showAddForm && (
              <button
                onClick={handleAddAddress}
                className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-tpppink text-white rounded-lg hover:bg-tpppink/90 transition-all duration-200 shadow-sm font-bold text-xs md:text-sm"
              >
                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Add New Address</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <AddressNotifications 
        success={success}
        error={error}
        onDismissSuccess={() => setSuccess(null)}
        onDismissError={() => setError(null)}
      />

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

      {/* Address List */}
      {!showAddForm && addresses.length > 0 && (
        <AddressList
          addresses={addresses}
          layoutColumns={layoutColumns}
          onEdit={handleEditAddress}
          onDelete={handleDeleteAddress}
          onSetDefault={handleSetDefault}
        />
      )}

      {/* Empty State */}
      {!loading && !showAddForm && addresses.length === 0 && (
        <AddressEmptyState onAddAddress={handleAddAddress} />
      )}
      
      {/* Address Form Sidebar */}
        <AddressFormSidebar
          isOpen={sidebarOpen}
          editingAddress={sidebarEditingAddress}
          onClose={() => setSidebarOpen(false)}
          onSuccess={handleSidebarSuccess}
        />
    </div>
  );
};

export default Addresses;