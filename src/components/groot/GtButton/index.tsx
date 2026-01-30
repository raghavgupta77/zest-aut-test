/**
 * GtButton Component
 * EXACT React replacement for Groot UI gt-button component
 * Matches Angular gt-button exactly from groot-ui/dist/groot-ui/p-4257e0d9.entry.js
 */

import React from 'react';
import './index.css';

export interface GtButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  appearance?: 'primary' | 'secondary' | 'teritary' | 'text' | 'wrapper';
  bold?: boolean;
  size?: 'block' | 'half' | 'auto' | 'xs' | 'small' | 'full';
  textContent?: string;
  grootClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  grootId?: string;
}

export const GtButton: React.FC<GtButtonProps> = ({
  appearance = 'primary',
  bold = false,
  size = 'auto',
  textContent,
  grootClick,
  grootId,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    grootClick?.(e);
  };

  // Build class names to match groot-ui exactly
  // Angular groot-ui applies: btn, {appearance}, {size}, bold (if true)
  const buttonClasses = [
    'btn',
    'gt-button',
    appearance, // Always add appearance class (primary, secondary, etc.) to match Angular exactly
    `gt-button-${appearance}`,
    size, // Size class (block, half, auto, etc.)
    `gt-button-${size}`,
    bold ? 'bold' : '',
    bold ? 'gt-button-bold' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      id={grootId}
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {textContent || children}
    </button>
  );
};
