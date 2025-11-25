// frontend/src/services/geocodingService.js

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Search addresses using Mapbox API (Primary)
 * Falls back to Nominatim if Mapbox fails
 */
const mapboxSearch = async (query) => {
  try {
    if (!MAPBOX_TOKEN) {
      console.warn('Mapbox token not configured, falling back to Nominatim');
      return nominatimSearch(query);
    }

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${MAPBOX_TOKEN}&country=IN&limit=5`
    );

    if (!response.ok) throw new Error('Mapbox API error');

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return nominatimSearch(query);
    }

    return data.features.map((feature) => ({
      address: feature.place_name,
      displayName: extractDisplayName(feature),
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
      source: 'mapbox',
      context: feature.context
    }));
  } catch (error) {
    console.error('Mapbox search failed:', error);
    return nominatimSearch(query);
  }
};

/**
 * Search addresses using Nominatim API (Fallback)
 * Free, no API key required
 */
const nominatimSearch = async (query) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(
        query
      )}&format=json&addressdetails=1&limit=5&countrycodes=in`,
      {
        headers: {
          'User-Agent': 'ThePetalPouches-App'
        }
      }
    );

    if (!response.ok) throw new Error('Nominatim API error');

    const data = await response.json();

    return data.map((result) => ({
      address: result.display_name,
      displayName: result.address?.village || result.address?.city || result.address?.town,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      source: 'nominatim',
      address_components: result.address
    }));
  } catch (error) {
    console.error('Nominatim search failed:', error);
    throw new Error('Failed to fetch address suggestions');
  }
};

/**
 * Extract formatted display name from Mapbox context
 */
const extractDisplayName = (feature) => {
  if (feature.context) {
    const place = feature.context.find((c) => c.id.includes('place'));
    const region = feature.context.find((c) => c.id.includes('region'));
    
    const parts = [];
    if (place) parts.push(place.text);
    if (region) parts.push(region.text);
    
    return parts.join(', ');
  }
  return feature.place_name.split(',')[1]?.trim() || 'Location';
};

/**
 * Reverse geocoding - Get address from coordinates
 * Tries Mapbox first, then falls back to Nominatim
 */
const reverseGeocode = async (lat, lng) => {
  try {
    if (MAPBOX_TOKEN) {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          return {
            address: feature.place_name,
            displayName: extractDisplayName(feature),
            lat,
            lng,
            source: 'mapbox'
          };
        }
      }
    }

    // Fallback to Nominatim
    return reverseGeocodeNominatim(lat, lng);
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return reverseGeocodeNominatim(lat, lng);
  }
};

/**
 * Reverse geocoding using Nominatim
 */
const reverseGeocodeNominatim = async (lat, lng) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ThePetalPouches-App'
        }
      }
    );

    if (!response.ok) throw new Error('Reverse geocoding failed');

    const data = await response.json();

    return {
      address: data.display_name,
      displayName: data.address?.village || data.address?.city || data.address?.town,
      lat,
      lng,
      source: 'nominatim',
      address_components: data.address
    };
  } catch (error) {
    console.error('Nominatim reverse geocoding failed:', error);
    throw new Error('Failed to get address from coordinates');
  }
};

/**
 * Get distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees) => {
  return (degrees * Math.PI) / 180;
};

/**
 * Validate if coordinates are within India
 */
const isWithinIndia = (lat, lng) => {
  // India bounding box: lat (8.4-35.8), lng (68.7-97.4)
  return lat >= 8.4 && lat <= 35.8 && lng >= 68.7 && lng <= 97.4;
};

/**
 * Format address for display
 */
const formatAddress = (addressObj) => {
  if (typeof addressObj === 'string') return addressObj;

  const {
    line1 = '',
    line2 = '',
    city = '',
    state = '',
    country = '',
    zip_code = ''
  } = addressObj;

  const parts = [line1, line2, city, state, zip_code, country].filter(Boolean);
  return parts.join(', ');
};

/**
 * Parse address components from API response
 */
const parseAddressComponents = (addressObj) => {
  if (!addressObj) return {};

  return {
    city: addressObj.city || addressObj.town || addressObj.village || '',
    state: addressObj.state || addressObj.county || '',
    country: addressObj.country || 'India',
    zip: addressObj.postcode || '',
    displayName: addressObj.display_name || ''
  };
};

// Export all functions
const geocodingService = {
  search: mapboxSearch,
  reverseGeocode,
  getDistance,
  isWithinIndia,
  formatAddress,
  parseAddressComponents
};

export default geocodingService;