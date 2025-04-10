import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string | null;
  onClose?: () => void;
  duration?: number; // Duration in ms before allowing dismissal
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  message, 
  onClose,
  duration = 5000 // Default 5 seconds
}) => {
  const [isVisible, setIsVisible] = useState(!!message);
  const [isDismissable, setIsDismissable] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset state when message changes
  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setIsDismissable(false);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Set timer to allow dismissal after duration
      timerRef.current = setTimeout(() => {
        setIsDismissable(true);
      }, duration);
      
      // Cleanup function
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    } else {
      // If message is null, ensure visibility is set to false
      setIsVisible(false);
    }
  }, [message, duration]);

  // Don't render anything if no message
  if (!message) return null;
  
  const handleClose = () => {
    if (!isDismissable) return; // Prevent early dismissal
    
    setIsVisible(false);
    // Delay the actual closing to allow for fade-out animation
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };
  
  return (
    <div 
      className={`bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded relative mb-4 transition-all duration-300 shadow-md ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`} 
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-grow">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <button
            type="button"
            className={`ml-auto -mx-1.5 -my-1.5 bg-destructive/15 text-destructive rounded-lg focus:ring-2 focus:ring-destructive p-1.5 inline-flex items-center justify-center h-8 w-8 transition-opacity duration-300 ${
              isDismissable ? 'opacity-100 hover:bg-destructive/20' : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={handleClose}
            disabled={!isDismissable}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
          </button>
        )}
      </div>
      {!isDismissable && (
        <div className="absolute bottom-0 left-0 h-1 bg-destructive/50 transition-all duration-300" 
          style={{ width: '100%', animation: `shrink ${duration / 1000}s linear forwards` }}></div>
      )}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default ErrorAlert; 