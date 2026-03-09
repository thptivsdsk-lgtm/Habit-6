import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
}

export function Button({ variant = 'primary', isLoading, children, className = '', disabled, ...props }: ButtonProps) {
    let btnClass = 'btn-primary';
    if (variant === 'secondary') btnClass = 'btn-secondary';
    if (variant === 'danger') btnClass = 'btn-primary'; // fallback to custom danger class if needed later

    // Quick inline style for danger
    const style = variant === 'danger' ? { background: 'var(--error)', boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)' } : {};

    return (
        <button
            className={`${btnClass} ${className}`}
            disabled={isLoading || disabled}
            style={style}
            {...props}
        >
            {isLoading ? 'Đang tải...' : children}
        </button>
    );
}
