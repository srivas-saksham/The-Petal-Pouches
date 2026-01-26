// frontend/src/data/faqData.js
import { Package, CreditCard, Truck, RotateCcw, Gift, ShieldCheck } from 'lucide-react';

/**
 * FAQ Data Structure
 * Centralized FAQ content for easy maintenance
 * Can be migrated to database in future
 * 
 * UPDATED: Icons are now actual components, not strings
 */

export const faqCategories = [
  {
    id: 'orders',
    name: 'Orders & Delivery',
    icon: Package,
    description: 'Everything about placing and tracking orders',
    color: 'blue',
    order: 1
  },
  {
    id: 'payment',
    name: 'Payment & Pricing',
    icon: CreditCard,
    description: 'Payment methods and transaction security',
    color: 'green',
    order: 2
  },
  {
    id: 'shipping',
    name: 'Shipping & Packaging',
    icon: Truck,
    description: 'Shipping options and packaging details',
    color: 'purple',
    order: 3
  },
  {
    id: 'returns',
    name: 'Returns & Refunds',
    icon: RotateCcw,
    description: 'Return policy and refund process',
    color: 'orange',
    order: 4
  },
  {
    id: 'products',
    name: 'Products & Bundles',
    icon: Gift,
    description: 'Product information and bundle details',
    color: 'pink',
    order: 5
  },
  {
    id: 'account',
    name: 'Account & Privacy',
    icon: ShieldCheck,
    description: 'Account management and data security',
    color: 'indigo',
    order: 6
  }
];

export const faqQuestions = {
  orders: [
    {
      id: 'ord-1',
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 5-7 business days across India. Express delivery (1-3 days) is available for select PIN codes with additional charges. Delivery timelines are calculated by our logistics partner Delhivery based on your location and shipment weight.',
      tags: ['delivery', 'shipping', 'time', 'express'],
      priority: 1,
      views: 2543,
      helpful: 1876
    },
    {
      id: 'ord-2',
      question: 'Do you deliver to my area?',
      answer: 'We deliver to most PIN codes across India through Delhivery. You can check delivery availability by entering your PIN code on the product page. If your area is not serviceable, we recommend checking back as we continuously expand our delivery network.',
      tags: ['delivery', 'location', 'pincode', 'availability'],
      priority: 2,
      views: 1932,
      helpful: 1456
    },
    {
      id: 'ord-3',
      question: 'Can I change my delivery address after placing an order?',
      answer: 'Yes, you can change the delivery address before the order is shipped. Please contact our support team at officialrizara@gmail.com as soon as possible with your order ID and new address. Once shipped, address changes are not possible.',
      tags: ['address', 'change', 'modification'],
      priority: 3,
      views: 1234,
      helpful: 892
    },
    {
      id: 'ord-4',
      question: 'What if I\'m not available during delivery?',
      answer: 'Our delivery partner will attempt delivery up to 3 times. If you\'re unavailable, they will leave a notification with contact details. You can also track your order in real-time and coordinate with the delivery agent directly.',
      tags: ['delivery', 'unavailable', 'redelivery'],
      priority: 4,
      views: 876,
      helpful: 654
    },
    {
      id: 'ord-5',
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, you\'ll receive a tracking number via email and SMS. You can track your order in real-time by visiting the Orders section in your account dashboard or using the tracking link provided.',
      tags: ['tracking', 'order status', 'updates'],
      priority: 5,
      views: 3421,
      helpful: 2987
    }
  ],
  
  payment: [
    {
      id: 'pay-1',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods including Credit/Debit Cards (Visa, Mastercard, RuPay, American Express), UPI (Google Pay, PhonePe, Paytm, and all UPI apps), Net Banking, and Mobile Wallets. All transactions are processed through secure payment gateways.',
      tags: ['payment', 'methods', 'options', 'cards', 'upi'],
      priority: 1,
      views: 4532,
      helpful: 3876
    },
    {
      id: 'pay-2',
      question: 'Is it safe to pay online?',
      answer: 'Yes, absolutely! All transactions are encrypted and processed through industry-standard secure payment gateways. We never store your payment details on our servers. Your financial information is completely safe and protected.',
      tags: ['security', 'safe', 'encryption', 'protection'],
      priority: 2,
      views: 2341,
      helpful: 1987
    },
    {
      id: 'pay-3',
      question: 'Do you offer Cash on Delivery (COD)?',
      answer: 'COD is currently not available. We only accept prepaid orders to ensure faster processing and delivery. All prepaid orders qualify for free standard shipping across India.',
      tags: ['cod', 'cash on delivery', 'prepaid'],
      priority: 3,
      views: 2876,
      helpful: 1543
    },
    {
      id: 'pay-4',
      question: 'Are there any hidden charges?',
      answer: 'No hidden charges! The price you see on the product page is the final price, inclusive of all taxes. Standard shipping is FREE for all prepaid orders. Express delivery charges (if applicable) are clearly shown during checkout.',
      tags: ['charges', 'fees', 'pricing', 'transparent'],
      priority: 4,
      views: 1987,
      helpful: 1654
    },
    {
      id: 'pay-5',
      question: 'Why was my payment declined?',
      answer: 'Payment failures can occur due to insufficient funds, incorrect card details, bank restrictions, or technical issues. Please verify your payment details and try again. If the problem persists, contact your bank or try a different payment method. You can also reach out to our support team for assistance.',
      tags: ['payment failed', 'declined', 'error', 'troubleshooting'],
      priority: 5,
      views: 1432,
      helpful: 876
    }
  ],
  
  shipping: [
    {
      id: 'ship-1',
      question: 'Do you offer free shipping?',
      answer: 'Yes! We offer FREE standard shipping on all prepaid orders across India. Express delivery is available at additional charges calculated by Delhivery based on weight and destination.',
      tags: ['free shipping', 'shipping cost', 'charges'],
      priority: 1,
      views: 5432,
      helpful: 4876
    },
    {
      id: 'ship-2',
      question: 'How is my order packaged?',
      answer: 'All orders are packaged with premium materials to ensure safe delivery. Our signature packaging includes protective cushioning, elegant wrapping, and tamper-evident seals. Bundles come in our special gift boxes perfect for gifting.',
      tags: ['packaging', 'box', 'protection', 'gift wrap'],
      priority: 2,
      views: 1876,
      helpful: 1543
    },
    {
      id: 'ship-3',
      question: 'Can I request gift wrapping?',
      answer: 'All our bundles come in premium gift-ready packaging by default! Individual products are securely packaged. For special gift messages or custom wrapping requests, please mention in the order notes during checkout or contact our support team.',
      tags: ['gift', 'wrapping', 'customization', 'message'],
      priority: 3,
      views: 2341,
      helpful: 1987
    },
    {
      id: 'ship-4',
      question: 'What if my package is damaged during delivery?',
      answer: 'We take utmost care in packaging, but if your package arrives damaged, please DO NOT accept it. If already accepted, record an unboxing video immediately and contact us at officialrizara@gmail.com within 24 hours with photos/video. We will arrange a replacement or refund.',
      tags: ['damaged', 'broken', 'packaging issue', 'complaint'],
      priority: 4,
      views: 987,
      helpful: 765
    },
    {
      id: 'ship-5',
      question: 'Can I add multiple addresses for one order?',
      answer: 'Currently, each order can only be delivered to one address. If you need to send items to multiple addresses, please place separate orders for each delivery location.',
      tags: ['multiple addresses', 'different locations', 'split order'],
      priority: 5,
      views: 654,
      helpful: 432
    }
  ],
  
  returns: [
    {
      id: 'ret-1',
      question: 'What is your return policy?',
      answer: 'We accept returns within 5 days of delivery for items that are visibly defective or damaged. Returns are not accepted for change of mind, wrong item selected, or cosmetic preferences. The item must be unused, in original condition with all tags and packaging intact.',
      tags: ['return policy', 'refund', 'conditions', 'eligibility'],
      priority: 1,
      views: 3876,
      helpful: 3124
    },
    {
      id: 'ret-2',
      question: 'How do I return an item?',
      answer: 'To initiate a return: 1) Contact us at officialrizara@gmail.com within 5 days of delivery. 2) Provide your order ID and reason for return. 3) Submit your unboxing video with 360° view of the package. 4) Our team will review and approve the return. 5) We will arrange pickup or provide return instructions.',
      tags: ['return process', 'steps', 'how to return'],
      priority: 2,
      views: 2987,
      helpful: 2456
    },
    {
      id: 'ret-3',
      question: 'When will I receive my refund?',
      answer: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method. Bank processing may take an additional 5-7 business days depending on your bank.',
      tags: ['refund', 'timeline', 'processing time', 'money back'],
      priority: 3,
      views: 2341,
      helpful: 1987
    },
    {
      id: 'ret-4',
      question: 'Why do I need an unboxing video?',
      answer: 'The unboxing video helps us provide the best customer support by verifying the condition of the package and products upon delivery. It protects both you and us from fraudulent claims and ensures genuine cases are resolved quickly. Please record a clear 360° view of the sealed package before opening.',
      tags: ['unboxing', 'video', 'proof', 'verification'],
      priority: 4,
      views: 1654,
      helpful: 1234
    },
    {
      id: 'ret-5',
      question: 'Can I exchange an item instead of returning?',
      answer: 'Currently, we do not offer direct exchanges. If you need a different item, please initiate a return for refund and place a new order for the desired product. This ensures faster processing and availability confirmation.',
      tags: ['exchange', 'replacement', 'swap'],
      priority: 5,
      views: 1432,
      helpful: 987
    }
  ],
  
  products: [
    {
      id: 'prod-1',
      question: 'What are bundles and how do they work?',
      answer: 'Bundles are curated gift sets that combine multiple premium products at a special discounted price. Each bundle is thoughtfully designed for specific occasions or recipients. You save money compared to buying items individually, and receive everything in beautiful gift-ready packaging.',
      tags: ['bundles', 'gift sets', 'discount', 'savings'],
      priority: 1,
      views: 4321,
      helpful: 3765
    },
    {
      id: 'prod-2',
      question: 'Can I customize a bundle?',
      answer: 'Currently, our bundles are pre-designed curated sets. However, we are working on custom bundle options! For bulk orders or corporate gifting with customization needs, please contact our support team at officialrizara@gmail.com.',
      tags: ['customize', 'custom', 'personalize', 'bulk'],
      priority: 2,
      views: 2876,
      helpful: 1987
    },
    {
      id: 'prod-3',
      question: 'Are products authentic and original?',
      answer: 'Yes, absolutely! All products are 100% authentic and sourced directly from trusted suppliers. We stand behind the quality of every item we sell and offer a satisfaction guarantee.',
      tags: ['authentic', 'genuine', 'original', 'quality'],
      priority: 3,
      views: 1987,
      helpful: 1654
    },
    {
      id: 'prod-4',
      question: 'How do I choose the right gift bundle?',
      answer: 'Browse our collections by occasion (Birthday, Anniversary, Wedding, etc.) or recipient type. Each bundle includes detailed descriptions of included products. You can also use our Gift Quiz on the homepage to get personalized recommendations based on your requirements!',
      tags: ['choose', 'select', 'gift finder', 'recommendations'],
      priority: 4,
      views: 2341,
      helpful: 1876
    },
    {
      id: 'prod-5',
      question: 'What if an item in my bundle is out of stock?',
      answer: 'If any item in a bundle becomes unavailable, we will contact you before shipping with options: 1) Wait for restock, 2) Receive a suitable replacement of equal or higher value, or 3) Cancel with full refund. We never ship incomplete bundles without your approval.',
      tags: ['out of stock', 'unavailable', 'substitute', 'replacement'],
      priority: 5,
      views: 876,
      helpful: 654
    }
  ],
  
  account: [
    {
      id: 'acc-1',
      question: 'Do I need an account to place an order?',
      answer: 'Yes, creating an account is required to place orders. This allows you to track orders, save addresses, view order history, and manage your wishlist. Registration is quick, free, and your information is kept secure.',
      tags: ['account', 'registration', 'signup', 'required'],
      priority: 1,
      views: 3432,
      helpful: 2876
    },
    {
      id: 'acc-2',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your registered email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password. If you don\'t receive the email within 10 minutes, check your spam folder.',
      tags: ['password', 'reset', 'forgot', 'recovery'],
      priority: 2,
      views: 2341,
      helpful: 1987
    },
    {
      id: 'acc-3',
      question: 'Is my personal information safe?',
      answer: 'Yes, we take data privacy very seriously. Your personal information is encrypted and stored securely. We never share your data with third parties without your consent. We comply with industry-standard security protocols to protect your information.',
      tags: ['privacy', 'security', 'data protection', 'safe'],
      priority: 3,
      views: 1876,
      helpful: 1543
    },
    {
      id: 'acc-4',
      question: 'Can I delete my account?',
      answer: 'Yes, you can request account deletion by contacting our support team at officialrizara@gmail.com. Please note that deleting your account will permanently remove your order history, saved addresses, and wishlist. This action cannot be undone.',
      tags: ['delete', 'remove', 'close account', 'deactivate'],
      priority: 4,
      views: 654,
      helpful: 432
    },
    {
      id: 'acc-5',
      question: 'How do I update my profile information?',
      answer: 'Log in to your account and go to Profile Settings. You can update your name, email, phone number, and password. To change your email address, you\'ll need to verify the new email through an OTP sent to both old and new addresses.',
      tags: ['profile', 'update', 'edit', 'change details'],
      priority: 5,
      views: 1234,
      helpful: 987
    }
  ]
};

/**
 * Get all FAQs organized by category
 */
export const getAllFAQs = () => {
  return faqCategories.map(category => ({
    ...category,
    faqs: faqQuestions[category.id] || []
  }));
};

/**
 * Search FAQs by query string
 */
export const searchFAQs = (query) => {
  const lowercaseQuery = query.toLowerCase();
  const results = [];
  
  Object.keys(faqQuestions).forEach(categoryId => {
    const category = faqCategories.find(cat => cat.id === categoryId);
    
    faqQuestions[categoryId].forEach(faq => {
      const matchesQuestion = faq.question.toLowerCase().includes(lowercaseQuery);
      const matchesAnswer = faq.answer.toLowerCase().includes(lowercaseQuery);
      const matchesTags = faq.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));
      
      if (matchesQuestion || matchesAnswer || matchesTags) {
        results.push({
          ...faq,
          categoryName: category.name,
          categoryIcon: category.icon
        });
      }
    });
  });
  
  return results;
};

/**
 * Get FAQs by category ID
 */
export const getFAQsByCategory = (categoryId) => {
  const category = faqCategories.find(cat => cat.id === categoryId);
  
  if (!category) return null;
  
  return {
    ...category,
    faqs: faqQuestions[categoryId] || []
  };
};

/**
 * Get popular FAQs (sorted by views)
 */
export const getPopularFAQs = (limit = 10) => {
  const allFAQs = [];
  
  Object.keys(faqQuestions).forEach(categoryId => {
    const category = faqCategories.find(cat => cat.id === categoryId);
    
    faqQuestions[categoryId].forEach(faq => {
      allFAQs.push({
        ...faq,
        categoryName: category.name,
        categoryIcon: category.icon
      });
    });
  });
  
  return allFAQs
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
};

export default {
  faqCategories,
  faqQuestions,
  getAllFAQs,
  searchFAQs,
  getFAQsByCategory,
  getPopularFAQs
};