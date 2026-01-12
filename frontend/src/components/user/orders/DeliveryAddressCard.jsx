// frontend/src/components/user/orders/DeliveryAddressCard.jsx

import { MapPin, Phone, Home, Info } from 'lucide-react';

/**
 * Delivery Address Card Component
 * Shows shipping address details
 */
const DeliveryAddressCard = ({ address }) => {
  if (!address) return null;

  return (
    <div className="bg-white rounded-2xl border-2 border-tppslate/20 overflow-hidden shadow-sm">
      <div className="bg-tpppink px-5 py-3">
        <h3 className="text-white font-bold flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Delivery Address
        </h3>
      </div>
      
      <div className="p-5">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Home className="w-4 h-4 text-tpppink mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-tppslate mb-0.5">
                {address.line1}
              </p>
              {address.line2 && (
                <p className="text-sm text-tppslate/80">
                  {address.line2}
                </p>
              )}
            </div>
          </div>
          
          {address.landmark && (
            <div className="flex items-start gap-2 bg-tppslate/5 rounded-lg p-2">
              <Info className="w-4 h-4 text-tppslate/60 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-tppslate/80">
                <span className="font-semibold">Landmark: </span>
                {address.landmark}
              </p>
            </div>
          )}
          
          <div className="pt-2 border-t border-tppslate/20">
            <p className="text-sm text-tppslate/80 mb-1">
              {address.city}, {address.state}
            </p>
            <p className="text-sm font-semibold text-tppslate">
              PIN: {address.zip_code}
            </p>
          </div>
          
          {address.phone && (
            <div className="pt-3 border-t border-tppslate/20">
              <div className="flex items-center gap-2 bg-tppslate/5 rounded-lg p-3">
                <Phone className="w-4 h-4 text-tpppink" />
                <span className="font-semibold text-tppslate">
                  {address.phone}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryAddressCard;