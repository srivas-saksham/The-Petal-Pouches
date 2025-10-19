import React from 'react';
import CreateProductForm from '../components/adminComps/CreateProductForm';
import CategoriesAdmin from '../components/adminComps/Categories';
const Admin = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <CreateProductForm />
      <CategoriesAdmin />
    </div>
  );
};

export default Admin;