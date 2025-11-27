// frontend/src/components/shop/ProductCard.jsx - FIXED VERSION 2

import React, { useState } from 'react';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';
import shopService from '../../services/shopService';

/**
 * ProductCard Component - FIXED VERSION 2
 * Individual product card with square image, title, price, and quick actions
 * 
 * KEY FIX: Send variant ID if product has variants, otherwise send product ID
 */
export default function ProductCard({ product, onQuickView, onAddToCart }) {
  const { user, isAuthenticated } = useUserAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addSuccess, setAddSuccess] = useState(false);

  // ✅ FIXED: Determine which ID to send based on has_variants flag
  const getProductVariantId = () => {
    // If product has variants, use first variant's ID
    if (product.has_variants && product.variants && product.variants.length > 0) {
      return product.variants[0].id;
    }
    // Otherwise use product ID directly
    return product.id;
  };

  const getPrice = () => {
    // If product has variants, use first variant's price
    if (product.has_variants && product.variants && product.variants.length > 0) {
      return product.variants[0].price;
    }
    // Otherwise use product price
    return product.price;
  };

  // ✅ FIXED: Handle Add to Cart using context
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setIsAdding(true);
    setAddError(null);

    try {
      // ✅ FIX 1: Check authentication first
      if (!isAuthenticated || !user?.id) {
        setAddError('Please log in to add items to cart');
        setIsAdding(false);
        return;
      }

      console.log('✅ User authenticated:', user.id);

      // ✅ FIX 2: Get correct ID (variant ID if has variants, product ID if not)
      const variantId = getProductVariantId();
      const priceToUse = getPrice();

      console.log('🛒 Adding to cart:', {
        userId: user.id,
        variantId,
        hasVariants: product.has_variants,
        quantity: 1,
        price: priceToUse
      });

      // ✅ FIX 3: Call shopService with correct ID
      const response = await shopService.addToCart({
        product_variant_id: variantId,  // ✅ This is the KEY FIX
        quantity: 1,
      });

      if (!response.success) {
        setAddError(response.error || 'Failed to add to cart');
        setIsAdding(false);
        return;
      }

      setAddSuccess(true);
      
      // Show success message for 2 seconds
      setTimeout(() => setAddSuccess(false), 2000);

      // Callback to parent component if provided
      if (onAddToCart) {
        onAddToCart({
          productId: product.id,
          variantId,
          quantity: 1,
          price: priceToUse,
          hasVariants: product.has_variants
        });
      }

      console.log('✅ Added to cart successfully:', response);
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      setAddError(
        error.message || 'Failed to add to cart. Please try again.'
      );
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Wishlist Toggle
  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const isOutOfStock = product.stock <= 0;
  const inStock = product.stock > 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {/* Placeholder skeleton while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Product Image */}
        <img
          src={product.img_url || '/placeholder-product.jpg'}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-300 hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
            setImageLoaded(true);
          }}
        />

        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-tpppink text-white text-xs font-semibold px-2 py-1 rounded">
          {product.category?.name || 'Product'}
        </div>

        {/* Stock Badge */}
        <div
          className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded ${
            isOutOfStock
              ? 'bg-red-500 text-white'
              : 'bg-green-500 text-white'
          }`}
        >
          {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
        </div>

        {/* Desktop Hover Overlay */}
        <div className="hidden md:flex absolute inset-0 bg-black bg-opacity-40 flex-col items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="bg-white text-tpppink px-4 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-tppslate hover:text-white transition-colors"
          >
            <Eye size={18} />
            Quick View
          </button>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding || !isAuthenticated}
            title={!isAuthenticated ? 'Please log in to add to cart' : ''}
            className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 transition-all ${
              isOutOfStock
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : !isAuthenticated
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : isAdding
                ? 'bg-yellow-500 text-white animate-pulse'
                : 'bg-tpppink text-white hover:bg-pink-600'
            }`}
          >
            <ShoppingCart size={18} />
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>

        {/* Wishlist Button (always visible) */}
        <button
          onClick={handleWishlist}
          className="absolute bottom-2 right-2 bg-white rounded-full p-2 hover:bg-tpppink hover:text-white transition-colors shadow-md"
        >
          <Heart
            size={18}
            className={isWishlisted ? 'fill-tpppink text-tpppink' : 'text-tppslate'}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Title */}
        <h3 className="text-sm font-semibold text-tppslate line-clamp-2 mb-1">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-tpppink">
            ₹{getPrice().toLocaleString('en-IN')}
          </span>
          {product.original_price && (
            <span className="text-xs text-gray-500 line-through">
              ₹{product.original_price?.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Rating (if available) */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2 text-xs text-yellow-500">
            ★ {product.rating.toFixed(1)} ({product.reviews_count || 0} reviews)
          </div>
        )}

        {/* Variant Info (if applicable) */}
        {product.has_variants && product.variants && product.variants.length > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''} available
          </div>
        )}

        {/* Error Message */}
        {addError && (
          <div className="bg-red-100 text-red-700 text-xs p-2 rounded mb-2">
            {addError}
          </div>
        )}

        {/* Success Message */}
        {addSuccess && (
          <div className="bg-green-100 text-green-700 text-xs p-2 rounded mb-2">
            ✓ Added to cart!
          </div>
        )}

        {/* Mobile Add to Cart Button */}
        <div className="md:hidden flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 bg-tppslate text-white text-xs py-2 rounded hover:bg-opacity-90 transition-colors"
          >
            View
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding || !isAuthenticated}
            title={!isAuthenticated ? 'Please log in to add to cart' : ''}
            className={`flex-1 text-xs py-2 rounded font-semibold transition-all ${
              isOutOfStock
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : !isAuthenticated
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : isAdding
                ? 'bg-yellow-500 text-white animate-pulse'
                : 'bg-tpppink text-white hover:bg-pink-600'
            }`}
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}