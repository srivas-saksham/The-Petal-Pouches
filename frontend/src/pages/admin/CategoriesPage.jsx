// frontend/src/pages/admin/CategoriesPage.jsx

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Package, Search, X, FolderOpen, Layers, ChevronRight, Eye } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import Button from '../../components/admin/ui/Button';
import Modal from '../../components/admin/ui/Modal';
import { formatDate } from '../../utils/adminHelpers';
import { useToast } from '../../hooks/useToast';

// Import services
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/categoryService';
import { getProductsByCategory } from '../../services/productService';

// Import getProducts to fetch all products
import { getProducts, updateProduct } from '../../services/productService';

// Format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// Product Item Component for Modal
const ProductItem = ({ product }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white border-2 border-tppgrey rounded-lg hover:border-tpppink transition-all duration-200 group">
      {/* Product Image */}
      <div className="w-16 h-16 flex-shrink-0 bg-tpppeach rounded-lg overflow-hidden border-2 border-tppgrey group-hover:border-tpppink transition-all">
        {product.img_url ? (
          <img 
            src={product.img_url} 
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-tppslate/30" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-tppslate text-sm truncate group-hover:text-tpppink transition-colors">
          {product.title}
        </h4>
        <div className="flex items-center gap-3 mt-1 text-xs text-tppslate/60">
          <span>SKU: {product.sku || 'N/A'}</span>
          <span>•</span>
          <span className={`font-medium ${
            product.stock === 0 ? 'text-red-600' : 
            product.stock <= 10 ? 'text-yellow-600' : 
            'text-tpppink'
          }`}>
            Stock: {product.stock}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <div className="font-bold text-tppslate text-sm">
          {formatCurrency(product.price)}
        </div>
        {product.has_variants && (
          <div className="text-xs text-tppslate/60 mt-0.5">
            Has variants
          </div>
        )}
      </div>
    </div>
  );
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, withProducts: 0, empty: 0 });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Products modal states
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Add products modal states
  const [showAddProductsModal, setShowAddProductsModal] = useState(false);
  const [addProductsCategory, setAddProductsCategory] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [addProductsLoading, setAddProductsLoading] = useState(false);
  const [addProductsSearchTerm, setAddProductsSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    setLoading(true);
    setStatsLoading(true);
    const result = await getCategories();
    
    if (result.success) {
      const categoriesData = result.data.data || result.data.categories || result.data || [];
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];
      setCategories(categoriesArray);
      
      // Calculate stats
      const withProducts = categoriesArray.filter(cat => (cat.product_count || 0) > 0).length;
      setStats({
        total: categoriesArray.length,
        withProducts: withProducts,
        empty: categoriesArray.length - withProducts,
      });
    } else {
      toast.error(result.error || 'Failed to load categories');
    }
    
    setLoading(false);
    setStatsLoading(false);
  };

  const fetchCategoryProducts = async (categoryId) => {
    setProductsLoading(true);
    const result = await getProductsByCategory(categoryId, { limit: 1000 });
    
    if (result.success) {
      const products = result.data.data || [];
      setCategoryProducts(products);
    } else {
      toast.error('Failed to load products');
      setCategoryProducts([]);
    }
    
    setProductsLoading(false);
  };

  const handleViewProducts = async (category) => {
    setSelectedCategory(category);
    setShowProductsModal(true);
    await fetchCategoryProducts(category.id);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSubmitting(true);
    

    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim()
    };

    let result;
    if (editingId) {
      result = await updateCategory(editingId, categoryData);
    } else {
      result = await createCategory(categoryData);
    }

    if (result.success) {
      toast.success(
        editingId ? 'Category updated successfully!' : 'Category created successfully!'
      );
      
      setFormData({ name: '', description: '' });
      setEditingId(null);
      setShowModal(false);
      
      fetchCategories();
    } else {
      toast.error(result.error || 'Failed to save category');
    }

    setSubmitting(false);
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setEditingId(category.id);
    setShowModal(true);
  };

  const handleDelete = async (id, categoryName) => {
    if (!confirm(`Delete "${categoryName}"? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    
    
    const result = await deleteCategory(id);
    
    if (result.success) {
      toast.success('Category deleted successfully!');
      fetchCategories();
    } else {
      toast.error(result.error || 'Failed to delete category');
    }
    
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowModal(false);
    
  };

  const handleOpenCreateModal = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowModal(true);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleCloseProductsModal = () => {
    setShowProductsModal(false);
    setSelectedCategory(null);
    setCategoryProducts([]);
  };

  const handleOpenAddProductsModal = async (category) => {
    setAddProductsCategory(category);
    setShowAddProductsModal(true);
    setAddProductsLoading(true);
    setAddProductsSearchTerm('');
    setSelectedProductIds([]);
    
    // Fetch all products that don't belong to this category
    const result = await getProducts({ limit: 1000 });
    if (result.success) {
      const products = result.data.data || [];
      // Filter out products that already belong to this category
      const availableProducts = products.filter(p => 
        p.category_id !== category.id
      );
      setAllProducts(availableProducts);
    }
    setAddProductsLoading(false);
  };

  const handleCloseAddProductsModal = () => {
    setShowAddProductsModal(false);
    setAddProductsCategory(null);
    setAllProducts([]);
    setSelectedProductIds([]);
    setAddProductsSearchTerm('');
  };

  const handleToggleProductSelection = (productId) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleAddProductsToCategory = async () => {
    if (selectedProductIds.length === 0) {
      toast.error('Please select at least one product');
      return;
    }
    setAddProductsLoading(true);

    // Update each selected product with the new category
    const updatePromises = selectedProductIds.map(productId => 
      updateProduct(productId, { category_id: addProductsCategory.id })
    );

    const results = await Promise.all(updatePromises);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    if (successCount > 0) {
      toast.success(
        `Successfully added ${successCount} product${successCount !== 1 ? 's' : ''} to ${addProductsCategory.name}${failCount > 0 ? `, ${failCount} failed` : ''}`
      );
      fetchCategories();
      handleCloseAddProductsModal();
    } else {
      toast.error('Failed to add products to category');
    }

    setAddProductsLoading(false);
  };

  const filteredAvailableProducts = allProducts.filter(product =>
    product.title.toLowerCase().includes(addProductsSearchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(addProductsSearchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Categories Management"
        description="Organize your products with categories"
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreateModal}
            className="text-sm"
          >
            Add Category
          </Button>
        }
      />

      {/* Stats Cards */}
      {!statsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border-2 border-tppgrey p-4 transition-all duration-200 hover:border-tpppink hover:bg-tpppink/5 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tpppeach rounded-lg">
                  <Layers className="w-5 h-5 text-tpppink" />
                </div>
                <div>
                  <div className="text-xs font-medium text-tppslate/60">Total Categories</div>
                  <div className="text-2xl font-bold text-tppslate">{stats.total}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border-2 border-tppgrey p-4 transition-all duration-200 hover:border-tpppink hover:bg-tpppink/5 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tpppeach rounded-lg">
                  <Package className="w-5 h-5 text-tpppink" />
                </div>
                <div>
                  <div className="text-xs font-medium text-tppslate/60">With Products</div>
                  <div className="text-2xl font-bold text-tppslate">{stats.withProducts}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border-2 border-tppgrey p-4 transition-all duration-200 hover:border-tpppink hover:bg-tpppink/5 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tpppeach rounded-lg">
                  <FolderOpen className="w-5 h-5 text-tpppink" />
                </div>
                <div>
                  <div className="text-xs font-medium text-tppslate/60">Empty</div>
                  <div className="text-2xl font-bold text-tppslate">{stats.empty}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg p-4 border-2 border-tppgrey shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tppslate/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories by name or description..."
            className="w-full pl-10 pr-10 py-2 border-2 border-tppgrey rounded-lg text-sm text-tppslate placeholder-tppslate/40 focus:outline-none hover:border-tpppink focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tppslate/40 hover:text-tppslate transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      {loading && categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpppink mx-auto"></div>
          <p className="text-tppslate/60 mt-4 text-sm">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-dashed border-tppgrey p-12 text-center">
          <div className="inline-flex p-4 bg-tpppeach rounded-full mb-4">
            <Tag className="w-8 h-8 text-tpppink" />
          </div>
          <h3 className="text-lg font-semibold text-tppslate mb-2">
            {searchTerm ? 'No categories found' : 'No categories yet'}
          </h3>
          <p className="text-tppslate/60 text-sm mb-6">
            {searchTerm ? 'Try adjusting your search' : 'Create your first category to organize products'}
          </p>
          {!searchTerm && (
            <Button variant="primary" onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4" />
              Create Category
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg border-2 border-tppgrey p-4 transition-all duration-200 hover:border-tpppink hover:bg-tpppink/5 hover:shadow-sm hover:shadow-md group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-tpppeach rounded group-hover:bg-tpppink/20 transition-colors">
                      <Tag className="w-3.5 h-3.5 text-tpppink" />
                    </div>
                    <h3 className="text-base font-semibold text-tppslate truncate">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-xs text-tppslate/50 ml-6">
                    {formatDate(category.created_at)}
                  </p>
                </div>
                <div className="flex gap-1.5 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenAddProductsModal(category)}
                    className="p-2 text-tppslate/60 hover:text-tpppink hover:bg-tpppink/10 rounded-lg transition-all duration-200"
                    title="Add products to category"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-tppslate/60 hover:text-tpppink hover:bg-tpppeach rounded-lg transition-all duration-200"
                    title="Edit category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="p-2 text-tppslate/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {category.description && (
                <p className="text-sm text-tppslate/70 mb-3 line-clamp-2 leading-relaxed">
                  {category.description}
                </p>
              )}
              
              <div className="pt-3 border-t border-tppgrey">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-tppslate/40 font-mono">
                    ID: {category.id.substring(0, 8)}...
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-tppslate/60 font-medium">
                      {category.product_count || 0} products
                    </span>
                    {(category.product_count || 0) > 0 && (
                      <button
                        onClick={() => handleViewProducts(category)}
                        className="p-1 text-tpppink hover:bg-tpppeach rounded transition-all duration-200"
                        title="View products"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title={editingId ? 'Edit Category' : 'Create Category'}
        size="md"
        allowFullscreen={false}
      >
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-tppslate mb-2">
                Category Name <span className="text-tpppink">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Jewelry, Soft Toys, Accessories"
                className="w-full px-4 py-2 border-2 border-tppgrey rounded-lg text-sm text-tppslate placeholder-tppslate/40 focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all duration-200"
                required
                autoFocus
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-tppslate mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Brief description of this category..."
                className="w-full px-4 py-2 border-2 border-tppgrey rounded-lg text-sm text-tppslate placeholder-tppslate/40 focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all duration-200 resize-none"
                disabled={submitting}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleCancel} 
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="primary"
                disabled={submitting}
                loading={submitting}
                className="flex-1"
              >
                {editingId ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Products Modal */}
      <Modal
        isOpen={showProductsModal}
        onClose={handleCloseProductsModal}
        title={selectedCategory?.name || 'Category Products'}
        subtitle={`${categoryProducts.length} product${categoryProducts.length !== 1 ? 's' : ''} in this category`}
        size="lg"
        icon={Package}
      >
        <div className="p-6">
          {productsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpppink mb-4"></div>
              <p className="text-tppslate/60 text-sm">Loading products...</p>
            </div>
          ) : categoryProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-tpppeach rounded-full mb-4">
                <Package className="w-8 h-8 text-tpppink" />
              </div>
              <h3 className="text-lg font-semibold text-tppslate mb-2">No Products</h3>
              <p className="text-tppslate/60 text-sm">
                This category doesn't have any products yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryProducts.map((product) => (
                <ProductItem key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Add Products to Category Modal */}
      <Modal
        isOpen={showAddProductsModal}
        onClose={handleCloseAddProductsModal}
        title={`Add Products to ${addProductsCategory?.name || 'Category'}`}
        subtitle={`Select products to add to this category`}
        size="lg"
        icon={Plus}
      >
        <div className="p-6 space-y-4">
          {/* Search products */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tppslate/40" />
            <input
              type="text"
              value={addProductsSearchTerm}
              onChange={(e) => setAddProductsSearchTerm(e.target.value)}
              placeholder="Search available products..."
              className="w-full pl-10 pr-4 py-2 border-2 border-tppslate/20 rounded-lg text-sm text-tppslate placeholder-tppslate/40 focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all duration-200"
            />
          </div>

          {/* Selected count */}
          {selectedProductIds.length > 0 && (
            <div className="bg-tpppink/10 border border-tpppink rounded-lg p-3 text-sm">
              <span className="font-semibold text-tppslate">
                {selectedProductIds.length} product{selectedProductIds.length !== 1 ? 's' : ''} selected
              </span>
            </div>
          )}

          {/* Products list */}
          {addProductsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpppink mb-4"></div>
              <p className="text-tppslate/60 text-sm">Loading available products...</p>
            </div>
          ) : filteredAvailableProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-tpppeach rounded-full mb-4">
                <Package className="w-8 h-8 text-tpppink" />
              </div>
              <h3 className="text-lg font-semibold text-tppslate mb-2">No Available Products</h3>
              <p className="text-tppslate/60 text-sm">
                {addProductsSearchTerm 
                  ? 'No products match your search'
                  : 'All products are already in categories or no products exist'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {filteredAvailableProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleToggleProductSelection(product.id)}
                  className={`flex items-center gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedProductIds.includes(product.id)
                      ? 'border-tpppink bg-tpppink/10'
                      : 'border-tppslate/20 hover:border-tpppink'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex-shrink-0">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      selectedProductIds.includes(product.id)
                        ? 'bg-tpppink border-tpppink'
                        : 'border-tppslate/30'
                    }`}>
                      {selectedProductIds.includes(product.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="w-12 h-12 flex-shrink-0 bg-tpppeach rounded overflow-hidden border-2 border-tppslate/20">
                    {product.img_url ? (
                      <img 
                        src={product.img_url} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-tppslate/30" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-tppslate text-sm truncate">
                      {product.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-tppslate/60">
                      <span>SKU: {product.sku || 'N/A'}</span>
                      {product.Categories && (
                        <>
                          <span>•</span>
                          <span>Current: {product.Categories.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-tppslate text-sm">
                      {formatCurrency(product.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-tppslate/20">
            <Button 
              variant="outline" 
              onClick={handleCloseAddProductsModal}
              disabled={addProductsLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={handleAddProductsToCategory}
              disabled={selectedProductIds.length === 0 || addProductsLoading}
              loading={addProductsLoading}
              className="flex-1"
            >
              Add {selectedProductIds.length > 0 ? `${selectedProductIds.length} ` : ''}Product{selectedProductIds.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}