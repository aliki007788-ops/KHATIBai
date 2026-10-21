import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}: ButtonProps) {
  
  const baseStyles = "rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "btn-primary text-white shadow-lg hover:shadow-xl",
    secondary: "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800",
    glass: "glass-panel hover:bg-white/10 dark:hover:bg-slate-800/50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}