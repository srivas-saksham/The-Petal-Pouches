// frontend/src/components/order-success/ShippingAddressCard.jsx

import { MapPin, Phone } from 'lucide-react';

const ShippingAddressCard = ({ address = {} }) => {
  if (!address || Object.keys(address).length === 0) {
    return null;
  }

  const { line1, line2, landmark, city, state, zip_code, phone } = address;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-tppslate px-4 py-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-white" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wide">Shipping Address</h3>
      </div>

      <div className="p-4 space-y-2 text-sm">
        {line1 && <p className="font-semibold text-tppslate">{line1}</p>}
        {line2 && <p className="text-slate-600">{line2}</p>}
        {landmark && <p className="text-slate-600 text-xs">Near: {landmark}</p>}
        {(city || state) && (
          <p className="text-slate-600">{city}{city && state ? ', ' : ''}{state}</p>
        )}
        {zip_code && <p className="text-slate-600 font-mono">{zip_code}</p>}
        
        {phone && (
          <div className="pt-3 mt-3 border-t border-slate-200 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-tpppink" />
            <span className="text-xs text-slate-500">Contact:</span>
            <span className="font-semibold text-tppslate">{phone}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingAddressCard;