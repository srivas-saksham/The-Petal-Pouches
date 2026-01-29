// backend/src/controllers/delhiveryController.js
/**
 * Delhivery Controller
 * Handles PIN availability and TAT checking for deliveries
 * Includes caching to reduce API calls
 */

const delhiveryService = require('../services/delhiveryService');
const supabase = require('../config/supabaseClient');

// Simple in-memory cache (replace with Redis in production)
const cache = new Map();
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days for pincode checks

const DelhiveryController = {

  // ==================== CHECK PINCODE SERVICEABILITY ====================

  /**
   * Quick serviceability check (used on product pages)
   * GET /api/delhivery/check-pin/:pincode
   * 
   * @example
   * GET /api/delhivery/check-pin/400001
   * GET /api/delhivery/check-pin/400001?useCache=true
   */
  checkPincode: async (req, res) => {
    try {
      const { pincode } = req.params;
      const { useCache = 'true' } = req.query;

      // Validate pincode
      if (!pincode || !/^\d{6}$/.test(pincode)) {
        return res.status(400).json({
          success: false,
          message: 'Valid 6-digit pincode is required'
        });
      }

      console.log(`📍 Check PIN: ${pincode} (cache: ${useCache})`);

      // Check cache first
      if (useCache === 'true') {
        const cached = DelhiveryController._getFromCache(pincode);
        if (cached) {
          console.log('✅ Using cached serviceability');
          return res.json({
            success: true,
            ...cached,
            fromCache: true
          });
        }
      }

      // Call Delhivery API
      const result = await delhiveryService.checkPincodeServiceability(pincode);

      if (result.serviceable) {
        // Cache successful result
        DelhiveryController._setCache(pincode, result);
      }

      return res.json({
        success: true,
        ...result,
        fromCache: false
      });

    } catch (error) {
      console.error('❌ Pincode check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check pincode serviceability',
        error: error.message
      });
    }
  },

  // ==================== GET ESTIMATED DELIVERY TIME ====================

  /**
   * Get estimated delivery time (TAT)
   * GET /api/delhivery/tat/:pincode
   * 
   * @example
   * GET /api/delhivery/tat/400001
   * GET /api/delhivery/tat/400001?mode=E (Express only)
   * GET /api/delhivery/tat/400001?originPin=110001&mode=S
   */
  getDeliveryTime: async (req, res) => {
    try {
      const { pincode } = req.params;
      const { mode = 'S', originPin, pickupDate } = req.query;

      // Validate pincode
      if (!pincode || !/^\d{6}$/.test(pincode)) {
        return res.status(400).json({
          success: false,
          message: 'Valid 6-digit pincode is required'
        });
      }

      // Validate mode
      if (!['S', 'E'].includes(mode)) {
        return res.status(400).json({
          success: false,
          message: 'Mode must be S (Surface) or E (Express)'
        });
      }

      console.log(`⏱️ Get TAT: ${pincode} (${mode})`);

      const result = await delhiveryService.getEstimatedTAT(pincode, {
        mode,
        originPincode: originPin,
        expectedPickupDate: pickupDate
      });

      return res.json({
        success: result.success,
        ...result
      });

    } catch (error) {
      console.error('❌ TAT check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get estimated delivery time',
        error: error.message
      });
    }
  },

  // ==================== COMBINED DELIVERY CHECK ====================

  /**
   * Combined check: serviceability + TAT
   * GET /api/delhivery/check/:pincode
   * 
   * Returns both serviceability and delivery time options
   * Perfect for checkout flow
   * 
   * @example
   * GET /api/delhivery/check/400001
   * GET /api/delhivery/check/400001?originPin=110001
   */
  checkDelivery: async (req, res) => {
    try {
      const { pincode } = req.params;
      const { originPin, weight } = req.query;

      // Validate pincode
      if (!pincode || !/^\d{6}$/.test(pincode)) {
        return res.status(400).json({
          success: false,
          message: 'Valid 6-digit pincode is required'
        });
      }

      console.log(`📦 Full delivery check: ${pincode}`);

      // ✅ ADD THIS LOG
      if (weight) {
        console.log(`📦 Weight specified: ${weight}g (${weight/1000}kg)`);
      }

      const result = await delhiveryService.checkDelivery(pincode, {
        originPincode: originPin,
        weight: parseInt(weight) || 499 // ✅ ADD THIS LINE - Default 499grams
      });

      return res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('❌ Delivery check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check delivery options',
        error: error.message
      });
    }
  },

  // ==================== HEALTH CHECK ====================

  /**
   * Health check endpoint
   * GET /api/delhivery/health
   */
  healthCheck: async (req, res) => {
    try {
      const health = await delhiveryService.healthCheck();

      return res.status(health.healthy ? 200 : 503).json({
        success: health.healthy,
        ...health
      });

    } catch (error) {
      res.status(503).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  },

  // ==================== BULK PINCODE CHECK ====================

  /**
   * Check multiple pincodes at once
   * POST /api/delhivery/check-pins
   * 
   * @example
   * POST /api/delhivery/check-pins
   * Body: { pincodes: ["400001", "400002", "400003"] }
   */
  checkMultiplePincodes: async (req, res) => {
    try {
      const { pincodes } = req.body;

      if (!Array.isArray(pincodes) || pincodes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Array of pincodes is required'
        });
      }

      if (pincodes.length > 20) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 20 pincodes per request'
        });
      }

      console.log(`📍 Bulk check: ${pincodes.length} pincodes`);

      // Check each pincode (sequentially to respect rate limits)
      const results = [];
      for (const pincode of pincodes) {
        if (!/^\d{6}$/.test(String(pincode))) {
          results.push({
            pincode: String(pincode),
            error: 'Invalid pincode format'
          });
          continue;
        }

        const result = await delhiveryService.checkPincodeServiceability(pincode);
        results.push({
          pincode: String(pincode),
          ...result
        });

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return res.json({
        success: true,
        count: results.length,
        results
      });

    } catch (error) {
      console.error('❌ Bulk check error:', error);
      res.status(500).json({
        success: false,
        message: 'Bulk pincode check failed',
        error: error.message
      });
    }
  },

  // ==================== CACHE MANAGEMENT ====================

  /**
   * Clear cache (admin only)
   * DELETE /api/delhivery/cache
   */
  clearCache: async (req, res) => {
    try {
      const previousSize = cache.size;
      cache.clear();

      return res.json({
        success: true,
        message: 'Cache cleared',
        previousSize,
        currentSize: cache.size
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache',
        error: error.message
      });
    }
  },

  /**
   * Get cache statistics
   * GET /api/delhivery/cache/stats
   */
  getCacheStats: async (req, res) => {
    try {
      const entries = Array.from(cache.entries());
      const validEntries = entries.filter(([_, value]) => {
        return value.timestamp + CACHE_TTL > Date.now();
      });

      return res.json({
        success: true,
        stats: {
          totalCached: cache.size,
          validEntries: validEntries.length,
          expiredEntries: cache.size - validEntries.length,
          cacheSize: `${Math.round(JSON.stringify(entries).length / 1024)} KB`
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get cache stats',
        error: error.message
      });
    }
  },

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Get from cache with TTL check
   * @private
   */
  _getFromCache: (pincode) => {
    const cached = cache.get(pincode);
    if (!cached) return null;

    // Check if expired
    if (cached.timestamp + CACHE_TTL < Date.now()) {
      cache.delete(pincode);
      return null;
    }

    return cached.data;
  },

  /**
   * Set cache with timestamp
   * @private
   */
  _setCache: (pincode, data) => {
    cache.set(pincode, {
      data,
      timestamp: Date.now()
    });
  }
};

module.exports = DelhiveryController;