import React, { useState, useEffect } from 'react';
import { getDomainFromUrl, getInitials, getDeterministicGradient } from '../utils/url';

interface ToolLogoProps {
  name: string;
  url: string;
  customLogoUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ToolLogo({
  name,
  url,
  customLogoUrl,
  className = '',
  size = 'md',
}: ToolLogoProps) {
  const domain = getDomainFromUrl(url);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState<'custom' | 'clearbit' | 'google' | 'initials'>('custom');

  useEffect(() => {
    // Reset state when inputs change
    if (customLogoUrl && customLogoUrl.trim() !== '') {
      setImgSrc(customLogoUrl);
      setFallbackMode('custom');
    } else {
      setImgSrc(`https://logo.clearbit.com/${domain}`);
      setFallbackMode('clearbit');
    }
  }, [url, customLogoUrl, domain]);

  const handleImgError = () => {
    if (fallbackMode === 'custom') {
      // Custom failed, try clearbit
      setImgSrc(`https://logo.clearbit.com/${domain}`);
      setFallbackMode('clearbit');
    } else if (fallbackMode === 'clearbit') {
      // Clearbit failed, try google high-res favicon
      setImgSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
      setFallbackMode('google');
    } else if (fallbackMode === 'google') {
      // Google favicon failed, trigger initials representation
      setImgSrc(null);
      setFallbackMode('initials');
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-xl',
  };

  if (fallbackMode === 'initials' || !imgSrc) {
    const gradient = getDeterministicGradient(name);
    return (
      <div
        id={`logo-fallback-${name.toLowerCase().replace(/\s+/g, '-')}`}
        className={`flex items-center justify-center rounded-xl font-bold text-white shadow-inner bg-gradient-to-br ${gradient} ${sizeClasses[size]} ${className}`}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center rounded-xl overflow-hidden bg-slate-800 border border-slate-700 p-1 bg-white ${sizeClasses[size]} ${className}`}>
      <img
        src={imgSrc}
        alt={`${name} logo`}
        className="w-full h-full object-contain max-w-[85%] max-h-[85%] rounded-lg"
        referrerPolicy="no-referrer"
        onError={handleImgError}
      />
    </div>
  );
}
