/**
 * LoginPage Route Component
 * 
 * Handles phone number login/OTP verification flow.
 * - If user exists: completes login and emits token
 * - If user needs email (new user): redirects to /email
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnterMobileNumberV3 } from '../components/forms/EnterMobileNumberV3';
import { EnterOtpV3 } from '../components/forms/EnterOtpV3';
import { AuthErrorComponent, AuthErrorType } from '../components/auth/AuthError';
import type { AuthError } from '../components/auth/AuthError';
import { useAuthServices } from '../hooks/useAuthServices';
import { AuthLoader } from '../components/common';
import { ROUTES } from '../constants/routes';
import {
  Authentication,
  AcrValues,
  Token,
  EventDetails,
  UserDetails,
  AuthenticationErrorCodes,
  AuthenticationV2ErrorMessages,
} from '../types/contracts';
import {
  setAuthenticationSession,
  removeAuthenticationSession,
  setContactNumber,
  setSignUpFlag,
} from '../utils/sessionStorage';
import { checkIfErrorCodeRetured } from '../utils/helpers';
import { focusElementById, scrollToTop } from '../utils/autoFocus';
import '../components/auth/PhoneNumberSignInV3Complete/index.css';

export function LoginPage() {
  const navigate = useNavigate();

  const {
    authService,
    trackingService,
    loaderService,
    environmentType,
    clientName,
    getEnvironmentConfig,
    showTruecaller,
    showGetCallFeatureSwitch,
    isInitialized,
    addToast,
  } = useAuthServices();

  // State
  const [authentication, setAuthentication] = useState<Authentication>(new Authentication());
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [hasOtpCallFinished, setHasOtpCallFinished] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [waOpted, setWaOpted] = useState(true);
  const [retryOtpAttempts, setRetryOtpAttempts] = useState(0);

  // Refs
  const authenticationRef = useRef<Authentication>(authentication);
  const generateOtpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync
  useEffect(() => {
    authenticationRef.current = authentication;
  }, [authentication]);

  // Initialize - clear any existing session when landing on login page
  useEffect(() => {
    // Clear any existing session to ensure fresh start
    removeAuthenticationSession();

    document.getElementsByTagName('html')[0].style.fontSize = '16px';
    setUserDetails(new UserDetails('', '', environmentType));
    scrollToTop();

    // Hide loader after init
    setTimeout(() => {
      loaderService.next({ showLoader: false, loaderTextMessage: '' });
    }, 500);
  }, [environmentType, loaderService]);

  // Generate OTP API call
  const callGenerateOtp = useCallback(async (mobileNumber: string) => {
    if (!mobileNumber || mobileNumber.length !== 10 || !mobileNumber.match(/^[0-9]+$/)) {
      setErrorMessage(AuthenticationV2ErrorMessages.ZMAUT17);
      return;
    }

    // Show OTP form immediately, disable continue until API completes
    setErrorMessage('');
    setAuthentication(prev => ({ ...prev, Otp: '', OtpId: '' }));
    setShowOtpForm(true);
    setHasOtpCallFinished(false);

    if (!authService) {
      setShowOtpForm(false);
      setErrorMessage('Service not initialized. Please refresh and try again.');
      return;
    }

    try {
      const authForApi = new Authentication();
      authForApi.MobileNumber = mobileNumber;

      const response = await authService.triggerOtpViaSmsV2(
        environmentType,
        authForApi,
        '', // merchantKey
        '', // merchantId
      );

      setAuthentication(prev => ({
        ...prev,
        MobileNumber: mobileNumber,
        OtpId: response.OtpId,
        ShowMfaChallenge: response.ShowMfaChallenge || false,
      }));
      setHasOtpCallFinished(true);
      focusElementById('otp_number', 500);
    } catch (error: any) {
      setShowOtpForm(false);
      setHasOtpCallFinished(false);
      const errorCode = checkIfErrorCodeRetured(error);
      if (errorCode && AuthenticationV2ErrorMessages[errorCode as keyof typeof AuthenticationV2ErrorMessages]) {
        setErrorMessage(AuthenticationV2ErrorMessages[errorCode as keyof typeof AuthenticationV2ErrorMessages]);
      } else {
        setErrorMessage('Failed to send OTP. Please try again.');
      }
    }
  }, [authService, environmentType]);

  // Debounced OTP generation
  const generateOtp = useCallback((mobileNumber: string) => {
    if (generateOtpTimeoutRef.current) {
      clearTimeout(generateOtpTimeoutRef.current);
    }
    generateOtpTimeoutRef.current = setTimeout(() => {
      callGenerateOtp(mobileNumber);
    }, 500);
  }, [callGenerateOtp]);

  // Handle mobile number submission
  const handleMobileSubmit = useCallback((mobileNumber: string) => {
    if (mobileNumber.length === 10 && mobileNumber.match(/^[0-9]+$/)) {
      setAuthentication(prev => ({ ...prev, MobileNumber: mobileNumber }));
      generateOtp(mobileNumber);

      // Track event
      if (trackingService && userDetails) {
        const event = new EventDetails('Onboarding_Mobile_Submited', 'field', mobileNumber, 'textbox', environmentType);
        trackingService.sendDataToFunnel(userDetails, event, environmentType, clientName, true);
      }
    }
  }, [generateOtp, trackingService, userDetails, environmentType, clientName]);

  // Verify OTP and get token
  const verifyOtp = useCallback(async (verificationData: { otp: string; pan?: string }) => {
    const otp = verificationData?.otp || '';
    const pan = verificationData?.pan || '';

    if (!otp || otp.length !== 6 || !otp.match(/^[0-9]+$/)) {
      return;
    }

    // Update authentication with OTP
    const updatedAuth = { ...authenticationRef.current, Otp: otp };
    authenticationRef.current = updatedAuth;
    setAuthentication(updatedAuth);

    // Check MFA challenge
    if (updatedAuth.ShowMfaChallenge && (!pan || pan.length !== 4)) {
      return;
    }

    if (!authService) return;

    setRetryOtpAttempts(prev => prev + 1);
    setErrorMessage('');

    const acrValues = new AcrValues('', '', '', '', 2, 'panIdentifier', pan);

    try {
      // Clear email for login attempt (not signup)
      const authForToken = { ...updatedAuth, Email: '', Password: '' };

      const response = await authService.getTokenUsingAcrValues(
        environmentType,
        authForToken,
        false, // isSignup = false (login attempt)
        false,
        acrValues,
        '2',
      );

      // Login successful - user exists
      removeAuthenticationSession();
      setContactNumber(updatedAuth.MobileNumber);

      // Track login event
      const event = new EventDetails('Onboarding_Login_Done', 'Event', 'AuthType', '_null', environmentType);
      if (trackingService && userDetails) {
        trackingService.sendDataToFunnel(userDetails, event, environmentType, clientName, true);
      }

      // Emit token and show success
      loaderService.next({ showLoader: true, loaderTextMessage: '' });
      addToast('success', 'Login successful!');
      setShowOtpForm(false);
      console.log('Login token received:', response);

    } catch (error: any) {
      const errorCode = checkIfErrorCodeRetured(error);

      // User doesn't exist - needs to register with email
      if (errorCode === AuthenticationErrorCodes.ZMAUT23 || errorCode === AuthenticationErrorCodes.ZMAUT28) {
        // Save authentication state for email page
        const authSession = {
          auth: updatedAuth,
          waOpted,
          issuedAt: Date.now(),
        };
        setAuthenticationSession(authSession);

        // Close OTP form and redirect to email page
        setShowOtpForm(false);
        loaderService.next({ showLoader: false, loaderTextMessage: '' });
        navigate(ROUTES.EMAIL);
        return;
      }

      // Handle other errors
      if (errorCode === AuthenticationErrorCodes.ZMAUT30) {
        // MFA challenge required
        setErrorMessage(AuthenticationV2ErrorMessages[errorCode as keyof typeof AuthenticationV2ErrorMessages]);
      } else if (errorCode === AuthenticationErrorCodes.ZMAUT02) {
        // Invalid OTP
        if (retryOtpAttempts >= 3) {
          setErrorMessage('Incorrect OTP. Please enter the verification code again');
        } else {
          setErrorMessage(AuthenticationV2ErrorMessages[errorCode as keyof typeof AuthenticationV2ErrorMessages] || 'Invalid OTP');
        }
      } else if (errorCode) {
        setErrorMessage(AuthenticationV2ErrorMessages[errorCode as keyof typeof AuthenticationV2ErrorMessages] || 'Something went wrong');
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }

      loaderService.next({ showLoader: false, loaderTextMessage: '' });
    }
  }, [authService, environmentType, trackingService, userDetails, clientName, loaderService, addToast, navigate, waOpted, retryOtpAttempts]);

  // Resend OTP
  const resendOtp = useCallback(() => {
    setRetryOtpAttempts(0);
    setErrorMessage('');
    focusElementById('otp_number', 500);

    if (authentication.MobileNumber) {
      generateOtp(authentication.MobileNumber);
    }

    // Track resend event
    if (trackingService && userDetails) {
      const event = new EventDetails('resend_otp_clicked', 'event', 'triggered', '_null', environmentType);
      trackingService.sendDataToFunnel(userDetails, event, environmentType, clientName, true);
    }
  }, [authentication.MobileNumber, generateOtp, trackingService, userDetails, environmentType, clientName]);

  // Close OTP modal
  const closeOtpModal = useCallback(() => {
    setShowOtpForm(false);
    setErrorMessage('');
  }, []);

  // Handle OTP via call
  const handleOtpViaCall = useCallback(async () => {
    if (authService && authentication.OtpId) {
      try {
        await authService.triggerOtpViaCallV2(environmentType, authentication.OtpId);
      } catch (error) {
        console.error('Error triggering OTP via call:', error);
      }
    }
  }, [authService, authentication.OtpId, environmentType]);

  // Show loader while initializing
  if (!isInitialized) {
    return <AuthLoader />;
  }

  return (
    <div className="auth-bg-wrapper">
      <div className="auth-v3-contianer">
        {/* Logo Header */}
        <div className="logo-header">
          <img
            src="https://assets.zestmoney.in/assets/customers/icons/Zest_logo_green.png"
            alt="zest-logo"
            className="zest-logo"
          />
        </div>

        {/* Mobile Number Form */}
        <EnterMobileNumberV3
          authentication={authentication}
          disabled={false}
          environmentType={environmentType}
          clientName={clientName}
          merchantId=""
          googlePayRedirection={false}
          MerchantCustomerId=""
          onGenerateOtp={handleMobileSubmit}
          onMobileNumberUpdate={() => {}}
          className="enter-mobile-v3-container"
        />

        {/* OTP Modal */}
        {showOtpForm && (
          <EnterOtpV3
            state={showOtpForm}
            authentication={authentication}
            errorMessage={errorMessage}
            userDetails={userDetails || undefined}
            hasOtpCallFinished={hasOtpCallFinished}
            showMfaChallenge={authentication.ShowMfaChallenge}
            showGetCall={showGetCallFeatureSwitch}
            environmentType={environmentType}
            clientName={clientName}
            onCloseModal={closeOtpModal}
            onOtpPassword={verifyOtp}
            onResendOtp={resendOtp}
            onGetOtpViaCall={handleOtpViaCall}
          />
        )}
      </div>

      {/* Auth Error Modal */}
      {authError && (
        <AuthErrorComponent
          error={authError}
          onClose={() => setAuthError(null)}
        />
      )}

      <AuthLoader />
    </div>
  );
}

export default LoginPage;
