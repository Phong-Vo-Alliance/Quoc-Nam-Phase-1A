import React from 'react';
import type { BadgeType } from '../types';


export const Badge: React.FC<{ type?: BadgeType; children: React.ReactNode }> = ({ type = 'neutral', children }) => {
    const styles: Record<BadgeType, string> = {
        processing: 'bg-brand-50 text-brand-600 border-brand-200',
        waiting: 'bg-amber-50 text-amber-700 border-amber-200',
        done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        danger: 'bg-rose-50 text-rose-700 border-rose-200',
        neutral: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[type]}`}>
            {children}
        </span>
    );
};
