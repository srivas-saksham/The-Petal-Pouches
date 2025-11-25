// frontend/src/components/admin/ui/ToastContainer.jsx

import { createPortal } from 'react-dom';
import Toast from './Toast';

const ToastContainer = ({ toasts, removeToast }) => {
  // Don't render anything if no toasts
  if (!toasts || toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id}
          className="pointer-events-auto"
          style={{
            animation: 'toast-slide-in 0.3s ease-out forwards',
            animationDelay: `${index * 0.05}s`,
          }}
        >
          <Toast
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        </div>
      ))}

      {/* CSS Animations */}
      <style>{`
        @keyframes toast-slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes toast-slide-out {
          from {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateX(400px) scale(0.95);
            opacity: 0;
          }
        }

        .toast-slide-in {
          animation: toast-slide-in 0.3s ease-out forwards;
        }

        .toast-slide-out {
          animation: toast-slide-out 0.2s ease-in forwards;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ToastContainer;