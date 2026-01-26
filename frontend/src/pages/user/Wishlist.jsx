// frontend/src/pages/user/Wishlist.jsx

import React, { useState } from 'react';
import { Heart, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/seo/SEO';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([
    {
      id: 1,
      title: 'Rose Gold Heart Necklace',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300',
      added_at: '2024-11-15'
    },
    {
      id: 2,
      title: 'Teddy Bear - Large',
      price: 1599,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300',
      added_at: '2024-11-10'
    },
    {
      id: 3,
      title: 'Silver Bracelet Set',
      price: 2499,
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300',
      added_at: '2024-11-05'
    },
  ]);

  const handleRemove = (id) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  const handleAddToCart = (item) => {
    // TODO: Add to cart logic
    alert(`Added ${item.title} to cart!`);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (wishlist.length === 0) {
    return (
      <div className="space-y-6">
        <SEO
          title="My Wishlist"
          description="Your saved jewelry and gift bundles"
          canonical="https://www.rizara.in/user/wishlist"
          noindex={true}
        />
        <div>
          <h1 className="text-3xl font-bold text-tppslate flex items-center gap-2 mb-2">
            <Heart className="w-8 h-8 text-tpppink" />
            My Wishlist
          </h1>
          <p className="text-tppslate/70">Your favorite items in one place</p>
        </div>

        <div className="bg-white rounded-lg border-2 border-tppslate/10 p-12 text-center">
          <Heart className="w-16 h-16 text-tppslate/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-tppslate mb-2">Your wishlist is empty</h3>
          <p className="text-tppslate/60 mb-4">Save your favorite items for later</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-tpppink text-white rounded-lg hover:bg-tpppink/90 transition-colors"
          >
            Explore Products
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEO
        title="My Wishlist"
        description="Your saved jewelry and gift bundles"
        canonical="https://www.rizara.in/user/wishlist"
        noindex={true}
      />

      <div>
        <h1 className="text-3xl font-bold text-tppslate flex items-center gap-2 mb-2">
          <Heart className="w-8 h-8 text-tpppink" />
          My Wishlist
        </h1>
        <p className="text-tppslate/70">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border-2 border-tppslate/10 overflow-hidden hover:shadow-md transition-all">
            {/* Image */}
            <div className="relative h-64 bg-slate-100 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={() => handleRemove(item.id)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-tppslate mb-1 line-clamp-2">{item.title}</h3>
              <p className="text-xs text-tppslate/60 mb-3">Added {formatDate(item.added_at)}</p>

              <div className="flex items-center justify-between mb-4">
                <p className="text-lg font-bold text-tpppink">₹{item.price.toLocaleString('en-IN')}</p>
              </div>

              <button
                onClick={() => handleAddToCart(item)}
                className="w-full px-4 py-2 bg-tpppink text-white rounded-lg hover:bg-tpppink/90 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;