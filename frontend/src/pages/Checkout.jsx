// frontend/src/pages/Checkout.jsx - SINGLE PAGE FLOW

import React, { useState, useEffect, useRef , useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, AlertCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useUserAuth } from '../context/UserAuthContext';
import { useToast } from '../hooks/useToast';
import CheckoutCart from '../components/checkout/CheckoutCart';
import CheckoutSummary from '../components/checkout/CheckoutSummary';
import CheckoutForm from '../components/checkout/CheckoutForm';
import DeliveryDetailsCard from '../components/checkout/DeliveryDetailsCard';
import bundleService from '../services/bundleService';
import { getAddresses } from '../services/addressService';
import { createOrder } from '../services/orderService';
import { formatBundlePrice } from '../utils/bundleHelpers';
import { getStoredAddressId, saveDeliveryData, getDeliveryData } from '../utils/deliveryStorage';

/**
 * Checkout Page - Single Page Flow
 * All checkout elements on one page:
 * - Cart items (left)
 * - Delivery details (left, below cart)
 * - Order summary with Place Order button (right)
 * 
 * ✅ No step management - everything visible at once
 * ✅ Silent refresh support - NO page reload on quantity changes
 * ✅ Full refresh on item removal
 * ✅ All delivery-related functionality managed here
 * ✅ Modal-based address form controlled by parent
 * ✅ No tax, no base shipping - only express charges apply
 */
