import React from 'react';

export const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 border border-sky-100">
    {children}
  </span>
);