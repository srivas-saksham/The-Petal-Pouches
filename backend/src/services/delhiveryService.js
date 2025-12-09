// backend/src/services/delhiveryService.js
/**
 * Delhivery Service - Complete Working Version with Fallback TAT
 * Handles all communication with Delhivery APIs
 * 
 * Features:
 * - Pincode serviceability check
 * - TAT API with intelligent fallback
 * - Zone-based delivery estimates
 */

const axios = require('axios');

class DelhiveryService {
  constructor() {
    this.apiToken = process.env.DELHIVERY_API_TOKEN;
    this.baseURL = process.env.DELHIVERY_API_URL || 'https://track.delhivery.com';
    this.warehousePincode = process.env.WAREHOUSE_PINCODE || '110059';
    
    // Validate configuration
    if (!this.apiToken) {
      console.error('❌ CRITICAL: DELHIVERY_API_TOKEN not configured in .env file!');
      console.error('Add this line to your .env file:');
      console.error('DELHIVERY_API_TOKEN=your-token-here');
    } else {
      console.log(`✅ Delhivery configured: ${this.baseURL}`);
      console.log(`   Token: ${this.apiToken.substring(0, 10)}... (${this.apiToken.length} chars)`);
      console.log(`   Warehouse: ${this.warehousePincode}`);
    }
  }

  // ==================== PINCODE SERVICEABILITY ====================

