// frontend/src/pages/Shop.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    min_price: '',
    max_price: '',
    in_stock: '',
    sort: 'created_at',
    page: 1,
    limit: 12
  });
  const [metadata, setMetadata] = useState(null);

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
      
      setProducts(response.data.data);
      setMetadata(response.data.metadata);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #dee2e6',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', margin: '0 0 10px 0' }}>
          Shop
        </h1>
        <p style={{ color: '#666', fontSize: '1.125rem' }}>
          Discover our beautiful collection of gifts
        </p>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Filters */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {/* Search */}
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />

            {/* Min Price */}
            <input
              type="number"
              placeholder="Min Price"
              value={filters.min_price}
              onChange={(e) => handleFilterChange('min_price', e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />

            {/* Max Price */}
            <input
              type="number"
              placeholder="Max Price"
              value={filters.max_price}
              onChange={(e) => handleFilterChange('max_price', e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />

            {/* Stock Filter */}
            <select
              value={filters.in_stock}
              onChange={(e) => handleFilterChange('in_stock', e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="">All Products</option>
              <option value="true">In Stock Only</option>
            </select>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="created_at">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px',
            fontSize: '1.25rem',
            color: '#666'
          }}>
            No products found
          </div>
        ) : (
          <>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '30px'
            }}>
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Product Image */}
                  <div style={{ 
                    width: '100%',
                    paddingTop: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={product.img_url}
                      alt={product.title}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {/* Stock Badge */}
                    {product.stock === 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div style={{ padding: '16px' }}>
                    {/* Category */}
                    {product.Categories && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#007bff',
                        fontWeight: '600',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {product.Categories.name}
                      </div>
                    )}

                    {/* Title */}
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      margin: '0 0 8px 0',
                      lineHeight: '1.4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {product.title}
                    </h3>

                    {/* Price and Stock */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '12px'
                    }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#007bff'
                      }}>
                        ₹{product.price}
                      </div>
                      {product.stock > 0 && (
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#28a745',
                          fontWeight: '600'
                        }}>
                          {product.stock} in stock
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {metadata && metadata.totalPages > 1 && (
              <div style={{
                marginTop: '40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px'
              }}>
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: filters.page === 1 ? '#e9ecef' : '#007bff',
                    color: filters.page === 1 ? '#6c757d' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: filters.page === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  Previous
                </button>

                <div style={{ fontSize: '1rem', color: '#666' }}>
                  Page {metadata.currentPage} of {metadata.totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!metadata.hasMore}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: !metadata.hasMore ? '#e9ecef' : '#007bff',
                    color: !metadata.hasMore ? '#6c757d' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: !metadata.hasMore ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default Shop;