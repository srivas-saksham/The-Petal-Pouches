// frontend/src/components/user/orders/DeliveryAddressCard.jsx

import { MapPin, Phone, Home, Info } from 'lucide-react';

const DeliveryAddressCard = ({ address }) => {
  if (!address) return null;

  return (
    <div className="bg-white dark:bg-tppdarkgray rounded-2xl border-2 border-tppslate/20 dark:border-tppdarkwhite/10 overflow-hidden shadow-sm">
      <div className="bg-tpppink dark:bg-tppdarkwhite px-5 py-3">
        <h3 className="text-white dark:text-tppdark font-bold flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Delivery Address
        </h3>
      </div>
      
      <div className="p-5">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Home className="w-4 h-4 text-tpppink dark:text-tppdarkwhite mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-tppslate dark:text-tppdarkwhite mb-0.5">{address.line1}</p>
              {address.line2 && <p className="text-sm text-tppslate/80 dark:text-tppdarkwhite/60">{address.line2}</p>}
            </div>
          </div>
          
          {address.landmark && (
            <div className="flex items-start gap-2 bg-tppslate/5 dark:bg-tppdarkwhite/5 rounded-lg p-2">
              <Info className="w-4 h-4 text-tppslate/60 dark:text-tppdarkwhite/50 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-tppslate/80 dark:text-tppdarkwhite/60">
                <span className="font-semibold">Landmark: </span>{address.landmark}
              </p>
            </div>
          )}
          
          <div className="pt-2 border-t border-tppslate/20 dark:border-tppdarkwhite/10">
            <p className="text-sm text-tppslate/80 dark:text-tppdarkwhite/60 mb-1">{address.city}, {address.state}</p>
            <p className="text-sm font-semibold text-tppslate dark:text-tppdarkwhite">PIN: {address.zip_code}</p>
          </div>
          
          {address.phone && (
            <div className="pt-3 border-t border-tppslate/20 dark:border-tppdarkwhite/10">
              <div className="flex items-center gap-2 bg-tppslate/5 dark:bg-tppdarkwhite/5 rounded-lg p-3">
                <Phone className="w-4 h-4 text-tpppink dark:text-tppdarkwhite" />
                <span className="font-semibold text-tppslate dark:text-tppdarkwhite">{address.phone}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryAddressCard;