// frontend/src/components/bundle-detail/ui/Breadcrumb.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumb = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-xs" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={12} className="text-slate-400 dark:text-tppdarkwhite/30" />}
            {isLast ? (
              <span className="font-semibold text-tppslate dark:text-tppdarkwhite truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link to={item.path} className="text-slate-500 dark:text-tppdarkwhite/50 hover:text-tpppink dark:hover:text-tppdarkwhite transition-colors font-medium">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;