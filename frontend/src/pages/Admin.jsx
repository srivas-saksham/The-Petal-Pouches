// frontend/src/pages/Admin.jsx
import { useState, useEffect } from 'react';
import CreateProductForm from '../components/adminComps/CreateProductForm';
import UpdateProductForm from '../components/adminComps/UpdateProductForm';
import ProductList from '../components/adminComps/ProductList';
import CategoriesForm from '../components/adminComps/CategoriesForm';

const Admin = () => {
  const [activeView, setActiveView] = useState('list');
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Debug logs
  useEffect(() => {
    console.log('🎯 Active View:', activeView);
    console.log('🆔 Selected Product ID:', selectedProductId);
  }, [activeView, selectedProductId]);

  const handleCreateSuccess = () => {
    setActiveView('list');
  };

  const handleUpdateSuccess = () => {
    setActiveView('list');
    setSelectedProductId(null);
  };

  const handleEdit = (productId) => {
    console.log('✏️ Edit clicked with ID:', productId);
    console.log('✏️ Type of ID:', typeof productId);
    
    if (!productId) {
      console.error('❌ Product ID is missing or undefined!');
      alert('Error: Product ID is missing');
      return;
    }
    
    setSelectedProductId(productId);
    setActiveView('edit');
  };

  const handleCancel = () => {
    setActiveView('list');
    setSelectedProductId(null);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #dee2e6',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>
            Admin Dashboard
          </h1>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          borderBottom: '2px solid #dee2e6'
        }}>
          <button
            onClick={() => {
              setActiveView('list');
              setSelectedProductId(null);
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeView === 'list' ? '3px solid #007bff' : '3px solid transparent',
              color: activeView === 'list' ? '#007bff' : '#6c757d',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              marginBottom: '-2px'
            }}
          >
            Product List
          </button>
          <button
            onClick={() => {
              setActiveView('create');
              setSelectedProductId(null);
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeView === 'create' ? '3px solid #007bff' : '3px solid transparent',
              color: activeView === 'create' ? '#007bff' : '#6c757d',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              marginBottom: '-2px'
            }}
          >
            Create Product
          </button>
          <button
            onClick={() => {
              setActiveView('categories');
              setSelectedProductId(null);
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeView === 'categories' ? '3px solid #007bff' : '3px solid transparent',
              color: activeView === 'categories' ? '#007bff' : '#6c757d',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              marginBottom: '-2px'
            }}
          >
            Manage Categories
          </button>
        </div>

        {/* Content Area */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px',
          padding: '20px',
          minHeight: '500px'
        }}>
          {activeView === 'list' && (
            <ProductList onEdit={handleEdit} />
          )}
          
          {activeView === 'create' && (
            <CreateProductForm onSuccess={handleCreateSuccess} />
          )}
          
          {activeView === 'categories' && (
            <CategoriesForm />
          )}
          
          {activeView === 'edit' && selectedProductId && (
            <UpdateProductForm 
              productId={selectedProductId}
              onSuccess={handleUpdateSuccess}
              onCancel={handleCancel}
            />
          )}

          {activeView === 'edit' && !selectedProductId && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#dc3545' }}>
              ❌ Error: No product selected for editing
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;