// backend/src/controllers/reviewController.js

const supabase = require('../config/supabaseClient');

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
      const { data: product, error: productError } = await supabase
        .from('Products')
        .select('id')
        .eq('id', product_id)
        .single();

      if (productError || !product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check if user has purchased this product
      const { data: purchases, error: purchaseError } = await supabase
        .from('Order_items')
        .select(`
          id,
          Orders!inner(user_id, status),
          Product_variants!inner(product_id)
        `)
        .eq('Orders.user_id', userId)
        .eq('Product_variants.product_id', product_id)
        .eq('Orders.status', 'delivered')
        .limit(1);

      if (purchaseError || !purchases || purchases.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'You can only review products you have purchased and received'
        });
      }

      // Check if user already reviewed this product
      const { data: existingReview, error: existingError } = await supabase
        .from('Reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', product_id)
        .single();

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this product. You can update your existing review.'
        });
      }

      // Create review
      const { data: review, error: createError } = await supabase
        .from('Reviews')
        .insert([{
          user_id: userId,
          product_id,
          order_id,
          rating,
          comment,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Get all reviews for this product to calculate average
      const { data: allReviews, error: reviewsError } = await supabase
        .from('Reviews')
        .select('rating')
        .eq('product_id', product_id);

      if (!reviewsError && allReviews) {
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        const reviewCount = allReviews.length;

        // Update product average rating
        await supabase
          .from('Products')
          .update({
            average_rating: avgRating,
            review_count: reviewCount
          })
          .eq('id', product_id);
      }

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

      // Build base query
      let query = supabase
        .from('Reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          helpful_count,
          verified_purchase,
          Users!inner(
            id,
            name,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('product_id', productId);

      // Apply rating filter
      if (rating_filter) {
        query = query.eq('rating', parseInt(rating_filter));
      }

      // Apply sorting
      switch (sort) {
        case 'helpful':
          query = query.order('helpful_count', { ascending: false });
          query = query.order('created_at', { ascending: false });
          break;
        case 'rating_high':
          query = query.order('rating', { ascending: false });
          query = query.order('created_at', { ascending: false });
          break;
        case 'rating_low':
          query = query.order('rating', { ascending: true });
          query = query.order('created_at', { ascending: false });
          break;
        default: // recent
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      query = query.range(offset, offset + parseInt(limit) - 1);

      const { data: reviews, error: reviewsError, count } = await query;

      if (reviewsError) throw reviewsError;

      // Format reviews
      const formattedReviews = reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        helpful_count: review.helpful_count,
        verified_purchase: review.verified_purchase,
        user_id: review.Users.id,
        user_name: review.Users.name,
        user_avatar: review.Users.avatar_url
      }));

      // Get rating distribution
      const { data: allReviews, error: distributionError } = await supabase
        .from('Reviews')
        .select('rating')
        .eq('product_id', productId);

      const distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      };

      if (!distributionError && allReviews) {
        allReviews.forEach(review => {
          distribution[review.rating] = (distribution[review.rating] || 0) + 1;
        });
      }

      return res.status(200).json({
        success: true,
        reviews: formattedReviews,
        pagination: {
          total: count || 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil((count || 0) / limit)
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

      const { data: reviews, error: reviewsError, count } = await supabase
        .from('Reviews')
        .select(`
          id,
          product_id,
          rating,
          comment,
          created_at,
          helpful_count,
          Products!inner(
            title,
            image_url
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (reviewsError) throw reviewsError;

      // Format reviews
      const formattedReviews = reviews.map(review => ({
        id: review.id,
        product_id: review.product_id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        helpful_count: review.helpful_count,
        product_title: review.Products.title,
        product_image: review.Products.image_url
      }));

      return res.status(200).json({
        success: true,
        reviews: formattedReviews,
        pagination: {
          total: count || 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil((count || 0) / limit)
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
      const { data: existingReview, error: checkError } = await supabase
        .from('Reviews')
        .select('id, product_id')
        .eq('id', reviewId)
        .eq('user_id', userId)
        .single();

      if (checkError || !existingReview) {
        return res.status(404).json({
          success: false,
          message: 'Review not found or you do not have permission to update it'
        });
      }

      const productId = existingReview.product_id;

      // Build update object
      const updateData = {
        updated_at: new Date().toISOString()
      };
      if (rating) updateData.rating = rating;
      if (comment !== undefined) updateData.comment = comment;

      // Update review
      const { data: updatedReview, error: updateError } = await supabase
        .from('Reviews')
        .update(updateData)
        .eq('id', reviewId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Get all reviews for this product to recalculate average
      const { data: allReviews, error: reviewsError } = await supabase
        .from('Reviews')
        .select('rating')
        .eq('product_id', productId);

      if (!reviewsError && allReviews) {
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        // Update product average rating
        await supabase
          .from('Products')
          .update({ average_rating: avgRating })
          .eq('id', productId);
      }

      console.log(`✅ Review updated: ${reviewId} by user ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        review: updatedReview
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
      const { data: existingReview, error: checkError } = await supabase
        .from('Reviews')
        .select('id, product_id')
        .eq('id', reviewId)
        .eq('user_id', userId)
        .single();

      if (checkError || !existingReview) {
        return res.status(404).json({
          success: false,
          message: 'Review not found or you do not have permission to delete it'
        });
      }

      const productId = existingReview.product_id;

      // Delete review
      const { error: deleteError } = await supabase
        .from('Reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Get remaining reviews for this product to recalculate average
      const { data: allReviews, error: reviewsError } = await supabase
        .from('Reviews')
        .select('rating')
        .eq('product_id', productId);

      if (!reviewsError) {
        const avgRating = allReviews.length > 0 
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
          : null;
        const reviewCount = allReviews.length;

        // Update product average rating and count
        await supabase
          .from('Products')
          .update({
            average_rating: avgRating,
            review_count: reviewCount
          })
          .eq('id', productId);
      }

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

      // Get current helpful count
      const { data: review, error: fetchError } = await supabase
        .from('Reviews')
        .select('helpful_count')
        .eq('id', reviewId)
        .single();

      if (fetchError || !review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Increment helpful count
      const newCount = (review.helpful_count || 0) + 1;

      const { data: updatedReview, error: updateError } = await supabase
        .from('Reviews')
        .update({ helpful_count: newCount })
        .eq('id', reviewId)
        .select('id, helpful_count')
        .single();

      if (updateError) throw updateError;

      return res.status(200).json({
        success: true,
        message: 'Marked as helpful',
        helpful_count: updatedReview.helpful_count
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