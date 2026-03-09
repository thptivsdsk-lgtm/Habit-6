import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    glassType?: 'panel' | 'card';
}

export function Card({ glassType = 'card', className = '', children, ...props }: CardProps) {
    const baseClass = glassType === 'panel' ? 'glass-panel' : 'glass-card';

    return (
        <div className={`${baseClass} animate-fade-in ${className}`} {...props}>
            {children}
        </div>
    );
}
