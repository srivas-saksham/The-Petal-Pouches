// frontend/src/components/checkout/DeliveryDetailsCard.jsx - WITH INTEGRATED DELIVERY SELECTION

import React, { useState, useEffect, useRef } from 'react';
import { Truck, Package, MapPin, Calendar, AlertCircle, CheckCircle, Loader, Plane, ChevronDown, ChevronUp, Home, Briefcase, Plus } from 'lucide-react';
import { getStoredDeliveryCheck, saveDeliveryData, getDeliveryData } from '../../utils/deliveryStorage';
import api from '../../services/api';

/**
 * DeliveryDetailsCard Component
 * Shows estimated delivery time and shipping method from localStorage
 * Performs silent background verification of delivery data
 * ✅ Address selector UI + localStorage persistence
 * ✅ No duplicate auto-selection (handled by parent)
 * ✅ Integrated delivery mode selection (Standard/Express)
 * ✅ TWO COLUMN LAYOUT: Address info | Delivery options
 * 
 * @param {Object} selectedAddress - Currently selected delivery address
 * @param {Function} onAddressSelect - Callback when address is selected
 * @param {Array} addresses - List of available addresses
 * @param {Function} onDeliveryUpdate - Callback when delivery data changes
 * @param {Function} onOpenAddressModal - Callback to open address modal
 * @param {Function} onDeliveryModeChange - Callback when delivery mode changes
 */
