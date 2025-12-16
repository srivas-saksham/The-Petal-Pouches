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
        weight = weight, // Weight in grams (default 1000g)
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
            'Content-Type': 'application/json',
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
      
      return this._estimateShippingCost(options.mode || 'S', options.weight || 1000, options.paymentType || 'Pre-paid');
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
            'Content-Type': 'application/json',
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

async createShipment(shipmentData) {
  try {
    if (!this.apiToken) {
      throw new Error('Delhivery API token not configured');
    }

    console.log(`📦 [Delhivery] Creating shipment for order: ${shipmentData.order_id}`);

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

    const shipmentPayload = {
      shipments: [{
        name: shipmentData.customer_name,
        add: fullAddress,
        pin: shipmentData.destination_pincode,
        city: shipmentData.destination_city,
        state: shipmentData.destination_state,
        country: 'India',
        phone: shipmentData.customer_phone,
        order: shipmentData.shipment_id,
        payment_mode: shipmentData.payment_mode,
        return_pin: process.env.WAREHOUSE_PINCODE || '110001',
        return_city: process.env.WAREHOUSE_CITY || 'Delhi',
        return_phone: process.env.WAREHOUSE_PHONE || '9999999999',
        return_add: process.env.WAREHOUSE_ADDRESS || 'Your Warehouse Address',
        products_desc: 'Gift Bundle',
        hsn_code: '',
        cod_amount: shipmentData.cod_amount || 0,
        order_date: new Date().toISOString(),
        total_amount: shipmentData.cod_amount || 0,
        seller_add: process.env.WAREHOUSE_ADDRESS || 'Your Warehouse Address',
        seller_name: 'The Petal Pouches',
        seller_inv: shipmentData.order_id,
        quantity: 1,
        waybill: '',
        shipment_width: shipmentData.dimensions_cm.width || 25,
        shipment_height: shipmentData.dimensions_cm.height || 10,
        weight: shipmentData.weight_grams / 1000,
        seller_gst_tin: process.env.SELLER_GST || '',
        shipping_mode: shipmentData.shipping_mode === 'Express' ? 'Express' : 'Surface',
        address_type: 'home'
      }]
    };
    
     // ✅ DEBUG: Log full request details
    console.log('📤 [Delhivery] Request Details:');
    console.log('   URL:', url);
    console.log('   Payload:', JSON.stringify(shipmentPayload, null, 2));
    console.log('   Headers:', {
      'Authorization': `Token ${this.apiToken.substring(0, 15)}...`,
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const response = await axios.post(url, 
      `format=json&data=${JSON.stringify(shipmentPayload)}`,
      {
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 30000,
        validateStatus: (status) => status < 500
      }
    );

    // ✅ DEBUG: Log full response
    console.log('📥 [Delhivery] Response Details:');
    console.log('   Status:', response.status);
    console.log('   Headers:', response.headers);
    console.log('   Data:', JSON.stringify(response.data, null, 2));

    if (response.status !== 200) {
      console.error(`❌ Delhivery API HTTP ${response.status}:`, response.data);
      throw new Error(`Delhivery API error: ${response.status}`);
    }

    const result = response.data;
    console.log('📥 Delhivery Response:', JSON.stringify(result, null, 2));

    const shipmentResult = result.packages?.[0] || result.shipments?.[0] || result;

    if (!shipmentResult.waybill && !shipmentResult.awb) {
      console.error('❌ No AWB in response:', result);
      throw new Error('Delhivery did not return AWB');
    }

    const awb = shipmentResult.waybill || shipmentResult.awb;

    // ✅ FIXED: Generate proper Delhivery URLs
    const trackingUrl = `https://www.delhivery.com/track/package/${awb}`;
    
    // ✅ Correct label URL format (requires authentication token)
    const labelUrl = `${this.baseURL}/api/p/packing_slip?wbns=${awb}&pdf=true`;
    
    // ✅ Invoice URL (if provided by Delhivery, else generate)
    const invoiceUrl = shipmentResult.invoice_url || 
                      `${this.baseURL}/api/p/invoice?wbns=${awb}&pdf=true`;
    
    // ✅ Manifest URL (typically not available immediately)
    const manifestUrl = shipmentResult.manifest_url || null;

    console.log(`✅ Shipment created successfully`);
    console.log(`   AWB: ${awb}`);
    console.log(`   Label URL: ${labelUrl}`);
    console.log(`   Invoice URL: ${invoiceUrl}`);

    return {
      success: true,
      awb: awb,
      order_id: shipmentResult.order_id || shipmentData.order_id,
      courier: 'Delhivery',
      tracking_url: trackingUrl,
      label_url: labelUrl,
      invoice_url: invoiceUrl,
      manifest_url: manifestUrl,
      cost: shipmentResult.charges || null,
      raw_response: result
    };

  } catch (error) {
    console.error('❌ [Delhivery] Create shipment failed:', error);

    if (error.response?.status === 401) {
      throw new Error('Delhivery authentication failed. Check API token.');
    }

    if (error.response?.status === 400) {
      const errorMsg = error.response.data?.error || error.response.data?.message || 'Invalid request';
      throw new Error(`Delhivery validation error: ${errorMsg}`);
    }

    throw new Error(`Failed to create Delhivery shipment: ${error.message}`);
  }
}
  /**
 * Get tracking information from Delhivery
 * @param {string} awb - Air Waybill number
 * @returns {Promise<Object>} Tracking information
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
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000,
      validateStatus: (status) => status < 500
    });

    if (response.status !== 200) {
      console.error(`❌ [Delhivery] Tracking API HTTP ${response.status}`);
      throw new Error(`Tracking API error: ${response.status}`);
    }

    const data = response.data;

    if (!data.ShipmentData || data.ShipmentData.length === 0) {
      console.warn(`⚠️ [Delhivery] No tracking data for AWB: ${awb}`);
      return {
        success: false,
        error: 'No tracking information available',
        awb
      };
    }

    const shipmentData = data.ShipmentData[0];
    const shipment = shipmentData.Shipment;

    // Map Delhivery status to our system
    const currentStatus = this._mapDelhiveryStatus(shipment.Status?.Status);

    // Format tracking history
    const trackingHistory = (shipment.Scans || []).map(scan => ({
      status: scan.ScanDetail.Scan,
      location: scan.ScanDetail.ScannedLocation,
      timestamp: scan.ScanDetail.ScanDateTime,
      instructions: scan.ScanDetail.Instructions || null
    }));

    console.log(`✅ [Delhivery] Tracking fetched: Status = ${currentStatus}`);

    return {
      success: true,
      awb: shipment.AWB,
      current_status: currentStatus,
      status_date: shipment.Status?.StatusDateTime,
      expected_delivery_date: shipment.ExpectedDeliveryDate || null,
      origin: shipment.Origin,
      destination: shipment.Destination,
      tracking_history: trackingHistory,
      courier_details: {
        name: shipment.Courier || 'Delhivery',
        phone: shipment.CourierPhone || null
      },
      raw_data: shipmentData
    };

  } catch (error) {
    console.error('❌ [Delhivery] Get tracking failed:', error);

    if (error.response?.status === 401) {
      throw new Error('Delhivery authentication failed');
    }

    throw new Error(`Failed to fetch tracking: ${error.message}`);
  }
}
/**
 * Schedule pickup request with Delhivery
 * @param {Object} pickupData - Pickup details
 * @returns {Promise<Object>} Pickup confirmation
 */
async schedulePickup(pickupData) {
  try {
    const {
      awbs = [],              // Array of AWB numbers
      pickupDate = null,      // YYYY-MM-DD
      pickupTime = '10:00:00',
      packageCount = 1
    } = pickupData;

    // Default to tomorrow
    const pickup = pickupDate || this._getTomorrowDate();

    console.log(`📅 [Delhivery] Scheduling pickup for ${pickup} at ${pickupTime}`);
    console.log(`   AWBs: ${awbs.join(', ')}`);

    const url = `${this.baseURL}/fm/request/new/`;

    const response = await axios.post(url, {
      pickup_time: pickupTime,
      pickup_date: pickup,
      pickup_location: process.env.WAREHOUSE_NAME || 'DEFAULT_WAREHOUSE',
      expected_package_count: packageCount
    }, {
      headers: {
        'Authorization': `Token ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    if (response.status !== 200) {
      throw new Error(`Pickup API error: ${response.status}`);
    }

    console.log(`✅ Pickup scheduled: ${response.data.pickup_id || 'Confirmed'}`);

    return {
      success: true,
      pickup_id: response.data.pickup_id || null,
      pickup_date: pickup,
      pickup_time: pickupTime,
      message: response.data.message || 'Pickup scheduled successfully'
    };

  } catch (error) {
    console.error('❌ [Delhivery] Schedule pickup failed:', error);
    throw new Error(`Failed to schedule pickup: ${error.message}`);
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
      const weight = options.weight || 1000;
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
          weight: weight || 1000,
          paymentType: options.paymentType || 'Pre-paid'
        }),
        this.calculateShippingCost(pincode, { 
          ...options, 
          mode: 'E',
          weight: weight || 1000,
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