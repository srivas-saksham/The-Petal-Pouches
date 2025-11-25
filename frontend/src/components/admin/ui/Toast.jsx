// frontend/src/components/admin/ui/Toast.jsx

import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ id, type = 'info', message, duration = 5000, onClose }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const progressRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const pausedTimeRef = useRef(0);
  const animationRef = useRef(null);

  // Toast type configurations with enhanced styling
  const toastConfig = {
    success: {
      icon: CheckCircle2,
      bgGradient: 'bg-gradient-to-r from-green-500 to-emerald-500',
      iconColor: 'text-white',
      bgIcon: 'bg-white/20',
      progressBg: 'bg-green-500',
      borderGlow: 'shadow-green-500/50',
      accentColor: 'bg-green-500',
    },
    error: {
      icon: XCircle,
      bgGradient: 'bg-gradient-to-r from-red-500 to-rose-500',
      iconColor: 'text-white',
      bgIcon: 'bg-white/20',
      progressBg: 'bg-red-500',
      borderGlow: 'shadow-red-500/50',
      accentColor: 'bg-red-500',
    },
    warning: {
      icon: AlertCircle,
      bgGradient: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      iconColor: 'text-white',
      bgIcon: 'bg-white/20',
      progressBg: 'bg-yellow-500',
      borderGlow: 'shadow-yellow-500/50',
      accentColor: 'bg-yellow-500',
    },
    info: {
      icon: Info,
      bgGradient: 'bg-gradient-to-r from-tpppink to-pink-400',
      iconColor: 'text-white',
      bgIcon: 'bg-white/20',
      progressBg: 'bg-tpppink',
      borderGlow: 'shadow-tpppink/50',
      accentColor: 'bg-tpppink',
    },
  };

  const config = toastConfig[type] || toastConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    if (!progressRef.current) return;

    const animate = () => {
      if (isPaused) {
        pausedTimeRef.current = Date.now();
        return;
      }

      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const remaining = Math.max(0, duration - elapsed);
      const progressPercent = (remaining / duration) * 100;

      if (progressRef.current) {
        progressRef.current.style.width = `${progressPercent}%`;
      }

      if (remaining <= 0) {
        handleClose();
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, duration]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    pausedTimeRef.current = Date.now();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (isPaused) {
      const pausedDuration = Date.now() - pausedTimeRef.current;
      startTimeRef.current += pausedDuration;
      setIsPaused(false);
    }
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-80 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 ${
        isExiting ? 'toast-slide-out' : 'toast-slide-in'
      } ${config.borderGlow}`}
    >
      {/* Gradient Background */}
      <div className={`${config.bgGradient} p-[1px] rounded-xl`}>
        <div className="bg-tppslate backdrop-blur-md rounded-xl">
          {/* Main Content */}
          <div className="flex items-start gap-3 p-4">
            {/* Icon with Animation */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${config.bgIcon} flex items-center justify-center animate-icon-bounce`}>
              <Icon className={`w-5 h-5 ${config.iconColor} drop-shadow-lg`} />
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm text-white font-medium leading-relaxed">
                {message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar Container */}
          <div className="relative h-1.5 bg-black/20 overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            
            {/* Progress Bar */}
            <div
              ref={progressRef}
              className={`absolute left-0 top-0 h-full ${config.progressBg} transition-all ease-linear shadow-lg`}
              style={{
                width: '100%',
                transitionDuration: isPaused ? '0ms' : '100ms',
              }}
            >
              {/* Progress Bar Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-progress-shine" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;