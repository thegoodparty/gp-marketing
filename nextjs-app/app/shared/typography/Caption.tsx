import React from 'react';

interface CaptionProps {
  children: React.ReactNode;
  className?: string;
}

export default function Caption({ children, className = '' }: CaptionProps) {
  return <div className={`font-semibold font-sfpro text-xs ${className}`}>{children}</div>;
}
