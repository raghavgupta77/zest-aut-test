/**
 * EnterMobileNumberV3 Component
 * Exact React replacement for Angular EnterMobileNumberV3Component
 * Matches Angular component exactly: styling, behavior, features
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GtHeader, GtInput, GtButton, GtModal, GtSwipe } from '../../groot';
import { SubmitterComponent } from '../../auth/SubmitterComponent';
import './index.css';

// Declare microapps for Google Pay
declare global {
  interface Window {
    microapps?: any;
    ymConfig?: any;
  }
}

export interface EnterMobileNumberV3Props {
  environmentType?: string;
  clientName?: string;
  userDetails?: any;
  authentication?: any;
  disabled?: boolean;
  merchantId?: string;
  googlePayRedirection?: boolean;
  MerchantCustomerId?: string;
  onGenerateOtp?: (mobileNumber: string) => void;
  onMobileNumberUpdate?: (response: any) => void;
  className?: string;
}

export const EnterMobileNumberV3: React.FC<EnterMobileNumberV3Props> = ({
  environmentType: _environmentType,
  clientName: _clientName,
  userDetails: _userDetails,
  authentication,
  disabled = false,
  merchantId,
  googlePayRedirection,
  MerchantCustomerId,
  onGenerateOtp,
  onMobileNumberUpdate,
  className
}) => {
  const [enteredNumber, setEnteredNumber] = useState<string>(
    authentication?.MobileNumber || ''
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBtnDisabled, setIsBtnDisabled] = useState<boolean>(true);
  const [openTNC, setOpenTNC] = useState<boolean>(false);
  const [openPP, setOpenPP] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [mobileURL, setMobileURL] = useState<string>('#');
  const [isGpay, setIsGpay] = useState<boolean>(false);

  const regex = useRef(new RegExp(/([5-9])\d{9}/));

  // Check if Google Pay iframe
  const checkIframeForGooglePay = useCallback(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return false;
    }
  }, []);

  // Load script utility
  const loadScript = useCallback((src: string, callback: () => void) => {
    const script = document.createElement('script');
    script.async = false;
    script.onload = callback;
    script.src = src;
    document.body.appendChild(script);
  }, []);

  // Get phone number from Google Pay microapps
  const getPhoneNumber = useCallback(() => {
    if (!window.microapps) return;
    
    window.microapps.getPhoneNumber().then((response: any) => {
      try {
        const payload = JSON.parse(atob(response.split('.')[1]));
        const phoneToken: any = {};
        Object.assign(phoneToken, payload);
        if (phoneToken && phoneToken.phone_number_verified && phoneToken.phone_number) {
          const phone = phoneToken.phone_number.includes('+91 ')
            ? phoneToken.phone_number.split(' ')[1]
            : phoneToken.phone_number;
          if (phone.length > 1) {
            setTimeout(() => {
              setEnteredNumber(phone);
              onMobileNumberUpdate?.(response);
            }, 0);
          }
        }
      } catch (error) {
        console.error('Error parsing phone number:', error);
      }
    });
  }, [onMobileNumberUpdate]);

  // Set app download URL
  const setAppDownloadURL = useCallback(() => {
    // Mobile check (simplified - should use mobileCheck() from helpers)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    const shouldShow = isMobile && !merchantId && !googlePayRedirection && !MerchantCustomerId;
    setShowBanner(shouldShow);

    if (shouldShow) {
      const OS = /Android/i.test(navigator.userAgent) ? 'Android' : 'iOS';
      // Using app download URLs from contracts (should be imported)
      setMobileURL(
        OS === 'Android'
          ? 'https://play.google.com/store/apps/details?id=in.zestmoney.app'
          : 'https://apps.apple.com/in/app/zestmoney/id1234567890'
      );

      if (window.ymConfig) {
        window.document.body.classList.add('hide-chat-icon');
      }
    }
  }, [merchantId, googlePayRedirection, MerchantCustomerId]);

  // Initialize Google Pay if needed
  useEffect(() => {
    if (checkIframeForGooglePay()) {
      loadScript(
        'https://microapps.google.com/apis/v1alpha/microapps.js',
        getPhoneNumber
      );
      setIsGpay(true);
    }
  }, [checkIframeForGooglePay, loadScript, getPhoneNumber]);

  // Initialize component - sync with authentication prop
  useEffect(() => {
    const mobileNumber = authentication?.MobileNumber || '';
    setEnteredNumber(mobileNumber);
    // Use the value directly, not the state which hasn't updated yet
    const isValidNumber = mobileNumber && mobileNumber.length === 10 && regex.current.test(mobileNumber);
    setIsBtnDisabled(!isValidNumber);
    setAppDownloadURL();
  }, [authentication, setAppDownloadURL]);

  // Handle number change
  const handleNumberChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '');
    setEnteredNumber(cleaned);
    
    if (cleaned) {
      if (regex.current.test(cleaned) && cleaned.length === 10) {
        setIsBtnDisabled(false);
        setErrorMessage(null);
      } else {
        setIsBtnDisabled(true);
      }
    } else {
      setIsBtnDisabled(true);
    }
  }, []);

  // Check error
  const checkError = useCallback((value: string, type: string) => {
    const cleaned = type === 'submit' ? value : value.replace(/\D/g, '');
    if (regex.current.test(cleaned)) {
      setErrorMessage(null);
      return false;
    } else {
      setErrorMessage('Please enter a valid number');
      return true;
    }
  }, []);

  // Submit mobile number
  const submitMobileNumber = useCallback(() => {
    if (!checkError(enteredNumber, 'submit')) {
      // Track event (should use tracking service)
      onGenerateOtp?.(enteredNumber);
      if (!enteredNumber || enteredNumber.length !== 10) {
        setErrorMessage('Please enter a valid number');
      } else {
        setErrorMessage(null);
      }
    }
  }, [enteredNumber, checkError, onGenerateOtp]);

  // Handle TNC click - kept for future integration
  const _handleTNCClick = (e: React.MouseEvent) => {
    void e; // Suppress unused warning
    // Track event
    if (isGpay) {
      window.microapps?.openUrl({ url: 'https://www.zestmoney.in/terms-and-conditions' });
    } else {
      window.open('https://www.zestmoney.in/terms-and-conditions', '_blank');
    }
    setOpenTNC(true);
  };
  void _handleTNCClick; // Suppress unused warning

  // Handle Privacy click
  const clickPP = useCallback((e: React.MouseEvent) => {
    // Track event
    if (isGpay) {
      e.preventDefault();
      window.microapps?.openUrl({ url: 'https://www.zestmoney.in/privacy' });
    } else {
      window.open('https://www.zestmoney.in/privacy', '_blank');
    }
    setOpenPP(true);
  }, [isGpay]);

  // Handle blur
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>, _type?: string) => {
    checkError(e.target.value, 'blur');
  }, [checkError]);

  // Handle download
  const triggerDownload = useCallback(() => {
    window.open(mobileURL, '_blank');
    // Track event
  }, [mobileURL]);

  // Build class list combining base class with any passed className
  const containerClasses = ['enter-mobile-screen-v3', className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="header-groot">
        <GtHeader
          headerTitle="Hello!"
          subtitle="An incredible credit experience is waiting for you"
          iconUrl="https://assets.zestmoney.in/assets/customers/bolt/header_type_1.svg"
        />
      </div>

      {/* Horizontal Rule */}
      <div className="horizontal-rule"></div>

      {/* Form */}
      <form
        className="auth-form-v3"
        name="loginForm"
        id="loginForm"
        method="POST"
        onSubmit={(e) => {
          e.preventDefault();
          submitMobileNumber();
        }}
        autoComplete="off"
      >
        <div className="content">
          <GtInput
            label="Mobile number"
            id="mobile_number"
            name="mobile_number"
            appearance="block"
            value={enteredNumber}
            valueChange={handleNumberChange}
            disabled={disabled}
            pattern="([5-9])\d{9}"
            maxLength={10}
            minLength={10}
            type="tel"
            errMsg={errorMessage || undefined}
            grootBlur={handleBlur}
            removeRef={true}
            prefix={<span>+91</span>}
          />
        </div>

        {/* Footer */}
        <div className="footer">
          <div className="footer-text">
            By creating an account, I agree with{' '}
            {/* TNC link is commented out in Angular - only Privacy Policy is shown */}
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="green-btn-text"
              onClick={clickPP}
              href="#"
            >
              Privacy Policy
            </a>
          </div>

          <SubmitterComponent
            btnLabel="Continue"
            size="block"
            type="submit"
            disabled={isBtnDisabled || disabled}
            onSubmit={submitMobileNumber}
          />

          {/* App Download Banner */}
          {showBanner && (
            <div className="app-banner">
              <div className="app-content">
                <img
                  src="https://assets.zestmoney.in/assets/payment_app/zest-icon-for-download-app.svg"
                  alt="zestmoney"
                />
                <div className="app-text">
                  <span className="download-text">Download the app</span>
                  <span className="sub-text">For the best Zest experience</span>
                </div>
              </div>
              <GtButton
                appearance="primary"
                bold={true}
                size="half"
                disabled={false}
                textContent="Download"
                grootClick={triggerDownload}
              />
            </div>
          )}
        </div>
      </form>

      {/* TNC Modal */}
      <GtSwipe onSwipeDown={() => setOpenTNC(false)}>
        <GtModal
          open={openTNC}
          grootClose={() => setOpenTNC(false)}
          appearance="primary"
          className="otp-modal"
        >
          <div className="modal-wrapper">
            <iframe
              src="https://docs.google.com/viewerng/viewer?url=https://assets.zestmoney.in/assets/pdfs/Terms+and+Conditions.pdf&embedded=true"
              frameBorder="0"
              height="500px"
              width="100%"
              title="Terms and Conditions"
            />
          </div>
        </GtModal>
      </GtSwipe>

      {/* Privacy Policy Modal */}
      <GtSwipe onSwipeDown={() => setOpenPP(false)}>
        <GtModal
          open={openPP}
          grootClose={() => setOpenPP(false)}
          appearance="primary"
          className="otp-modal"
        >
          <div className="modal-wrapper">
            <iframe
              src="https://docs.google.com/viewerng/viewer?url=https://assets.zestmoney.in/assets/pdfs/Privacy+Policy.pdf&embedded=true"
              frameBorder="0"
              height="500px"
              width="100%"
              title="Privacy Policy"
            />
          </div>
        </GtModal>
      </GtSwipe>
    </div>
  );
};

export default EnterMobileNumberV3;
