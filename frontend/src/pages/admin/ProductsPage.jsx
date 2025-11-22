// frontend/src/pages/admin/ProductsPage.jsx

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import SearchBar from '../../components/admin/ui/SearchBar';
import Button from '../../components/admin/ui/Button';
import ProductsTable from '../../components/admin/products/ProductsTable';
import ProductFilters from '../../components/admin/products/ProductFilters';
import BulkActions from '../../components/admin/products/BulkActions';
import Pagination from '../../components/admin/ui/Pagination';
import Modal from '../../components/admin/ui/Modal';
import { BULK_ACTIONS } from '../../utils/constants';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [variantManagerProduct, setVariantManagerProduct] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category_id: '',
    min_price: '',
    max_price: '',
    in_stock: '',
    sort: 'created_at',
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [metadata, setMetadata] = useState(null);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [currentPage, filters, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/categories`);
      const categoriesData = response.data.data || response.data.categories || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
        ...(searchTerm && { search: searchTerm }),
      });

      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.set(key, filters[key]);
        }
      });

      const response = await axios.get(`${API_URL}/api/products?${params.toString()}`);
      
      setProducts(response.data.data || []);
      setMetadata(response.data.metadata || null);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setMessage({ type: 'error', text: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      category_id: '',
      min_price: '',
      max_price: '',
      in_stock: '',
      sort: 'created_at',
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkAction = async (action) => {
    console.log('Bulk action:', action, 'on products:', selectedIds);
    
    // TODO: Implement actual bulk actions
    switch (action) {
      case 'activate':
        setMessage({ type: 'success', text: `Activating ${selectedIds.length} products` });
        break;
      case 'deactivate':
        setMessage({ type: 'success', text: `Deactivating ${selectedIds.length} products` });
        break;
      case 'delete':
        if (confirm(`Delete ${selectedIds.length} products? This cannot be undone.`)) {
          setMessage({ type: 'success', text: `Deleting ${selectedIds.length} products` });
        }
        break;
      case 'duplicate':
        setMessage({ type: 'success', text: `Duplicating ${selectedIds.length} products` });
        break;
      default:
        break;
    }
    
    setTimeout(() => {
      setMessage({ type: '', text: '' });
      setSelectedIds([]);
      fetchProducts();
    }, 2000);
  };

  const handleEdit = (productId) => {
    console.log('✏️ Editing product:', productId);
    setEditingProductId(productId);
    setShowEditModal(true);
  };

  const handleDelete = async (productId, productTitle) => {
    if (!confirm(`Delete "${productTitle}"? This cannot be undone.`)) return;

    try {
      await axios.delete(`${API_URL}/api/admin/products/${productId}`);
      setMessage({ type: 'success', text: 'Product deleted successfully' });
      fetchProducts();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete product' 
      });
    }
  };

  const handleDuplicate = async (productId) => {
    // TODO: Implement product duplication
    console.log('Duplicate product:', productId);
    setMessage({ type: 'success', text: 'Duplicate feature coming soon!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleManageVariants = (productId) => {
    setVariantManagerProduct(productId);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setMessage({ type: 'success', text: 'Product created successfully!' });
    fetchProducts();
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleUpdateSuccess = () => {
    setShowEditModal(false);
    setEditingProductId(null);
    setMessage({ type: 'success', text: 'Product updated successfully!' });
    fetchProducts();
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => setShowCreateModal(true)}
          >
            Add Product
          </Button>
        }
      />

      {/* Messages */}
      {message.text && (
        <div className={`
          p-4 rounded-lg border animate-slide-in
          ${message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
          }
        `}>
          {message.text}
        </div>
      )}

      {/* Search Bar */}
      <div className="card p-6">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search products by title, SKU..."
          className="w-full"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6">
            <ProductFilters
              categories={categories}
              activeFilters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="lg:col-span-3 space-y-4">
          {/* Bulk Actions */}
          <BulkActions
            selectedCount={selectedIds.length}
            actions={BULK_ACTIONS.products.map(action => ({
              ...action,
              onClick: () => handleBulkAction(action.value),
            }))}
            onClearSelection={handleClearSelection}
          />

          {/* Table */}
          <ProductsTable
            products={products}
            loading={loading}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onManageVariants={handleManageVariants}
          />

          {/* Pagination */}
          {!loading && metadata && metadata.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalItems={metadata.totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Product"
          size="lg"
        >
          <div className="max-h-[70vh] overflow-y-auto">
            {/* Use existing CreateProductForm but with new styling context */}
            <div className="space-y-4">
              <p className="text-text-secondary text-sm">
                Fill in the product details below. All fields marked with * are required.
              </p>
              {/* The actual form will be rendered here - keeping existing logic */}
              <iframe 
                src="/admin-legacy/create-product" 
                style={{ display: 'none' }}
                title="Create Product Form"
              />
              {/* TODO: Integrate CreateProductForm component here */}
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProductId && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProductId(null);
          }}
          title="Edit Product"
          size="lg"
        >
          <div className="max-h-[70vh] overflow-y-auto">
            {/* Use existing UpdateProductForm but with new styling context */}
            <div className="space-y-4">
              <p className="text-text-secondary text-sm">
                Update product details. Changes will be saved immediately.
              </p>
              {/* TODO: Integrate UpdateProductForm component here */}
            </div>
          </div>
        </Modal>
      )}

      {/* Variant Manager Modal */}
      {variantManagerProduct && (
        <div>
          {/* Use existing VariantManager component */}
          {/* TODO: Import and render VariantManager here */}
        </div>
      )}
    </div>
  );
}