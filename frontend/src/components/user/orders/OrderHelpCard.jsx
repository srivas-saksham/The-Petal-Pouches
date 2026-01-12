// frontend/src/components/user/orders/OrderHelpCard.jsx

import { AlertCircle, Mail, Phone } from 'lucide-react';

/**
 * Order Help Card Component
 * Shows customer support contact information
 */
const OrderHelpCard = () => {
  return (
    <div className="bg-gradient-to-br from-tpppink/10 to-tpppink/5 rounded-2xl border-2 border-tpppink/20 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-tpppink/20 rounded-lg flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-tpppink" />
        </div>
        <h4 className="font-bold text-tppslate">Need Help?</h4>
      </div>
      
      <p className="text-sm text-tppslate/80 mb-4">
        Contact our support team for any questions about your order.
      </p>
      
      <div className="space-y-2">
        <a 
          href="mailto:support@petalpouches.com" 
          className="flex items-center gap-2 text-sm text-tpppink hover:text-tpppink/80 font-medium bg-white rounded-lg p-2 border border-tpppink/20 hover:border-tpppink/40 transition-all"
        >
          <Mail className="w-4 h-4" />
          support@petalpouches.com
        </a>
        <a 
          href="tel:+919999999999" 
          className="flex items-center gap-2 text-sm text-tpppink hover:text-tpppink/80 font-medium bg-white rounded-lg p-2 border border-tpppink/20 hover:border-tpppink/40 transition-all"
        >
          <Phone className="w-4 h-4" />
          +91 99999 99999
        </a>
      </div>
    </div>
  );
};

export default OrderHelpCard;