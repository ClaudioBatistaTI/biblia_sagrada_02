import React, { useEffect } from 'react';
import Icons from './Icon';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColors = {
    success: 'bg-gray-900 dark:bg-white text-white dark:text-gray-900',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-full shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${bgColors[type]}`}>
      {type === 'success' && <Icons.CheckCircle size={18} />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default Toast;