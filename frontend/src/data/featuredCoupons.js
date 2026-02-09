// frontend/src/data/featuredCoupons.js
/**
 * Featured Coupons Configuration
 * Clean, professional theme matching site design
 * 
 * HOW TO ADD A NEW COUPON:
 * 1. Add a new object to the FEATURED_COUPONS array
 * 2. Set active: true to enable
 * 3. Configure navigation target (category/tags)
 * 4. Deploy - changes reflect immediately
 */

export const FEATURED_COUPONS = [
  {
    id: 'ring-bogo-2024',
    code: 'RING-BUY3GET2',
    marquee_text: 'Buy 3 Rings Get 2 FREE! Use code: RING-BUY3GET2 - Shop Now',
    
    // Modal Configuration (kept for backwards compatibility, used for navigation)
    modal: {
      title: 'Exclusive Ring Offer!',
      subtitle: 'Buy 3 Rings, Get 2 Absolutely FREE',
      description: 'Add any 3 rings to your cart and get 2 additional rings completely free! The discount applies automatically at checkout when you use the coupon code.',
      
      highlights: [
        'Pick any 3 rings from our collection',
        'Get 2 more rings for FREE',
        'Mix and match any designs',
        'Limited time offer - while stocks last'
      ],
      
      terms: [
        'Valid on rings category only',
        'Minimum 3 rings required in cart',
        'Free rings will be the 2 lowest-priced items',
        'Cannot be combined with other offers',
        'Subject to availability'
      ],
      
      code_display: 'RING-BUY3GET2',
      
      // Action buttons configuration - used for navigation
      buttons: {
        primary: {
          text: 'Browse All Products',
          action: 'shop',
          path: '/shop'
        },
        secondary: {
          text: 'Show Only Rings',
          action: 'category',
          path: '/shop',
          params: {
            tags: 'ring',
            applyCoupon: 'RING-BUY3GET2'
          }
        }
      }
    },
    
    // Clean theme - no gradients, professional colors
    theme: {
      bg: 'bg-tpppink',
      text: 'text-white',
      accent: 'bg-white/10'
    },
    
    // Scheduling (optional)
    active: true,
    start_date: '2026-02-01',
    end_date: '2026-02-28'
  },
  
  {
    id: 'ring-buy2get1-2026',
    code: 'RING-BUY2GET1',
    marquee_text: 'Buy 2 Rings Get 1 FREE! Use code: RING-BUY2GET1 - Shop Now',
    
    modal: {
      title: 'Exclusive Ring Offer!',
      subtitle: 'Buy 2 Rings, Get 1 at 100% OFF',
      description: 'Add any 2 rings to your cart and get 1 additional ring completely free! The discount applies automatically at checkout when you use the coupon code.',
      
      highlights: [
        'Pick any 2 rings from our collection',
        'Get 1 more ring for FREE',
        'Mix and match any designs',
        'Valid until February 28, 2026'
      ],
      
      terms: [
        'Valid on rings category only',
        'Minimum 2 rings required in cart',
        'Free ring will be the lowest-priced item',
        'Cannot be combined with other offers',
        'Maximum 5 uses per user',
        'Limited to 100 total uses'
      ],
      
      code_display: 'RING-BUY2GET1',
      
      buttons: {
        primary: {
          text: 'Browse All Products',
          action: 'shop',
          path: '/shop'
        },
        secondary: {
          text: 'Show Only Rings',
          action: 'category',
          path: '/shop',
          params: {
            tags: 'ring',
            applyCoupon: 'RING-BUY2GET1'
          }
        }
      }
    },
    
    theme: {
      bg: 'bg-tpppink',
      text: 'text-white',
      accent: 'bg-white/10'
    },
    
    active: true,
    start_date: '2026-02-01',
    end_date: '2026-02-28'
  },
  
  {
    id: 'earing-bogo-2026',
    code: 'EARING-BUY2GET1',
    marquee_text: 'Buy 2 Earrings Get 1 FREE! Use code: EARING-BUY2GET1 - Shop Now',
    
    modal: {
      title: 'Exclusive Earring Offer!',
      subtitle: 'Buy 2 Earrings, Get 1 at 100% OFF',
      description: 'Add any 2 earrings to your cart and get 1 additional earring completely free! The discount applies automatically at checkout when you use the coupon code.',
      
      highlights: [
        'Pick any 2 earrings from our collection',
        'Get 1 more earring for FREE',
        'Mix and match any designs',
        'Valid until February 28, 2026'
      ],
      
      terms: [
        'Valid on earrings category only',
        'Minimum 2 earrings required in cart',
        'Free earring will be the lowest-priced item',
        'Cannot be combined with other offers',
        'Maximum 5 uses per user',
        'Limited to 100 total uses'
      ],
      
      code_display: 'EARING-BUY2GET1',
      
      buttons: {
        primary: {
          text: 'Browse All Products',
          action: 'shop',
          path: '/shop'
        },
        secondary: {
          text: 'Show Only Earrings',
          action: 'category',
          path: '/shop',
          params: {
            tags: 'earings',
            applyCoupon: 'EARING-BUY2GET1'
          }
        }
      }
    },
    
    theme: {
      bg: 'bg-tpppink',
      text: 'text-white',
      accent: 'bg-white/10'
    },
    
    active: true,
    start_date: '2026-02-01',
    end_date: '2026-02-28'
  },
  
  {
    id: 'earing-buy3get2-2026',
    code: 'EARING-BUY3GET2',
    marquee_text: 'Buy 3 Earrings Get 2 FREE! Use code: EARING-BUY3GET2 - Shop Now',
    
    modal: {
      title: 'Exclusive Earring Offer!',
      subtitle: 'Buy 3 Earrings & Get 2 @ 100% OFF',
      description: 'Add any 3 earrings to your cart and get 2 additional earrings completely free! The discount applies automatically at checkout when you use the coupon code.',
      
      highlights: [
        'Pick any 3 earrings from our collection',
        'Get 2 more earrings for FREE',
        'Mix and match any designs',
        'Valid until February 28, 2026'
      ],
      
      terms: [
        'Valid on earrings category only',
        'Minimum 3 earrings required in cart',
        'Free earrings will be the 2 lowest-priced items',
        'Cannot be combined with other offers',
        'Maximum 5 uses per user',
        'Limited to 100 total uses'
      ],
      
      code_display: 'EARING-BUY3GET2',
      
      buttons: {
        primary: {
          text: 'Browse All Products',
          action: 'shop',
          path: '/shop'
        },
        secondary: {
          text: 'Show Only Earrings',
          action: 'category',
          path: '/shop',
          params: {
            tags: 'earings',
            applyCoupon: 'EARING-BUY3GET2'
          }
        }
      }
    },
    
    theme: {
      bg: 'bg-tpppink',
      text: 'text-white',
      accent: 'bg-white/10'
    },
    
    active: true,
    start_date: '2026-02-01',
    end_date: '2026-02-28'
  },
  
  // EXAMPLE: Add more coupons below
  {
    id: 'summer-sale-2024',
    code: 'SUMMER30',
    marquee_text: 'Summer Sale! Get 30% OFF on all pouches - Code: SUMMER30',
    
    modal: {
      title: 'Summer Sale is Here!',
      subtitle: 'Flat 30% OFF on All Pouches',
      description: 'Beat the heat with our exclusive summer collection! Get 30% off on all pouch designs when you use code SUMMER30 at checkout.',
      
      highlights: [
        '30% OFF on entire pouch collection',
        'All colors and designs included',
        'Free shipping on orders above ₹999',
        'Limited time summer special'
      ],
      
      terms: [
        'Valid on pouches category only',
        'Minimum order value: ₹499',
        'Cannot be combined with other offers',
        'Offer valid until stocks last'
      ],
      
      code_display: 'SUMMER30',
      
      buttons: {
        primary: {
          text: 'Browse All Products',
          action: 'shop',
          path: '/shop'
        },
        secondary: {
          text: 'Show Only Pouches',
          action: 'category',
          path: '/shop',
          params: {
            tags: 'pouch',
            applyCoupon: 'SUMMER30'
          }
        }
      }
    },
    
    // Alternative color scheme
    theme: {
      bg: 'bg-tppslate',
      text: 'text-white',
      accent: 'bg-white/10'
    },
    
    active: false, // Set to true when you want to activate
    start_date: null,
    end_date: null
  }
];

/**
 * Get currently active coupons
 * Filters by active flag and date range
 */
export const getActiveFeaturedCoupons = () => {
  const now = new Date();
  
  return FEATURED_COUPONS.filter(coupon => {
    // Check active flag
    if (!coupon.active) return false;
    
    // Check start date
    if (coupon.start_date) {
      const startDate = new Date(coupon.start_date);
      if (now < startDate) return false;
    }
    
    // Check end date
    if (coupon.end_date) {
      const endDate = new Date(coupon.end_date);
      if (now > endDate) return false;
    }
    
    return true;
  });
};

/**
 * Get coupon by ID
 */
export const getFeaturedCouponById = (id) => {
  return FEATURED_COUPONS.find(coupon => coupon.id === id);
};

/**
 * Get coupon by code
 */
export const getFeaturedCouponByCode = (code) => {
  return FEATURED_COUPONS.find(coupon => 
    coupon.code.toUpperCase() === code.toUpperCase()
  );
};