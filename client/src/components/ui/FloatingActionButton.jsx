import React from 'react';

const FloatingActionButton = ({
    icon: Icon,
    onClick,
    variant = 'primary',
    className = '',
    tooltip,
    children
}) => {
    const baseStyles = "h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 duration-200 border relative";

    // Variant styles matching the user's design system inspiration
    // Using tailwind classes that likely exist in the project or falling back to standard ones
    const variants = {
        primary: "bg-surface text-ink border-border hover:bg-gray-50 dark:hover:bg-gray-800",
        secondary: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
        accent: "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
            title={tooltip}
            aria-label={tooltip}
        >
            {Icon && <Icon size={24} />}
            {children}
        </button>
    );
};

export default FloatingActionButton;
