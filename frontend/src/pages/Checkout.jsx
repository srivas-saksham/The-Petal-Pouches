// frontend/src/pages/Checkout.jsx - WITH DELIVERY DETAILS CARD BELOW CART

import React, { useState, useEffect } from 'react';
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
 * Checkout Page - Main component
 * Displays cart items on left, price breakdown on right
 * DeliveryDetailsCard positioned below cart items
 * Fetches bundle details for all cart items
 * Handles order placement with delivery mode metadata
 * ✅ All delivery-related functionality managed here
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
  const [currentStep, setCurrentStep] = useState('review');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

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
      } catch (err) {
        console.error('❌ Error fetching bundles:', err);
        setError('Failed to load bundle details');
      } finally {
        setLoading(false);
      }
    };

    fetchBundleDetails();
  }, [cartItems]);

  // Redirect to shop if no cart items
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      navigate('/shop');
    }
  }, [cartLoading, cartItems.length, navigate]);

  const handleGoBack = () => {
    navigate('/shop');
  };

  const handleNextStep = (step) => {
    setCurrentStep(step);
  };

  const handleQuantityChange = (cartItemId, newQuantity) => {
    console.log(`📦 Quantity changed for ${cartItemId}: ${newQuantity}`);
  };

  const handleAddressSelect = (address) => {
    console.log('📍 [Checkout] Address selected:', address);
    setSelectedAddress(address);
  };

  // ✅ Handle delivery updates from DeliveryDetailsCard
  const handleDeliveryUpdate = (updatedDeliveryData) => {
    console.log('🔄 [Checkout] Delivery data updated:', updatedDeliveryData);
    setDeliveryInfo(updatedDeliveryData);
    
    // Update localStorage with fresh data
    const currentStoredData = getDeliveryData() || {};
    saveDeliveryData({
      ...currentStoredData,
      deliveryCheck: updatedDeliveryData,
      timestamp: Date.now()
    });
  };

  // ✅ Handle delivery mode changes from DeliveryDetailsCard
  const handleDeliveryModeChange = (modeData) => {
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
  };

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

      // ✅ Get delivery mode data from state or localStorage
      const storedData = getDeliveryData();
      const deliveryMode = deliveryModeData?.mode || storedData?.selectedDeliveryMode || 'surface';
      const finalDeliveryModeData = deliveryModeData || storedData?.deliveryModeData;

      console.log('📦 [Checkout] Delivery metadata:', {
        mode: deliveryMode,
        data: finalDeliveryModeData
      });

      // Create order with address ID and delivery metadata
      const orderData = {
        address_id: selectedAddress.id,
        payment_method: 'cod',
        notes: '',
        gift_wrap: false,
        gift_message: null,
        // ✅ Add delivery metadata to order
        delivery_metadata: {
          mode: deliveryMode,
          estimated_days: finalDeliveryModeData?.estimatedDays,
          expected_delivery_date: finalDeliveryModeData?.deliveryDate || finalDeliveryModeData?.expectedDeliveryDate,
          express_charge: finalDeliveryModeData?.extraCharge || 0
        }
      };

      console.log('📦 [Checkout] Placing order with data:', orderData);

      const response = await createOrder(orderData);

      if (response.success) {
        const orderId = response.data?.order?.id;
        
        console.log('✅ Order placed successfully:', orderId);
        
        // Save order metadata to localStorage for OrderSuccess page
        const orderMetadata = {
          orderId: orderId,
          deliveryMode: deliveryMode,
          deliveryModeData: finalDeliveryModeData,
          timestamp: Date.now()
        };
        
        localStorage.setItem('tpp_last_order', JSON.stringify(orderMetadata));
        console.log('💾 [Checkout] Saved order metadata for success page');
        
        toast.success('Order placed successfully!');
        
        // Refresh cart (will be empty now)
        await refreshCart();
        
        // Redirect to success page
        if (orderId) {
          navigate(`/order-success/${orderId}`);
        } else {
          console.error('❌ Order ID not found in response');
          toast.error('Order placed but could not get order ID');
          navigate('/user/orders');
        }
      } else {
        toast.error(response.message || 'Failed to place order');
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

  if (cartLoading || loading) {
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
        backgroundImage: 'url(/assets/doodle_bg.png)',
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
              onItemUpdate={refreshCart}
              onQuantityChange={handleQuantityChange}
            />

            {/* ✅ Delivery Details Card - Below Cart Items */}
            <DeliveryDetailsCard 
              selectedAddress={selectedAddress}
              onAddressSelect={handleAddressSelect}
              addresses={addresses}
              onDeliveryUpdate={handleDeliveryUpdate}
              onStepChange={handleNextStep}
              onDeliveryModeChange={handleDeliveryModeChange}
            />

            {/* Shipping Form */}
            {currentStep === 'shipping' && (
              <div className="mt-8">
                <CheckoutForm
                  onAddressSelect={handleAddressSelect}
                  onNext={() => handleNextStep('payment')}
                />
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <CheckoutSummary
              cartItems={cartItems}
              bundles={bundles}
              cartTotals={cartTotals}
              promoCode={promoCode}
              onPromoCodeChange={setPromoCode}
              discount={discount}
              onDiscountChange={setDiscount}
              selectedAddress={selectedAddress}
              currentStep={currentStep}
              onStepChange={handleNextStep}
              onPlaceOrder={handlePlaceOrder}
              placingOrder={placingOrder}
              expressCharge={expressCharge}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;