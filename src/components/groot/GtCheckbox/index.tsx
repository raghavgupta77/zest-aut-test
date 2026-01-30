/**
 * GtCheckbox Component
 * React replacement for Groot UI gt-checkbox component
 * Matches Angular gt-checkbox exactly: checked, disabled, grootChange
 */

import React, { useCallback } from "react";
import "./index.css";

export interface GtCheckboxProps {
  checked?: boolean;
  disabled?: boolean;
  grootChange?: (checked: boolean) => void;
  className?: string;
  id?: string;
}

export const GtCheckbox: React.FC<GtCheckboxProps> = ({
  checked = false,
  disabled = false,
  grootChange,
  className = "",
  id,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      grootChange?.(e.target.checked);
    },
    [disabled, grootChange],
  );

  const checkboxId =
    id || `gt-checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`gt-checkbox-wrapper ${className}`}>
      <input
        type="checkbox"
        id={checkboxId}
        className="gt-checkbox"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        aria-checked={checked}
        aria-disabled={disabled}
      />
      <label htmlFor={checkboxId} className="gt-checkbox-label">
        <span className="gt-checkbox-checkmark"></span>
      </label>
    </div>
  );
};