  /**
   * Check if a pincode is serviceable
   * @param {string} pincode - 6-digit pincode
   * @returns {Promise<Object>} Serviceability info
   */
  async checkPincodeServiceability(pincode) {
    try {
      // Validate pincode format
      if (!pincode || !/^\d{6}$/.test(String(pincode))) {
        return {
          pincode: String(pincode),
          serviceable: false,
          error: 'Invalid pincode format. Must be exactly 6 digits.',
          status: 'Invalid'
        };
      }

      // Check if token is configured
      if (!this.apiToken) {
        return {
          pincode: String(pincode),
          serviceable: false,
          error: 'Delhivery API token not configured. Check .env file.',
          status: 'Configuration Error'
        };
      }

      console.log(`🔍 [Delhivery] Checking serviceability for pincode: ${pincode}`);

      // Delhivery Pincode API endpoint
      const url = `${this.baseURL}/c/api/pin-codes/json/`;

      const response = await axios.get(url, {
        params: {
          filter_codes: pincode
        },
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000,
        validateStatus: function (status) {
          return status < 500; // Don't throw for 4xx errors
        }
      });

      // Handle authentication errors
      if (response.status === 401) {
        console.error('❌ [Delhivery] 401 Unauthorized - Token is invalid!');
        return {
          pincode: String(pincode),
          serviceable: false,
          error: 'Invalid Delhivery API token. Please check your credentials.',
          status: 'Authentication Failed',
          hint: 'Contact clientservice@delhivery.com for new token'
        };
      }

      if (response.status === 403) {
        console.error('❌ [Delhivery] 403 Forbidden - No permission');
        return {
          pincode: String(pincode),
          serviceable: false,
          error: 'Access forbidden. Token may not have required permissions.',
          status: 'Permission Denied'
        };
      }

      if (response.status === 404) {
        console.error('❌ [Delhivery] 404 Not Found - Wrong endpoint');
        return {
          pincode: String(pincode),
          serviceable: false,
          error: 'API endpoint not found',
          status: 'Endpoint Error'
        };
      }

      if (response.status !== 200) {
        console.error(`❌ [Delhivery] HTTP ${response.status}:`, response.data);
        return {
          pincode: String(pincode),
          serviceable: false,
          error: `API returned status ${response.status}`,
          status: 'API Error'
        };
      }

      const data = response.data;

      // Check if pincode exists in response
      if (!data.delivery_codes || data.delivery_codes.length === 0) {
        console.log(`❌ [Delhivery] Pincode ${pincode} is NOT serviceable`);
        return {
          pincode: String(pincode),
          serviceable: false,
          reason: 'Non-Serviceable Zone (NSZ)',
          status: 'NSZ',
          city: null,
          state: null,
          features: {
            cod: false,
            prepaid: false,
            pickup: false,
            reverse: false,
            cash: false
          }
        };
      }

      const pincodeData = data.delivery_codes[0];
      const postalCode = pincodeData.postal_code || {};

      // Check for embargo
      if (postalCode.remark === 'Embargo') {
        console.log(`⚠️ [Delhivery] Pincode ${pincode} is under EMBARGO`);
        return {
          pincode: String(pincode),
          serviceable: false,
          reason: 'Temporary embargo on this pincode',
          status: 'Embargo',
          city: postalCode.city,
          state: postalCode.state_code,
          features: {
            cod: false,
            prepaid: false,
            pickup: false,
            reverse: false,
            cash: false
          }
        };
      }

      // ✅ Pincode is serviceable
      console.log(`✅ [Delhivery] Pincode ${pincode} is SERVICEABLE`);
      console.log(`   Location: ${postalCode.city}, ${postalCode.state_code}`);

      return {
        pincode: String(pincode),
        serviceable: true,
        status: 'Serviceable',
        city: postalCode.city || null,
        state: postalCode.state_code || null,
        features: {
          cod: this._parseBoolean(pincodeData.cod),
          prepaid: this._parseBoolean(pincodeData.pre_paid),
          pickup: this._parseBoolean(pincodeData.pickup),
          reverse: this._parseBoolean(pincodeData.repl),
          cash: this._parseBoolean(pincodeData.cash)
        }
      };

    } catch (error) {
      console.error('❌ [Delhivery] Serviceability check failed:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        return {
          pincode: String(pincode),
          serviceable: false,
          error: 'Cannot connect to Delhivery API. Check internet connection.',
          status: 'Connection Failed'
        };
      }

      if (error.code === 'ETIMEDOUT') {
        return {
          pincode: String(pincode),
          serviceable: false,
          error: 'Delhivery API request timed out.',
          status: 'Timeout'
        };
      }

      return {
        pincode: String(pincode),
        serviceable: false,
        error: error.message,
        status: 'API Error'
      };
    }
  }

  // ==================== STATIC TAT CALCULATOR (FALLBACK) ====================

  /**
     * Calculate estimated TAT based on state zones
     * This is a fallback when TAT API is not available
     * 
     * @private
     * @param {string} originState - Origin state code (e.g., 'DL')
     * @param {string} destinationState - Destination state code (e.g., 'KA')
     * @param {string} destinationCity - Destination city name
     * @param {string} mode - 'S' (Surface) or 'E' (Express)
     * @returns {number} Estimated days
     */
    _calculateStaticTAT(originState, destinationState, destinationCity, mode = 'S') {
    // Metro cities
    const metroCities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Bengaluru', 'Chennai', 'Kolkata', 
        'Hyderabad', 'Pune', 'Ahmedabad', 'Gurgaon', 'Noida', 'New Delhi'
    ];
    
    // Tier 2 cities
    const tier2Cities = [
        'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 
        'Bhopal', 'Visakhapatnam', 'Vadodara', 'Coimbatore', 'Kochi',
        'Chandigarh', 'Mysore', 'Surat', 'Nashik'
    ];

    // Zone mapping
    const zones = {
        'North': ['DL', 'HR', 'UP', 'UK', 'PB', 'HP', 'JK', 'CH', 'RJ'],
        'South': ['KA', 'TN', 'KL', 'AP', 'TS', 'PY'],
        'East': ['WB', 'OR', 'JH', 'BR', 'AS', 'SK', 'NL', 'MN', 'TR', 'MZ', 'AR'],
        'West': ['MH', 'GJ', 'MP', 'GA', 'DD', 'DN'],
        'Central': ['MP', 'CG']
    };

    // Find zones
    let originZone = null;
    let destZone = null;
    
    for (const [zone, states] of Object.entries(zones)) {
        if (states.includes(originState)) originZone = zone;
        if (states.includes(destinationState)) destZone = zone;
    }

    console.log(`   📍 Route: ${originState} (${originZone}) → ${destinationState} (${destZone})`);
    console.log(`   🏙️  City: ${destinationCity}`);

    // Calculate TAT based on distance zones
    let baseDays = 5; // Default

    // Same state - fastest
    if (originState === destinationState) {
        if (metroCities.includes(destinationCity)) {
        baseDays = mode === 'E' ? 1 : 2;
        } else {
        baseDays = mode === 'E' ? 2 : 3;
        }
    }
    // Same zone - fast
    else if (originZone === destZone) {
        if (metroCities.includes(destinationCity)) {
        baseDays = mode === 'E' ? 2 : 3;
        } else if (tier2Cities.includes(destinationCity)) {
        baseDays = mode === 'E' ? 3 : 4;
        } else {
        baseDays = mode === 'E' ? 3 : 5;
        }
    }
    // Adjacent zones (1 zone gap)
    else if (
        (originZone === 'North' && destZone === 'West') ||
        (originZone === 'North' && destZone === 'Central') ||
        (originZone === 'West' && destZone === 'North') ||
        (originZone === 'West' && destZone === 'Central') ||
        (originZone === 'West' && destZone === 'South') ||
        (originZone === 'South' && destZone === 'West') ||
        (originZone === 'Central' && destZone === 'North') ||
        (originZone === 'Central' && destZone === 'West')
    ) {
        if (metroCities.includes(destinationCity)) {
        baseDays = mode === 'E' ? 3 : 4; // Metro in adjacent zone
        } else if (tier2Cities.includes(destinationCity)) {
        baseDays = mode === 'E' ? 4 : 5; // Tier-2 in adjacent zone
        } else {
        baseDays = mode === 'E' ? 4 : 6; // Smaller cities in adjacent zone
        }
    }
    // Far zones (North-South, North-East, South-East, etc.)
    else {
        if (metroCities.includes(destinationCity)) {
        baseDays = mode === 'E' ? 3 : 5; // Metro in far zone (e.g., Delhi to Bangalore)
        } else if (tier2Cities.includes(destinationCity)) {
        baseDays = mode === 'E' ? 4 : 6; // Tier-2 in far zone
        } else {
        baseDays = mode === 'E' ? 5 : 7; // Smaller cities in far zone
        }
    }

    console.log(`   ⏱️  Calculated TAT: ${baseDays} days (${mode === 'S' ? 'Surface' : 'Express'})`);

    return baseDays;
    }

  // ==================== EXPECTED TAT ====================

  /**
   * Get estimated delivery time (TAT) for a pincode
   * Tries API first, falls back to zone-based calculation
   * 
   * @param {string} destinationPincode - Destination pincode
   * @param {Object} options - TAT options
   * @returns {Promise<Object>} TAT info
   */
  async getEstimatedTAT(destinationPincode, options = {}) {
    try {
      if (!destinationPincode || !/^\d{6}$/.test(String(destinationPincode))) {
        return {
          success: false,
          error: 'Invalid destination pincode format'
        };
      }

      if (!this.apiToken) {
        return {
          success: false,
          error: 'Delhivery API token not configured'
        };
      }

      const {
        originPincode = this.warehousePincode,
        mode = 'S',
        expectedPickupDate = new Date().toISOString().split('T')[0],
        destinationCity = null,
        destinationState = null
      } = options;

      const modeName = mode === 'S' ? 'Surface' : 'Express';
      console.log(`⏱️  [Delhivery] Getting TAT: ${originPincode} → ${destinationPincode} (${modeName})`);

      // Try TAT API first
      const url = `${this.baseURL}/api/kinko/v1/invoice/charges/tat`;

      try {
        const response = await axios.get(url, {
          params: {
            origin_pin: originPincode,
            destination_pin: destinationPincode,
            mot: mode,
            pdt: 'B2C',
            expected_pickup_date: expectedPickupDate
          },
          headers: {
            'Authorization': `Token ${this.apiToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000,
          validateStatus: function (status) {
            return status < 500;
          }
        });

        if (response.status === 200 && (response.data.tat || response.data.estimated_days)) {
          const estimatedDays = parseInt(response.data.tat || response.data.estimated_days);
          
          let deliveryDate = response.data.expected_delivery_date;
          if (!deliveryDate && estimatedDays) {
            const delivery = new Date();
            delivery.setDate(delivery.getDate() + estimatedDays);
            deliveryDate = delivery.toISOString().split('T')[0];
          }

          console.log(`✅ [Delhivery] TAT from API: ${estimatedDays} days`);

          return {
            success: true,
            estimatedDays,
            expectedDeliveryDate: deliveryDate,
            mode: modeName,
            originPincode: String(originPincode),
            destinationPincode: String(destinationPincode),
            pickupDate: expectedPickupDate,
            source: 'api'
          };
        }
      } catch (apiError) {
        console.log(`⚠️  [Delhivery] TAT API not available (${apiError.response?.status || apiError.code}), using fallback`);
      }

      // Fallback: Use static zone-based calculation
      console.log(`📊 [Delhivery] Using zone-based TAT calculation`);
      
      // Get origin state from warehouse pincode (assuming Delhi for 110059)
      const originState = this.warehousePincode.startsWith('11') ? 'DL' : 'DL';
      
      const fallbackDays = this._calculateStaticTAT(
        originState, 
        destinationState || 'KA', 
        destinationCity || 'Unknown',
        mode
      );

      const delivery = new Date();
      delivery.setDate(delivery.getDate() + fallbackDays);
      
      console.log(`✅ [Delhivery] TAT from fallback: ${fallbackDays} days (${destinationCity}, ${destinationState})`);

      return {
        success: true,
        estimatedDays: fallbackDays,
        expectedDeliveryDate: delivery.toISOString().split('T')[0],
        mode: modeName,
        originPincode: String(originPincode),
        destinationPincode: String(destinationPincode),
        pickupDate: expectedPickupDate,
        source: 'fallback',
        note: 'Estimated based on zone calculation'
      };

    } catch (error) {
      console.error('❌ [Delhivery] TAT check failed:', error.message);
      
      // Final emergency fallback
      const fallbackDays = options.mode === 'E' ? 2 : 5;
      const delivery = new Date();
      delivery.setDate(delivery.getDate() + fallbackDays);
      
      return {
        success: true,
        estimatedDays: fallbackDays,
        expectedDeliveryDate: delivery.toISOString().split('T')[0],
        mode: options.mode === 'S' ? 'Surface' : 'Express',
        originPincode: String(options.originPincode || this.warehousePincode),
        destinationPincode: String(destinationPincode),
        pickupDate: options.expectedPickupDate || new Date().toISOString().split('T')[0],
        error: error.message,
        source: 'default_fallback'
      };
    }
  }

  // ==================== COMBINED CHECK ====================

  /**
   * Combined check: Serviceability + TAT (Surface & Express)
   * Perfect for checkout flow
   * 
   * @param {string} pincode - Destination pincode
   * @param {Object} options - Options
   * @returns {Promise<Object>} Complete delivery info
   */
  async checkDelivery(pincode, options = {}) {
    try {
      console.log(`📦 [Delhivery] Starting full delivery check for: ${pincode}`);

      // Step 1: Check serviceability
      const serviceability = await this.checkPincodeServiceability(pincode);

      if (!serviceability.serviceable) {
        console.log(`⚠️  [Delhivery] Pincode not serviceable`);
        return {
          pincode: String(pincode),
          serviceable: false,
          location: null,
          features: serviceability.features,
          deliveryOptions: {
            surface: null,
            express: null
          },
          bestOption: null,
          reason: serviceability.reason || serviceability.error || 'This PIN code is not serviceable'
        };
      }

      console.log(`✅ [Delhivery] Pincode is serviceable, calculating TAT...`);

      // Step 2: Get TAT with city/state info for better accuracy
      const tatOptions = {
        ...options,
        destinationCity: serviceability.city,
        destinationState: serviceability.state
      };

      const [surfaceTAT, expressTAT] = await Promise.allSettled([
        this.getEstimatedTAT(pincode, { ...tatOptions, mode: 'S' }),
        this.getEstimatedTAT(pincode, { ...tatOptions, mode: 'E' })
      ]);

      const surfaceResult = surfaceTAT.status === 'fulfilled' ? surfaceTAT.value : null;
      const expressResult = expressTAT.status === 'fulfilled' ? expressTAT.value : null;

      // Format delivery options
      const deliveryOptions = {
        surface: surfaceResult && surfaceResult.success ? {
          mode: 'Surface',
          estimatedDays: surfaceResult.estimatedDays,
          deliveryDate: surfaceResult.expectedDeliveryDate,
          tat: surfaceResult.estimatedDays,
          expected_delivery_date: surfaceResult.expectedDeliveryDate,
          cost: '₹50-80',
          source: surfaceResult.source
        } : null,
        express: expressResult && expressResult.success ? {
          mode: 'Express',
          estimatedDays: expressResult.estimatedDays,
          deliveryDate: expressResult.expectedDeliveryDate,
          tat: expressResult.estimatedDays,
          expected_delivery_date: expressResult.expectedDeliveryDate,
          cost: '₹70-100',
          source: expressResult.source
        } : null
      };

      // Select best option (prefer Express if available, else Surface)
      let bestOption = null;
      if (expressResult && expressResult.success) {
        bestOption = deliveryOptions.express;
      } else if (surfaceResult && surfaceResult.success) {
        bestOption = deliveryOptions.surface;
      }

      console.log(`✅ [Delhivery] Delivery check complete`);
      console.log(`   Surface: ${deliveryOptions.surface?.estimatedDays || 'N/A'} days`);
      console.log(`   Express: ${deliveryOptions.express?.estimatedDays || 'N/A'} days`);
      console.log(`   Best: ${bestOption?.mode} (${bestOption?.estimatedDays} days)`);

      return {
        pincode: String(pincode),
        serviceable: true,
        location: {
          city: serviceability.city,
          state: serviceability.state
        },
        features: serviceability.features,
        deliveryOptions,
        bestOption
      };

    } catch (error) {
      console.error('❌ [Delhivery] Delivery check failed:', error);
      return {
        pincode: String(pincode),
        success: false,
        error: error.message
      };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Parse boolean values from Delhivery API
   * @private
   */
  _parseBoolean(value) {
    return value === 'Y' || value === 'y' || value === true;
  }

  /**
   * Health check for Delhivery API
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      if (!this.apiToken) {
        return {
          healthy: false,
          service: 'Delhivery API',
          message: 'API token not configured',
          apiUrl: this.baseURL,
          timestamp: new Date().toISOString()
        };
      }

      console.log('🏥 [Delhivery] Running health check...');

      const result = await this.checkPincodeServiceability('110001');
      
      if (result.status === 'Authentication Failed') {
        return {
          healthy: false,
          service: 'Delhivery API',
          message: 'Invalid API token',
          apiUrl: this.baseURL,
          timestamp: new Date().toISOString()
        };
      }

      console.log('✅ [Delhivery] Health check passed');

      return {
        healthy: result.serviceable !== undefined,
        service: 'Delhivery API',
        message: 'API is responsive',
        apiUrl: this.baseURL,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [Delhivery] Health check failed:', error.message);
      
      return {
        healthy: false,
        service: 'Delhivery API',
        message: 'API is unreachable',
        error: error.message,
        apiUrl: this.baseURL,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
const delhiveryService = new DelhiveryService();

module.exports = delhiveryService;