// frontend/src/utils/geocodingHelpers.js

/**
 * Format address object into readable string
 * @param {Object} addressObj - Address object with components
 * @returns {string} - Formatted address string
 */
export const formatAddress = (addressObj) => {
  if (!addressObj) return '';
  if (typeof addressObj === 'string') return addressObj;

  const {
    line1 = '',
    line2 = '',
    city = '',
    state = '',
    country = '',
    zip_code = ''
  } = addressObj;

  const parts = [line1, line2, city, state, zip_code, country].filter(
    (part) => part && part.trim() !== ''
  );

  return parts.join(', ');
};

/**
 * Validate if address has all required fields
 * @param {Object} addressObj - Address object to validate
 * @returns {Object} - { isValid: boolean, missingFields: string[] }
 */
export const validateAddressComplete = (addressObj) => {
  const required = ['line1', 'city', 'state', 'country', 'zip_code'];
  const missingFields = required.filter((field) => !addressObj[field] || addressObj[field].trim() === '');

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} - Distance in kilometers
 */
export const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} - Angle in radians
 */
export const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} - Angle in degrees
 */
export const toDegrees = (radians) => {
  return (radians * 180) / Math.PI;
};

/**
 * Parse address components from geocoding API response
 * @param {Object} apiResponse - Response from Mapbox or Nominatim
 * @returns {Object} - Parsed address components
 */
export const parseAddressComponents = (apiResponse) => {
  if (!apiResponse) return {};

  // Handle Mapbox context response
  if (apiResponse.context) {
    const result = {};

    apiResponse.context.forEach((item) => {
      if (item.id.includes('place')) result.city = item.text;
      if (item.id.includes('district')) result.district = item.text;
      if (item.id.includes('region')) result.state = item.text;
      if (item.id.includes('country')) result.country = item.text;
      if (item.id.includes('postcode')) result.zip_code = item.text;
    });

    return result;
  }

  // Handle Nominatim address response
  if (apiResponse.address) {
    const addr = apiResponse.address;
    return {
      city: addr.city || addr.town || addr.village || '',
      district: addr.district || '',
      state: addr.state || addr.county || '',
      country: addr.country || 'India',
      zip_code: addr.postcode || '',
      landmark: addr.road || addr.neighbourhood || ''
    };
  }

  return {};
};

/**
 * Build formatted address string for shipping
 * @param {string} line1 - Address line 1
 * @param {string} line2 - Address line 2
 * @param {string} city - City name
 * @param {string} state - State name
 * @param {string} country - Country name
 * @param {string} zip_code - ZIP/Postal code
 * @returns {string} - Formatted address for shipping
 */
export const buildAddressString = (
  line1,
  line2,
  city,
  state,
  country,
  zip_code
) => {
  const parts = [];

  if (line1) parts.push(line1);
  if (line2) parts.push(line2);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (zip_code) parts.push(zip_code);
  if (country) parts.push(country);

  return parts.filter((p) => p && p.trim() !== '').join(', ');
};

/**
 * Validate ZIP/Postal code format for India
 * @param {string} zipCode - ZIP code to validate
 * @returns {boolean} - Is valid Indian PIN code
 */
export const validateIndianZipCode = (zipCode) => {
  // Indian PIN code: 6 digits
  const pinRegex = /^[1-9]{1}[0-9]{5}$/;
  return pinRegex.test(zipCode);
};

/**
 * Validate phone number format for India
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Is valid Indian phone number
 */
export const validateIndianPhoneNumber = (phone) => {
  // Indian phone: 10 digits starting with 6-9
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Check if coordinates are within India bounds
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} - Is within India
 */
export const isWithinIndiaBounds = (lat, lng) => {
  // India bounding box: lat (8.4-35.8), lng (68.7-97.4)
  return lat >= 8.4 && lat <= 35.8 && lng >= 68.7 && lng <= 97.4;
};

/**
 * Get state name from coordinates (approximate)
 * Maps major Indian cities to states
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} - State name or empty string
 */
export const getStateFromCoordinates = (lat, lng) => {
  const majorCities = [
    { city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
    { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8776 },
    { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
    { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { city: 'Hyderabad', state: 'Telangana', lat: 17.3685, lng: 78.4711 },
    { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
    { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
    { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 }
  ];

  // Find nearest city
  let nearest = null;
  let minDistance = Infinity;

  majorCities.forEach((city) => {
    const distance = getDistanceKm(lat, lng, city.lat, city.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = city;
    }
  });

  return minDistance < 200 ? nearest.state : '';
};

/**
 * Format address for display (multi-line)
 * @param {Object} addressObj - Address object
 * @returns {string} - Multi-line formatted address
 */
export const formatAddressMultiLine = (addressObj) => {
  if (!addressObj) return '';

  const { line1 = '', line2 = '', city = '', state = '', zip_code = '', country = '' } = addressObj;

  const lines = [];
  if (line1) lines.push(line1);
  if (line2) lines.push(line2);
  if (city || state) lines.push(`${city} ${state}`.trim());
  if (zip_code) lines.push(zip_code);
  if (country) lines.push(country);

  return lines.join('\n');
};

/**
 * Sanitize address input to prevent XSS
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
export const sanitizeAddressInput = (input) => {
  if (!input) return '';
  return input
    .replace(/[<>\"']/g, '')
    .trim()
    .substring(0, 100);
};

/**
 * Extract postal code from full address string
 * @param {string} addressStr - Full address string
 * @returns {string} - Postal code if found
 */
export const extractPostalCode = (addressStr) => {
  if (!addressStr) return '';
  const matches = addressStr.match(/\b\d{6}\b/);
  return matches ? matches[0] : '';
};

// Export all as object for flexibility
export default {
  formatAddress,
  validateAddressComplete,
  getDistanceKm,
  toRadians,
  toDegrees,
  parseAddressComponents,
  buildAddressString,
  validateIndianZipCode,
  validateIndianPhoneNumber,
  capitalizeWords,
  isWithinIndiaBounds,
  getStateFromCoordinates,
  formatAddressMultiLine,
  sanitizeAddressInput,
  extractPostalCode
};