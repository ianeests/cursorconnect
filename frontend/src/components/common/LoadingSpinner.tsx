import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  fullPage = false 
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-10 w-10';
      case 'md':
      default:
        return 'h-6 w-6';
    }
  };

  const spinner = (
    <div 
      className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${getSizeClass()}`}
      style={{ aspectRatio: '1/1' }}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-2">
      {spinner}
    </div>
  );
};

export default LoadingSpinner; 