/**
 * SubmitterComponent
 * Exact React replacement for Angular SubmitterComponent
 * Matches Angular component exactly: income consent checkbox + submit button
 */

import React, { useCallback } from 'react';
import { GtButton, GtCheckbox } from '../../groot';
import './index.css';

export interface SubmitterComponentProps {
  btnLabel?: string;
  size?: string;
  type?: string;
  disableCTA?: boolean;
  customClass?: string;
  preSubmit?: (flag?: boolean) => void;
  preSubmitFlag?: boolean | null;
  shouldShowConset?: boolean | null;
  incomeConsent?: boolean;
  showRM?: boolean;
  disabled?: boolean;
  emailVal?: string;
  onSubmit?: () => void;
  onConsentCheck?: (consent: boolean) => void;
}

export const SubmitterComponent: React.FC<SubmitterComponentProps> = ({
  btnLabel = 'Continue',
  size = 'block',
  type = 'button',
  disableCTA,
  customClass = '',
  preSubmit,
  preSubmitFlag,
  shouldShowConset,
  incomeConsent = false,
  showRM: _showRM,
  disabled = false,
  emailVal = '',
  onSubmit,
  onConsentCheck
}) => {
  // showRM is a boolean flag - currently unused but kept for API compatibility
  const handleKnowMoreClick = () => {
    window.open('https://www.zestmoney.in/terms-and-conditions', '_blank');
  };

  const submitEvent = useCallback(() => {
    if (preSubmitFlag != null) {
      if (preSubmitFlag) {
        onSubmit?.();
      } else {
        preSubmit?.();
      }
    } else {
      onSubmit?.();
    }
  }, [preSubmitFlag, preSubmit, onSubmit]);

  const toggleIncomeConsent = useCallback(() => {
    const newConsent = !incomeConsent;
    onConsentCheck?.(newConsent);
    if (newConsent) {
      preSubmit?.(true);
    }
  }, [incomeConsent, onConsentCheck, preSubmit]);

  const onConsentChange = useCallback(() => {
    if (emailVal.trim() === '') {
      return;
    }
    toggleIncomeConsent();
  }, [emailVal, toggleIncomeConsent]);

  const isButtonDisabled = size === 'block' && !incomeConsent && shouldShowConset
    ? true
    : disabled || disableCTA || false;

  return (
    <div className={`submitter-wrapper ${customClass}`}>
      {shouldShowConset && (
        <div className="income-consent" id="IC">
          <GtCheckbox
            checked={incomeConsent}
            grootChange={onConsentChange}
          />
          <div className="text">
            I hereby agree that ZestMoney has permission to share my personal information wherever it is necessary for the provision of loan products. <span className="star">*</span>{' '}
            <a className="more" onClick={handleKnowMoreClick}>
              Know More
            </a>
          </div>
        </div>
      )}
      <GtButton
        appearance="primary"
        bold={true}
        size={size as 'block' | 'half' | 'auto'}
        textContent={btnLabel}
        grootClick={submitEvent}
        type={type as 'button' | 'submit' | 'reset'}
        disabled={isButtonDisabled}
      />
    </div>
  );
};
