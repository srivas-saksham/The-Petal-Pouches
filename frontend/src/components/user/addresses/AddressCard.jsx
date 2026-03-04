import React from 'react';
import { Home, Briefcase, MapPin, Star, Edit2, Trash2 } from 'lucide-react';

const getAddressTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'home': return Home;
    case 'work': return Briefcase;
    default: return MapPin;
  }
};

const formatAddressLine = (address) => {
  const parts = [address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean);
  return parts.join(', ');
};

const AddressCard = ({ address, layout = "2-column", onEdit, onDelete, onSetDefault }) => {
  const TypeIcon = getAddressTypeIcon(address.type);
  if (!address) return null;

  const MobileLayout = () => (
    <div className="md:hidden">
      <div className={`bg-white dark:bg-tppdarkgray rounded-lg border-2 ${
        address.is_default
          ? 'border-tpppink dark:border-tppdarkwhite shadow-md'
          : 'border-tppslate/10 dark:border-tppdarkwhite/10 hover:border-tpppink/30 dark:hover:border-tppdarkwhite/20'
      } transition-all duration-200 overflow-hidden relative`}>
        {address.is_default && (
          <div className="absolute top-0 left-0 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark px-2 py-0.5 rounded-br text-[10px] font-bold uppercase tracking-wide shadow flex items-center gap-0.5 z-10">
            <Star className="w-2.5 h-2.5 fill-current" />Default
          </div>
        )}
        <div className="p-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${address.is_default ? 'bg-tpppink/10 dark:bg-tppdarkwhite/10' : 'bg-tppslate/10 dark:bg-tppdarkwhite/5'} flex items-center justify-center flex-shrink-0`}>
              <TypeIcon className={`w-4 h-4 ${address.is_default ? 'text-tpppink dark:text-tppdarkwhite' : 'text-tppslate dark:text-tppdarkwhite/70'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-tppslate dark:text-tppdarkwhite capitalize">{address.type || 'Address'}</h3>
              {address.label && <p className="text-[10px] text-tppslate/80 dark:text-tppdarkwhite/50 truncate">{address.label}</p>}
            </div>
          </div>
          {address.name && <p className="text-xs font-bold text-tppslate dark:text-tppdarkwhite">{address.name}</p>}
          <div className="space-y-1 text-xs text-tppslate/80 dark:text-tppdarkwhite/60">
            <p className="leading-relaxed">{formatAddressLine(address)}</p>
            {address.phone && <p><span className="font-semibold">Phone:</span> {address.phone}</p>}
            {address.landmark && <p className="text-[11px]"><span className="font-semibold">Landmark:</span> {address.landmark}</p>}
            {address.zip_code && <p className="text-[11px]"><span className="font-semibold">Zip:</span> {address.zip_code}</p>}
          </div>
          <div className="flex gap-1 pt-2 border-t border-tppslate/10 dark:border-tppdarkwhite/10">
            {!address.is_default && (
              <button onClick={() => onSetDefault(address.id)} className="flex-1 px-1.5 py-2 bg-tppslate/5 dark:bg-tppdarkwhite/5 border border-tppslate/20 dark:border-tppdarkwhite/10 text-tppslate dark:text-tppdarkwhite text-[10px] rounded hover:bg-tppslate/10 dark:hover:bg-tppdarkwhite/10 font-bold transition-all flex items-center justify-center gap-0.5" title="Set Default">
                <Star className="w-3.5 h-3.5" /><span className="hidden xs:inline">Default</span>
              </button>
            )}
            <button onClick={() => onEdit(address)} className="flex-1 px-1.5 py-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 font-bold transition-all flex items-center justify-center gap-0.5" title="Edit">
              <Edit2 className="w-3.5 h-3.5" /><span className="hidden xs:inline">Edit</span>
            </button>
            <button onClick={() => onDelete(address.id)} className="flex-1 px-1.5 py-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[10px] rounded hover:bg-red-100 dark:hover:bg-red-900/20 font-bold transition-all flex items-center justify-center gap-0.5" title="Delete">
              <Trash2 className="w-3.5 h-3.5" /><span className="hidden xs:inline">Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (layout === "2-column") {
    return (
      <>
        <MobileLayout />
        <div className="hidden md:block">
          <div className={`bg-white dark:bg-tppdarkgray rounded-lg border-2 ${
            address.is_default
              ? 'border-tpppink dark:border-tppdarkwhite shadow-md'
              : 'border-tppslate/10 dark:border-tppdarkwhite/10 hover:border-tpppink/30 dark:hover:border-tppdarkwhite/20'
          } transition-all duration-200 overflow-hidden group relative`}>
            {address.is_default && (
              <div className="absolute top-0 left-0 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark px-3 py-1 rounded-br-lg text-xs font-bold uppercase tracking-wide shadow-lg flex items-center gap-1 z-10">
                <Star className="w-3 h-3 fill-current" />Default
              </div>
            )}
            <div className="p-5 flex gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-full ${address.is_default ? 'bg-tpppink/10 dark:bg-tppdarkwhite/10' : 'bg-tppslate/10 dark:bg-tppdarkwhite/5'} flex items-center justify-center`}>
                    <TypeIcon className={`w-5 h-5 ${address.is_default ? 'text-tpppink dark:text-tppdarkwhite' : 'text-tppslate dark:text-tppdarkwhite/70'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-tppslate dark:text-tppdarkwhite capitalize">{address.type || 'Address'}</h3>
                    {address.label && <p className="text-xs text-tppslate/80 dark:text-tppdarkwhite/50 truncate">{address.label}</p>}
                  </div>
                </div>
                {address.name && <div className="mb-2"><p className="text-sm font-bold text-tppslate dark:text-tppdarkwhite">{address.name}</p></div>}
                <div className="space-y-1.5">
                  <p className="text-sm text-tppslate/80 dark:text-tppdarkwhite/60 leading-relaxed">{formatAddressLine(address)}</p>
                  {address.phone && <p className="text-sm text-tppslate/80 dark:text-tppdarkwhite/60"><span className="font-semibold">Phone:</span> {address.phone}</p>}
                  {address.landmark && <p className="text-xs text-tppslate/80 dark:text-tppdarkwhite/60"><span className="font-semibold">Landmark:</span> {address.landmark}</p>}
                  {address.zip_code && <p className="text-xs text-tppslate/80 dark:text-tppdarkwhite/60"><span className="font-semibold">Zip Code:</span> {address.zip_code}</p>}
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-1 border-l-2 border-tppslate/30 dark:border-tppdarkwhite/10 border-dashed pl-3 justify-between">
                {!address.is_default && (
                  <button onClick={() => onSetDefault(address.id)} className="px-3 py-2 bg-tppslate/5 dark:bg-tppdarkwhite/5 border border-tppslate/20 dark:border-tppdarkwhite/10 text-tppslate dark:text-tppdarkwhite text-xs rounded-lg hover:bg-tppslate/10 dark:hover:bg-tppdarkwhite/10 font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap">
                    <Star className="w-3.5 h-3.5" />Set Default
                  </button>
                )}
                <button onClick={() => onEdit(address)} className="px-3 py-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <Edit2 className="w-3.5 h-3.5" />Edit
                </button>
                <button onClick={() => onDelete(address.id)} className="px-3 py-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <Trash2 className="w-3.5 h-3.5" />Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 3-column layout
  return (
    <>
      <MobileLayout />
      <div className="hidden md:block">
        <div className={`bg-white dark:bg-tppdarkgray rounded-lg border ${
          address.is_default
            ? 'border-tpppink dark:border-tppdarkwhite shadow-md'
            : 'border-tppslate/10 dark:border-tppdarkwhite/10 hover:border-tpppink/30 dark:hover:border-tppdarkwhite/20'
        } transition-all duration-200 overflow-hidden group relative`}>
          {address.is_default && (
            <div className="absolute top-0 left-0 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark px-2 py-0.5 rounded-br text-[10px] font-bold uppercase tracking-wide shadow flex items-center gap-1 z-10">
              <Star className="w-2.5 h-2.5 fill-current" />Default
            </div>
          )}
          <div className="p-3 flex gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full ${address.is_default ? 'bg-tpppink/10 dark:bg-tppdarkwhite/10' : 'bg-tppslate/10 dark:bg-tppdarkwhite/5'} flex items-center justify-center flex-shrink-0`}>
                  <TypeIcon className={`w-4 h-4 ${address.is_default ? 'text-tpppink dark:text-tppdarkwhite' : 'text-tppslate dark:text-tppdarkwhite/70'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-tppslate dark:text-tppdarkwhite capitalize truncate">{address.type || 'Address'}</h3>
                  {address.label && <p className="text-[10px] text-tppslate/80 dark:text-tppdarkwhite/50 truncate">{address.label}</p>}
                </div>
              </div>
              {address.name && <p className="text-xs font-bold text-tppslate dark:text-tppdarkwhite mb-2">{address.name}</p>}
              <div className="space-y-1">
                <p className="text-xs text-tppslate/80 dark:text-tppdarkwhite/60 leading-snug">{formatAddressLine(address)}</p>
                {address.phone && <p className="text-xs text-tppslate/80 dark:text-tppdarkwhite/60"><span className="font-semibold">Phone:</span> {address.phone}</p>}
                {address.landmark && <p className="text-xs text-tppslate/80 dark:text-tppdarkwhite/60"><span className="font-semibold">Landmark:</span> {address.landmark}</p>}
                {address.zip_code && <p className="text-xs text-tppslate/80 dark:text-tppdarkwhite/60"><span className="font-semibold">Zip Code:</span> {address.zip_code}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 pt-1 border-l-2 border-tppslate/30 dark:border-tppdarkwhite/10 border-dashed pl-3 justify-between">
              {!address.is_default && (
                <button onClick={() => onSetDefault(address.id)} className="p-2 bg-tppslate/5 dark:bg-tppdarkwhite/5 border border-tppslate/20 dark:border-tppdarkwhite/10 text-tppslate dark:text-tppdarkwhite rounded hover:bg-tppslate/10 dark:hover:bg-tppdarkwhite/10 font-bold transition-all flex items-center justify-center" title="Set Default">
                  <Star className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => onEdit(address)} className="p-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 font-bold transition-all flex items-center justify-center" title="Edit">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(address.id)} className="p-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/20 font-bold transition-all flex items-center justify-center" title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressCard;