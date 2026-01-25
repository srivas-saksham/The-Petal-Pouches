// frontend/src/components/bundle-detail/FloatingSidebar/TrustBadgesSection.jsx
import React, { useState } from 'react';
import { ShieldCheck, RotateCcw, X, CreditCard, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * TrustBadgesSection - Compact trust indicators
 * Shows why customers should feel confident purchasing
 */
const TrustBadgesSection = () => {
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  const badges = [
    { 
      icon: ShieldCheck, 
      title: 'Secure Checkout',
      color: 'text-green-600 bg-green-50',
      clickable: true,
      onClick: () => setShowPaymentInfo(true)
    },
    { 
      icon: RotateCcw, 
      title: '5-Day Returns',
      color: 'text-blue-600 bg-blue-50',
      clickable: true,
      onClick: () => setShowRefundPolicy(true)
    }
  ];

  return (
    <>
      <div className="p-4">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Why Shop With Us
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                onClick={badge.clickable ? badge.onClick : undefined}
                className={`flex items-center gap-2 p-2 border border-gray-200 rounded hover:border-gray-300 transition-colors ${
                  badge.clickable ? 'cursor-pointer hover:bg-gray-50' : ''
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${badge.color}`}>
                  <Icon size={14} />
                </div>
                <p className="text-xs font-semibold text-gray-800 leading-tight underline decoration-1 underline-offset-2">
                  {badge.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Info Modal */}
      <AnimatePresence>
        {showPaymentInfo && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowPaymentInfo(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
            />

            {/* Modal - Slides up from bottom */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[40vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-800">Secure Checkout</h3>
                <button
                  onClick={() => setShowPaymentInfo(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 text-sm text-gray-700">
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Payment Security:</p>
                  <p>All transactions are encrypted and processed through secure payment gateways to ensure your financial information remains protected.</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-800 mb-2">Accepted Payment Methods:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-gray-600" />
                      <span>Credit & Debit Cards (Visa, Mastercard, RuPay, American Express)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone size={16} className="text-gray-600" />
                      <span>UPI (Google Pay, PhonePe, Paytm, and all UPI apps)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-800 mb-1">Safe Shopping Guarantee:</p>
                  <p>Your payment details are never stored on our servers. We comply with industry-standard security protocols to protect your information.</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Refund Policy Modal */}
      <AnimatePresence>
        {showRefundPolicy && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowRefundPolicy(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
            />

            {/* Modal - Slides up from bottom */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[40vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-800">Refund Policy</h3>
                <button
                  onClick={() => setShowRefundPolicy(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 text-sm text-gray-700">
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Eligibility:</p>
                  <p>Returns are accepted only for items that are visibly defective or damaged upon receipt.</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-800 mb-1">Unboxing Video:</p>
                  <p>To help us provide the best customer support, please record an unboxing video with a 360° view of the package and its contents upon delivery.</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-800 mb-2">Return Process:</p>
                  <ol className="list-decimal list-inside space-y-2 pl-1">
                    <li>Contact our support team at <a href="mailto:officialrizara@gmail.com" className="text-blue-600 underline font-medium">officialrizara@gmail.com</a> within 5 days after receiving your order.</li>
                    <li>Submit your unboxing video to help us assess the issue and expedite your return.</li>
                  </ol>
                </div>

                <div>
                  <p className="font-semibold text-gray-800 mb-1">Refunds:</p>
                  <p>Refunds will be processed only after we have received and inspected the returned item. The original shipping fee will not be refunded.</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default TrustBadgesSection;