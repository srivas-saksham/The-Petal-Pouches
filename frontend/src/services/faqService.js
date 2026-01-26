// frontend/src/services/faqService.js
import api from './api';

/**
 * FAQ Service - Handle FAQ data fetching and management
 * Can be extended to fetch from backend API in future
 */

class FAQService {
  /**
   * Get all FAQ categories and questions
   * Currently returns static data, can be connected to backend
   */
  async getAllFAQs() {
    try {
      // For now, return static data
      // In future, replace with: const response = await api.get('/api/faqs');
      
      return {
        success: true,
        data: {
          categories: [
            {
              id: 'orders',
              name: 'Orders & Delivery',
              icon: 'Package',
              faqs: [
                {
                  id: 'order-1',
                  question: 'How long does delivery take?',
                  answer: 'Standard delivery takes 5-7 business days across India. Express delivery (1-3 days) is available for select PIN codes with additional charges.',
                  tags: ['delivery', 'shipping', 'time'],
                  views: 1523,
                  helpful: 892
                },
                // Add more FAQs...
              ]
            },
            // Add more categories...
          ]
        }
      };
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      return {
        success: false,
        error: error.message || 'Failed to load FAQs'
      };
    }
  }

  /**
   * Search FAQs by query
   * @param {string} query - Search query
   */
  async searchFAQs(query) {
    try {
      // In future: const response = await api.get(`/api/faqs/search?q=${query}`);
      
      return {
        success: true,
        data: {
          results: [], // Filtered FAQ results
          count: 0
        }
      };
    } catch (error) {
      console.error('FAQ search failed:', error);
      return {
        success: false,
        error: error.message || 'Search failed'
      };
    }
  }

  /**
   * Get FAQs by category
   * @param {string} categoryId - Category identifier
   */
  async getFAQsByCategory(categoryId) {
    try {
      // In future: const response = await api.get(`/api/faqs/category/${categoryId}`);
      
      return {
        success: true,
        data: {
          category: {},
          faqs: []
        }
      };
    } catch (error) {
      console.error('Failed to fetch category FAQs:', error);
      return {
        success: false,
        error: error.message || 'Failed to load category'
      };
    }
  }

  /**
   * Mark FAQ as helpful
   * @param {string} faqId - FAQ identifier
   */
  async markHelpful(faqId) {
    try {
      // In future: const response = await api.post(`/api/faqs/${faqId}/helpful`);
      
      return {
        success: true,
        message: 'Thank you for your feedback!'
      };
    } catch (error) {
      console.error('Failed to mark helpful:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit feedback'
      };
    }
  }

  /**
   * Submit a question to support
   * @param {object} questionData - Question details
   */
  async submitQuestion(questionData) {
    try {
      const response = await api.post('/api/support/question', questionData);
      
      return {
        success: true,
        data: response.data,
        message: 'Your question has been submitted. We will respond within 24 hours.'
      };
    } catch (error) {
      console.error('Failed to submit question:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit question'
      };
    }
  }
}

export default new FAQService();