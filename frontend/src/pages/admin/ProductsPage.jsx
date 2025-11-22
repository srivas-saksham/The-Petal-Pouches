// frontend/src/pages/admin/ProductsPage.jsx

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import SearchBar from '../../components/admin/ui/SearchBar';
import Button from '../../components/admin/ui/Button';
import ProductsTable from '../../components/admin/products/ProductsTable';
import ProductStats from '../../components/admin/products/ProductStats';
import ProductFilters from '../../components/admin/products/ProductFilters';
import BulkActions from '../../components/admin/products/BulkActions';
import Pagination from '../../components/admin/ui/Pagination';
import Modal from '../../components/admin/ui/Modal';
import { BULK_ACTIONS } from '../../utils/constants';

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
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
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
      ...filters,
    };

    if (searchTerm) {
      params.search = searchTerm;
    }

    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

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

      {/* Stats */}
      <ProductStats stats={stats} loading={statsLoading} />

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
          <div className="max-h-[70vh] overflow-y-auto scrollbar-custom">
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
          <div className="max-h-[70vh] overflow-y-auto scrollbar-custom">
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