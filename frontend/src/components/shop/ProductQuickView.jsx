// frontend/src/components/shop/ProductQuickView.jsx

import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import shopService from '../../services/shopService';
import { formatPrice } from '../../utils/shopHelpers';

/**
 * ProductQuickView Component
 * Modal for quick product preview with image gallery and quick actions
 * 
 * @param {string} productId - Product UUID
 * @param {boolean} isOpen - Whether modal is open
 * @param {Function} onClose - Callback to close modal
 */
const ProductQuickView = ({ productId, isOpen, onClose }) => {
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /**
   * Fetch product details and variants
   */
  useEffect(() => {
    if (!isOpen || !productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Fetch product details
        const productResult = await shopService.getProductById(productId);

        if (productResult.success) {
          setProduct(productResult.data);
          
          // Fetch variants if product has variants
          if (productResult.data.has_variants) {
            const variantsResult = await shopService.getProductVariants(productId);
            if (variantsResult.success) {
              setVariants(variantsResult.data);
              if (variantsResult.data.length > 0) {
                setSelectedVariant(variantsResult.data[0]);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [isOpen, productId]);

  /**
   * Handle image navigation
   */
  const handlePrevImage = () => {
    setCurrentImageIndex(prev =>
      prev === 0 ? (variants.length > 0 ? variants.length - 1 : 0) : prev - 1
    );
  };

  const handleNextImage = () => {
    const totalImages = variants.length > 0 ? variants.length : 1;
    setCurrentImageIndex(prev =>
      prev === totalImages - 1 ? 0 : prev + 1
    );
  };

  /**
   * Handle wishlist toggle
   */
  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Call API to add/remove from wishlist
  };

  /**
   * Handle add to cart
   */
  const handleAddToCart = () => {
    if (!product) return;
    // TODO: Call API to add to cart
    console.log('Add to cart:', {
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity: 1
    });
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setCurrentImageIndex(0);
    setSelectedVariant(null);
    onClose();
  };

  if (!isOpen) return null;

  const images = variants.length > 0
    ? variants.map(v => v.img_url || v.Products?.img_url)
    : product?.img_url
      ? [product.img_url]
      : [];

  const displayPrice = selectedVariant?.price || product?.price || 0;
  const displayStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const inStock = displayStock > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="
            bg-white rounded-2xl shadow-2xl max-w-2xl w-full
            max-h-[90vh] overflow-y-auto
            transform transition-all duration-300
          "
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b-2 border-slate-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-tppslate">Quick View</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-8 flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-tpppink/10 rounded-full">
                  <div className="w-8 h-8 border-3 border-tpppink border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-slate-600 font-medium">Loading product...</p>
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && product && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Section */}
              <div className="flex flex-col gap-4">
                {/* Main Image */}
                <div className="relative bg-slate-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center group">
                  {images.length > 0 && images[currentImageIndex] ? (
                    <img
                      src={images[currentImageIndex]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <span>No image available</span>
                    </div>
                  )}

                  {/* Image Navigation - Show if multiple variants */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="
                          absolute left-3 top-1/2 -translate-y-1/2
                          w-10 h-10 rounded-full bg-white/90 hover:bg-white
                          flex items-center justify-center shadow-lg
                          opacity-0 group-hover:opacity-100 transition-opacity
                        "
                      >
                        <ChevronLeft className="w-5 h-5 text-tppslate" />
                      </button>

                      <button
                        onClick={handleNextImage}
                        className="
                          absolute right-3 top-1/2 -translate-y-1/2
                          w-10 h-10 rounded-full bg-white/90 hover:bg-white
                          flex items-center justify-center shadow-lg
                          opacity-0 group-hover:opacity-100 transition-opacity
                        "
                      >
                        <ChevronRight className="w-5 h-5 text-tppslate" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {variants.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {variants.map((variant, index) => (
                      <button
                        key={variant.id}
                        onClick={() => {
                          setSelectedVariant(variant);
                          setCurrentImageIndex(index);
                        }}
                        className={`
                          flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2
                          transition-all duration-200
                          ${currentImageIndex === index
                            ? 'border-tpppink shadow-md'
                            : 'border-slate-200 hover:border-tpppink'
                          }
                        `}
                      >
                        <img
                          src={variant.img_url}
                          alt={`Variant ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info Section */}
              <div className="flex flex-col gap-4">
                {/* Category */}
                {product.Categories && (
                  <div className="text-xs font-semibold text-tpppink uppercase tracking-wide">
                    {product.Categories.name}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-2xl font-bold text-tppslate">
                  {product.title}
                </h1>

                {/* Rating (if available) */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-amber-400"
                        fill="currentColor"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-slate-600">(25 reviews)</span>
                </div>

                {/* Price */}
                <div className="py-4 border-y-2 border-slate-200">
                  <div className="text-3xl font-bold text-tpppink">
                    {formatPrice(displayPrice)}
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-sm leading-relaxed">
                  {product.description || 'Premium quality product from The Petal Pouches collection.'}
                </p>

                {/* Variants Selector */}
                {variants.length > 1 && (
                  <div>
                    <label className="block text-sm font-semibold text-tppslate mb-2">
                      Select Variant
                    </label>
                    <select
                      value={selectedVariant?.id || ''}
                      onChange={(e) => {
                        const variant = variants.find(v => v.id === e.target.value);
                        setSelectedVariant(variant);
                      }}
                      className="
                        w-full px-4 py-2 border-2 border-slate-300 rounded-lg
                        focus:outline-none focus:border-tpppink
                        text-slate-900 bg-white
                      "
                    >
                      {variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.attributes || `Variant ${variant.sku}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Stock Status */}
                <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  inStock
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {inStock ? `${displayStock} in stock` : 'Out of Stock'}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-6 py-3
                      rounded-lg font-semibold transition-all duration-200
                      ${inStock
                        ? 'bg-tpppink text-white hover:bg-tppslate active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={handleWishlistToggle}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-6 py-3
                      rounded-lg font-semibold transition-all duration-200 border-2
                      ${isWishlisted
                        ? 'bg-tpppink text-white border-tpppink hover:bg-tppslate'
                        : 'bg-white text-tppslate border-slate-300 hover:border-tpppink'
                      }
                    `}
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={isWishlisted ? 'currentColor' : 'none'}
                    />
                    {isWishlisted ? 'Liked' : 'Like'}
                  </button>
                </div>

                {/* View Details Link */}
                <button
                  onClick={handleClose}
                  className="
                    text-center px-6 py-2 text-tpppink font-semibold
                    hover:text-tppslate transition-colors border-b-2 border-transparent
                    hover:border-tpppink
                  "
                >
                  View Full Details →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductQuickView;