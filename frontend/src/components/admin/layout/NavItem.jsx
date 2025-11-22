// frontend/src/components/admin/layout/NavItem.jsx

import { Link, useLocation } from 'react-router-dom';

export default function NavItem({ item, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

  const content = (
    <>
      {item.icon && (
        <span className="flex-shrink-0">
          {item.icon}
        </span>
      )}
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="flex-shrink-0 w-5 h-5 bg-admin-pink text-white text-xs rounded-full flex items-center justify-center font-semibold">
          3
        </span>
      )}
    </>
  );

  const classes = `
    flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
    transition-all duration-200
    ${
      isActive
        ? 'bg-admin-pink bg-opacity-10 text-admin-pink'
        : 'text-gray-300 hover:bg-white hover:bg-opacity-5 hover:text-white'
    }
  `;

  if (onClick) {
    return (
      <button onClick={onClick} className={`${classes} w-full text-left`}>
        {content}
      </button>
    );
  }

  return (
    <Link to={item.path} className={classes}>
      {content}
    </Link>
  );
}