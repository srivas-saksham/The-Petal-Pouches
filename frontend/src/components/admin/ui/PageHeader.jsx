// frontend/src/components/admin/ui/PageHeader.jsx

export default function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className = '',
}) {
  return (
    <div className={`mb-6 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-admin-pink transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className={index === breadcrumbs.length - 1 ? 'text-text-primary font-medium' : ''}>
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Header Content */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-text-primary mb-1">
            {title}
          </h1>
          {description && (
            <p className="text-text-secondary text-sm">
              {description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}