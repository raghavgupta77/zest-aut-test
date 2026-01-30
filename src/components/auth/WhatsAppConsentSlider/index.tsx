/**
 * WhatsApp Consent Slider Component
 * Exact match for Angular WhatsApp consent slider
 */

import React from 'react';
import './index.css';

export interface WhatsAppConsentSliderProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const WhatsAppConsentSlider: React.FC<WhatsAppConsentSliderProps> = ({
  checked,
  onChange,
  className = ''
}) => {
  const handleClick = () => {
    onChange(!checked);
  };

  return (
    <div className={`whatsapp-container ${className}`}>
      <div
        id="slider-compo"
        className={`slider-vv ${checked ? 'slider-on' : 'slider-off'}`}
        onClick={handleClick}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <div className={`select-cir ${checked ? 'slider-checked' : 'slider-unchecked'}`}></div>
      </div>
      <p className="label">
        Receive messages on Whatsapp{' '}
        <img
          src="https://assets.zestmoney.in/assets/customers/UI/whatsapp.svg"
          alt="whatsapp"
        />
      </p>
    </div>
  );
};
