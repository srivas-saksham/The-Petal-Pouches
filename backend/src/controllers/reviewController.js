// backend/src/controllers/reviewController.js

const pool = require('../config/database');

/**
 * Review Controller
 * Handles product reviews - create, read, update, delete
 */
const ReviewController = {

  // ==================== CREATE REVIEW ====================

  /**
   * Create a product review
   * POST /api/reviews
   */
  createReview: async (req, res) => {
    try {
      const userId = req.user.id;
      const { product_id, rating, comment, order_id } = req.body;

      // Validation
      if (!product_id || !rating) {
        return res.status(400).json({
          success: false,
          message: 'Product ID and rating are required'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      // Check if product exists
      const productCheck = await pool.query(
        'SELECT id FROM products WHERE id = $1',
        [product_id]
      );

      if (productCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check if user has purchased this product
      const purchaseCheck = await pool.query(
        `SELECT oi.id FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         JOIN product_variants pv ON oi.product_variant_id = pv.id
         WHERE o.user_id = $1 AND pv.product_id = $2 AND o.status = 'delivered'
         LIMIT 1`,
        [userId, product_id]
      );

      if (purchaseCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'You can only review products you have purchased and received'
        });
      }

      // Check if user already reviewed this product
      const existingReview = await pool.query(
        'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
        [userId, product_id]
      );

      if (existingReview.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this product. You can update your existing review.'
        });
      }

      // Create review
      const result = await pool.query(
        `INSERT INTO reviews (id, user_id, product_id, order_id, rating, comment, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
         RETURNING id, user_id, product_id, rating, comment, created_at`,
        [userId, product_id, order_id, rating, comment]
      );

      const review = result.rows[0];

      // Update product average rating
      await pool.query(
        `UPDATE products 
         SET average_rating = (
           SELECT AVG(rating) FROM reviews WHERE product_id = $1
         ),
         review_count = (
           SELECT COUNT(*) FROM reviews WHERE product_id = $1
         )
         WHERE id = $1`,
        [product_id]
      );

      console.log(`✅ Review created: ${review.id} for product ${product_id} by user ${userId}`);

      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        review
      });

    } catch (error) {
      console.error('❌ Create review error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit review'
      });
    }
  },

  // ==================== GET REVIEWS ====================

  /**
   * Get reviews for a product
   * GET /api/reviews/product/:product_id
   */
  getProductReviews: async (req, res) => {
    try {
      const productId = req.params.product_id;
      const { page = 1, limit = 10, rating_filter, sort = 'recent' } = req.query;
      const offset = (page - 1) * limit;

      // Build query
      let whereClause = 'WHERE r.product_id = $1';
      const params = [productId];
      let paramCount = 1;

      if (rating_filter) {
        paramCount++;
        whereClause += ` AND r.rating = $${paramCount}`;
        params.push(parseInt(rating_filter));
      }

      // Sort options
      let orderBy = 'ORDER BY r.created_at DESC'; // recent
      if (sort === 'helpful') {
        orderBy = 'ORDER BY r.helpful_count DESC, r.created_at DESC';
      } else if (sort === 'rating_high') {
        orderBy = 'ORDER BY r.rating DESC, r.created_at DESC';
      } else if (sort === 'rating_low') {
        orderBy = 'ORDER BY r.rating ASC, r.created_at DESC';
      }

      // Get reviews
      const reviewsQuery = `
        SELECT 
          r.id,
          r.rating,
          r.comment,
          r.created_at,
          r.helpful_count,
          r.verified_purchase,
          u.id as user_id,
          u.name as user_name,
          u.avatar_url as user_avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        ${whereClause}
        ${orderBy}
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      params.push(parseInt(limit), offset);
      const reviewsResult = await pool.query(reviewsQuery, params);

      // Get total count
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM reviews r ${whereClause}`,
        params.slice(0, paramCount)
      );

      // Get rating distribution
      const distributionResult = await pool.query(
        `SELECT rating, COUNT(*) as count
         FROM reviews
         WHERE product_id = $1
         GROUP BY rating
         ORDER BY rating DESC`,
        [productId]
      );

      const distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      };

      distributionResult.rows.forEach(row => {
        distribution[row.rating] = parseInt(row.count);
      });

      return res.status(200).json({
        success: true,
        reviews: reviewsResult.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult.rows[0].count / limit)
        },
        rating_distribution: distribution
      });

    } catch (error) {
      console.error('❌ Get reviews error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews'
      });
    }
  },

  /**
   * Get user's reviews
   * GET /api/reviews/my-reviews
   */
  getMyReviews: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const result = await pool.query(
        `SELECT 
          r.id,
          r.product_id,
          r.rating,
          r.comment,
          r.created_at,
          r.helpful_count,
          p.title as product_title,
          p.image_url as product_image
        FROM reviews r
        JOIN products p ON r.product_id = p.id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC
        LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      const countResult = await pool.query(
        'SELECT COUNT(*) FROM reviews WHERE user_id = $1',
        [userId]
      );

      return res.status(200).json({
        success: true,
        reviews: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult.rows[0].count / limit)
        }
      });

    } catch (error) {
      console.error('❌ Get my reviews error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch your reviews'
      });
    }
  },

  // ==================== UPDATE REVIEW ====================

  /**
   * Update a review
   * PUT /api/reviews/:id
   */
  updateReview: async (req, res) => {
    try {
      const userId = req.user.id;
      const reviewId = req.params.id;
      const { rating, comment } = req.body;

      // Validation
      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      // Check ownership
      const ownerCheck = await pool.query(
        'SELECT id, product_id FROM reviews WHERE id = $1 AND user_id = $2',
        [reviewId, userId]
      );

      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review not found or you do not have permission to update it'
        });
      }

      const productId = ownerCheck.rows[0].product_id;

      // Update review
      const result = await pool.query(
        `UPDATE reviews
         SET rating = COALESCE($1, rating),
             comment = COALESCE($2, comment),
             updated_at = NOW()
         WHERE id = $3 AND user_id = $4
         RETURNING id, rating, comment, updated_at`,
        [rating, comment, reviewId, userId]
      );

      // Update product average rating
      await pool.query(
        `UPDATE products 
         SET average_rating = (
           SELECT AVG(rating) FROM reviews WHERE product_id = $1
         )
         WHERE id = $1`,
        [productId]
      );

      console.log(`✅ Review updated: ${reviewId} by user ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        review: result.rows[0]
      });

    } catch (error) {
      console.error('❌ Update review error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update review'
      });
    }
  },

  // ==================== DELETE REVIEW ====================

  /**
   * Delete a review
   * DELETE /api/reviews/:id
   */
  deleteReview: async (req, res) => {
    try {
      const userId = req.user.id;
      const reviewId = req.params.id;

      // Check ownership
      const ownerCheck = await pool.query(
        'SELECT id, product_id FROM reviews WHERE id = $1 AND user_id = $2',
        [reviewId, userId]
      );

      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review not found or you do not have permission to delete it'
        });
      }

      const productId = ownerCheck.rows[0].product_id;

      // Delete review
      await pool.query(
        'DELETE FROM reviews WHERE id = $1 AND user_id = $2',
        [reviewId, userId]
      );

      // Update product average rating and count
      await pool.query(
        `UPDATE products 
         SET average_rating = (
           SELECT AVG(rating) FROM reviews WHERE product_id = $1
         ),
         review_count = (
           SELECT COUNT(*) FROM reviews WHERE product_id = $1
         )
         WHERE id = $1`,
        [productId]
      );

      console.log(`✅ Review deleted: ${reviewId} by user ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
      });

    } catch (error) {
      console.error('❌ Delete review error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete review'
      });
    }
  },

  // ==================== MARK HELPFUL ====================

  /**
   * Mark review as helpful
   * POST /api/reviews/:id/helpful
   */
  markHelpful: async (req, res) => {
    try {
      const reviewId = req.params.id;

      // Increment helpful count
      const result = await pool.query(
        `UPDATE reviews
         SET helpful_count = helpful_count + 1
         WHERE id = $1
         RETURNING id, helpful_count`,
        [reviewId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Marked as helpful',
        helpful_count: result.rows[0].helpful_count
      });

    } catch (error) {
      console.error('❌ Mark helpful error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark review as helpful'
      });
    }
  }

};

module.exports = ReviewController;