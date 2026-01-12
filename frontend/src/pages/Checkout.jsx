// frontend/src/pages/Checkout.jsx - FIXED VERSION

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, AlertCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useUserAuth } from '../context/UserAuthContext';
import { useToast } from '../hooks/useToast';
import { useRazorpay } from '../hooks/useRazorpay';
import CommonHeader from '../components/common/CommonHeader';
import CheckoutCart from '../components/checkout/CheckoutCart';
import CheckoutSummary from '../components/checkout/CheckoutSummary';
import CheckoutForm from '../components/checkout/CheckoutForm';
import DeliveryDetailsCard from '../components/checkout/DeliveryDetailsCard';
import bundleService from '../services/bundleService';
import { getAddresses } from '../services/addressService';
import { formatBundlePrice } from '../utils/bundleHelpers';
import { getStoredAddressId, saveDeliveryData, getDeliveryData } from '../utils/deliveryStorage';

const Checkout = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated } = useUserAuth();
  const { cartItems, cartTotals, loading: cartLoading, refreshCart } = useCart();
  
  const { 
    initiatePayment, 
    isProcessing: paymentProcessing,
    error: paymentError,  // Still track error, but don't use in useEffect
    initializeRazorpay 
  } = useRazorpay();

  const [bundles, setBundles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [pageInitialized, setPageInitialized] = useState(false);
  const [totalCartWeight, setTotalCartWeight] = useState(1000);
  const [pendingCartWeight, setPendingCartWeight] = useState(null);
  const deliveryDebounceTimerRef = useRef(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [deliveryModeData, setDeliveryModeData] = useState(null);
  const [expressCharge, setExpressCharge] = useState(0);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [lastCartTotals, setLastCartTotals] = useState(null);
  const [isDeliveryCalculating, setIsDeliveryCalculating] = useState(false);
  const [hasPendingQuantityChanges, setHasPendingQuantityChanges] = useState(false);

  // Initialize Razorpay on component mount
  useEffect(() => {
    initializeRazorpay();
  }, [initializeRazorpay]);

  // ❌ REMOVED: The problematic useEffect that caused infinite loop
  // useEffect(() => {
  //   if (paymentError) {
  //     toast.error(paymentError);
  //   }
  // }, [paymentError, toast]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  // ... rest of your existing useEffects ...

  // Fetch addresses and auto-select from localStorage
  useEffect(() => {
    const fetchAddressesData = async () => {
      try {
        const result = await getAddresses();
        if (result.success) {
          setAddresses(result.data);
          
          if (initialLoadComplete) {
            return;
          }

          console.log('🔍 [Checkout] Loading stored address from localStorage');
          
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

  // ... rest of your existing useEffects ...

  // Load delivery data from localStorage on mount
  useEffect(() => {
    const loadStoredDeliveryData = () => {
      const storedData = getDeliveryData();
      if (!storedData) {
        console.log('📭 [Checkout] No stored delivery data');
        return;
      }

      console.log('📦 [Checkout] Found stored delivery data:', storedData);

      if (storedData.deliveryCheck) {
        setDeliveryInfo(storedData.deliveryCheck);
      }

      if (storedData.deliveryModeData) {
        setDeliveryModeData(storedData.deliveryModeData);
        setExpressCharge(storedData.deliveryModeData.extraCharge || 0);
      }
    };

    loadStoredDeliveryData();
  }, []);

  // Fetch details for all cart items (bundles + products)
  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!cartItems || cartItems.length === 0) {
        setLoading(false);
        setPageInitialized(true);
        setTotalCartWeight(1000);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // ⭐ Fetch BOTH bundles and products
        const itemPromises = cartItems.map(async (item) => {
          if (item.type === 'bundle' && item.bundle_id) {
            const response = await bundleService.getBundleDetails(item.bundle_id);
            return { id: item.bundle_id, type: 'bundle', data: response.data };
          } else if (item.type === 'product' && item.product_id) {
            // Product details already in cart item, just return it
            return { 
              id: item.product_id, 
              type: 'product', 
              data: {
                id: item.product_id,
                title: item.title,
                description: item.description,
                img_url: item.image_url,
                price: item.price,
                stock: item.stock_limit,
                items: [] // Products don't have sub-items
              }
            };
          }
          return null;
        });

        const responses = await Promise.all(itemPromises);
        
        // Build unified items map
        const itemsMap = {};
        responses.forEach(response => {
          if (response) {
            const key = response.type === 'bundle' ? response.id : `product_${response.id}`;
            itemsMap[key] = response.data;
          }
        });

        setBundles(itemsMap); // Reusing 'bundles' state for both types
        console.log('✅ Item details fetched:', itemsMap);
        
        // Calculate total weight
        const totalWeight = cartItems.reduce((sum, item) => {
          return sum + (item.quantity * 1000);
        }, 0);
        setTotalCartWeight(totalWeight);
        console.log(`📦 [Checkout] Total cart weight calculated: ${totalWeight}g (${totalWeight/1000}kg)`);
        
      } catch (err) {
        console.error('❌ Error fetching item details:', err);
        setError('Failed to load item details');
      } finally {
        setLoading(false);
        setPageInitialized(true);
      }
    };

    fetchItemDetails();
  }, [cartItems]);

  // Trigger delivery refresh when weight updates
  useEffect(() => {
    if (!pageInitialized || Object.keys(bundles).length === 0) {
      return;
    }

    if (cartItems && cartItems.length > 0) {
      const newWeight = cartItems.reduce((sum, item) => sum + (item.quantity * 1000), 0);
      
      if (newWeight !== totalCartWeight) {
        console.log(`📦 [Checkout] Weight changed: ${totalCartWeight}g → ${newWeight}g`);
        
        // ⭐ UPDATE IMMEDIATELY - No debounce!
        setTotalCartWeight(newWeight);
        setPendingCartWeight(null);
        
        // ⭐ Clear delivery data immediately
        if (selectedAddress?.zip_code) {
          console.log('🔄 [Checkout] Triggering delivery recalculation...');
          const currentStoredData = getDeliveryData() || {};
          saveDeliveryData({
            ...currentStoredData,
            deliveryCheck: null,
            timestamp: Date.now()
          });
          
          // ⭐ Force DeliveryDetailsCard to recalculate
          setDeliveryInfo(null);
        }
      }
    }
  }, [cartItems, pageInitialized, bundles, totalCartWeight, selectedAddress]);

  // Redirect to shop if no cart items
  useEffect(() => {
    if (pageInitialized && !cartLoading && cartItems.length === 0) {
      navigate('/shop');
    }
  }, [pageInitialized, cartLoading, cartItems.length, navigate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (deliveryDebounceTimerRef.current) {
        clearTimeout(deliveryDebounceTimerRef.current);
      }
    };
  }, []);

  // Track when cart totals actually update (clears recalculating flag)
  useEffect(() => {
    if (!isRecalculating) return;
    
    // Check if totals have actually changed
    if (cartTotals && lastCartTotals) {
      const totalsChanged = 
        cartTotals.subtotal !== lastCartTotals.subtotal ||
        cartTotals.total !== lastCartTotals.total ||
        cartTotals.item_count !== lastCartTotals.item_count;
      
      if (totalsChanged) {
        console.log('✅ [Checkout] Cart totals updated, clearing recalculating flag', {
          old: lastCartTotals,
          new: cartTotals
        });
        setIsRecalculating(false);
      }
    }
    
    // If we have new totals and didn't have old ones, clear flag
    if (cartTotals && !lastCartTotals) {
      console.log('✅ [Checkout] Initial cart totals loaded');
      setIsRecalculating(false);
    }
    
    // Failsafe: Clear after 3 seconds max
    const failsafe = setTimeout(() => {
      if (isRecalculating) {
        console.log('⚠️ [Checkout] Failsafe: Clearing recalculating flag after 3s');
        setIsRecalculating(false);
      }
    }, 3000);
    
    return () => clearTimeout(failsafe);
  }, [cartTotals, lastCartTotals, isRecalculating]);

  const handleQuantityChangeStart = useCallback(() => {
    console.log('⏸️ [Checkout] Quantity change started - disabling payment');
    setHasPendingQuantityChanges(true);
  }, []);

  const handleQuantityChangeComplete = useCallback(() => {
    console.log('▶️ [Checkout] Quantity change complete - enabling payment');
    
    // Add a small delay to ensure all state updates propagate
    setTimeout(() => {
      setHasPendingQuantityChanges(false);
    }, 300);
  }, []);

  const handleGoBack = () => {
    navigate('/shop');
  };

  const handleCartUpdate = useCallback(async (silentRefresh = false) => {
    console.log('🔄 [Checkout] Cart update requested');
    
    // Save current totals before update
    setLastCartTotals(cartTotals);
    setIsRecalculating(true);
    
    // ⭐ NEW: Calculate new weight IMMEDIATELY before refresh
    const newWeight = cartItems.reduce((sum, item) => sum + (item.quantity * 1000), 0);
    console.log('📦 [Checkout] Calculated new weight:', newWeight, 'grams');
    
    // ⭐ NEW: Update weight state IMMEDIATELY (don't wait for debounce)
    setTotalCartWeight(newWeight);
    setPendingCartWeight(null);
    
    await refreshCart(true);
    
    console.log('✅ [Checkout] Full refresh complete');
  }, [refreshCart, cartTotals, cartItems]);

  const handleAddressSelect = async (address) => {
    console.log('📍 [Checkout] Address selected:', address);
    setSelectedAddress(address);
    
    try {
      const result = await getAddresses();
      if (result.success) {
        setAddresses(result.data);
      }
    } catch (err) {
      console.error('❌ Error refreshing addresses:', err);
    }
  };

  const handleOpenAddressModal = () => {
    console.log('➕ [Checkout] Opening address modal');
    setShowAddressModal(true);
  };

  const handleCloseAddressModal = () => {
    console.log('✖️ [Checkout] Closing address modal');
    setShowAddressModal(false);
  };

  const handleDeliveryUpdate = useCallback((updatedDeliveryData) => {
    console.log('🔄 [Checkout] Delivery data updated:', updatedDeliveryData);
    
    // ⭐ NEW: Check if this is a loading state notification
    if (updatedDeliveryData?.isCalculating === true) {
      console.log('⏳ [Checkout] Delivery calculation started');
      setIsDeliveryCalculating(true);
      return;
    }
    
    if (updatedDeliveryData?.isCalculating === false) {
      console.log('✅ [Checkout] Delivery calculation complete');
      setIsDeliveryCalculating(false);
      return;
    }
    
    // Normal delivery data update
    setIsDeliveryCalculating(false);
    setDeliveryInfo(updatedDeliveryData);
    
    const currentStoredData = getDeliveryData() || {};
    saveDeliveryData({
      ...currentStoredData,
      deliveryCheck: updatedDeliveryData,
      timestamp: Date.now()
    });
  }, []);

  const handleDeliveryModeChange = useCallback((modeData) => {
    console.log('🚚 [Checkout] Delivery mode changed:', modeData);
    
    // Save current totals and set recalculating
    setLastCartTotals(cartTotals);
    setIsRecalculating(true);
    
    setDeliveryModeData(modeData);
    setExpressCharge(modeData.extraCharge || 0);

    const currentStoredData = getDeliveryData() || {};
    saveDeliveryData({
      ...currentStoredData,
      selectedDeliveryMode: modeData.mode,
      deliveryModeData: modeData,
      timestamp: Date.now()
    });
    
    console.log('⏳ [Checkout] Waiting for price recalculation...');
  }, [cartTotals]);

  // ⭐ NEW: Coupon handlers
  const handleCouponApply = useCallback((couponData) => {
    console.log('🎟️ [Checkout] Coupon applied:', couponData);
    setAppliedCoupon(couponData);
    setDiscount(couponData.discount);
    setPromoCode(couponData.code);
    toast.success(couponData.savings_text || `Coupon applied: ${couponData.code}`);
  }, [toast]);

  const handleCouponRemove = useCallback(() => {
    console.log('🎟️ [Checkout] Coupon removed');
    setAppliedCoupon(null);
    setDiscount(0);
    setPromoCode('');
    toast.info('Coupon removed');
  }, [toast]);

  // Revalidate coupon when cart subtotal changes
  useEffect(() => {
    // Only revalidate if:
    // 1. Page is initialized
    // 2. A coupon is currently applied
    // 3. Cart totals are loaded
    if (!pageInitialized || !appliedCoupon || !cartTotals) {
      return;
    }

    const currentSubtotal = cartTotals.subtotal || 0;
    
    console.log('🔍 [Checkout] Cart subtotal changed, revalidating coupon...', {
      coupon: appliedCoupon.code,
      subtotal: currentSubtotal
    });

    // Revalidate the coupon with new cart total
    const revalidateCoupon = async () => {
      try {
        const { validateCoupon } = await import('../services/couponService');
        
        const result = await validateCoupon(appliedCoupon.code, currentSubtotal);

        if (result.success) {
          // Coupon still valid - update discount if it changed
          const newDiscount = result.data.discount;
          
          if (newDiscount !== discount) {
            console.log('✅ [Checkout] Coupon revalidated - discount updated:', {
              old: discount,
              new: newDiscount
            });
            
            setDiscount(newDiscount);
            setAppliedCoupon({
              ...appliedCoupon,
              discount: newDiscount,
              savings_text: result.data.savings_text
            });
          } else {
            console.log('✅ [Checkout] Coupon still valid - no discount change');
          }
        } else {
          // Coupon no longer valid - remove it
          console.log('❌ [Checkout] Coupon no longer valid:', result.error);
          
          handleCouponRemove();
          
          // Show appropriate error message
          const errorMessage = result.code === 'MIN_ORDER_NOT_MET'
            ? `Coupon removed: Minimum order value not met (add ₹${result.shortfall} more)`
            : `Coupon removed: ${result.error}`;
          
          toast.warning(errorMessage);
        }
      } catch (error) {
        console.error('❌ [Checkout] Coupon revalidation error:', error);
        // Don't remove coupon on network errors, just log it
      }
    };

    // Debounce revalidation to avoid excessive API calls
    const revalidationTimer = setTimeout(() => {
      revalidateCoupon();
    }, 500);

    return () => clearTimeout(revalidationTimer);
  }, [cartTotals?.subtotal, pageInitialized]); // Only trigger when subtotal changes

  const handleProceedToPayment = async () => {
    // ===== EXISTING VALIDATIONS - 100% UNCHANGED =====
    
    if (hasPendingQuantityChanges) {
      toast.warning('Please wait, quantity is being updated...');
      console.log('⚠️ [Checkout] Payment blocked - quantity changes pending');
      return;
    }

    // ⭐ NEW: Block payment if delivery is calculating
    if (isDeliveryCalculating) {
      toast.warning('Please wait, delivery charges are being calculated...');
      console.log('⚠️ [Checkout] Payment blocked - delivery calculation in progress');
      return;
    }

    // ⭐ CRITICAL: Prevent payment if recalculating
    if (isRecalculating) {
      toast.warning('Please wait, prices are being recalculated...');
      console.log('⚠️ [Checkout] Payment blocked - recalculation in progress');
      return;
    }

    // ⭐ CRITICAL: Prevent payment if weight calculation pending
    if (pendingCartWeight !== null) {
      toast.warning('Please wait, delivery charges are being calculated...');
      console.log('⚠️ [Checkout] Payment blocked - weight recalculation pending');
      return;
    }

    // ⭐ CRITICAL: Prevent payment if cart is loading
    if (cartLoading || loading) {
      toast.warning('Please wait, loading cart details...');
      console.log('⚠️ [Checkout] Payment blocked - cart loading');
      return;
    }

    // ✅ UNCHANGED: Existing validations
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // ⭐ CRITICAL: Check delivery info is ready
    if (!deliveryInfo && selectedAddress) {
      toast.error('Delivery information is being calculated. Please wait...');
      console.log('⚠️ [Checkout] Payment blocked - no delivery info');
      return;
    }

    // ⭐ CRITICAL: Validate cart totals exist and are valid
    if (!cartTotals || !cartTotals.subtotal || cartTotals.subtotal === 0) {
      toast.error('Cart totals are being calculated. Please try again.');
      console.log('⚠️ [Checkout] Payment blocked - invalid cart totals', cartTotals);
      setPlacingOrder(false);
      return;
    }

    try {
      setPlacingOrder(true);

      // ===== NEW FIX: FORCE CART SYNC BEFORE PAYMENT =====
      console.log('🔄 [Checkout] Ensuring cart is fully synced before payment...');
      
      // Wait for any pending debounced cart updates to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force one final cart refresh to ensure DB is up-to-date
      console.log('🔄 [Checkout] Performing final cart sync...');
      await refreshCart(true);
      
      // Small delay to let state settle
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('✅ [Checkout] Cart fully synced - proceeding with payment');
      // ===== END NEW FIX =====

      // ===== EXISTING CODE - 100% UNCHANGED =====
      
      // ✅ UNCHANGED: Get delivery data
      const storedData = getDeliveryData();
      const deliveryMode = deliveryModeData?.mode || storedData?.selectedDeliveryMode || 'surface';
      const finalDeliveryModeData = deliveryModeData || storedData?.deliveryModeData;

      // ⭐ CRITICAL: Log final payment details for verification
      console.log('💳 [Checkout] Initiating payment with VERIFIED data:', {
        mode: deliveryMode,
        deliveryData: finalDeliveryModeData,
        address: selectedAddress,
        cartTotals: {
          subtotal: cartTotals.subtotal,
          total: cartTotals.total,
          itemCount: cartTotals.item_count
        },
        expressCharge: expressCharge,
        discount: discount,
        finalAmount: cartTotals.subtotal + expressCharge - discount,
        timestamp: new Date().toISOString()
      });

      // ✅ UNCHANGED: Build order data
      const orderData = {
        address_id: selectedAddress.id,
        notes: '',
        gift_wrap: false,
        gift_message: null,
        coupon_code: appliedCoupon?.code || null,
        delivery_metadata: {
          mode: deliveryMode,
          estimated_days: finalDeliveryModeData?.estimatedDays,
          expected_delivery_date: finalDeliveryModeData?.deliveryDate || finalDeliveryModeData?.expectedDeliveryDate,
          express_charge: expressCharge,
          delivery_option: finalDeliveryModeData,
          pincode: selectedAddress.zip_code,
          city: selectedAddress.city,
          state: selectedAddress.state,
          calculated_at: new Date().toISOString()
        }
      };

      // ✅ UNCHANGED: Initiate payment
      await initiatePayment(orderData, {
        onSuccess: async (paymentData) => {
          console.log('✅ [Checkout] Payment successful:', paymentData);
          
          // ✅ UNCHANGED: Save order metadata
          const orderMetadata = {
            orderId: paymentData.order_id,
            deliveryMode: deliveryMode,
            deliveryModeData: finalDeliveryModeData,
            selectedAddress: selectedAddress,
            paymentId: paymentData.payment_id,
            timestamp: Date.now()
          };
          
          localStorage.setItem('tpp_last_order', JSON.stringify(orderMetadata));
          
          // ⭐ UNCHANGED: Clear cart after successful payment
          console.log('🧹 [Checkout] Clearing cart after successful payment...');
          try {
            await refreshCart();
            console.log('✅ [Checkout] Cart cleared successfully');
          } catch (cartError) {
            console.error('⚠️ [Checkout] Failed to clear cart (non-critical):', cartError);
          }
        },
        onError: (errorMsg) => {
          console.error('❌ [Checkout] Payment failed:', errorMsg);
          toast.error(errorMsg);
          setPlacingOrder(false);
        }
      });

    } catch (error) {
      console.error('❌ Error initiating payment:', error);
      
      // ✅ UNCHANGED: Error handling
      if (error.message?.includes('Cart is empty')) {
        toast.error('Your cart is empty');
      } else if (error.message?.includes('out of stock')) {
        toast.error('Some items are out of stock. Please update your cart.');
      }
      
      setPlacingOrder(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

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
      <div className="sticky top-0 z-10">
        <div className="bg-white">
          <CommonHeader />
        </div>
        
        {/* Back to Shop Button - At very left edge */}
        <div className="px-4 py-3">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-slate-600 hover:text-tpppink transition-colors font-medium text-sm group"
          >
            <ArrowLeft 
              size={18} 
              className="transition-transform group-hover:-translate-x-1" 
            />
            <span>Back to Shop</span>
          </button>
        </div>
      </div>
      

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-tppslate">Checkout</h1>
        </div>

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
            <CheckoutCart
              cartItems={cartItems}
              bundles={bundles}
              onItemUpdate={handleCartUpdate}
              onQuantityChangeStart={handleQuantityChangeStart}  // ⭐ NEW
              onQuantityChangeComplete={handleQuantityChangeComplete}  // ⭐ NEW
              hasPendingChanges={hasPendingQuantityChanges}
            />
            
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

          {/* Right Column - Order Summary */}
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
                onPlaceOrder={handleProceedToPayment}
                placingOrder={placingOrder || paymentProcessing || isRecalculating}
                expressCharge={expressCharge}
                deliveryMode={deliveryModeData?.mode || 'surface'}
                appliedCoupon={appliedCoupon} // ⭐ NEW
                onCouponApply={handleCouponApply} // ⭐ NEW
                onCouponRemove={handleCouponRemove} // ⭐ NEW
                isDeliveryCalculating={isDeliveryCalculating}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      <CheckoutForm
        showModal={showAddressModal}
        onCloseModal={handleCloseAddressModal}
        onAddressSelect={handleAddressSelect}
      />
    </div>
  );
};

export default Checkout;