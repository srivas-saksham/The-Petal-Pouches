// frontend/src/components/bundle-detail/FloatingSidebar/DeliverySection.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Calendar, ChevronDown, ChevronUp, Plus, Home, Briefcase, CheckCircle, Loader, AlertCircle, Plane } from 'lucide-react';
import { useUserAuth } from '../../../context/UserAuthContext';
import { getAddresses } from '../../../services/addressService';
import api from '../../../services/api';
import { saveDeliveryData, getDeliveryData, getStoredAddressId } from '../../../utils/deliveryStorage';
import BundleAddressModal from '../../bundle-detail/BundleAddressModal';

const DeliverySection = ({ bundleWeight = 99, isRecalculating = false }) => {
  const { isAuthenticated } = useUserAuth();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressList, setShowAddressList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [checkingPin, setCheckingPin] = useState(false);
  const [pinCheckResult, setPinCheckResult] = useState(null);
  const [pinError, setPinError] = useState(null);
  const [lastCheckedWeight, setLastCheckedWeight] = useState(null);
  const addressListRef = useRef(null);

  useEffect(() => {
    const storedData = getDeliveryData();
    if (!storedData) return;
    if (!isAuthenticated && storedData.guestPinCode) setPinCode(storedData.guestPinCode);
    if (storedData.deliveryCheck) setPinCheckResult(storedData.deliveryCheck);
  }, [isAuthenticated]);

  const checkPinDelivery = async (pin) => {
    if (!pin || pin.length !== 6) { setPinError('Please enter a valid 6-digit PIN code'); return; }
    setCheckingPin(true);
    setPinError(null);
    setPinCheckResult(null);
    try {
      const response = await api.get(`/api/delhivery/check/${pin}`, { params: { weight: bundleWeight } });
      if (response.data.success) {
        const data = response.data;
        if (data.serviceable) {
          const deliveryOptions = data.deliveryOptions || {};
          const bestOption = data.bestOption || deliveryOptions.surface || deliveryOptions.express;
          let estimatedDays = null, deliveryDate = null, mode = 'Surface';
          if (bestOption) { estimatedDays = bestOption.estimatedDays || bestOption.tat; deliveryDate = bestOption.expectedDeliveryDate || bestOption.expected_delivery_date; mode = bestOption.mode || 'Surface'; }
          else if (deliveryOptions.surface) { estimatedDays = deliveryOptions.surface.estimatedDays || deliveryOptions.surface.tat; deliveryDate = deliveryOptions.surface.deliveryDate; mode = 'Surface'; }
          else if (deliveryOptions.express) { estimatedDays = deliveryOptions.express.estimatedDays || deliveryOptions.express.tat; deliveryDate = deliveryOptions.express.deliveryDate; mode = 'Express'; }
          const result = { serviceable: true, city: data.location?.city, state: data.location?.state, estimatedDays, deliveryDate, mode, features: data.features || {}, rawData: data };
          setPinCheckResult(result);
          saveDeliveryData({ deliveryCheck: result, guestPinCode: !isAuthenticated ? pin : undefined, timestamp: Date.now() });
        } else {
          setPinCheckResult({ serviceable: false, reason: data.reason || 'Delivery not available for this PIN code' });
        }
      } else {
        setPinError(response.data.error || 'Failed to check delivery availability');
      }
    } catch (error) {
      setPinError(error.response?.data?.message || 'Failed to check delivery availability');
    } finally {
      setCheckingPin(false);
    }
  };

  useEffect(() => {
    if (selectedAddress?.zip_code) {
      const pin = selectedAddress.zip_code;
      if (pin.length === 6 && pin !== pinCode) {
        setPinCode(pin);
        checkPinDelivery(pin);
        saveDeliveryData({ selectedAddressId: selectedAddress.id, deliveryCheck: pinCheckResult });
      }
    }
  }, [selectedAddress, bundleWeight]);

  useEffect(() => {
    if (pinCode && pinCode.length === 6 && pinCheckResult && bundleWeight !== lastCheckedWeight) {
      setLastCheckedWeight(bundleWeight);
      checkPinDelivery(pinCode);
    }
  }, [bundleWeight]);

  useEffect(() => {
    if (isAuthenticated) fetchAddresses();
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const result = await getAddresses();
      if (result.success && result.data) {
        setAddresses(result.data);
        const storedId = getStoredAddressId();
        let toSelect = storedId ? result.data.find(a => a.id === storedId) : null;
        if (!toSelect) toSelect = result.data.find(a => a.is_default) || result.data[0] || null;
        if (toSelect) setSelectedAddress(toSelect);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowAddressList(false);
    saveDeliveryData({ selectedAddressId: address.id });
  };

  const handleModalSuccess = async (newAddress) => {
    await fetchAddresses();
    setShowAddressModal(false);
  };

  const getAddressIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'home': return <Home size={14} className="text-purple-600 dark:text-purple-400" />;
      case 'work': return <Briefcase size={14} className="text-blue-600 dark:text-blue-400" />;
      default: return <MapPin size={14} className="text-gray-600 dark:text-tppdarkwhite/50" />;
    }
  };

  const getAddressTypeName = (type) => type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Address';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addressListRef.current && !addressListRef.current.contains(event.target)) setShowAddressList(false);
    };
    if (showAddressList) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddressList]);

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-bold text-gray-800 dark:text-tppdarkwhite uppercase tracking-wide flex items-center gap-1.5">
        Delivery
        <Truck size={16} className="text-tpppink dark:text-tppdarkwhite" />
      </h3>

      {isAuthenticated ? (
        <div className="relative" ref={addressListRef}>
          {selectedAddress ? (
            <button
              onClick={() => setShowAddressList(!showAddressList)}
              className="w-full p-3 bg-white dark:bg-tppdark border-2 border-tpppink/20 dark:border-tppdarkwhite/20 rounded-lg text-left hover:border-tpppink dark:hover:border-tppdarkwhite transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getAddressIcon(selectedAddress.address_type)}
                    <span className="text-xs font-bold text-gray-800 dark:text-tppdarkwhite">{getAddressTypeName(selectedAddress.address_type)}</span>
                    {selectedAddress.is_default && (
                      <span className="text-xs bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark px-1.5 py-0.5 rounded-full font-semibold">Default</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 dark:text-tppdarkwhite/70 font-medium truncate">{selectedAddress.line1}</p>
                  <p className="text-xs text-gray-500 dark:text-tppdarkwhite/40">{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip_code}</p>
                </div>
                <div className="ml-2 flex-shrink-0">
                  {showAddressList ? <ChevronUp size={16} className="text-gray-600 dark:text-tppdarkwhite/50" /> : <ChevronDown size={16} className="text-gray-600 dark:text-tppdarkwhite/50" />}
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setShowAddressList(!showAddressList)}
              className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-tppdarkwhite/20 rounded-lg text-left hover:border-tpppink dark:hover:border-tppdarkwhite transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-tppdarkwhite/50">Select delivery address</span>
                {showAddressList ? <ChevronUp size={16} className="text-gray-600 dark:text-tppdarkwhite/50" /> : <ChevronDown size={16} className="text-gray-600 dark:text-tppdarkwhite/50" />}
              </div>
            </button>
          )}

          {showAddressList && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-tppdarkgray border-2 border-gray-200 dark:border-tppdarkwhite/10 rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
              <button
                onClick={() => { setShowAddressModal(true); setShowAddressList(false); }}
                className="w-full p-3 bg-tpppink/10 dark:bg-tppdarkwhite/10 border-b-2 border-gray-100 dark:border-tppdarkwhite/10 flex items-center gap-2 hover:bg-tpppink dark:hover:bg-tppdarkwhite transition-colors text-tpppink dark:text-tppdarkwhite hover:text-white dark:hover:text-tppdark font-semibold"
              >
                <Plus size={16} />
                <span className="text-sm">New Address</span>
              </button>
              {loading ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-tppdarkwhite/40">Loading addresses...</div>
              ) : addresses.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-tppdarkwhite/40">No saved addresses</div>
              ) : (
                addresses.map((addr) => (
                  <button key={addr.id} onClick={() => handleAddressSelect(addr)}
                    className={`w-full p-3 border-b last:border-b-0 dark:border-tppdarkwhite/10 text-left hover:bg-tppslate/20 dark:hover:bg-tppdarkwhite/5 transition-colors ${selectedAddress?.id === addr.id ? 'bg-tppslate/10 dark:bg-tppdarkwhite/5' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getAddressIcon(addr.address_type)}
                          <span className="text-xs font-semibold text-gray-800 dark:text-tppdarkwhite">{getAddressTypeName(addr.address_type)}</span>
                          {addr.is_default && <span className="text-xs bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark px-1.5 py-0.5 rounded-full font-semibold">Default</span>}
                        </div>
                        <p className="text-xs text-gray-700 dark:text-tppdarkwhite/70 font-medium truncate">{addr.line1}</p>
                        <p className="text-xs text-gray-500 dark:text-tppdarkwhite/40">{addr.city}, {addr.state} {addr.zip_code}</p>
                      </div>
                      {selectedAddress?.id === addr.id && <CheckCircle size={16} className="text-tpppink dark:text-tppdarkwhite flex-shrink-0 ml-2" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700 dark:text-tppdarkwhite/70 flex items-center gap-1">
            <MapPin size={12} />
            Check Delivery Availability
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter PIN Code"
              value={pinCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 6) { setPinCode(value); setPinCheckResult(null); setPinError(null); }
              }}
              onKeyDown={(e) => e.key === 'Enter' && checkPinDelivery(pinCode)}
              maxLength={6}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-tppdarkwhite/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tpppink dark:focus:ring-tppdarkwhite focus:border-transparent bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite placeholder:text-gray-400 dark:placeholder:text-tppdarkwhite/30"
            />
            <button
              onClick={() => checkPinDelivery(pinCode)}
              disabled={pinCode.length !== 6 || checkingPin}
              className="px-4 py-2 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark rounded-lg font-medium hover:bg-tppslate dark:hover:bg-tppdarkwhite/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              {checkingPin ? <Loader size={14} className="animate-spin" /> : 'Check'}
            </button>
          </div>
        </div>
      )}

      {checkingPin && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/30 rounded-lg">
          <Loader size={16} className="text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
          <div className="text-xs text-blue-700 dark:text-blue-400">
            <p className="font-semibold">Checking delivery availability...</p>
          </div>
        </div>
      )}

      {pinError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/30 rounded-lg">
          <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-700 dark:text-red-400">
            <p className="font-semibold">Error</p>
            <p>{pinError}</p>
          </div>
        </div>
      )}

      {pinCheckResult && !checkingPin && (
        <div>
          {pinCheckResult.serviceable ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-500/30 rounded-lg">
                <CheckCircle size={14} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400">Delivery Available</p>
                  {pinCheckResult.city && pinCheckResult.state && (
                    <p className="text-xs text-green-600 dark:text-green-400/70">{pinCheckResult.city}, {pinCheckResult.state}</p>
                  )}
                </div>
              </div>

              {(pinCheckResult.rawData?.deliveryOptions?.express || pinCheckResult.rawData?.deliveryOptions?.surface) ? (
                <div className="bg-white dark:bg-tppdark border border-gray-200 dark:border-tppdarkwhite/10 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-tppdarkwhite/5 px-3 py-2 border-b border-gray-200 dark:border-tppdarkwhite/10">
                    <p className="text-xs font-semibold text-gray-700 dark:text-tppdarkwhite/70">Estimated Delivery</p>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-tppdarkwhite/10">
                    {pinCheckResult.rawData?.deliveryOptions?.surface && (
                      <div className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-tppdarkwhite/5 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded-full flex items-center justify-center">
                            <Truck size={14} className="text-tppslate dark:text-tppdarkwhite/60" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-tppdarkwhite">Standard</p>
                            <p className="text-xs text-gray-500 dark:text-tppdarkwhite/40">Regular delivery</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-tppslate dark:text-tppdarkwhite">
                            {pinCheckResult.rawData.deliveryOptions.surface.estimatedDays} {pinCheckResult.rawData.deliveryOptions.surface.estimatedDays === 1 ? 'day' : 'days'}
                          </p>
                          {pinCheckResult.rawData.deliveryOptions.surface.deliveryDate && (
                            <p className="text-xs text-gray-500 dark:text-tppdarkwhite/40">
                              by {new Date(pinCheckResult.rawData.deliveryOptions.surface.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {pinCheckResult.rawData?.deliveryOptions?.express && (
                      <div className="p-3 bg-pink-50/50 dark:bg-tppdarkwhite/5 hover:bg-pink-50 dark:hover:bg-tppdarkwhite/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-tpppink/20 dark:bg-tppdarkwhite/20 rounded-full flex items-center justify-center">
                              <Plane size={16} className="text-tpppink dark:text-tppdarkwhite" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 dark:text-tppdarkwhite">Express</p>
                              <p className="text-xs text-gray-500 dark:text-tppdarkwhite/40">Priority delivery</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-tpppink dark:text-tppdarkwhite">
                              {pinCheckResult.rawData.deliveryOptions.express.estimatedDays} {pinCheckResult.rawData.deliveryOptions.express.estimatedDays === 1 ? 'day' : 'days'}
                            </p>
                            {pinCheckResult.rawData.deliveryOptions.express.deliveryDate && (
                              <p className="text-xs text-gray-500 dark:text-tppdarkwhite/40">
                                by {new Date(pinCheckResult.rawData.deliveryOptions.express.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                            )}
                          </div>
                        </div>
                        {pinCheckResult.rawData.deliveryOptions.express.extraCharge >= 0 && (
                          <div className="mt-2 pt-2 border-t border-pink-100 dark:border-tppdarkwhite/20">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 dark:text-tppdarkwhite/50">Express charges:</span>
                              <span className="font-semibold text-tpppink dark:text-tppdarkwhite">{pinCheckResult.rawData.deliveryOptions.express.extraChargeFormatted}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {pinCheckResult.rawData?.priceDifference && (
                    <div className="font-inter bg-yellow-50 dark:bg-yellow-900/10 border-t border-yellow-100 dark:border-yellow-500/20 px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="relative">
                          <AlertCircle size={12} className="alert-icon text-yellow-600 dark:text-yellow-400 flex-shrink-0 cursor-help"
                            onMouseEnter={(e) => {
                              const tooltip = e.currentTarget.nextElementSibling;
                              tooltip.classList.remove('hidden');
                            }}
                            onMouseLeave={(e) => {
                              const tooltip = e.currentTarget.nextElementSibling;
                              tooltip.classList.add('hidden');
                            }}
                          />
                          <div className="tooltip fixed hidden w-64 p-2.5 bg-tppslate/100 text-white text-xs rounded-lg shadow-xl z-[99999] -translate-y-full pointer-events-none">
                            <p className="leading-relaxed"><b>Delivery charges</b> and <b>express fees</b> are determined by our logistics partner, <b>Delhivery</b>, based on <b>shipment weight and destination</b>.</p>
                            <div className="absolute top-full right-3 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400">
                          <span className="font-semibold">Express delivery:</span>{' '}
                          <span className="font-bold">{pinCheckResult.rawData.priceDifference.formatted}</span> extra charges apply
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Calendar size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-700 dark:text-blue-400">
                      <p className="font-semibold mb-1">Delivery Available</p>
                      <p>Standard delivery: 5-7 business days</p>
                    </div>
                  </div>
                </div>
              )}

              {pinCheckResult.features && (pinCheckResult.features.cod || pinCheckResult.features.prepaid) && (
                <div className="flex flex-wrap gap-2">
                  {pinCheckResult.features.cod && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-500/30 rounded text-xs text-green-700 dark:text-green-400 font-medium">
                      <CheckCircle size={10} />
                      <span>COD Currently Not Available</span>
                    </div>
                  )}
                  {pinCheckResult.features.prepaid && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/30 rounded text-xs text-blue-700 dark:text-blue-400 font-medium">
                      <CheckCircle size={10} />
                      <span>Prepaid</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/30 rounded-lg">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-700 dark:text-red-400">
                <p className="font-semibold">Delivery Not Available</p>
                <p>{pinCheckResult.reason || 'This PIN code is not serviceable'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {(!pinCheckResult || pinCheckResult.serviceable) && (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-500/30 rounded-lg p-2.5 flex items-center gap-2">
          <div>
            <p className="text-xs font-bold text-green-700 dark:text-green-400">FREE STANDARD SHIPPING</p>
            <p className="text-xs text-green-600 dark:text-green-400/70">On all PREPAID orders</p>
          </div>
        </div>
      )}

      <BundleAddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default DeliverySection;