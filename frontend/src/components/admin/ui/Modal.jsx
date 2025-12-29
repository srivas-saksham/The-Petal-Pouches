// frontend/src/components/admin/ui/Modal.jsx

import { X, Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
  icon: Icon,
  subtitle,
  loading = false,
  footerAlign = 'right', // 'left', 'center', 'right', 'between'
  allowFullscreen = true,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger fade-in animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, loading, isFullscreen]);

  // Reset fullscreen when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]',
  };

  const footerAlignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && !loading && e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[1px] transition-all duration-300
        ${isVisible ? 'bg-black/50 opacity-100' : 'bg-black/0 opacity-0'}
      `}
      onClick={handleBackdropClick}
    >
      <div
        className={`
          bg-white rounded-xl shadow-2xl w-full flex flex-col 
          transform transition-all duration-300 ease-out
          ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          ${isFullscreen 
            ? 'h-[100vh] max-w-[100vw] m-0 rounded-none' 
            : `${sizeClasses[size]} max-h-[90vh] m-4`
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="bg-gradient-to-r from-tpppink to-tpppink/90 px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-xl">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-tpppink" />
                </div>
              )}
              {title && (
                <div>
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                  {subtitle && (
                    <p className="text-sm text-white/80 mt-0.5">{subtitle}</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {allowFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  disabled={loading}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`flex items-center gap-3 p-6 border-t-2 border-slate-200 flex-shrink-0 ${footerAlignClasses[footerAlign]}`}>
            {footer}
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-tpppeach border-t-tppslate rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-tppslate">Processing...</p>
            </div>
          </div>
        )}
      </div>

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