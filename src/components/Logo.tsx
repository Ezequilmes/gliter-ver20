'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  } as const;

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  } as const;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="eggplantGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#581c87" />
            </linearGradient>
            <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="65" rx="25" ry="30" fill="url(#eggplantGradient)" className="drop-shadow-lg" />
          <ellipse cx="50" cy="25" rx="6" ry="12" fill="url(#leafGradient)" />
          <path d="M42 22 C38 18, 35 25, 40 28 C42 26, 42 24, 42 22 Z" fill="url(#leafGradient)" className="opacity-80" />
          <path d="M58 22 C62 18, 65 25, 60 28 C58 26, 58 24, 58 22 Z" fill="url(#leafGradient)" className="opacity-80" />
          <ellipse cx="42" cy="55" rx="8" ry="12" fill="rgba(255,255,255,0.2)" className="opacity-60" />
        </svg>
      </div>
      {showText && (
        <span className={`font-bold text-gradient ${textSizeClasses[size]}`}>
          Gliter
        </span>
      )}
    </div>
  );
};

export default Logo;