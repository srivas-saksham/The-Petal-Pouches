// backend/src/services/delhiveryService.js
/**
 * Delhivery Service - Enhanced with Shipping Cost Calculation
 * Handles all communication with Delhivery APIs including cost estimation
 * 
 * Features:
 * - Pincode serviceability check
 * - TAT API with intelligent fallback
 * - Zone-based delivery estimates
 * - Shipping cost calculation (NEW)
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
          'Content-Type': 'application/x-www-form-urlencoded',
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

  /**
   * Edit existing shipment with Delhivery
   * @param {string} awb - Air Waybill number
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Update result
   */
  async editShipment(awb, updateData) {
    try {
      if (!this.apiToken) {
        throw new Error('Delhivery API token not configured');
      }

      if (!awb) {
        throw new Error('AWB number is required for editing');
      }

      console.log(`✏️ [Delhivery] Editing shipment: ${awb}`);
      console.log('   Update data:', updateData);

      const url = `${this.baseURL}/api/p/edit`;

      // Build payload according to Delhivery format
      const payload = {
        waybill: awb,
        ...updateData
      };

      // Convert weight to grams if provided in kg
      if (payload.weight && payload.weight < 100) {
        payload.weight = Math.round(payload.weight * 1000);
        console.log(`   Converted weight: ${payload.weight}g`);
      }

      console.log('📤 [Delhivery] Edit Request Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 15000,
        validateStatus: (status) => status < 500
      });

      console.log('📥 [Delhivery] Edit Response:', {
        status: response.status,
        data: response.data
      });

      // Handle errors
      if (response.status === 401) {
        throw new Error('Delhivery authentication failed');
      }

      if (response.status === 400) {
        const errorMsg = response.data?.error || response.data?.message || 'Invalid request';
        throw new Error(`Delhivery validation error: ${errorMsg}`);
      }

      if (response.status !== 200) {
        console.error(`❌ [Delhivery] Edit API HTTP ${response.status}:`, response.data);
        throw new Error(`API returned status ${response.status}`);
      }

      const result = response.data;
      console.log('✅ [Delhivery] Shipment edited successfully');

      return {
        success: true,
        awb: awb,
        message: result.message || 'Shipment updated successfully',
        updated_fields: Object.keys(updateData).filter(k => k !== 'waybill'),
        raw_response: result
      };

    } catch (error) {
      console.error('❌ [Delhivery] Edit shipment failed:', error);

      if (error.response?.status === 401) {
        throw new Error('Delhivery authentication failed. Check API token.');
      }

      if (error.response?.status === 400) {
        const errorMsg = error.response.data?.error || error.response.data?.message || 'Invalid request';
        throw new Error(`Delhivery validation error: ${errorMsg}`);
      }

      if (error.response?.status === 404) {
        throw new Error(`Shipment with AWB ${awb} not found in Delhivery system`);
      }

      throw new Error(`Failed to edit shipment: ${error.message}`);
    }
  }

  /**
   * Validate if shipment can be edited
   * @param {string} awb - Air Waybill number
   * @returns {Promise<Object>} Eligibility info
   */
  async validateEditEligibility(awb) {
    try {
      console.log(`🔍 [Delhivery] Checking edit eligibility for AWB: ${awb}`);

      // Fetch current tracking status
      const trackingData = await this.getTrackingInfo(awb);
      
      if (!trackingData) {
        return {
          eligible: false,
          reason: 'Unable to fetch shipment tracking information'
        };
      }

      const status = trackingData.status || 'Unknown';
      console.log(`   Current Delhivery status: ${status}`);
      
      // Delhivery editable statuses (from API docs)
      const editableStatuses = [
        'Manifested',
        'In Transit',
        'Pending',
        'Scheduled' // For RVP
      ];

      // Terminal statuses (not editable)
      const terminalStatuses = [
        'Delivered',
        'DTO',
        'RTO',
        'LOST',
        'Closed',
        'Cancelled'
      ];

      // Check if terminal
      const isTerminal = terminalStatuses.some(s => 
        status.toLowerCase().includes(s.toLowerCase())
      );

      if (isTerminal) {
        console.log(`   ❌ Terminal status - not editable`);
        return {
          eligible: false,
          reason: `Shipment is in terminal status '${status}' and cannot be edited`,
          current_status: status
        };
      }

      // Check if editable
      const isEditable = editableStatuses.some(s => 
        status.toLowerCase().includes(s.toLowerCase())
      );

      if (!isEditable) {
        console.log(`   ❌ Status not editable`);
        return {
          eligible: false,
          reason: `Shipment status '${status}' is not eligible for editing. Editable statuses: ${editableStatuses.join(', ')}`,
          current_status: status,
          editable_statuses: editableStatuses
        };
      }

      console.log(`   ✅ Shipment is eligible for editing`);
      return {
        eligible: true,
        current_status: status,
        message: 'Shipment can be edited'
      };

    } catch (error) {
      console.error('❌ [Delhivery] Edit eligibility check failed:', error);
      return {
        eligible: false,
        reason: `Unable to validate eligibility: ${error.message}`
      };
    }
  }

  /**
   * Cancel shipment via Delhivery API
   * @param {string} awb - Air Waybill number
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelShipment(awb) {
    try {
      if (!this.apiToken) {
        throw new Error('Delhivery API token not configured');
      }

      if (!awb) {
        throw new Error('AWB number is required for cancellation');
      }

      console.log(`🚫 [Delhivery] Cancelling shipment: ${awb}`);

      const url = `${this.baseURL}/api/p/edit`;

      const payload = {
        waybill: awb,
        cancellation: 'true'
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 15000,
        validateStatus: (status) => status < 500
      });

      if (response.status !== 200) {
        console.error(`❌ [Delhivery] Cancel API HTTP ${response.status}:`, response.data);
        throw new Error(`API returned status ${response.status}`);
      }

      console.log('✅ [Delhivery] Shipment cancelled successfully');

      return {
        success: true,
        awb: awb,
        message: 'Shipment cancelled successfully',
        raw_response: response.data
      };

    } catch (error) {
      console.error('❌ [Delhivery] Cancel shipment failed:', error);
      throw new Error(`Failed to cancel shipment: ${error.message}`);
    }
  }

  // ==================== SHIPPING COST CALCULATION (NEW) ====================

  /**
   * Calculate shipping charges using Delhivery API
   * @param {string} destinationPincode - Destination pincode
   * @param {Object} options - Cost calculation options
   * @returns {Promise<Object>} Shipping cost info
   */
  async calculateShippingCost(destinationPincode, options = {}) {
    try {
      const {
        originPincode = this.warehousePincode,
        mode = 'S', // 'S' for Surface, 'E' for Express
        weight = 499, // Weight in grams (default 499g)
        paymentType = 'Pre-paid', // 'Pre-paid' or 'COD'
        shipmentStatus = 'Delivered' // Status of shipment
      } = options;

      if (!this.apiToken) {
        console.warn('⚠️ [Delhivery] API token not configured for cost calculation');
        return this._estimateShippingCost(mode, weight, paymentType);
      }

      console.log(`💰 [Delhivery] Calculating shipping cost: ${originPincode} → ${destinationPincode}`);
      console.log(`   Mode: ${mode === 'S' ? 'Surface' : 'Express'}, Weight: ${weight}g, Payment: ${paymentType}`);

      const url = `${this.baseURL}/api/kinko/v1/invoice/charges/.json`;

      try {
        const response = await axios.get(url, {
          params: {
            md: mode,
            cgm: weight,
            o_pin: originPincode,
            d_pin: destinationPincode,
            ss: shipmentStatus,
            pt: paymentType
          },
          headers: {
            'Authorization': `Token ${this.apiToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: 15000,
          validateStatus: function (status) {
            return status < 500;
          }
        });

        if (response.status !== 200) {
          console.error(`❌ [Delhivery] Cost API HTTP ${response.status}:`, response.data);
          throw new Error(`Cost API returned status ${response.status}`);
        }

        const data = response.data;
        console.log('✅ [Delhivery] Cost API Response:', JSON.stringify(data, null, 2));

        // Parse the response - structure may vary
        const totalAmount = data[0]?.total_amount || data.total_amount || null;
        
        if (!totalAmount) {
          console.warn('⚠️ [Delhivery] No cost data in response');
          throw new Error('No cost data in response');
        }

        console.log(`✅ [Delhivery] Calculated cost: ₹${totalAmount}`);

        return {
          success: true,
          amount: Math.ceil(parseFloat(totalAmount)),
          currency: 'INR',
          mode: mode === 'S' ? 'Surface' : 'Express',
          weight: weight,
          paymentType: paymentType,
          originPincode: String(originPincode),
          destinationPincode: String(destinationPincode),
          rawData: data,
          source: 'api'
        };

      } catch (apiError) {
        console.log(`⚠️ [Delhivery] Cost API failed: ${apiError.message}`);
        console.log(`   Using fallback estimation`);
        
        return this._estimateShippingCost(mode, weight, paymentType);
      }

    } catch (error) {
      console.error('❌ [Delhivery] Cost calculation failed:', error.message);
      
      return this._estimateShippingCost(options.mode || 'S', options.weight || 499, options.paymentType || 'Pre-paid');
    }
  }

  /**
   * Fallback shipping cost estimation
   * @private
   */
  _estimateShippingCost(mode, weight, paymentType) {
    // Base rates (approximate)
    let baseRate = mode === 'E' ? 70 : 50;
    
    // Weight-based pricing (per 500g)
    const weightSlabs = Math.ceil(weight / 500);
    let amount = baseRate + (weightSlabs - 1) * 20;
    
    // COD charges (if applicable)
    if (paymentType === 'COD') {
      amount += 30; // COD handling charge
    }
    
    amount = Math.ceil(amount);

    console.log(`💰 [Delhivery] Estimated cost: ₹${amount} (${mode === 'S' ? 'Surface' : 'Express'})`);
    
    return {
      success: true,
      amount: amount,
      currency: 'INR',
      mode: mode === 'S' ? 'Surface' : 'Express',
      weight: weight,
      paymentType: paymentType,
      source: 'estimated',
      note: 'Estimated based on standard rates'
    };
  }

  // ==================== STATIC TAT CALCULATOR (FALLBACK) ====================

  /**
   * Calculate estimated TAT based on state zones
   * @private
   */
  _calculateStaticTAT(originState, destinationState, destinationCity, mode = 'S') {
    const metroCities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Bengaluru', 'Chennai', 'Kolkata', 
      'Hyderabad', 'Pune', 'Ahmedabad', 'Gurgaon', 'Noida', 'New Delhi'
    ];
    
    const tier2Cities = [
      'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 
      'Bhopal', 'Visakhapatnam', 'Vadodara', 'Coimbatore', 'Kochi',
      'Chandigarh', 'Mysore', 'Surat', 'Nashik'
    ];

    const zones = {
      'North': ['DL', 'HR', 'UP', 'UK', 'PB', 'HP', 'JK', 'CH', 'RJ'],
      'South': ['KA', 'TN', 'KL', 'AP', 'TS', 'PY'],
      'East': ['WB', 'OR', 'JH', 'BR', 'AS', 'SK', 'NL', 'MN', 'TR', 'MZ', 'AR'],
      'West': ['MH', 'GJ', 'MP', 'GA', 'DD', 'DN'],
      'Central': ['MP', 'CG']
    };

    let originZone = null;
    let destZone = null;
    
    for (const [zone, states] of Object.entries(zones)) {
      if (states.includes(originState)) originZone = zone;
      if (states.includes(destinationState)) destZone = zone;
    }

    console.log(`   📍 Route: ${originState} (${originZone}) → ${destinationState} (${destZone})`);
    console.log(`   🏙️  City: ${destinationCity}`);

    let baseDays = 5;

    if (originState === destinationState) {
      baseDays = metroCities.includes(destinationCity) ? (mode === 'E' ? 1 : 2) : (mode === 'E' ? 2 : 3);
    } else if (originZone === destZone) {
      if (metroCities.includes(destinationCity)) {
        baseDays = mode === 'E' ? 2 : 3;
      } else if (tier2Cities.includes(destinationCity)) {
        baseDays = mode === 'E' ? 3 : 4;
      } else {
        baseDays = mode === 'E' ? 3 : 5;
      }
    } else if (
      (originZone === 'North' && destZone === 'West') ||
      (originZone === 'North' && destZone === 'Central') ||
      (originZone === 'West' && ['North', 'Central', 'South'].includes(destZone)) ||
      (originZone === 'South' && destZone === 'West') ||
      (originZone === 'Central' && ['North', 'West'].includes(destZone))
    ) {
      if (metroCities.includes(destinationCity)) {
        baseDays = mode === 'E' ? 3 : 4;
      } else if (tier2Cities.includes(destinationCity)) {
        baseDays = mode === 'E' ? 4 : 5;
      } else {
        baseDays = mode === 'E' ? 4 : 6;
      }
    } else {
      if (metroCities.includes(destinationCity)) {
        baseDays = mode === 'E' ? 3 : 5;
      } else if (tier2Cities.includes(destinationCity)) {
        baseDays = mode === 'E' ? 4 : 6;
      } else {
        baseDays = mode === 'E' ? 5 : 7;
      }
    }

    console.log(`   ⏱️  Calculated TAT: ${baseDays} days (${mode === 'S' ? 'Surface' : 'Express'})`);
    return baseDays;
  }

  // ==================== EXPECTED TAT ====================

  async getEstimatedTAT(destinationPincode, options = {}) {
    try {
      if (!destinationPincode || !/^\d{6}$/.test(String(destinationPincode))) {
        return { success: false, error: 'Invalid destination pincode format' };
      }

      if (!this.apiToken) {
        return { success: false, error: 'Delhivery API token not configured' };
      }

      const {
        originPincode = this.warehousePincode,
        mode = 'S',
        expectedPickupDate = this._getFormattedPickupDate(),
        destinationCity = null,
        destinationState = null
      } = options;

      const modeName = mode === 'S' ? 'Surface' : 'Express';
      console.log(`⏱️  [Delhivery] Getting TAT: ${originPincode} → ${destinationPincode} (${modeName})`);

      const url = `${this.baseURL}/api/dc/expected_tat`;

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
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: 15000,
          validateStatus: (status) => status < 500
        });

        if (response.status !== 200) {
          throw new Error(`API returned status ${response.status}`);
        }

        const responseData = response.data;
        const data = responseData.data || responseData;
        
        if (!data.tat && !data.estimated_days) {
          throw new Error('No TAT data in response');
        }

        const estimatedDays = parseInt(data.tat || data.estimated_days);
        let calculatedDeliveryDate = data.expected_delivery_date || data.expectedDeliveryDate;
        
        if (!calculatedDeliveryDate && estimatedDays) {
          const delivery = new Date();
          delivery.setDate(delivery.getDate() + estimatedDays);
          calculatedDeliveryDate = delivery.toISOString().split('T')[0];
        }

        console.log(`✅ [Delhivery] TAT from API: ${estimatedDays} days`);

        return {
          success: true,
          estimatedDays,
          expectedDeliveryDate: calculatedDeliveryDate,
          mode: modeName,
          originPincode: String(originPincode),
          destinationPincode: String(destinationPincode),
          pickupDate: expectedPickupDate,
          source: 'api'
        };

      } catch (apiError) {
        console.log(`⚠️  [Delhivery] TAT API failed, using fallback`);
      }

      const originState = this.warehousePincode.startsWith('11') ? 'DL' : 'DL';
      const fallbackDays = this._calculateStaticTAT(
        originState, 
        destinationState || 'KA', 
        destinationCity || 'Unknown',
        mode
      );

      const delivery = new Date();
      delivery.setDate(delivery.getDate() + fallbackDays);

      return {
        success: true,
        estimatedDays: fallbackDays,
        expectedDeliveryDate: delivery.toISOString().split('T')[0],
        mode: modeName,
        originPincode: String(originPincode),
        destinationPincode: String(destinationPincode),
        pickupDate: this._getFormattedPickupDate(),
        source: 'fallback',
        note: 'Estimated based on zone calculation'
      };

    } catch (error) {
      console.error('❌ [Delhivery] TAT check failed:', error.message);
      
      const fallbackDays = options.mode === 'E' ? 3 : 5;
      const delivery = new Date();
      delivery.setDate(delivery.getDate() + fallbackDays);
      
      return {
        success: true,
        estimatedDays: fallbackDays,
        expectedDeliveryDate: delivery.toISOString().split('T')[0],
        mode: options.mode === 'S' ? 'Surface' : 'Express',
        source: 'default_fallback'
      };
    }
  }

  /**
   * Create shipment with Delhivery
   * @param {Object} shipmentData - Complete shipment details
   * @returns {Promise<Object>} Delhivery response with AWB
   */
  // backend/src/services/delhiveryService.js - FIXED createShipment method

/**
 * Create shipment with Delhivery
 * @param {Object} shipmentData - Complete shipment details
 * @returns {Promise<Object>} Delhivery response with AWB
 */
async createShipment(shipmentData) {
  try {
    if (!this.apiToken) {
      throw new Error('Delhivery API token not configured');
    }

    const pickupLocation = process.env.DELHIVERY_PICKUP_LOCATION;
    if (!pickupLocation) {
      throw new Error('DELHIVERY_PICKUP_LOCATION not configured in .env');
    }

    console.log(`📦 [Delhivery] Creating shipment for order: ${shipmentData.order_id}`);
    console.log(`📍 [Delhivery] Using pickup location: ${pickupLocation}`);

    const url = `${this.baseURL}/api/cmu/create.json`;

    const address = shipmentData.customer_address;
    const fullAddress = [
      address.line1,
      address.line2,
      address.landmark,
      address.city,
      address.state,
      address.zip_code
    ].filter(Boolean).join(', ');

    // ✅ CORRECT PAYLOAD STRUCTURE
    const payloadObject = {
      shipments: [{
        // Customer details
        name: shipmentData.customer_name,
        add: fullAddress,
        pin: String(shipmentData.destination_pincode),
        city: shipmentData.destination_city,
        state: shipmentData.destination_state,
        country: 'India',
        phone: String(shipmentData.customer_phone),
        address_type: address.address_type || 'home',
        
        // Order details
        order: shipmentData.order_id,
        payment_mode: shipmentData.payment_mode,
        cod_amount: String(shipmentData.payment_mode === 'COD' ? shipmentData.cod_amount : 0),
        total_amount: String(shipmentData.order_total || 0),
        order_date: new Date().toISOString(),
        
        // ✅ Return address (NOT pickup_location here)
        return_name: process.env.WAREHOUSE_NAME || 'Rizara Luxe',
        return_add: process.env.WAREHOUSE_ADDRESS,
        return_city: process.env.WAREHOUSE_CITY || 'Delhi',
        return_state: process.env.WAREHOUSE_STATE || 'Delhi',
        return_country: 'India',
        return_pin: String(process.env.WAREHOUSE_PINCODE),
        return_phone: String(process.env.WAREHOUSE_PHONE),
        
        // Seller details
        seller_name: process.env.SELLER_NAME || 'Rizara Luxe',
        seller_add: process.env.WAREHOUSE_ADDRESS,
        seller_inv: `INV-${shipmentData.order_id.substring(0, 8).toUpperCase()}`,
        seller_gst_tin: process.env.SELLER_GST_TIN || '',
        
        // Product details
        products_desc: shipmentData.products_desc || 'Items that she will love <3',
        quantity: String(shipmentData.quantity || 1),
        hsn_code: '',
        
        // Package details
        weight: String(shipmentData.weight_grams),
        shipment_width: String(shipmentData.dimensions_cm?.width || 10),
        shipment_height: String(shipmentData.dimensions_cm?.height || 3),
        shipment_length: String(shipmentData.dimensions_cm?.length || 10),
        shipping_mode: shipmentData.shipping_mode,
        
        // Optional fields
        waybill: '',
        fragile_shipment: false,
        dangerous_good: false
      }],
      // ✅ CRITICAL: pickup_location at ROOT level as object
      pickup_location: {
        name: pickupLocation
      }
    };
    
    // ✅ CORRECT: Wrap with format=json&data=
    const body = `format=json&data=${JSON.stringify(payloadObject)}`;
    
    console.log('📤 [Delhivery] Request Payload:', JSON.stringify(payloadObject, null, 2));

    const response = await axios.post(url, body, {
      headers: {
        'Authorization': `Token ${this.apiToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: (status) => status < 500
    });

    console.log('📥 [Delhivery] Response:', JSON.stringify(response.data, null, 2));

    if (response.status !== 200) {
      throw new Error(`Delhivery API error: ${response.status}`);
    }

    const result = response.data;
    const shipmentResult = result.packages?.[0] || result.shipments?.[0] || result;

    if (!shipmentResult.waybill && !shipmentResult.awb) {
      throw new Error('Delhivery did not return AWB');
    }

    const awb = shipmentResult.waybill || shipmentResult.awb;
    const trackingUrl = `https://www.delhivery.com/track/package/${awb}`;
    const labelUrl = `${this.baseURL}/api/p/packing_slip?wbns=${awb}&pdf=true`;
    const invoiceUrl = `${this.baseURL}/api/p/invoice?wbns=${awb}&pdf=true`;

    console.log(`✅ Shipment created: AWB ${awb}`);

    return {
      success: true,
      awb: awb,
      order_id: shipmentResult.refnum || shipmentData.order_id,
      courier: 'Delhivery',
      tracking_url: trackingUrl,
      label_url: labelUrl,
      invoice_url: invoiceUrl,
      manifest_url: null,
      cost: shipmentResult.charges || null,
      raw_response: result
    };

  } catch (error) {
    console.error('❌ [Delhivery] Create shipment failed:', error);
    throw error;
  }
}

  /**
 * Get tracking information from Delhivery
 * @param {string} awb - Air Waybill number
 * @returns {Promise<Object>} Tracking information with status and history
 */
async getTrackingInfo(awb) {
  try {
    if (!this.apiToken) {
      throw new Error('Delhivery API token not configured');
    }

    console.log(`📍 [Delhivery] Fetching tracking for AWB: ${awb}`);

    const url = `${this.baseURL}/api/v1/packages/json/`;

    const response = await axios.get(url, {
      params: { waybill: awb },
      headers: {
        'Authorization': `Token ${this.apiToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      timeout: 15000,
      validateStatus: (status) => status < 500
    });

    if (response.status !== 200) {
      console.error(`❌ [Delhivery] Tracking API HTTP ${response.status}`);
      return null;
    }

    const data = response.data;

    if (!data.ShipmentData || data.ShipmentData.length === 0) {
      console.warn(`⚠️ [Delhivery] No tracking data for AWB: ${awb}`);
      return null;
    }

    const shipmentData = data.ShipmentData[0];
    const shipment = shipmentData.Shipment;

    // Get the current status
    const currentStatus = shipment.Status?.Status || 'Unknown';
    
    console.log(`✅ [Delhivery] Tracking fetched: Status = ${currentStatus}`);

    // Format tracking history
    const trackingHistory = [];
    
    if (shipment.Scans && Array.isArray(shipment.Scans)) {
      shipment.Scans.forEach(scan => {
        trackingHistory.push({
          status: scan.ScanDetail?.Scan || 'Unknown',
          timestamp: scan.ScanDetail?.ScanDateTime || new Date().toISOString(),
          location: scan.ScanDetail?.ScannedLocation || null,
          remarks: scan.ScanDetail?.Instructions || null
        });
      });
    }

    // Return standardized format expected by shipmentModel
    return {
      awb: awb,
      status: currentStatus, // Raw Delhivery status (will be mapped by statusMapper)
      history: trackingHistory,
      expected_delivery_date: shipment.ExpectedDeliveryDate || null,
      current_location: trackingHistory.length > 0 ? 
        trackingHistory[trackingHistory.length - 1]?.location : null,
      raw_data: shipmentData
    };

  } catch (error) {
    console.error(`❌ [Delhivery] Tracking fetch error for AWB ${awb}:`, error.message);
    
    if (error.response) {
      console.error(`❌ [Delhivery] API Response:`, {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    return null; // Return null on error
  }
}
// backend/src/services/delhiveryService.js
// ⚠️ ONLY THE schedulePickup METHOD - ADD THIS TO YOUR EXISTING FILE

/**
 * Schedule pickup request with Delhivery
 * ✅ CORRECTED: Pickup is per LOCATION, not per AWB
 * 
 * @param {Object} pickupData - Pickup details
 * @returns {Promise<Object>} Pickup confirmation
 */
async schedulePickup(pickupData) {
  try {
    const {
      pickupDate = null,
      pickupTime = '10:00:00',
      packageCount = 1,
      pickupLocation = process.env.DELHIVERY_PICKUP_LOCATION
    } = pickupData;

    // ✅ Validate pickup location
    if (!pickupLocation) {
      throw new Error('pickup_location is required and must match registered warehouse name');
    }

    const pickup = pickupDate || this._getTomorrowDate();

    console.log(`📅 [Delhivery] Creating pickup request`);
    console.log(`   Location: ${pickupLocation}`);
    console.log(`   Date: ${pickup} at ${pickupTime}`);
    console.log(`   Expected packages: ${packageCount}`);

    const url = `${this.baseURL}/fm/request/new/`;

    // ✅ CORRECT PAYLOAD - No AWBs needed
    const payload = {
      pickup_time: pickupTime,
      pickup_date: pickup,
      pickup_location: pickupLocation,
      expected_package_count: packageCount
    };

    console.log('📤 [Delhivery] Pickup Request Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Token ${this.apiToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      timeout: 15000,
      validateStatus: (status) => status < 500
    });

    console.log('📥 [Delhivery] Pickup Response:', JSON.stringify(response.data, null, 2));

    if (response.status !== 200 && response.status !== 201) {
      // Handle specific error cases
      if (response.data?.error?.includes('already exists')) {
        console.warn('⚠️ [Delhivery] Pickup already scheduled for today');
        return {
          success: true,
          pickup_id: response.data.pickup_id || null,
          pickup_date: pickup,
          pickup_time: pickupTime,
          message: 'Pickup already scheduled for this location today',
          already_exists: true
        };
      }
      
      throw new Error(`Pickup API error: ${response.status} - ${response.data?.error || 'Unknown error'}`);
    }

    const pickupId = response.data.pickup_id || response.data.request_id || null;
    
    console.log(`✅ Pickup request created: ${pickupId}`);

    return {
      success: true,
      pickup_id: pickupId,
      pickup_date: pickup,
      pickup_time: pickupTime,
      expected_package_count: packageCount,
      message: response.data.message || 'Pickup request created successfully',
      already_exists: false
    };

  } catch (error) {
    console.error('❌ [Delhivery] Pickup request failed:', error.message);
    
    // Don't throw - return error info
    return {
      success: false,
      error: error.message,
      pickup_date: pickupData.pickupDate,
      pickup_location: pickupData.pickupLocation
    };
  }
}

// Helper
_getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Map Delhivery status to our system status
 * @private
 */
_mapDelhiveryStatus(delhiveryStatus) {
  const statusMap = {
    'Booked': 'placed',
    'Pickup Scheduled': 'pending_pickup',
    'Picked Up': 'picked_up',
    'In Transit': 'in_transit',
    'Out for Delivery': 'out_for_delivery',
    'Delivered': 'delivered',
    'RTO Initiated': 'rto_initiated',
    'RTO Delivered': 'rto_delivered',
    'Undelivered': 'failed',
    'Cancelled': 'cancelled'
  };

  return statusMap[delhiveryStatus] || delhiveryStatus?.toLowerCase() || 'unknown';
}
  // ==================== COMBINED CHECK WITH COSTS (ENHANCED) ====================

  async checkDelivery(pincode, options = {}) {
    try {
      console.log(`📦 [Delhivery] Starting full delivery check for: ${pincode}`);

      // ✅ ADD THESE LINES RIGHT AFTER THE ABOVE LOG:
      const weight = options.weight || 499;
      console.log(`📦 [Delhivery] Using weight: ${weight}g (${weight/1000}kg)`);

      const serviceability = await this.checkPincodeServiceability(pincode);

      if (!serviceability.serviceable) {
        return {
          pincode: String(pincode),
          serviceable: false,
          location: null,
          features: serviceability.features,
          deliveryOptions: { surface: null, express: null },
          bestOption: null,
          reason: serviceability.reason || serviceability.error || 'This PIN code is not serviceable'
        };
      }

      const tatOptions = {
        ...options,
        destinationCity: serviceability.city,
        destinationState: serviceability.state
      };

      const [surfaceTAT, expressTAT, surfaceCost, expressCost] = await Promise.allSettled([
        this.getEstimatedTAT(pincode, { ...tatOptions, mode: 'S' }),
        this.getEstimatedTAT(pincode, { ...tatOptions, mode: 'E' }),
        this.calculateShippingCost(pincode, { 
          ...options, 
          mode: 'S',
          weight: weight || 499,
          paymentType: options.paymentType || 'Pre-paid'
        }),
        this.calculateShippingCost(pincode, { 
          ...options, 
          mode: 'E',
          weight: weight || 499,
          paymentType: options.paymentType || 'Pre-paid'
        })
      ]);

      const surfaceResult = surfaceTAT.status === 'fulfilled' ? surfaceTAT.value : null;
      const expressResult = expressTAT.status === 'fulfilled' ? expressTAT.value : null;
      const surfaceCostResult = surfaceCost.status === 'fulfilled' ? surfaceCost.value : null;
      const expressCostResult = expressCost.status === 'fulfilled' ? expressCost.value : null;

      const deliveryOptions = {
        surface: surfaceResult?.success ? {
          mode: 'Surface',
          estimatedDays: surfaceResult.estimatedDays,
          deliveryDate: surfaceResult.expectedDeliveryDate,
          tat: surfaceResult.estimatedDays,
          expected_delivery_date: surfaceResult.expectedDeliveryDate,
          cost: surfaceCostResult?.success ? Math.ceil(surfaceCostResult.amount) : null,
          costFormatted: surfaceCostResult?.success ? `₹${surfaceCostResult.amount}` : '₹50-80',
          costSource: surfaceCostResult?.source || 'estimated',
          source: surfaceResult.source
        } : null,
        express: expressResult?.success ? {
          mode: 'Express',
          estimatedDays: expressResult.estimatedDays,
          deliveryDate: expressResult.expectedDeliveryDate,
          tat: expressResult.estimatedDays,
          expected_delivery_date: expressResult.expectedDeliveryDate,
          cost: expressCostResult?.success ? Math.ceil(expressCostResult.amount) : null,
          costFormatted: expressCostResult?.success ? `₹${expressCostResult.amount}` : '₹70-100',
          costSource: expressCostResult?.source || 'estimated',
          source: expressResult.source
        } : null
      };

      let priceDifference = null;
      if (deliveryOptions.surface?.cost && deliveryOptions.express?.cost) {
        priceDifference = deliveryOptions.express.cost - deliveryOptions.surface.cost;
        const percentageDiff = Math.round((priceDifference / deliveryOptions.surface.cost) * 100);
        priceDifference = Math.ceil(priceDifference);

        deliveryOptions.express.extraCharge = priceDifference;
        deliveryOptions.express.extraChargeFormatted = `+₹${priceDifference}`;
        
        priceDifference = {
          amount: priceDifference,
          formatted: `₹${priceDifference}`,
          percentage: `${percentageDiff}%`
        };
      }

      const bestOption = expressResult?.success ? deliveryOptions.express : deliveryOptions.surface;

      console.log(`✅ [Delhivery] Delivery check complete`);
      console.log(`   Surface: ${deliveryOptions.surface?.estimatedDays || 'N/A'} days @ ${deliveryOptions.surface?.costFormatted || 'N/A'}`);
      console.log(`   Express: ${deliveryOptions.express?.estimatedDays || 'N/A'} days @ ${deliveryOptions.express?.costFormatted || 'N/A'}`);
      if (priceDifference) {
        console.log(`   Express extra: ${priceDifference.formatted} (${priceDifference.percentage})`);
      }

      return {
        pincode: String(pincode),
        serviceable: true,
        location: {
          city: serviceability.city,
          state: serviceability.state
        },
        features: serviceability.features,
        deliveryOptions,
        bestOption,
        priceDifference
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

  // backend/src/services/delhiveryService.js
// ✅ Extract pdf_encoding from Delhivery response

/**
 * Generate shipping label
 * ✅ FIXED: Returns pdf_encoding (base64) from API response
 */
async generateLabel(awb, options = {}) {
  try {
    if (!this.apiToken) {
      throw new Error('Delhivery API token not configured');
    }

    if (!awb) {
      throw new Error('AWB number is required');
    }

    const { pdf = true, pdf_size = '4R' } = options;

    console.log(`📄 [Delhivery] Generating label for AWB: ${awb}`);
    console.log(`   Format: ${pdf ? 'PDF' : 'JSON'}, Size: ${pdf_size}`);

    const url = `${this.baseURL}/api/p/packing_slip`;

    const response = await axios.get(url, {
      params: {
        wbns: awb,
        pdf: pdf,
        pdf_size: pdf_size
      },
      headers: {
        'Authorization': `Token ${this.apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: (status) => status < 500
    });

    if (response.status !== 200) {
      console.error(`❌ [Delhivery] Label API HTTP ${response.status}:`, response.data);
      throw new Error(`Label generation failed: ${response.status}`);
    }

    console.log('✅ [Delhivery] Label API Response:', JSON.stringify(response.data, null, 2));

    const data = response.data;
    
    if (pdf) {
      let labelUrl = null;
      let pdfEncoding = null;
      
      // ✅ Extract pdf_encoding (base64) if available
      if (data.packages && Array.isArray(data.packages) && data.packages.length > 0) {
        const packageData = data.packages[0];
        pdfEncoding = packageData.pdf_encoding;
        labelUrl = packageData.pdf_download_link || packageData.label_url;
      } else if (data.pdf_encoding) {
        pdfEncoding = data.pdf_encoding;
        labelUrl = data.pdf_download_link || data.label_url;
      }
      
      // Fallback URL if needed
      if (!labelUrl) {
        console.warn('⚠️ [Delhivery] No S3 URL in response, using direct API URL');
        labelUrl = `${this.baseURL}/api/p/packing_slip?wbns=${awb}&pdf=true&pdf_size=${pdf_size}`;
      }
      
      console.log(`📥 [Delhivery] Extracted label URL: ${labelUrl.substring(0, 100)}...`);
      
      if (pdfEncoding) {
        console.log(`✅ [Delhivery] Found pdf_encoding (${pdfEncoding.length} chars)`);
      }

      return {
        success: true,
        label_url: labelUrl,
        pdf_encoding: pdfEncoding, // ✅ Include base64 PDF data
        awb: awb,
        format: 'pdf',
        size: pdf_size,
        expires_soon: labelUrl.includes('s3.amazonaws.com') || labelUrl.includes('X-Amz-Expires')
      };
    } else {
      // JSON mode
      return {
        success: true,
        label_data: data,
        awb: awb,
        format: 'json'
      };
    }

  } catch (error) {
    console.error('❌ [Delhivery] Generate label failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate invoice
 * ✅ FIXED: Returns pdf_encoding (base64) from API response
 */
async generateInvoice(awb) {
  try {
    if (!this.apiToken) {
      throw new Error('Delhivery API token not configured');
    }

    if (!awb) {
      throw new Error('AWB number is required');
    }

    console.log(`📄 [Delhivery] Generating invoice for AWB: ${awb}`);

    const url = `${this.baseURL}/api/p/invoice`;

    const response = await axios.get(url, {
      params: {
        wbns: awb,
        pdf: true
      },
      headers: {
        'Authorization': `Token ${this.apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: (status) => status < 500
    });

    if (response.status !== 200) {
      console.error(`❌ [Delhivery] Invoice API HTTP ${response.status}:`, response.data);
      throw new Error(`Invoice generation failed: ${response.status}`);
    }

    console.log('✅ [Delhivery] Invoice API Response:', JSON.stringify(response.data, null, 2));

    const data = response.data;
    let invoiceUrl = null;
    let pdfEncoding = null;
    
    // ✅ Extract pdf_encoding (base64) if available
    if (data.packages && Array.isArray(data.packages) && data.packages.length > 0) {
      const packageData = data.packages[0];
      pdfEncoding = packageData.pdf_encoding;
      invoiceUrl = packageData.pdf_download_link || packageData.invoice_url;
    } else if (data.pdf_encoding) {
      pdfEncoding = data.pdf_encoding;
      invoiceUrl = data.pdf_download_link || data.invoice_url;
    }
    
    // Fallback URL if needed
    if (!invoiceUrl) {
      console.warn('⚠️ [Delhivery] No S3 URL in response, using direct API URL');
      invoiceUrl = `${this.baseURL}/api/p/invoice?wbns=${awb}&pdf=true`;
    }
    
    console.log(`📥 [Delhivery] Extracted invoice URL: ${invoiceUrl.substring(0, 100)}...`);
    
    if (pdfEncoding) {
      console.log(`✅ [Delhivery] Found pdf_encoding (${pdfEncoding.length} chars)`);
    }

    return {
      success: true,
      invoice_url: invoiceUrl,
      pdf_encoding: pdfEncoding, // ✅ Include base64 PDF data
      awb: awb,
      expires_soon: invoiceUrl.includes('s3.amazonaws.com') || invoiceUrl.includes('X-Amz-Expires')
    };

  } catch (error) {
    console.error('❌ [Delhivery] Generate invoice failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

  // ==================== HELPER METHODS ====================

  _getFormattedPickupDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day} 10:00`;
  }

  _parseBoolean(value) {
    return value === 'Y' || value === 'y' || value === true;
  }

  async healthCheck() {
    try {
      if (!this.apiToken) {
        return {
          healthy: false,
          service: 'Delhivery API',
          message: 'API token not configured',
          timestamp: new Date().toISOString()
        };
      }

      const result = await this.checkPincodeServiceability('110001');
      
      return {
        healthy: result.serviceable !== undefined,
        service: 'Delhivery API',
        message: result.status === 'Authentication Failed' ? 'Invalid API token' : 'API is responsive',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        service: 'Delhivery API',
        message: 'API is unreachable',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

const delhiveryService = new DelhiveryService();
module.exports = delhiveryService;