const Checkout = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated } = useUserAuth();
  const { cartItems, cartTotals, loading: cartLoading, refreshCart } = useCart();

  const [bundles, setBundles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [pageInitialized, setPageInitialized] = useState(false);
  const [totalCartWeight, setTotalCartWeight] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState('prepaid'); // or 'online'/'prepaid'
  // ✅ NEW: Debounced weight tracking
  const [pendingCartWeight, setPendingCartWeight] = useState(null);
  const deliveryDebounceTimerRef = useRef(null);

  // ✅ Modal state for address form
  const [showAddressModal, setShowAddressModal] = useState(false);

  // ✅ Delivery state management
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [deliveryModeData, setDeliveryModeData] = useState(null);
  const [expressCharge, setExpressCharge] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  // ✅ Fetch addresses and auto-select from localStorage
  useEffect(() => {
    const fetchAddressesData = async () => {
      try {
        const result = await getAddresses();
        if (result.success) {
          setAddresses(result.data);
          
          // Only run auto-select once
          if (initialLoadComplete) {
            return;
          }

          console.log('🔍 [Checkout] Loading stored address from localStorage');
          
          // Try to restore address from localStorage first
          const storedAddressId = getStoredAddressId();
          let addressToSelect = null;

          if (storedAddressId) {
            addressToSelect = result.data.find(a => a.id === storedAddressId);
            if (addressToSelect) {
              console.log('✅ [Checkout] Restored address from localStorage:', addressToSelect);
            } else {
              console.log('⚠️ [Checkout] Stored address ID not found in address list');
            }
          }

          // Fallback to default address
          if (!addressToSelect) {
            const defaultAddr = result.data.find(a => a.is_default);
            if (defaultAddr) {
              addressToSelect = defaultAddr;
              console.log('✅ [Checkout] Selected default address:', defaultAddr);
            } else if (result.data.length > 0) {
              addressToSelect = result.data[0];
              console.log('✅ [Checkout] Selected first address:', result.data[0]);
            }
          }

          if (addressToSelect) {
            setSelectedAddress(addressToSelect);
          }

          setInitialLoadComplete(true);
        }
      } catch (err) {
        console.error('❌ Error fetching addresses:', err);
      }
    };

    if (isAuthenticated) {
      fetchAddressesData();
    }
  }, [isAuthenticated, initialLoadComplete]);

  // ✅ Load delivery data from localStorage on mount
  useEffect(() => {
    const loadStoredDeliveryData = () => {
      const storedData = getDeliveryData();
      if (!storedData) {
        console.log('📭 [Checkout] No stored delivery data');
        return;
      }

      console.log('📦 [Checkout] Found stored delivery data:', storedData);

      // Load delivery check data
      if (storedData.deliveryCheck) {
        setDeliveryInfo(storedData.deliveryCheck);
      }

      // Load delivery mode data
      if (storedData.deliveryModeData) {
        setDeliveryModeData(storedData.deliveryModeData);
        setExpressCharge(storedData.deliveryModeData.extraCharge || 0);
      }
    };

    loadStoredDeliveryData();
  }, []);

  // Fetch bundle details for all cart items
  useEffect(() => {
    const fetchBundleDetails = async () => {
      if (!cartItems || cartItems.length === 0) {
        setLoading(false);
        setPageInitialized(true);
        setTotalCartWeight(1000);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const bundlePromises = cartItems
          .filter(item => item.bundle_id)
          .map(item => bundleService.getBundleDetails(item.bundle_id));

        const responses = await Promise.all(bundlePromises);
        
        const bundlesMap = {};
        cartItems.forEach((item, index) => {
          if (item.bundle_id && responses[index]) {
            bundlesMap[item.bundle_id] = responses[index].data;
          }
        });

        setBundles(bundlesMap);
        console.log('✅ Bundle details fetched:', bundlesMap);
        
        // ✅ WEIGHT-BASED: Calculate total weight from cart items
        const totalWeight = cartItems.reduce((sum, item) => {
          return sum + (item.quantity * 1000); // 1000g per bundle
        }, 0);
        setTotalCartWeight(totalWeight);
        console.log(`📦 [Checkout] Total cart weight calculated: ${totalWeight}g (${totalWeight/1000}kg)`);
        
      } catch (err) {
        console.error('❌ Error fetching bundles:', err);
        setError('Failed to load bundle details');
      } finally {
        setLoading(false);
        setPageInitialized(true);
      }
    };

    fetchBundleDetails();
  }, [cartItems]);

  // ✅ FIX: Also trigger delivery refresh when weight updates
  useEffect(() => {
    // Skip on initial load or if bundles not loaded yet
    if (!pageInitialized || Object.keys(bundles).length === 0) {
      return;
    }

    if (cartItems && cartItems.length > 0) {
      const newWeight = cartItems.reduce((sum, item) => sum + (item.quantity * 1000), 0);
      
      // Only update if weight actually changed
      if (newWeight !== totalCartWeight) {
        console.log(`📦 [Checkout] Weight changed: ${totalCartWeight}g → ${newWeight}g - debouncing delivery recalculation...`);
        
        // Set pending weight immediately for UI feedback
        setPendingCartWeight(newWeight);
        
        // Clear existing timer
        if (deliveryDebounceTimerRef.current) {
          clearTimeout(deliveryDebounceTimerRef.current);
        }
        
        // Set new timer - sync with cart debounce (800ms)
        deliveryDebounceTimerRef.current = setTimeout(() => {
          console.log(`✅ [Checkout] Delivery weight synced: ${newWeight}g`);
          setTotalCartWeight(newWeight);
          setPendingCartWeight(null);
          
          // ✅ FIX: Force delivery recalculation with new weight
          if (selectedAddress?.zip_code) {
            console.log(`🔄 [Checkout] Triggering delivery refresh with new weight: ${newWeight}g`);
            // Trigger delivery update by setting a flag or calling the handler
            handleDeliveryWeightChange(newWeight);
          }
        }, 800);
      }
    }
  }, [cartItems, pageInitialized, bundles, totalCartWeight, selectedAddress]);

  // Redirect to shop if no cart items (only after initial load)
  useEffect(() => {
    if (pageInitialized && !cartLoading && cartItems.length === 0) {
      navigate('/shop');
    }
  }, [pageInitialized, cartLoading, cartItems.length, navigate]);

  const handleGoBack = () => {
    navigate('/shop');
  };

  // ✅ ENHANCED: Debounced cart update with weight tracking
  const handleCartUpdate = useCallback(async (silentRefresh = false) => {
    console.log(`🔄 [Checkout] Cart update requested: ${silentRefresh ? 'SILENT (summary only)' : 'FULL (entire cart)'}`);
    
    // ✅ ALWAYS use silent refresh - no page reload!
    await refreshCart(true);
    
    if (silentRefresh) {
      console.log('✅ [Checkout] Silent refresh complete - summary updated');
    } else {
      console.log('✅ [Checkout] Full refresh complete (but still silent)');
    }
  }, [refreshCart]);

  // ✅ Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (deliveryDebounceTimerRef.current) {
        clearTimeout(deliveryDebounceTimerRef.current);
      }
    };
  }, []);

  // ✅ Handle address selection (from DeliveryDetailsCard or modal)
  const handleAddressSelect = async (address) => {
    console.log('📍 [Checkout] Address selected:', address);
    setSelectedAddress(address);
    
    // Refresh addresses list to include the new address
    try {
      const result = await getAddresses();
      if (result.success) {
        setAddresses(result.data);
      }
    } catch (err) {
      console.error('❌ Error refreshing addresses:', err);
    }
  };

  // ✅ Handle "Add New Address" click from DeliveryDetailsCard
  const handleOpenAddressModal = () => {
    console.log('➕ [Checkout] Opening address modal');
    setShowAddressModal(true);
  };

  // ✅ Handle modal close
  const handleCloseAddressModal = () => {
    console.log('✖️ [Checkout] Closing address modal');
    setShowAddressModal(false);
  };

  // ✅ Handle delivery updates from DeliveryDetailsCard
  const handleDeliveryUpdate = useCallback((updatedDeliveryData) => {
    console.log('🔄 [Checkout] Delivery data updated:', updatedDeliveryData);
    setDeliveryInfo(updatedDeliveryData);
    
    // Update localStorage with fresh data
    const currentStoredData = getDeliveryData() || {};
    saveDeliveryData({
      ...currentStoredData,
      deliveryCheck: updatedDeliveryData,
      timestamp: Date.now()
    });
  }, []);

  // ✅ Handle delivery mode changes
  const handleDeliveryModeChange = useCallback((modeData) => {
    console.log('🚚 [Checkout] Delivery mode changed:', modeData);
    setDeliveryModeData(modeData);
    setExpressCharge(modeData.extraCharge || 0);

    // Save to localStorage
    const currentStoredData = getDeliveryData() || {};
    saveDeliveryData({
      ...currentStoredData,
      selectedDeliveryMode: modeData.mode,
      deliveryModeData: modeData,
      timestamp: Date.now()
    });
  }, []);

  // ✅ NEW: Handler to refresh delivery when weight changes
  const handleDeliveryWeightChange = useCallback((newWeight) => {
    console.log(`🔄 [Checkout] Delivery weight change detected: ${newWeight}g`);
    
    // Force DeliveryDetailsCard to recalculate with new weight
    // This will be picked up by DeliveryDetailsCard's cartWeight prop change
    
    // Optional: Clear delivery metadata to force fresh calculation
    const currentStoredData = getDeliveryData() || {};
    saveDeliveryData({
      ...currentStoredData,
      // Keep selected mode but clear cached delivery check
      deliveryCheck: null,
      timestamp: Date.now()
    });
    
    console.log(`✅ [Checkout] Delivery data cleared for recalculation`);
  }, []);

  // ⭐ Enhanced Place Order with delivery metadata
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setPlacingOrder(true);

      // ✅ Get ALL delivery data from localStorage
      const storedData = getDeliveryData();
      const deliveryMode = deliveryModeData?.mode || storedData?.selectedDeliveryMode || 'surface';
      const finalDeliveryModeData = deliveryModeData || storedData?.deliveryModeData;

      console.log('📦 [Checkout] Complete delivery metadata:', {
        mode: deliveryMode,
        data: finalDeliveryModeData,
        address: selectedAddress
      });

      // ✅ Calculate order total correctly (no tax, no base shipping)
      const subtotal = cartItems.reduce((total, item) => {
        const bundle = bundles[item.bundle_id];
        return total + (bundle?.price || 0) * item.quantity;
      }, 0);
      
      const orderTotal = subtotal + expressCharge - discount;

      // ✅ Create order with comprehensive delivery metadata
      const orderData = {
        address_id: selectedAddress.id,
        payment_method: paymentMethod,
        notes: '',
        gift_wrap: false,
        gift_message: null,
        // ✅ COMPLETE delivery metadata
        delivery_metadata: {
          mode: deliveryMode,
          estimated_days: finalDeliveryModeData?.estimatedDays,
          expected_delivery_date: finalDeliveryModeData?.deliveryDate || finalDeliveryModeData?.expectedDeliveryDate,
          express_charge: expressCharge,
          delivery_option: finalDeliveryModeData,  // ✅ Full option details
          pincode: selectedAddress.zip_code,
          city: selectedAddress.city,
          state: selectedAddress.state,
          calculated_at: new Date().toISOString()
        }
      };

      const response = await createOrder(orderData);

      if (response.success) {
        const orderId = response.data?.order?.id;
        
        // ✅ Save comprehensive metadata for OrderSuccess page
        const orderMetadata = {
          orderId: orderId,
          deliveryMode: deliveryMode,
          deliveryModeData: finalDeliveryModeData,
          selectedAddress: selectedAddress,  // ✅ Also save address
          orderTotals: {
            subtotal,
            expressCharge,
            discount,
            total: orderTotal
          },
          timestamp: Date.now()
        };
        
        localStorage.setItem('tpp_last_order', JSON.stringify(orderMetadata));
        
        navigate(`/order-success/${orderId}`);
      }
    } catch (error) {
      console.error('❌ Error placing order:', error);
      
      if (error.response?.data?.code === 'INSUFFICIENT_STOCK') {
        toast.error('Some items are out of stock. Please update your cart.');
      } else if (error.response?.data?.code === 'CART_EMPTY') {
        toast.error('Your cart is empty');
      } else {
        toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // ✅ ONLY show loading on INITIAL page load
  if (!pageInitialized && (cartLoading || loading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-tpppink animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50"
      style={{
        backgroundImage: 'url(/assets/doodle_bg_pink.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Shop
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-medium">Error loading checkout</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items + Delivery Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <CheckoutCart
              cartItems={cartItems}
              bundles={bundles}
              onItemUpdate={handleCartUpdate}
            />
            {console.log('🔍 [Checkout Render] Current totalCartWeight:', totalCartWeight)}
            {/* ✅ Delivery Details Card - Below Cart Items */}
            <DeliveryDetailsCard 
              selectedAddress={selectedAddress}
              onAddressSelect={handleAddressSelect}
              addresses={addresses}
              onDeliveryUpdate={handleDeliveryUpdate}
              onOpenAddressModal={handleOpenAddressModal}
              onDeliveryModeChange={handleDeliveryModeChange}
              cartWeight={totalCartWeight}
              isRecalculating={pendingCartWeight !== null}
            />
          </div>

          {/* Right Column - Order Summary with Place Order */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CheckoutSummary
                cartItems={cartItems}
                bundles={bundles}
                promoCode={promoCode}
                onPromoCodeChange={setPromoCode}
                discount={discount}
                onDiscountChange={setDiscount}
                selectedAddress={selectedAddress}
                onPlaceOrder={handlePlaceOrder}
                placingOrder={placingOrder}
                expressCharge={expressCharge}
                deliveryMode={deliveryModeData?.mode || 'surface'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Address Form Modal */}
      <CheckoutForm
        showModal={showAddressModal}
        onCloseModal={handleCloseAddressModal}
        onAddressSelect={handleAddressSelect}
      />
    </div>
  );
};

export default Checkout;