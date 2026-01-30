/**
 * GtInput Component
 * React replacement for Groot UI gt-input component
 * Matches Angular gt-input exactly from groot-ui/dist/groot-ui/p-4257e0d9.entry.js
 */

import React, { useState, useCallback, useId, memo } from 'react';
import './index.css';

export interface GtInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur' | 'prefix'> {
  label?: string;
  errMsg?: string;
  helpMsg?: string;
  appearance?: 'block' | 'full' | 'auto';
  valueChange?: (value: string) => void;
  grootBlur?: (event: React.FocusEvent<HTMLInputElement>, type?: string) => void;
  grootFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  removeRef?: boolean;
  prefix?: React.ReactNode;
  children?: React.ReactNode; // For prefix slot
  grootId?: string;
}

export const GtInput: React.FC<GtInputProps> = memo(({
  label,
  errMsg,
  helpMsg,
  appearance = 'block',
  valueChange,
  grootBlur,
  grootFocus,
  removeRef = false,
  prefix,
  children,
  value,
  className = '',
  id,
  grootId,
  ...props
}) => {
  const [, setIsFocused] = useState(false);
  const generatedId = useId();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    valueChange?.(e.target.value);
  }, [valueChange]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    grootBlur?.(e, 'blur');
  }, [grootBlur]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    grootFocus?.(e);
    props.onFocus?.(e);
  }, [grootFocus, props]);

  const inputId = grootId || id || generatedId;
  const prefixContent = prefix || children;
  
  // Build input class names to match groot-ui exactly
  const inputClasses = [
    'text-input',
    prefixContent ? 'pre' : '',
    appearance,
    errMsg ? 'error' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={`text-input-container ${className}`}>
      {/* Label above input - matches groot-ui structure */}
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      
      {/* Input wrapper with prefix - matches groot-ui .input-wrapper */}
      <div className="input-wrapper">
        {/* Prefix slot - matches groot-ui span.pre-fix */}
        {prefixContent && (
          <span className="pre-fix">
            {prefixContent}
          </span>
        )}
        
        {/* Input element - matches groot-ui input.text-input */}
        <input
          id={inputId}
          className={inputClasses}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-invalid={!!errMsg}
          aria-describedby={errMsg ? `${inputId}-error` : helpMsg ? `${inputId}-help` : undefined}
          {...props}
        />
      </div>
      
      {/* Help message - matches groot-ui p.txt */}
      {helpMsg && !errMsg && (
        <p id={`${inputId}-help`} className="txt">
          {helpMsg}
        </p>
      )}
      
      {/* Error message - matches groot-ui p.txt.errorTxt */}
      {errMsg && (
        <p id={`${inputId}-error`} className="txt errorTxt" role="alert">
          {errMsg}
        </p>
      )}
    </div>
  );
});