const DeliveryDetailsCard = ({ 
  selectedAddress, 
  onAddressSelect,
  addresses = [],
  onDeliveryUpdate,
  onOpenAddressModal,
  onDeliveryModeChange,
  cartWeight = 99,
  isRecalculating = false
}) => {
  const [deliveryData, setDeliveryData] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [verificationError, setVerificationError] = useState(null);

  // Address dropdown state
  const [showAddressList, setShowAddressList] = useState(false);
  const addressListRef = useRef(null);

  // ✅ NEW: Delivery mode selection state
  const [selectedMode, setSelectedMode] = useState('surface'); // 'surface' or 'express'
  const [isChangingMode, setIsChangingMode] = useState(false);

  // Load delivery data from localStorage - React to address and weight changes
  useEffect(() => {
    const storedData = getDeliveryData();
    
    if (!storedData) {
      console.log('📭 [DeliveryDetailsCard] No stored delivery data');
      
      if (selectedAddress?.zip_code && cartWeight) {
        console.log('🔄 [DeliveryDetailsCard] No cached data, triggering fresh calculation');
        verifyDeliveryInBackground(selectedAddress.zip_code, null);
      }
      return;
    }

    console.log('📦 [DeliveryDetailsCard] Found stored delivery data:', storedData);

    if (storedData.deliveryCheck) {
      setDeliveryData(storedData.deliveryCheck);
    } else {
      if (selectedAddress?.zip_code && cartWeight) {
        console.log('🔄 [DeliveryDetailsCard] Delivery data cleared, triggering recalculation');
        verifyDeliveryInBackground(selectedAddress.zip_code, null);
      }
    }

    // ⭐ REMOVED: setDeliveryModeData and setExpressCharge (not in this component)

    // Load saved delivery mode
    if (storedData.selectedDeliveryMode) {
      setSelectedMode(storedData.selectedDeliveryMode);
      console.log('✅ [DeliveryDetailsCard] Restored delivery mode:', storedData.selectedDeliveryMode);
    }
  }, [selectedAddress?.zip_code, cartWeight]);

  // Background verification when address is selected and changes
  useEffect(() => {
    if (!selectedAddress?.zip_code) {
      return;
    }

    const storedPinCode = deliveryData?.rawData?.pincode || deliveryData?.pinCode;
    
    // Verify if no data exists OR if PIN changed
    if (!deliveryData || (storedPinCode && storedPinCode !== selectedAddress.zip_code)) {
      console.log('🔄 [DeliveryDetailsCard] Verifying delivery for address:', selectedAddress.zip_code);
      verifyDeliveryInBackground(selectedAddress.zip_code, deliveryData);
    }
  }, [selectedAddress?.id, selectedAddress?.zip_code, cartWeight]);


  // ✅ NEW: Notify parent when mode changes
  useEffect(() => {
    if (!deliveryData?.rawData?.deliveryOptions) return;

    const options = deliveryData.rawData.deliveryOptions;
    const selectedOption = options[selectedMode];

    if (selectedOption && onDeliveryModeChange) {
      const extraCharge = selectedMode === 'express' && options.express?.extraCharge 
        ? options.express.extraCharge 
        : 0;

      onDeliveryModeChange({
        mode: selectedMode,
        estimatedDays: selectedOption.estimatedDays,
        deliveryDate: selectedOption.deliveryDate,
        extraCharge: extraCharge,
        option: selectedOption
      });
    }
  }, [selectedMode, deliveryData, onDeliveryModeChange]);

  /**
   * Silent background verification of delivery serviceability
   */
  const verifyDeliveryInBackground = async (pinCode, storedCheck) => {
    if (!pinCode || pinCode.length !== 6) return;

    setVerifying(true);
    setVerificationError(null);

    // ⭐ NEW: Notify parent that delivery is being calculated
    if (onDeliveryUpdate) {
      onDeliveryUpdate({ isCalculating: true });
    }

    try {
      console.log('🔄 [DeliveryDetailsCard] Verifying delivery for PIN:', pinCode);
      console.log(`📦 [DeliveryDetailsCard] Using cart weight: ${cartWeight}g (${cartWeight/1000}kg)`);
      
      const response = await api.get(`/api/delhivery/check/${pinCode}`, {
        params: {
          weight: cartWeight
        }
      });

      if (response.data.success) {
        const freshData = response.data;
        
        // Build new delivery data structure
        const newDeliveryData = {
          serviceable: freshData.serviceable,
          city: freshData.location?.city,
          state: freshData.location?.state,
          estimatedDays: freshData.bestOption?.estimatedDays || freshData.deliveryOptions?.surface?.estimatedDays,
          deliveryDate: freshData.bestOption?.expectedDeliveryDate || freshData.deliveryOptions?.surface?.deliveryDate,
          mode: freshData.bestOption?.mode || 'Surface',
          features: freshData.features || {},
          pinCode: pinCode,
          rawData: freshData
        };

        // Compare with stored data
        if (storedCheck) {
          const hasChanged = 
            freshData.serviceable !== storedCheck.serviceable ||
            freshData.deliveryOptions?.surface?.estimatedDays !== storedCheck.rawData?.deliveryOptions?.surface?.estimatedDays ||
            freshData.deliveryOptions?.express?.estimatedDays !== storedCheck.rawData?.deliveryOptions?.express?.estimatedDays;

          if (hasChanged) {
            console.log('⚠️ [DeliveryDetailsCard] Delivery info has changed!');
            setHasChanges(true);
          }
        }

        setDeliveryData(newDeliveryData);
        setVerified(true);

        // ✅ Save to localStorage
        const currentStoredData = getDeliveryData() || {};
        saveDeliveryData({
          ...currentStoredData,
          deliveryCheck: newDeliveryData,
          timestamp: Date.now()
        });

        // Notify parent component
        if (onDeliveryUpdate) {
          onDeliveryUpdate(newDeliveryData);
        }

        console.log('✅ [DeliveryDetailsCard] Verification complete:', newDeliveryData);
      } else {
        throw new Error(response.data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('❌ [DeliveryDetailsCard] Verification error:', error);
      setVerificationError('Unable to verify delivery availability');
      // Don't clear existing data on error - show cached data
    } finally {
      setVerifying(false);
      
      // ⭐ NEW: Notify parent that calculation is complete
      if (onDeliveryUpdate) {
        onDeliveryUpdate({ isCalculating: false });
      }
    }
  };


  // Handle address selection
  const handleAddressSelect = (address) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
    setShowAddressList(false);

    // ✅ Save to localStorage
    const currentStoredData = getDeliveryData() || {};
    saveDeliveryData({
      ...currentStoredData,
      selectedAddressId: address.id,
      timestamp: Date.now()
    });
    console.log('💾 [DeliveryDetailsCard] Saved address selection to localStorage');
  };

  // ✅ NEW: Handle delivery mode change
  const handleModeChange = async (mode) => {
    console.log('🔄 Mode changing to:', mode);

    if (isChangingMode || mode === selectedMode) return;

    try {
      setIsChangingMode(true);
      setSelectedMode(mode);

      // Save to localStorage
      const currentStoredData = getDeliveryData() || {};
      await saveDeliveryData({
        ...currentStoredData,
        selectedDeliveryMode: mode,
        timestamp: Date.now()
      });

      console.log('💾 [DeliveryDetailsCard] Saved delivery mode:', mode);
    } catch (error) {
      console.error('❌ [DeliveryDetailsCard] Error saving mode:', error);
    } finally {
      setIsChangingMode(false);
    }
  };

  // Get address icon
  const getAddressIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'home':
        return <Home size={14} className="text-tpppink dark:text-tppdarkwhite/70" />;
      case 'work':
        return <Briefcase size={14} className="text-blue-600 dark:text-blue-400" />;
      default:
        return <MapPin size={14} className="text-slate-600 dark:text-tppdarkwhite/50" />;
    }
  };

  // Get formatted address type
  const getAddressTypeName = (type) => {
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Address';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addressListRef.current && !addressListRef.current.contains(event.target)) {
        setShowAddressList(false);
      }
    };

    if (showAddressList) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddressList]);

  return (
    <div className="bg-white dark:bg-tppdarkgray rounded-lg shadow overflow-visible">
      {/* Header */}
      <div className="bg-gradient-to-r from-tppslate to-tppslate/90 dark:from-tppdark dark:to-tppdark/90 px-6 py-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck size={20} />
            Delivery Information
          </h2>
          
          {/* Free Shipping Badge - Compact with white text */}
          {selectedAddress && deliveryData && deliveryData.serviceable && (
            <div className="bg-green-600 dark:bg-green-700 rounded-md px-3 py-1.5 flex items-center gap-1.5">
              <Package size={14} className="text-white" />
              <span className="font-inter text-xs font-bold text-white whitespace-nowrap">FREE STANDARD SHIPPING</span>
            </div>
          )}
        </div>
      </div>

      {/* ==================== TWO COLUMN LAYOUT ==================== */}
      <div className="p-6 overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ==================== LEFT COLUMN: ADDRESS INFO ==================== */}
          <div className="space-y-4">
            {/* ADDRESS SELECTOR */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] font-bold text-slate-800 dark:text-tppdarkwhite flex items-center gap-2">
                  Delivery Address
                </h3>

                <button
                  onClick={() => {
                    onOpenAddressModal();
                    setShowAddressList(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-tpppink/10 dark:bg-tppdarkwhite/10 hover:bg-tpppink dark:hover:bg-tppdarkwhite text-tpppink dark:text-tppdarkwhite hover:text-white dark:hover:text-tppdark rounded-md transition-colors"
                >
                  <Plus size={14} />
                  <span className="text-xs font-bold">Add Address</span>
                </button>
              </div>

              <div className="relative" ref={addressListRef}>
                {selectedAddress ? (
                  <button
                    onClick={() => setShowAddressList(!showAddressList)}
                    className="w-full p-3 bg-tpppink/10 dark:bg-tppdarkwhite/5 border-2 border-tpppink dark:border-tppdarkwhite/30 rounded-lg text-left hover:border-tpppink dark:hover:border-tppdarkwhite/50 hover:bg-tpppink/20 dark:hover:bg-tppdarkwhite/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getAddressIcon(selectedAddress.address_type)}
                          <span className="text-sm font-bold text-slate-800 dark:text-tppdarkwhite">
                            {getAddressTypeName(selectedAddress.address_type)}
                          </span>
                          {selectedAddress.is_default && (
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 dark:text-tppdarkwhite/80 font-medium">
                          {selectedAddress.line1}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-tppdarkwhite/60">
                          {selectedAddress.line2 ? `${selectedAddress.line2}, ` : ''}
                          {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip_code}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        {showAddressList ? (
                          <ChevronUp size={18} className="text-slate-600 dark:text-tppdarkwhite/50" />
                        ) : (
                          <ChevronDown size={18} className="text-slate-600 dark:text-tppdarkwhite/50" />
                        )}
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAddressList(!showAddressList)}
                    className="w-full p-3 border-2 border-dashed border-slate-300 dark:border-tppdarkwhite/20 rounded-lg text-left hover:border-tpppink dark:hover:border-tppdarkwhite/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-tppdarkwhite/50">Select delivery address</span>
                      {showAddressList ? (
                        <ChevronUp size={16} className="text-slate-600 dark:text-tppdarkwhite/50" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-600 dark:text-tppdarkwhite/50" />
                      )}
                    </div>
                  </button>
                )}

                {/* Address Dropdown - Modal for 3+ addresses, Dropdown for 1-2 */}
                {showAddressList && addresses.length <= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-tppdarkgray border-2 border-slate-200 dark:border-tppdarkwhite/10 rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">

                    {addresses.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500 dark:text-tppdarkwhite/40">
                        No saved addresses
                      </div>
                    ) : (
                      addresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => handleAddressSelect(addr)}
                          className={`w-full p-3 border-b last:border-b-0 border-slate-100 dark:border-tppdarkwhite/10 text-left hover:bg-slate-50 dark:hover:bg-tppdark/30 transition-colors ${
                            selectedAddress?.id === addr.id ? 'bg-slate-50 dark:bg-tppdark/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getAddressIcon(addr.address_type)}
                                <span className="text-xs font-semibold text-slate-800 dark:text-tppdarkwhite">
                                  {getAddressTypeName(addr.address_type)}
                                </span>
                                {addr.is_default && (
                                  <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 dark:text-tppdarkwhite/70 font-medium truncate">
                                {addr.line1}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-tppdarkwhite/40">
                                {addr.city}, {addr.state} {addr.zip_code}
                              </p>
                            </div>
                            {selectedAddress?.id === addr.id && (
                              <CheckCircle size={16} className="text-tpppink dark:text-tppdarkwhite flex-shrink-0 ml-2" />
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Address Modal - For 3+ addresses */}
                {showAddressList && addresses.length > 2 && (
                  <>
                    {/* Modal Backdrop */}
                    <div 
                      className="fixed inset-0 bg-black/50 z-50"
                      onClick={() => setShowAddressList(false)}
                    />
                    
                    {/* Modal Content */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="bg-white dark:bg-tppdarkgray rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-tppslate to-tppslate/90 dark:from-tppdark dark:to-tppdark/90 px-6 py-4 flex items-center justify-between rounded-t-lg">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <MapPin size={20} />
                            Select Delivery Address
                          </h3>
                          <button
                            onClick={() => setShowAddressList(false)}
                            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                          >
                            <ChevronUp size={20} />
                          </button>
                        </div>

                        {/* Add New Address Button */}
                        {onOpenAddressModal && (
                          <button
                            onClick={() => {
                              onOpenAddressModal();
                              setShowAddressList(false);
                            }}
                            className="m-4 mb-0 p-3 bg-tpppink/10 dark:bg-tppdarkwhite/10 border-2 border-tpppink dark:border-tppdarkwhite/30 rounded-lg flex items-center justify-center gap-2 hover:bg-tpppink dark:hover:bg-tppdarkwhite transition-colors text-tpppink dark:text-tppdarkwhite hover:text-white dark:hover:text-tppdark font-semibold"
                          >
                            <Plus size={16} />
                            <span className="text-sm">Add New Address</span>
                          </button>
                        )}

                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4">
                          {addresses.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-500 dark:text-tppdarkwhite/40">
                              No saved addresses
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {addresses.map((addr) => (
                                <button
                                  key={addr.id}
                                  onClick={() => handleAddressSelect(addr)}
                                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                                    selectedAddress?.id === addr.id 
                                      ? 'bg-tpppink/5 dark:bg-tppdarkwhite/5 border-tpppink dark:border-tppdarkwhite/40' 
                                      : 'border-slate-200 dark:border-tppdarkwhite/10 hover:border-slate-300 dark:hover:border-tppdarkwhite/20 hover:bg-slate-50 dark:hover:bg-tppdark/20'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        {getAddressIcon(addr.address_type)}
                                        <span className="text-sm font-semibold text-slate-800 dark:text-tppdarkwhite">
                                          {getAddressTypeName(addr.address_type)}
                                        </span>
                                        {addr.is_default && (
                                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                            Default
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-slate-700 dark:text-tppdarkwhite/80 font-medium mb-1">
                                        {addr.line1}
                                      </p>
                                      <p className="text-sm text-slate-600 dark:text-tppdarkwhite/60">
                                        {addr.line2 ? `${addr.line2}, ` : ''}
                                        {addr.city}, {addr.state} {addr.zip_code}
                                      </p>
                                    </div>
                                    {selectedAddress?.id === addr.id && (
                                      <CheckCircle size={20} className="text-tpppink dark:text-tppdarkwhite flex-shrink-0 ml-3" />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Show message if no address selected */}
            {!selectedAddress && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Please select a delivery address to see delivery estimates
                </p>
              </div>
            )}

            {/* Loading delivery info */}
            {selectedAddress && !deliveryData && !verifying && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-tppdark/30 border border-slate-200 dark:border-tppdarkwhite/10 rounded-lg">
                <Loader size={14} className="text-slate-600 dark:text-tppdarkwhite/50 animate-spin flex-shrink-0" />
                <p className="text-xs text-slate-700 dark:text-tppdarkwhite/60">Loading delivery information...</p>
              </div>
            )}

            {/* Verification Status */}
            {selectedAddress && (verifying || isRecalculating) && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-lg">
                <Loader size={14} className="text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">
                  {isRecalculating ? 'Recalculating delivery costs...' : 'Verifying delivery availability...'}
                </p>
              </div>
            )}

            {selectedAddress && verificationError && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg">
                <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">{verificationError}</p>
              </div>
            )}

            {/* Not serviceable state */}
            {selectedAddress && deliveryData && !deliveryData.serviceable && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-lg">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                    Cannot deliver to this address
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {deliveryData.reason || 'This PIN code is not serviceable. Please select a different address.'}
                  </p>
                </div>
              </div>
            )}

            {/* Location Info - "Delivering to..." */}
            {selectedAddress && deliveryData && deliveryData.serviceable && deliveryData.city && deliveryData.state && !verifying && (
              <div className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                isRecalculating 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/30' 
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/30'
              }`}>
                {isRecalculating ? (
                  <Loader size={18} className="text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
                ) : (
                  <MapPin size={18} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-semibold ${
                    isRecalculating ? 'text-blue-800 dark:text-blue-300' : 'text-green-800 dark:text-green-300'
                  }`}>
                    {isRecalculating ? 'Updating delivery costs...' : `Delivering to ${deliveryData.city}, ${deliveryData.state}`}
                  </p>
                  <p className={`text-xs ${isRecalculating ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
                    PIN: {selectedAddress.zip_code}
                  </p>
                </div>
              </div>
            )}

            {/* Delivery Features */}
            {selectedAddress && deliveryData && deliveryData.serviceable && deliveryData.features && (deliveryData.features.cod || deliveryData.features.prepaid) && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-tppdarkwhite/60 uppercase tracking-wide">
                  Available Payment Methods
                </p>
                <div className="flex flex-wrap gap-2">
                  {deliveryData.features.prepaid && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-tppdark/30 border border-slate-200 dark:border-tppdarkwhite/10 rounded-md">
                      <CheckCircle size={12} className="text-tppslate dark:text-tppdarkwhite/60" />
                      <span className="text-xs text-slate-700 dark:text-tppdarkwhite/70 font-medium">Prepaid</span>
                    </div>
                  )}
                  {deliveryData.features.cod && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30 rounded-md">
                      <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                      <span className="text-xs text-green-700 dark:text-green-400 font-medium">Cash on Delivery</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ==================== RIGHT COLUMN: DELIVERY OPTIONS ==================== */}
          <div>
            {/* Show delivery options only when serviceable */}
            {selectedAddress && deliveryData && deliveryData.serviceable && deliveryData.rawData?.deliveryOptions && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[16px] font-bold text-slate-800 dark:text-tppdarkwhite flex items-center gap-2">
                    Choose Delivery Speed
                  </h3>
                  
                  {/* Current Selected Mode Display */}
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-tppdark/50 px-3 py-1.5 rounded-md">
                    {selectedMode === 'express' ? (
                      <>
                        <Plane size={14} className="text-tpppink dark:text-tppdarkwhite/70" />
                        <span className="text-xs font-bold text-slate-800 dark:text-tppdarkwhite">Express</span>
                      </>
                    ) : (
                      <>
                        <Truck size={14} className="text-tppslate dark:text-tppdarkwhite/60" />
                        <span className="text-xs font-bold text-slate-800 dark:text-tppdarkwhite">Standard</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-tppdark/30 border border-slate-200 dark:border-tppdarkwhite/10 rounded-lg overflow-hidden">
                  <div className="divide-y divide-slate-200 dark:divide-tppdarkwhite/10">
                    {/* Standard/Surface Delivery */}
                    {deliveryData.rawData.deliveryOptions.surface && (
                      <button
                        onClick={() => handleModeChange('surface')}
                        disabled={isChangingMode}
                        className={`w-full p-4 flex items-center justify-between text-left transition-all ${
                          selectedMode === 'surface'
                            ? 'bg-tpppink/5 dark:bg-tppdarkwhite/5 border-l-4 border-tpppink dark:border-tppdarkwhite/50'
                            : 'hover:bg-slate-100 dark:hover:bg-tppdark/50 border-l-4 border-transparent'
                        } ${isChangingMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            selectedMode === 'surface' ? 'bg-tppslate/20 dark:bg-tppdarkwhite/10' : 'bg-slate-200 dark:bg-tppdark/50'
                          }`}>
                            <Truck size={18} className={selectedMode === 'surface' ? 'text-tppslate dark:text-tppdarkwhite/70' : 'text-slate-500 dark:text-tppdarkwhite/40'} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-slate-800 dark:text-tppdarkwhite">Standard Delivery</p>
                              <span className="text-xs font-bold text-green-600 dark:text-green-400">FREE</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-tppdarkwhite/40">Regular shipping</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="text-base font-bold text-tppslate dark:text-tppdarkwhite">
                              {deliveryData.rawData.deliveryOptions.surface.estimatedDays}{' '}
                              {deliveryData.rawData.deliveryOptions.surface.estimatedDays === 1 ? 'day' : 'days'}
                            </p>
                            {deliveryData.rawData.deliveryOptions.surface.deliveryDate && (
                              <p className="text-xs text-slate-500 dark:text-tppdarkwhite/40">
                                by {new Date(deliveryData.rawData.deliveryOptions.surface.deliveryDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Express Delivery */}
                    {deliveryData.rawData.deliveryOptions.express && (
                      <div 
                        className={`w-full transition-all ${
                          selectedMode === 'express'
                            ? 'bg-tpppink/5 dark:bg-tppdarkwhite/5 border-l-4'
                            : 'hover:bg-slate-100 dark:hover:bg-tppdark/50 border-l-4 border-transparent'
                        }`}
                        style={selectedMode === 'express' ? {
                          borderLeftColor: 'var(--color-tpppink, #d95669)',
                          borderLeftWidth: '4px',
                          borderLeftStyle: 'solid'
                        } : {}}
                      >
                        <button
                          onClick={() => handleModeChange('express')}
                          disabled={isChangingMode}
                          className={`w-full p-4 flex items-center justify-between text-left ${
                            isChangingMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              selectedMode === 'express' ? 'bg-tpppink/20 dark:bg-tppdarkwhite/10' : 'bg-slate-200 dark:bg-tppdark/50'
                            }`}>
                              <Plane size={18} className={selectedMode === 'express' ? 'text-tpppink dark:text-tppdarkwhite/70' : 'text-slate-500 dark:text-tppdarkwhite/40'} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-slate-800 dark:text-tppdarkwhite">Express Delivery</p>
                                {deliveryData.rawData.priceDifference?.formatted && (
                                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                    +{deliveryData.rawData.priceDifference.formatted}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-tppdarkwhite/40">Priority shipping</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="text-base font-bold text-tpppink dark:text-tppdarkwhite">
                                {deliveryData.rawData.deliveryOptions.express.estimatedDays}{' '}
                                {deliveryData.rawData.deliveryOptions.express.estimatedDays === 1 ? 'day' : 'days'}
                              </p>
                              {deliveryData.rawData.deliveryOptions.express.deliveryDate && (
                                <p className="text-xs text-slate-500 dark:text-tppdarkwhite/40">
                                  by {new Date(deliveryData.rawData.deliveryOptions.express.deliveryDate).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Extra Charges - OUTSIDE button but INSIDE border div */}
                        {deliveryData.rawData.deliveryOptions.express.extraCharge >= 0 && (
                          <div className="px-4 pb-4">
                            <div className="pt-3 border-t border-tpppink/20 dark:border-tppdarkwhite/10">
                              <div className="flex items-center gap-2">
                                <AlertCircle 
                                  size={12} 
                                  className="alert-icon text-yellow-600 dark:text-yellow-400 flex-shrink-0 cursor-help" 
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const tooltip = e.currentTarget.nextElementSibling;
                                    tooltip.style.left = `${rect.right - 256}px`; // 256px = w-64
                                    tooltip.style.top = `${rect.top - 8}px`;
                                    tooltip.classList.remove('hidden');
                                  }}
                                  onMouseLeave={(e) => {
                                    const tooltip = e.currentTarget.nextElementSibling;
                                    tooltip.classList.add('hidden');
                                  }}
                                />
                                {/* Tooltip - using fixed positioning to escape all parent constraints */}
                                <div className="tooltip fixed hidden w-64 p-2.5 bg-tppslate/100 dark:bg-tppdark text-white text-xs rounded-lg shadow-xl z-[99999] -translate-y-full pointer-events-none">
                                  <p className="font-inter leading-relaxed">
                                    <b>Delivery charges</b> and <b>express fees</b> are determined and applied directly by our logistics partner, <b>Delhivery</b>, based on <b>shipment weight and destination</b>.
                                  </p>
                                  {/* Tooltip arrow - pointing down from bottom right */}
                                  <div className="absolute top-full right-3 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                  <span className="font-semibold">Express delivery:</span>{' '}
                                  <span className="font-bold">{deliveryData.rawData.priceDifference.formatted}</span> extra charges apply
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Fallback if no delivery options */}
            {selectedAddress && deliveryData && deliveryData.serviceable && !deliveryData.rawData?.deliveryOptions && deliveryData.estimatedDays && (
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-tppdark/30 border border-slate-200 dark:border-tppdarkwhite/10 rounded-lg">
                <Calendar size={18} className="text-slate-600 dark:text-tppdarkwhite/50 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-tppdarkwhite mb-1">
                    Estimated Delivery: {deliveryData.estimatedDays} days
                  </p>
                  {deliveryData.deliveryDate && (
                    <p className="text-sm text-slate-700 dark:text-tppdarkwhite/70">
                      Expected by: {new Date(deliveryData.deliveryDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 dark:text-tppdarkwhite/50 mt-1">
                    Mode: {deliveryData.mode || 'Standard'}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailsCard;