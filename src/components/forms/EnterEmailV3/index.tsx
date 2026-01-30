/**
 * EnterEmailV3 Component
 * Separate page for email entry after OTP verification
 * Matches styling of EnterMobileNumberV3
 */

import React, { useState, useCallback } from 'react';
import { GtHeader, GtInput } from '../../groot';
import { WhatsAppConsentSlider } from '../../auth/WhatsAppConsentSlider';
import { SubmitterComponent } from '../../auth/SubmitterComponent';
import { isEmail } from '../../../utils/helpers';
import './index.css';

export interface EnterEmailV3Props {
  authentication?: any;
  disabled?: boolean;
  environmentType?: string;
  clientName?: string;
  isGpay?: boolean;
  showFinoramicParsing?: boolean;
  onEmailSubmit?: (email: string, incomeConsent: boolean, waOpted: boolean) => void;
  onFinoramicRedirect?: (e?: React.MouseEvent) => void;
  className?: string;
}

export const EnterEmailV3: React.FC<EnterEmailV3Props> = ({
  authentication,
  disabled = false,
  isGpay = false,
  showFinoramicParsing = false,
  onEmailSubmit,
  onFinoramicRedirect,
  className
}) => {
  const [enteredEmail, setEnteredEmail] = useState<string>(authentication?.Email || '');
  const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null);
  const [disableCTA, setDisableCTA] = useState<boolean>(true);
  const [sliderCheck, setSliderCheck] = useState<boolean>(true);
  const [incomeConsent, setIncomeConsent] = useState<boolean>(false);
  const [isSubmitInProgress, setIsSubmitInProgress] = useState<boolean>(false);
  const [visitRM, setVisitRM] = useState<boolean>(false);

  // Handle email change
  const handleEmailChange = useCallback((value: string) => {
    setEnteredEmail(value);

    if (value) {
      if (!isEmail(value)) {
        setDisableCTA(true);
      } else {
        setDisableCTA(false);
        setEmailErrorMsg(null);
      }
    } else {
      setDisableCTA(true);
    }
  }, []);

  // Check email error on blur
  const checkEmailError = useCallback((val: string | React.FocusEvent<HTMLInputElement>, type?: string): boolean => {
    const email = type === 'submit' ? val : (val as React.FocusEvent<HTMLInputElement>).target.value;
    setEnteredEmail(email as string);

    if (isEmail(email as string)) {
      setEmailErrorMsg(null);
      return false;
    } else {
      setEmailErrorMsg('Please enter a valid email ID');
      return true;
    }
  }, []);

  // Get consent value
  const getConsentValue = useCallback((consent: boolean) => {
    setIncomeConsent(consent);
  }, []);

  // Check consent before submit
  const checkConsent = useCallback(() => {
    if (!incomeConsent) {
      setVisitRM(true);
    }
  }, [incomeConsent]);

  // Submit email
  const submitEmail = useCallback(() => {
    if (checkEmailError(enteredEmail, 'submit')) {
      return;
    }

    const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (enteredEmail && enteredEmail.length > 0 && emailRegex.test(enteredEmail) && incomeConsent) {
      setIsSubmitInProgress(true);
      onEmailSubmit?.(enteredEmail, incomeConsent, sliderCheck);
    }
  }, [enteredEmail, incomeConsent, sliderCheck, checkEmailError, onEmailSubmit]);

  // Build class list
  const containerClasses = ['enter-email-screen-v3', className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="header-groot">
        <GtHeader
          headerTitle="Hey there!"
          subtitle="We are excited to welcome you to the ZestMoney family"
          iconUrl="https://assets.zestmoney.in/assets/customers/bolt/header_type_1.svg"
        />
      </div>

      {/* Horizontal Rule */}
      <div className="horizontal-rule"></div>

      {/* Form */}
      <form
        className={`auth-form-v3 ${showFinoramicParsing ? 'sticky' : ''}`}
        name="emailForm"
        id="emailForm"
        method="POST"
        onSubmit={(e) => {
          e.preventDefault();
          submitEmail();
        }}
        autoComplete="off"
      >
        <div className="content">
          {/* Email Input */}
          <div className="email-input-wrapper">
            <GtInput
              id="email"
              label="Email ID"
              name="email"
              appearance="block"
              value={enteredEmail}
              valueChange={handleEmailChange}
              disabled={disabled}
              maxLength={100}
              minLength={1}
              grootBlur={checkEmailError}
              type="email"
              errMsg={emailErrorMsg || undefined}
              removeRef={true}
            />
          </div>

          {/* WhatsApp Consent - Directly under email input (matching Angular) */}
          <WhatsAppConsentSlider
            checked={sliderCheck}
            onChange={setSliderCheck}
            className={showFinoramicParsing ? 'centred' : ''}
          />
        </div>

        {/* Footer */}
        <div className="footer">
          {/* Submit Button with Income Consent */}
          <SubmitterComponent
            disabled={isSubmitInProgress || disableCTA}
            btnLabel={isSubmitInProgress ? 'Please wait...' : 'Continue'}
            showRM={visitRM}
            onConsentCheck={getConsentValue}
            incomeConsent={incomeConsent}
            shouldShowConset={!isGpay}
            preSubmit={checkConsent}
            preSubmitFlag={incomeConsent}
            customClass={!showFinoramicParsing ? 'email-btn' : 'no-padding'}
            emailVal={enteredEmail}
            size="block"
            type="submit"
            onSubmit={submitEmail}
          />

          {/* Finoramic Section */}
          {showFinoramicParsing && (
            <div className="auth-finoramic">
              <div className="strike">
                <span>Or</span>
              </div>
              <div className="google-auth-button">
                <button
                  type="button"
                  className="google-auth-button"
                  onClick={onFinoramicRedirect}
                >
                  <img
                    src="https://assets.zestmoney.in/assets/UI/google.svg"
                    alt="Google Icon"
                  />
                  Continue with Google
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default EnterEmailV3;
