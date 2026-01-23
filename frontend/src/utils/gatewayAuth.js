// frontend/src/utils/gatewayAuth.js
const GATEWAY_TOKEN_KEY = 'gatewayToken';

/**
 * Check if gateway is enabled
 */
export const isGatewayEnabled = () => {
  return import.meta.env.VITE_GATEWAY_ENABLED === 'true';
};

/**
 * Get stored gateway token
 */
export const getGatewayToken = () => {
  if (!isGatewayEnabled()) {
    return null;
  }

  return localStorage.getItem(GATEWAY_TOKEN_KEY);
};

/**
 * Store gateway JWT token
 */
export const setGatewayToken = (token) => {
  localStorage.setItem(GATEWAY_TOKEN_KEY, token);
};

/**
 * Clear stored token
 */
export const clearGatewayToken = () => {
  localStorage.removeItem(GATEWAY_TOKEN_KEY);
};

/**
 * Check if user has valid gateway access
 */
export const hasGatewayAccess = () => {
  if (!isGatewayEnabled()) {
    return true;
  }

  return getGatewayToken() !== null;
};

/**
 * Get gateway headers for API requests
 */
export const getGatewayHeaders = () => {
  if (!isGatewayEnabled()) {
    return {};
  }

  const token = getGatewayToken();
  if (!token) {
    return {};
  }

  const headerName = import.meta.env.VITE_GATEWAY_HEADER_NAME || 'x-gateway-token';
  
  return {
    [headerName]: token // ✅ Send JWT token, not password
  };
};