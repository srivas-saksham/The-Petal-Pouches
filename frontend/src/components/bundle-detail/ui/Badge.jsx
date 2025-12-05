// frontend/src/components/bundle-details/ui/Badge.jsx
import React from 'react';

/**
 * Badge Component - Compact, minimal design
 * @param {string} variant - success | error | warning | info | default
 * @param {string} size - sm | md | lg
 */
const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}) => {
  const variants = {
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    primary: 'bg-tpppink/10 text-tpppink border-tpppink/20',
    default: 'bg-tppslate/5 text-tppslate border-tppslate/10',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1 rounded-md border font-semibold
        ${variants[variant] || variants.default}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;