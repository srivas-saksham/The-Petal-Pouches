// frontend/src/services/geocodingService.js

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Search addresses using Nominatim API (100% Free)
 * Returns autocomplete suggestions as user types
 * 
 * @param {string} query - Search query (min 3 characters)
 * @returns {Promise<Array>} - Array of address suggestions
 */
const searchAddress = async (query) => {
  try {
    if (!query || query.length < 3) {
      return [];
    }

    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?` +
      `q=${encodeURIComponent(query)}&` +
      `format=json&` +
      `addressdetails=1&` +
      `limit=8&` +
      `countrycodes=in`,
      {
        headers: {
          'User-Agent': 'Rizara-Address-App'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();

    return data.map((result) => ({
      id: result.place_id,
      address: result.display_name,
      displayName: result.address?.city || result.address?.town || result.address?.village || result.address?.state || 'Location',
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      source: 'nominatim',
      components: {
        road: result.address?.road || '',
        neighbourhood: result.address?.neighbourhood || result.address?.suburb || '',
        city: result.address?.city || result.address?.town || result.address?.village || '',
        city_district: result.address?.city_district || '',
        state: result.address?.state || result.address?.state_district || '',
        postcode: result.address?.postcode || '',
        country: result.address?.country || 'India',
        'ISO3166-2-lvl4': result.address['ISO3166-2-lvl4'] || ''
      }
    }));
  } catch (error) {
    console.error('Address search failed:', error);
    return [];
  }
};

/**
 * Reverse geocode coordinates to address (100% Free)
 * Used for GPS location to address conversion
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} - Address data
 */
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?` +
      `format=json&` +
      `lat=${lat}&` +
      `lon=${lng}&` +
      `addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Rizara-Address-App'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();

    return {
      address: data.display_name,
      displayName: data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'Location',
      lat,
      lng,
      source: 'nominatim',
      address_components: {
        road: data.address?.road || '',
        neighbourhood: data.address?.neighbourhood || data.address?.suburb || '',
        city: data.address?.city || data.address?.town || data.address?.village || '',
        city_district: data.address?.city_district || '',
        state: data.address?.state || data.address?.state_district || '',
        postcode: data.address?.postcode || '',
        country: data.address?.country || 'India',
        'ISO3166-2-lvl4': data.address['ISO3166-2-lvl4'] || ''
      }
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    throw error;
  }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude 1
 * @param {number} lng1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lng2 - Longitude 2
 * @returns {number} - Distance in kilometers
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

const toRad = (degrees) => (degrees * Math.PI) / 180;

/**
 * Validate if coordinates are within India
 */
const isWithinIndia = (lat, lng) => {
  return lat >= 8.4 && lat <= 35.8 && lng >= 68.7 && lng <= 97.4;
};

/**
 * Format address for display
 */
const formatAddress = (addressObj) => {
  if (typeof addressObj === 'string') return addressObj;

  const { line1, line2, city, state, country, zip_code } = addressObj;
  const parts = [line1, line2, city, state, zip_code, country].filter(Boolean);
  return parts.join(', ');
};

// Export all functions
const geocodingService = {
  search: searchAddress,
  reverseGeocode,
  getDistance,
  isWithinIndia,
  formatAddress
};

export default geocodingService;