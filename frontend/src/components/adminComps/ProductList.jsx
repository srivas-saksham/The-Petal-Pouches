// frontend/src/components/adminComps/ProductList.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import VariantManager from './VariantManager';

const ProductList = ({ onEdit }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    min_price: '',
    max_price: '',
    in_stock: '',
    sort: 'created_at',
    page: 1,
    limit: 20
  });
  const [metadata, setMetadata] = useState(null);
  const [variantManagerProduct, setVariantManagerProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/products?${params.toString()}`
      );
      
      console.log('📦 Products loaded:', response.data.data);
      setProducts(response.data.data);
      setMetadata(response.data.metadata);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', text: 'Failed to load products' });
      setLoading(false);
    }
  };

  const handleDelete = async (productId, productTitle) => {
    if (!confirm(`Are you sure you want to delete "${productTitle}"?`)) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/products/${productId}`
      );
      
      setMessage({ type: 'success', text: 'Product deleted successfully' });
      fetchProducts();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete product'
      });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Helper function to get the display image for a product
  const getProductDisplayImage = (product) => {
    // If product has variants, try to get the default variant's image
    if (product.has_variants && product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants.find(v => v.is_default);
      if (defaultVariant && defaultVariant.img_url) {
        return defaultVariant.img_url;
      }
      // If no default variant has an image, use the first variant's image
      const variantWithImage = product.variants.find(v => v.img_url);
      if (variantWithImage) {
        return variantWithImage.img_url;
      }
    }
    // Fall back to product's main image
    return product.img_url;
  };

  if (loading && products.length === 0) {
    return <div style={{ padding: '20px' }}>Loading products...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Product Management</h2>
      
      {message.text && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px'
      }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <input
          type="number"
          placeholder="Min Price"
          value={filters.min_price}
          onChange={(e) => handleFilterChange('min_price', e.target.value)}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={filters.max_price}
          onChange={(e) => handleFilterChange('max_price', e.target.value)}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <select
          value={filters.in_stock}
          onChange={(e) => handleFilterChange('in_stock', e.target.value)}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="">All Stock</option>
          <option value="true">In Stock Only</option>
        </select>
        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="created_at">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Product Table */}
      {products.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          No products found
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Image</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Title</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>SKU</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Stock</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Variants</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const displayImage = getProductDisplayImage(product);
                  const hasDefaultVariant = product.has_variants && product.variants?.some(v => v.is_default);
                  
                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={displayImage} 
                            alt={product.title}
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          {hasDefaultVariant && (
                            <div style={{
                              position: 'absolute',
                              bottom: '-4px',
                              right: '-4px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              fontSize: '0.6rem',
                              padding: '2px 4px',
                              borderRadius: '3px',
                              fontWeight: '600',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}>
                              DEFAULT
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '600' }}>{product.title}</div>
                        {product.description && (
                          <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '4px' }}>
                            {product.description.substring(0, 60)}...
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'monospace' }}>{product.sku}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                        ₹{product.price}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: product.stock > 0 ? '#d4edda' : '#f8d7da',
                          color: product.stock > 0 ? '#155724' : '#721c24',
                          fontSize: '0.875rem'
                        }}>
                          {product.stock}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {product.Categories?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {product.has_variants ? (
                          <div>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#e7f3ff',
                              color: '#0056b3',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              ✓ Has Variants
                            </span>
                            {product.variants && product.variants.length > 0 && (
                              <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px' }}>
                                ({product.variants.length} variant{product.variants.length > 1 ? 's' : ''})
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#999', fontSize: '0.875rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => {
                              console.log('✏️ Editing product:', product.id);
                              onEdit(product.id);
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Edit
                          </button>
                          {product.has_variants && (
                            <button
                              onClick={() => setVariantManagerProduct(product.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#6f42c1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                              title="Manage Variants"
                            >
                              Variants
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(product.id, product.title)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {metadata && metadata.totalPages > 1 && (
            <div style={{ 
              marginTop: '20px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                Showing page {metadata.currentPage} of {metadata.totalPages} 
                ({metadata.totalCount} total products)
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: filters.page === 1 ? '#e9ecef' : '#007bff',
                    color: filters.page === 1 ? '#6c757d' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: filters.page === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!metadata.hasMore}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: !metadata.hasMore ? '#e9ecef' : '#007bff',
                    color: !metadata.hasMore ? '#6c757d' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: !metadata.hasMore ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Variant Manager Modal */}
      {variantManagerProduct && (
        <VariantManager
          productId={variantManagerProduct}
          onClose={() => {
            setVariantManagerProduct(null);
            fetchProducts(); // Refresh products after managing variants
          }}
        />
      )}
    </div>
  );
};

export default ProductList;