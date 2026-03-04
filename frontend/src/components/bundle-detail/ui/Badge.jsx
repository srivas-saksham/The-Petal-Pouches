// frontend/src/components/bundle-detail/ui/Badge.jsx

import React from 'react';

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    success: 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30',
    error: 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30',
    warning: 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
    info: 'bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
    primary: 'bg-tpppink/10 dark:bg-tppdarkwhite/10 text-tpppink dark:text-tppdarkwhite border-tpppink/20 dark:border-tppdarkwhite/20',
    default: 'bg-tppslate/5 dark:bg-tppdarkwhite/5 text-tppslate dark:text-tppdarkwhite border-tppslate/10 dark:border-tppdarkwhite/10',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border font-semibold ${variants[variant] || variants.default} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;