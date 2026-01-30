// frontend/src/components/user/addresses/AddressLocationModal.jsx

import React, { useState, useEffect } from 'react';
import { MapPin, Loader, X, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * AddressLocationModal Component
 * Minimal, clean GPS location modal with auto-detection
 * 
 * Features:
 * - Auto-detects if permission already granted (skips modal)
 * - Minimal UI with no lengthy disclaimers
 * - Mobile-responsive design
 * - Smart error handling
 */
const AddressLocationModal = ({ 
  isOpen, 
  onClose, 
  onLocationSelect,
  reverseGeocodeFunc 
}) => {
  const [status, setStatus] = useState('checking'); // 'checking', 'request', 'loading', 'success', 'error'
  const [error, setError] = useState(null);

  /**
   * Check permission status on mount
   * If already granted, fetch location immediately without showing modal
   */
  useEffect(() => {
    if (!isOpen) return;

    const checkPermission = async () => {
      if (!navigator.permissions || !navigator.geolocation) {
        setStatus('request');
        return;
      }

      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permission.state === 'granted') {
          // Permission already granted - fetch location immediately
          console.log('✅ Location permission already granted');
          fetchLocation();
        } else if (permission.state === 'denied') {
          // Permission denied - show error
          setStatus('error');
          setError('Location access is blocked. Please enable it in your browser settings.');
        } else {
          // Need to request permission
          setStatus('request');
        }
      } catch (err) {
        // Fallback if permissions API not supported
        setStatus('request');
      }
    };

    checkPermission();
  }, [isOpen]);

  /**
   * Fetch GPS location
   */
  const fetchLocation = () => {
    setStatus('loading');
    setError(null);

    if (!navigator.geolocation) {
      setStatus('error');
      setError('Location not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          
          console.log('📍 GPS:', { latitude, longitude, accuracy: `${Math.round(accuracy)}m` });

          // Reverse geocode
          let addressData = null;
          if (reverseGeocodeFunc) {
            try {
              addressData = await reverseGeocodeFunc(latitude, longitude);
            } catch (err) {
              console.warn('Geocoding failed:', err);
            }
          }

          setStatus('success');

          // Send data to parent
          if (onLocationSelect) {
            onLocationSelect({
              lat: latitude,
              lng: longitude,
              address: addressData?.address || '',
              displayName: addressData?.displayName || '',
              components: addressData?.address_components || {}
            });
          }

          // Auto-close after 1 second
          setTimeout(onClose, 1000);

        } catch (err) {
          console.error('Location processing error:', err);
          setStatus('error');
          setError('Failed to process location');
        }
      },
      (err) => {
        console.error('GPS error:', err);
        setStatus('error');

        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location access denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable');
            break;
          case err.TIMEOUT:
            setError('Request timed out');
            break;
          default:
            setError('Location error');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          
          {/* Header */}
          <div className="relative bg-gradient-to-br from-tpppink to-tpppeach p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {status === 'loading' || status === 'checking' ? (
                  <Loader className="w-6 h-6 animate-spin" />
                ) : status === 'success' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : status === 'error' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <MapPin className="w-6 h-6" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {status === 'checking' ? 'Checking...' :
                   status === 'loading' ? 'Getting Location' :
                   status === 'success' ? 'Location Found' :
                   status === 'error' ? 'Error' :
                   'Use Location'}
                </h2>
                <p className="text-white/80 text-xs mt-0.5">
                  {status === 'checking' ? 'Please wait' :
                   status === 'loading' ? 'Detecting address' :
                   status === 'success' ? 'Auto-filling form' :
                   status === 'error' ? 'Something went wrong' :
                   'Auto-fill your address'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            
            {/* CHECKING (Hidden state - quick transition) */}
            {status === 'checking' && (
              <div className="text-center py-6">
                <Loader className="w-8 h-8 text-tpppink animate-spin mx-auto" />
              </div>
            )}

            {/* REQUEST PERMISSION */}
            {status === 'request' && (
              <>
                <p className="text-sm text-tppslate/80 mb-4 text-center">
                  We'll use your device's GPS to auto-fill the address form
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={fetchLocation}
                    className="flex-1 px-4 py-2.5 bg-tpppink hover:bg-tpppink/90 text-white rounded-lg font-semibold transition-all text-sm"
                  >
                    Allow Location
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 border-2 border-tppslate/20 hover:border-tppslate/30 text-tppslate rounded-lg font-medium transition-all text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* LOADING */}
            {status === 'loading' && (
              <div className="text-center py-6">
                <Loader className="w-10 h-10 text-tpppink animate-spin mx-auto mb-3" />
                <p className="text-sm text-tppslate/70">Detecting your location...</p>
              </div>
            )}

            {/* SUCCESS */}
            {status === 'success' && (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-tppslate font-semibold mb-1">Success!</p>
                <p className="text-xs text-tppslate/70">
                  Verify the auto-filled address details
                </p>
              </div>
            )}

            {/* ERROR */}
            {status === 'error' && (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>

                {error?.includes('denied') || error?.includes('blocked') ? (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-700 font-medium mb-1">Enable location:</p>
                    <p className="text-xs text-gray-600">
                      Click the <strong>lock icon</strong> in your browser's address bar → 
                      Allow location → Refresh page
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={fetchLocation}
                    className="flex-1 px-4 py-2.5 bg-tpppink hover:bg-tpppink/90 text-white rounded-lg font-semibold transition-all text-sm"
                  >
                    Retry
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 border-2 border-tppslate/20 hover:border-tppslate/30 text-tppslate rounded-lg font-medium transition-all text-sm"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressLocationModal;