// frontend/src/pages/admin/ProductsPage.jsx

import { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import SearchBar from '../../components/admin/ui/SearchBar';
import Button from '../../components/admin/ui/Button';
import ProductsTable from '../../components/admin/products/ProductsTable';
import ProductsGrid from '../../components/admin/products/ProductsGrid';
import ProductStats from '../../components/admin/products/ProductStats';
import ProductFilters from '../../components/admin/products/ProductFilters';
import BulkActions from '../../components/admin/products/BulkActions';
import Pagination from '../../components/admin/ui/Pagination';
import Modal from '../../components/admin/ui/Modal';
import { BULK_ACTIONS, PRODUCT_SORT_OPTIONS } from '../../utils/constants';

// Import existing working components
import CreateProductForm from '../../components/adminComps/CreateProductForm';
import UpdateProductForm from '../../components/adminComps/UpdateProductForm';
import VariantManager from '../../components/adminComps/VariantManager';

// Import services
import { 
  getProducts, 
  getProductStats,
  deleteProduct,
  duplicateProduct,
} from '../../services/productService';
import { getCategories } from '../../services/categoryService';

export default function ProductsPage() {
  // State declarations
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // View mode: 'list' or 'grid'
  const [viewMode, setViewMode] = useState('list');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [variantManagerProduct, setVariantManagerProduct] = useState(null);
  
  // Search term - must be declared before filters
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters with new stock_level and has_variants
  const [filters, setFilters] = useState({
    category_id: '',
    min_price: '',
    max_price: '',
    stock_level: '',
    has_variants: '',
    sort: 'created_at',
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [metadata, setMetadata] = useState(null);
  const itemsPerPage = 20;

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters, searchTerm]);

  const fetchCategories = async () => {
    const result = await getCategories();
    if (result.success) {
      setCategories(result.data.data || []);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    const result = await getProductStats();
    if (result.success) {
      setStats(result.data);
    }
    setStatsLoading(false);
  };

  const fetchProducts = async () => {
    setLoading(true);
    
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // Add filters only if they have values
    if (filters.category_id) {
      params.category_id = filters.category_id;
    }
    
    if (filters.min_price) {
      params.min_price = parseFloat(filters.min_price);
    }
    
    if (filters.max_price) {
      params.max_price = parseFloat(filters.max_price);
    }
    
    // Handle stock_level filter (comprehensive)
    if (filters.stock_level && filters.stock_level !== '') {
      params.stock_level = filters.stock_level;
    }
    
    // Handle has_variants filter
    if (filters.has_variants && filters.has_variants !== '') {
      params.has_variants = filters.has_variants;
    }
    
    // Validate and send sort parameter (only valid options)
    const validSortValues = PRODUCT_SORT_OPTIONS.map(opt => opt.value);
    if (filters.sort && validSortValues.includes(filters.sort)) {
      params.sort = filters.sort;
    } else {
      params.sort = 'created_at';
    }
    
    // Search query (backend searches title, description, and SKU)
    if (searchTerm && searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    const result = await getProducts(params);
    
    if (result.success) {
      setProducts(result.data.data || []);
      setMetadata(result.data.metadata || null);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to load products' });
    }
    
    setLoading(false);
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
      stock_level: '',
      has_variants: '',
      sort: 'created_at',
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return searchTerm || 
           filters.category_id || 
           filters.min_price || 
           filters.max_price || 
           filters.stock_level !== '' ||
           filters.has_variants !== '';
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
    
    // TODO: Implement bulk actions on backend
    setMessage({ 
      type: 'success', 
      text: `Bulk action "${action}" on ${selectedIds.length} products - Coming soon!` 
    });
    
    setTimeout(() => {
      setMessage({ type: '', text: '' });
      setSelectedIds([]);
    }, 3000);
  };

  const handleEdit = (productId) => {
    setEditingProductId(productId);
    setShowEditModal(true);
  };

  const handleDelete = async (productId, productTitle) => {
    if (!confirm(`Delete "${productTitle}"? This cannot be undone.`)) return;

    const result = await deleteProduct(productId);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Product deleted successfully' });
      fetchProducts();
      fetchStats();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to delete product' });
    }
    
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleDuplicate = async (productId) => {
    const result = await duplicateProduct(productId);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Product duplicated successfully' });
      fetchProducts();
      fetchStats();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to duplicate product' });
    }
    
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleManageVariants = (productId) => {
    setVariantManagerProduct(productId);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setMessage({ type: 'success', text: 'Product created successfully!' });
    fetchProducts();
    fetchStats();
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleUpdateSuccess = () => {
    setShowEditModal(false);
    setEditingProductId(null);
    setMessage({ type: 'success', text: 'Product updated successfully!' });
    fetchProducts();
    fetchStats();
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setEditingProductId(null);
  };

  const handleSortChange = (sortValue) => {
    setFilters(prev => ({ ...prev, sort: sortValue }));
    setCurrentPage(1);
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
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
            className="text-sm"
          >
            Add Product
          </Button>
        }
      />

      {/* Messages */}
      {message.text && (
        <div className={`
          p-3 rounded-lg border animate-slide-in text-sm
          ${message.type === 'success' 
            ? 'bg-tppmint/20 border-tppmint text-tppslate' 
            : 'bg-red-50 border-red-200 text-red-800'
          }
        `}>
          {message.text}
        </div>
      )}

      {/* Search & Filters Section */}
      <div className="bg-white rounded-lg p-5 border border-tppgrey shadow-sm space-y-4">
        {/* Search Bar with View Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search products by title, description, or SKU..."
              className="w-full"
            />
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-tpppeach/20 rounded-lg p-1 border border-tppgrey">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-tppslate shadow-sm'
                  : 'text-tppslate/50 hover:text-tppslate'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-tppslate shadow-sm'
                  : 'text-tppslate/50 hover:text-tppslate'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Filters */}
        <ProductFilters
          categories={categories}
          activeFilters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters()}
        />
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-tppmint/10 rounded-lg p-4 border border-tppmint">
          <BulkActions
            selectedCount={selectedIds.length}
            actions={BULK_ACTIONS.products.map(action => ({
              ...action,
              onClick: () => handleBulkAction(action.value),
            }))}
            onClearSelection={handleClearSelection}
          />
        </div>
      )}

      {/* Products Display */}
      <div className="bg-white rounded-lg border border-tppgrey shadow-sm overflow-hidden">
        {viewMode === 'list' ? (
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
            currentSort={filters.sort}
            onSortChange={handleSortChange}
          />
        ) : (
          <ProductsGrid
            products={products}
            loading={loading}
            selectedIds={selectedIds}
            onSelectOne={handleSelectOne}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onManageVariants={handleManageVariants}
          />
        )}
      </div>

      {/* Pagination */}
      {!loading && metadata && metadata.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalItems={metadata.totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Stats */}
      <ProductStats stats={stats} loading={statsLoading} />
      
      {/* Create Product Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Product"
          size="lg"
        >
          <div className="max-h-[100vh] overflow-y-auto scrollbar-custom">
            <CreateProductForm onSuccess={handleCreateSuccess} />
          </div>
        </Modal>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProductId && (
        <Modal
          isOpen={showEditModal}
          onClose={handleModalClose}
          title="Edit Product"
          size="lg"
        >
          <div className="max-h-[100vh] overflow-y-auto scrollbar-custom">
            <UpdateProductForm
              productId={editingProductId}
              onSuccess={handleUpdateSuccess}
              onCancel={handleModalClose}
            />
          </div>
        </Modal>
      )}

      {/* Variant Manager Modal */}
      {variantManagerProduct && (
        <VariantManager
          productId={variantManagerProduct}
          onClose={() => {
            setVariantManagerProduct(null);
            fetchProducts();
            fetchStats();
          }}
        />
      )}
    </div>
  );
}