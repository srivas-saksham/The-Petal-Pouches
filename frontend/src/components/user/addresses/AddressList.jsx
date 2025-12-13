// frontend/src/components/user/addresses/AddressList.jsx

import React from 'react';
import AddressCard from './AddressCard';

/**
 * AddressList Component
 * Display list of addresses with 2-column or 3-column layout
 * 
 * @param {Array} addresses - Array of address objects
 * @param {number} layoutColumns - Number of columns (2 or 3)
 * @param {Function} onEdit - Edit address callback
 * @param {Function} onDelete - Delete address callback
 * @param {Function} onSetDefault - Set default callback
 */
const AddressList = ({ 
  addresses = [], 
  layoutColumns = 2,
  onEdit, 
  onDelete, 
  onSetDefault
}) => {
  if (!addresses || addresses.length === 0) {
    return null;
  }

  // 2 Column Layout
  if (layoutColumns === 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300">
        {addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            layout="2-column"
            onEdit={onEdit}
            onDelete={onDelete}
            onSetDefault={onSetDefault}
          />
        ))}
      </div>
    );
  }

  // 3 Column Compact Layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 transition-all duration-300">
      {addresses.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          layout="3-column"
          onEdit={onEdit}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
        />
      ))}
    </div>
  );
};

export default AddressList;