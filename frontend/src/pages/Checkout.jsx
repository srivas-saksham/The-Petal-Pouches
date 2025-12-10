// frontend/src/pages/Checkout.jsx - FIXED: Address object instead of ID

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, AlertCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useUserAuth } from '../context/UserAuthContext';
import { useToast } from '../hooks/useToast';
import CheckoutCart from '../components/checkout/CheckoutCart';
import CheckoutSummary from '../components/checkout/CheckoutSummary';
import CheckoutForm from '../components/checkout/CheckoutForm';
import bundleService from '../services/bundleService';
import { getAddresses } from '../services/addressService';
import { createOrder } from '../services/orderService';
import { formatBundlePrice } from '../utils/bundleHelpers';
import { getStoredAddressId } from '../utils/deliveryStorage';

/**
 * Checkout Page - Main component
 * Displays cart items on left, price breakdown on right
 * Fetches bundle details for all cart items
 * Handles order placement
 * ✅ FIXED: Stores full address object, not just ID
 */
const Checkout = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated } = useUserAuth();
  const { cartItems, cartTotals, loading: cartLoading, refreshCart } = useCart();

  const [bundles, setBundles] = useState({}); // { bundleId: bundleData }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null); // ✅ FIXED: Now stores full address object
  const [addresses, setAddresses] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [currentStep, setCurrentStep] = useState('review'); // review -> shipping -> payment
  const [placingOrder, setPlacingOrder] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  // ✅ FIXED: Fetch addresses and auto-select from localStorage
  useEffect(() => {
    const fetchAddressesData = async () => {
      try {
        const result = await getAddresses();
        if (result.success) {
          setAddresses(result.data);
          
          // ✅ Try to restore address from localStorage first
          const storedAddressId = getStoredAddressId();
          let addressToSelect = null;

          if (storedAddressId) {
            addressToSelect = result.data.find(a => a.id === storedAddressId);
            if (addressToSelect) {
              console.log('✅ [Checkout] Restored address from localStorage:', addressToSelect);
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
            setSelectedAddress(addressToSelect); // ✅ Store full object
          }
        }
      } catch (err) {
        console.error('❌ Error fetching addresses:', err);
      }
    };

    if (isAuthenticated) {
      fetchAddressesData();
    }
  }, [isAuthenticated]);

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

  // Handle back button
  const handleGoBack = () => {
    navigate('/shop');
  };

  // Handle step changes
  const handleNextStep = (step) => {
    setCurrentStep(step);
  };

  // Handle quantity changes without full refresh
  const handleQuantityChange = (cartItemId, newQuantity) => {
    console.log(`📦 Quantity changed for ${cartItemId}: ${newQuantity}`);
  };

  // ✅ FIXED: Handle address selection - receives full address object
  const handleAddressSelect = (address) => {
    console.log('📍 [Checkout] Address selected:', address);
    setSelectedAddress(address); // Store full object
  };

  // ⭐ Handle Place Order
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

      // Create order with address ID
      const orderData = {
        address_id: selectedAddress.id, // ✅ Use address.id from full object
        payment_method: 'cod',
        notes: '',
        gift_wrap: false,
        gift_message: null
      };

      console.log('📦 Placing order with data:', orderData);

      const response = await createOrder(orderData);

      if (response.success) {
        const orderId = response.data?.order?.id;
        
        console.log('✅ Order placed successfully:', orderId);
        
        // Show success toast
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
        toast.error('Failed to place order. Please try again.');
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Redirect happening in effect
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
    <div className="min-h-screen bg-gray-50">
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
          {/* Left Column - Cart Items (2/3 width) */}
          <div className="lg:col-span-2">
            <CheckoutCart
              cartItems={cartItems}
              bundles={bundles}
              onItemUpdate={refreshCart}
              onQuantityChange={handleQuantityChange}
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

          {/* Right Column - Order Summary (1/3 width) */}
          <div className="lg:col-span-1">
            <CheckoutSummary
              cartItems={cartItems}
              bundles={bundles}
              cartTotals={cartTotals}
              promoCode={promoCode}
              onPromoCodeChange={setPromoCode}
              discount={discount}
              onDiscountChange={setDiscount}
              selectedAddress={selectedAddress} // ✅ Pass full address object
              onAddressSelect={handleAddressSelect} // ✅ Updated callback
              addresses={addresses}
              currentStep={currentStep}
              onStepChange={handleNextStep}
              user={user}
              onPlaceOrder={handlePlaceOrder}
              placingOrder={placingOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;