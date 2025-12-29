// frontend/src/utils/constants.js

// Product Status Types
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  OUT_OF_STOCK: 'out_of_stock',
  LOW_STOCK: 'low_stock',
};

// Order Status Types
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

// Payment Status Types
export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  CUSTOMER: 'customer',
};

// Bundle Status
export const BUNDLE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SCHEDULED: 'scheduled',
};

// Status Badge Colors
export const STATUS_COLORS = {
  active: 'success',
  inactive: 'neutral',
  draft: 'warning',
  scheduled: 'warning',
  out_of_stock: 'danger',
  low_stock: 'warning',
  pending: 'warning',
  processing: 'warning',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'neutral',
  paid: 'success',
  failed: 'danger',
};

// Status Labels
export const STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft',
  scheduled: 'Scheduled',
  out_of_stock: 'Out of Stock',
  low_stock: 'Low Stock',
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  paid: 'Paid',
  failed: 'Failed',
};

// Navigation Menu Items
export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: 'dashboard',
    section: 'main',
  },
  {
    id: 'products',
    label: 'Products',
    path: '/admin/products',
    icon: 'product',
    section: 'catalog',
  },
  {
    id: 'categories',
    label: 'Categories',
    path: '/admin/categories',
    icon: 'category',
    section: 'catalog',
  },
  {
    id: 'bundles',
    label: 'Bundles',
    path: '/admin/bundles',
    icon: 'bundle',
    section: 'catalog',
  },
  {
    id: 'coupons',
    label: 'Coupons',
    path: '/admin/coupons',
    icon: 'coupon',
    section: 'catalog',
  },
  {
    id: 'orders',
    label: 'Orders',
    path: '/admin/orders',
    icon: 'order',
    section: 'sales',
  },
  {
    id: 'shipments',
    label: 'Shipments',
    path: '/admin/shipments',
    icon: 'shipment',
    section: 'main',
    badge: 0
  },
  {
    id: 'customers',
    label: 'Customers',
    path: '/admin/customers',
    icon: 'customer',
    section: 'sales',
  },
  // {
  //   id: 'notifications',
  //   label: 'Notifications',
  //   path: '/admin/notifications',
  //   icon: 'notification',
  //   section: 'system',
  //   badge: true,
  // },
  // {
  //   id: 'settings',
  //   label: 'Settings',
  //   path: '/admin/settings',
  //   icon: 'settings',
  //   section: 'system',
  // },
];

// Navigation Sections
export const NAVIGATION_SECTIONS = {
  main: 'Main',
  catalog: 'Catalog Management',
  sales: 'Sales & Orders',
  system: 'System',
};

// Table Items Per Page Options
export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

// Date Format Options
export const DATE_FORMATS = {
  SHORT: 'MMM DD, YYYY',
  LONG: 'MMMM DD, YYYY',
  FULL: 'MMMM DD, YYYY hh:mm A',
  TIME: 'hh:mm A',
};

// ✅ UPDATED: Sort Options for Products (matches backend exactly)
export const PRODUCT_SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest First' },
  { value: 'created_at_asc', label: 'Oldest First' },
  { value: 'title_asc', label: 'Title: A to Z' },
  { value: 'title_desc', label: 'Title: Z to A' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'stock_asc', label: 'Stock: Low to High' },
  { value: 'stock_desc', label: 'Stock: High to Low' },
];

// Sort Options for Orders
export const ORDER_SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Newest First' },
  { value: 'created_at_asc', label: 'Oldest First' },
  { value: 'total_desc', label: 'Amount: High to Low' },
  { value: 'total_asc', label: 'Amount: Low to High' },
];

// ✅ UPDATED: Filter Options for Products with comprehensive stock levels
export const PRODUCT_FILTERS = {
  status: [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ],
  stock_level: [
    { value: '', label: 'All Products' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock (≤10)' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ],
  has_variants: [
    { value: '', label: 'All Products' },
    { value: 'true', label: 'With Variants' },
    { value: 'false', label: 'Without Variants' },
  ],
};

// Filter Options for Orders
export const ORDER_FILTERS = {
  status: [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  payment: [
    { value: '', label: 'All Payments' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
  ],
};

// Bulk Actions
export const BULK_ACTIONS = {
  products: [
    { value: 'activate', label: 'Mark as Active' },
    { value: 'deactivate', label: 'Mark as Inactive' },
    { value: 'delete', label: 'Delete Selected' },
    { value: 'duplicate', label: 'Duplicate' },
    { value: 'export', label: 'Export to CSV' },
  ],
  orders: [
    { value: 'mark_processing', label: 'Mark as Processing' },
    { value: 'mark_shipped', label: 'Mark as Shipped' },
    { value: 'mark_delivered', label: 'Mark as Delivered' },
    { value: 'export', label: 'Export to CSV' },
  ],
  bundles: [
    { value: 'activate', label: 'Activate' },
    { value: 'deactivate', label: 'Deactivate' },
    { value: 'delete', label: 'Delete Selected' },
    { value: 'duplicate', label: 'Duplicate' },
  ],
};

// Quick Stats Config for Dashboard
export const DASHBOARD_STATS = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    icon: 'currency',
    color: 'primary',
    prefix: '₹',
  },
  {
    id: 'orders',
    label: 'Total Orders',
    icon: 'order',
    color: 'secondary',
  },
  {
    id: 'products',
    label: 'Products',
    icon: 'product',
    color: 'success',
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: 'customer',
    color: 'warning',
  },
];

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER: 'order',
  PRODUCT: 'product',
  CUSTOMER: 'customer',
  SYSTEM: 'system',
  ALERT: 'alert',
};

// Currency Settings
export const CURRENCY = {
  symbol: '₹',
  code: 'INR',
  position: 'before', // 'before' or 'after'
};

// Image Upload Settings
export const IMAGE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxDimensions: {
    width: 2000,
    height: 2000,
  },
};

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
};

// ✅ NEW: Stock Level Thresholds
export const STOCK_THRESHOLDS = {
  LOW_STOCK: 10,
  OUT_OF_STOCK: 0,
};

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: {
    CREATE: 'Created successfully',
    UPDATE: 'Updated successfully',
    DELETE: 'Deleted successfully',
    UPLOAD: 'Uploaded successfully',
  },
  ERROR: {
    CREATE: 'Failed to create',
    UPDATE: 'Failed to update',
    DELETE: 'Failed to delete',
    UPLOAD: 'Failed to upload',
    FETCH: 'Failed to fetch data',
    NETWORK: 'Network error. Please check your connection.',
  },
};

// Validation Rules
export const VALIDATION = {
  product: {
    titleMinLength: 3,
    titleMaxLength: 200,
    descriptionMaxLength: 2000,
    minPrice: 1,
    maxPrice: 999999,
    minStock: 0,
    maxStock: 999999,
  },
  bundle: {
    minItems: 2,
    maxItems: 10,
    titleMinLength: 3,
    titleMaxLength: 200,
  },
  order: {
    minTotal: 1,
  },
};

// Export all as default object as well
export default {
  PRODUCT_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  USER_ROLES,
  BUNDLE_STATUS,
  STATUS_COLORS,
  STATUS_LABELS,
  NAVIGATION_ITEMS,
  NAVIGATION_SECTIONS,
  ITEMS_PER_PAGE_OPTIONS,
  DATE_FORMATS,
  PRODUCT_SORT_OPTIONS,
  ORDER_SORT_OPTIONS,
  PRODUCT_FILTERS,
  ORDER_FILTERS,
  BULK_ACTIONS,
  DASHBOARD_STATS,
  NOTIFICATION_TYPES,
  CURRENCY,
  IMAGE_UPLOAD,
  PAGINATION_DEFAULTS,
  STOCK_THRESHOLDS,
  API_MESSAGES,
  VALIDATION,
};