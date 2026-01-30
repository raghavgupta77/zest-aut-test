/**
 * RedirectComponent
 * Exact React replacement for Angular RedirectComponent
 * Main orchestrator managing multiple authentication screen states
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { PhoneNumberSignInV3Complete } from '../PhoneNumberSignInV3Complete';
import { FinoramicCallback } from '../FinoramicCallback';
import { ForgotPassword } from '../ForgotPassword';
import { Logout } from '../Logout';
import { AuthErrorComponent, AuthErrorType } from '../AuthError';
import type { AuthError } from '../AuthError';
import { AuthLoader } from '../../common';
import { HeaderService, Header } from '../../../services/headerService';
import { FooterService, Footer } from '../../../services/footerService';
import { LoaderService } from '../../../services/loaderService';
import { AuthenticationServiceExtended } from '../../../services/authenticationServiceExtended';
import { ApplicationService } from '../../../services/applicationService';
import { TrackingService } from '../../../services/trackingService';
import {
  AUTHENTICATION_SESSION_STORAGE_KEY,
  checkIfErrorCodeRetured
} from '../../../utils/helpers';
import { Token, EventDetails, AuthenticationErrorCodes } from '../../../types/contracts';
import './index.css';

export interface RedirectComponentProps {
  environmentType?: string;
  clientName?: string;
  isSignup?: boolean;
  isLogout?: boolean;
  authVersion?: string;
  newTexts?: boolean;
  hideGmail?: boolean;
  googlePayRedirection?: boolean;
  checkoutParams?: any;
  loanApplicationId?: string;
  merchantId?: string;
  MerchantCustomerId?: string;
  merchantKey?: string;
  resetPasswordToken?: string;
  isReferred?: boolean;
  onGetToken?: (token: Token) => void;
  onGetEvents?: (events: EventDetails[]) => void;
  onLogout?: () => void;
  getEnvironmentConfig?: (envType: string) => any;
}

export const RedirectComponent: React.FC<RedirectComponentProps> = ({
  environmentType = 'Local',
  clientName,
  isSignup = false,
  isLogout = false,
  authVersion = 'V3',
  newTexts = false,
  hideGmail = false,
  googlePayRedirection = false,
  checkoutParams,
  loanApplicationId,
  merchantId,
  MerchantCustomerId,
  merchantKey,
  resetPasswordToken,
  isReferred,
  onGetToken,
  onGetEvents,
  onLogout,
  getEnvironmentConfig
}) => {
  const location = useLocation();
  // const navigate = useNavigate(); // Reserved for future use

  // Screen states
  const [resetPassword, setResetPassword] = useState<boolean>(false);
  const [showOtpLogin, setShowOtpLogin] = useState<boolean>(false);
  const [showOtpSignup, setShowOtpSignup] = useState<boolean>(false);
  const [showLogout, setShowLogout] = useState<boolean>(false);
  const [showFinoramicCallback, setShowFinoramicCallback] = useState<boolean>(false);
  const [showTruecaller, setShowTruecaller] = useState<boolean>(false);
  const [showGetCallFeatureSwitch, setShowGetCallFeatureSwitch] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_backButtonDirectiveName, setBackButtonDirectiveName] = useState<string[]>([]);
  
  // Auth error state for modal
  const [authError, setAuthError] = useState<AuthError | null>(null);

  // Initialize services
  const [authService, setAuthService] = useState<AuthenticationServiceExtended | null>(null);
  const [applicationService, setApplicationService] = useState<ApplicationService | null>(null);
  const [trackingService, setTrackingService] = useState<TrackingService | null>(null);

  // Initialize redirection parameters
  const initializeRedirectionParameters = useCallback(() => {
    if (isLogout) {
      setShowLogout(true);
    } else if (resetPasswordToken && resetPasswordToken.length > 0) {
      setResetPassword(true);
    } else if (isSignup && clientName !== 'MyAccounts') {
      setShowOtpSignup(true);
    } else {
      setShowOtpLogin(true);
    }
  }, [isLogout, resetPasswordToken, isSignup, clientName]);

  // Setup Google login script
  const setupGoogleLoginScript = useCallback((envConfig: any) => {
    const googleLoginScriptUrl = 'https://apis.google.com/js/platform.js';
    const google_login_client_id = envConfig.google_login_client_id;

    const script = document.createElement('script');
    script.src = googleLoginScriptUrl;
    script.type = 'text/javascript';
    script.async = false;
    script.defer = false;
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(script, firstScript);

    // Create meta tag
    const meta = document.createElement('meta');
    meta.name = 'google-signin-client_id';
    meta.content = google_login_client_id;
    const firstMeta = document.getElementsByTagName('meta')[0];
    firstMeta.parentNode?.insertBefore(meta, firstMeta);
  }, []);

  // Setup pixel script
  const setupPixelScript = useCallback((envConfig: any) => {
    const pixelScriptUrl = envConfig.scripts?.pixelScriptUrl;
    if (!pixelScriptUrl) return;

    const script = document.createElement('script');
    script.src = pixelScriptUrl;
    script.type = 'text/javascript';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(script, firstScript);
  }, []);

  // Check auto signup customer
  const checkAutoSignupCustomer = useCallback(async (authServiceInstance: AuthenticationServiceExtended) => {
    if (authServiceInstance) {
      // Check Truecaller enabled
      try {
        const truecallerResponse = await authServiceInstance.checkTruecallerEnabled(environmentType);
        setShowTruecaller(truecallerResponse?.enabled === true);
      } catch (error) {
        setShowTruecaller(false);
      }

      // Check Get OTP via Call enabled
      try {
        const otpCallResponse = await authServiceInstance.checkGetOtpViaCallEnabled(environmentType);
        setShowGetCallFeatureSwitch(otpCallResponse?.enabled === true);
      } catch (error) {
        setShowGetCallFeatureSwitch(false);
      }
    }

    initializeRedirectionParameters();
  }, [environmentType, initializeRedirectionParameters]);

  // Initialize
  useEffect(() => {
    if (!getEnvironmentConfig) return;

    const envConfig = getEnvironmentConfig(environmentType);
    const { finoramicCallback = '/authentication/finoramic-callback' } = envConfig || {};

    // Set session storage
    sessionStorage.setItem('ngx-webstorage|zest-sign-up', 'false');

    // Setup header and footer
    HeaderService.next(new Header(true, false));
    FooterService.next(new Footer(true));

    // Initialize services using singleton instances
    // Services now use the centralized environment config from config/environment.ts
    const authServiceInstance = new AuthenticationServiceExtended();

    const applicationServiceInstance = new ApplicationService();

    const trackingServiceInstance = new TrackingService();

    setAuthService(authServiceInstance);
    setApplicationService(applicationServiceInstance);
    setTrackingService(trackingServiceInstance);

    // Setup Google login script
    setupGoogleLoginScript(envConfig);

    // Setup pixel script
    setupPixelScript(envConfig);

    // Check if Finoramic callback
    if (location.pathname === finoramicCallback && sessionStorage.getItem(AUTHENTICATION_SESSION_STORAGE_KEY)) {
      setShowFinoramicCallback(true);
    } else {
      checkAutoSignupCustomer(authServiceInstance);
    }
  }, [environmentType, location.pathname, getEnvironmentConfig, setupGoogleLoginScript, setupPixelScript, checkAutoSignupCustomer]);

  // Show header back button
  const showHeaderBackButtonAndSetBackUrl = useCallback((sourceDirectiveName: string) => {
    setBackButtonDirectiveName(prev => {
      const updated = [...prev, sourceDirectiveName].filter(d => d !== 'zest-forgot-password');
      HeaderService.next(new Header(true, true));
      return updated;
    });
  }, []);

  // Hide header back button
  const hideHeaderBackButton = useCallback(() => {
    setBackButtonDirectiveName(prev => {
      const updated = prev.filter(d => d !== 'zest-forgot-password');
      if (updated.length > 0) {
        updated.pop();
      }
      if (updated.length === 0) {
        HeaderService.next(new Header(true, false));
      }
      return updated;
    });
  }, []);

  // Note: backButtonClicked functionality is integrated into showResetPassword, showLoginWithOtp, showSignupWithOtp below

  // Show reset password
  const showResetPassword = useCallback((sourceDirectiveName?: string) => {
    if (sourceDirectiveName && !resetPassword) {
      showHeaderBackButtonAndSetBackUrl(sourceDirectiveName);
    } else {
      hideHeaderBackButton();
    }
    setResetPassword(true);
    setShowOtpLogin(false);
    setShowOtpSignup(false);
  }, [resetPassword, showHeaderBackButtonAndSetBackUrl, hideHeaderBackButton]);

  // Show login with OTP
  const showLoginWithOtp = useCallback((sourceDirectiveName?: string) => {
    if (sourceDirectiveName && !showOtpLogin) {
      showHeaderBackButtonAndSetBackUrl(sourceDirectiveName);
    } else {
      hideHeaderBackButton();
    }
    setResetPassword(false);
    setShowOtpLogin(true);
    setShowOtpSignup(false);
  }, [showOtpLogin, showHeaderBackButtonAndSetBackUrl, hideHeaderBackButton]);

  // Show signup with OTP
  const showSignupWithOtp = useCallback((sourceDirectiveName?: string) => {
    if (sourceDirectiveName && !showOtpSignup) {
      showHeaderBackButtonAndSetBackUrl(sourceDirectiveName);
    } else {
      hideHeaderBackButton();
    }
    setResetPassword(false);
    setShowOtpLogin(false);
    setShowOtpSignup(true);
  }, [showOtpSignup, showHeaderBackButtonAndSetBackUrl, hideHeaderBackButton]);

  // Get token function
  const getTokenFunction = useCallback((token: Token) => {
    LoaderService.next({ showLoader: true, loaderTextMessage: '' });
    onGetToken?.(token);
  }, [onGetToken]);

  // Get events function
  const getEventsFunction = useCallback((events: EventDetails[]) => {
    onGetEvents?.(events);
  }, [onGetEvents]);

  // Logout function
  const logoutFunction = useCallback(() => {
    onLogout?.();
  }, [onLogout]);

  // Handle auth error - matching Angular's handleAuthErrorFunction
  const handleAuthErrorFunction = useCallback((backendError: any) => {
    const emailParsingError = () => {
      setAuthError({
        error: AuthErrorType.email,
        heading: 'Email ID not found',
        description: 'Sorry, we could not fetch your email ID. Please enter your email ID.'
      });
    };

    const emailDuplicateError = () => {
      setAuthError({
        error: AuthErrorType.otp,
        heading: 'Email ID belongs to another user',
        description: 'Sorry, this email is linked to a different account. Please login again.'
      });
    };

    const otpParsingError = () => {
      setAuthError({
        error: AuthErrorType.otp,
        heading: 'OTP Invalid',
        description: 'Sorry, your OTP is invalid. Please login again.'
      });
    };

    if (!backendError) {
      // No backend response means email was definitely invalid.
      emailParsingError();
    } else {
      const errorCode = checkIfErrorCodeRetured(backendError);
      
      if (errorCode && (errorCode === AuthenticationErrorCodes.ZMAUT23 || errorCode === AuthenticationErrorCodes.ZMAUT28)) {
        emailParsingError();
      } else if (errorCode === AuthenticationErrorCodes.ZMAUT25) {
        emailDuplicateError();
      } else {
        otpParsingError();
      }
    }
    
    // After showing error, go back to OTP signup screen
    setTimeout(() => {
      setShowFinoramicCallback(false);
      setShowOtpSignup(true);
    }, 200);
  }, []);

  // V3 uses its own full-screen layout without header/footer
  const isV3Auth = (showOtpLogin || showOtpSignup) && authVersion === 'V3';

  return (
    <>
      <AuthLoader />

      {/* Finoramic Callback Screen */}
      {showFinoramicCallback && !resetPassword && !showLogout && !showOtpLogin && !showOtpSignup && (
        <FinoramicCallback
          environment={environmentType}
          loanApplicationId={loanApplicationId}
          merchantId={merchantId}
          MerchantCustomerId={MerchantCustomerId}
          merchantKey={merchantKey}
          clientName={clientName}
          onGetToken={getTokenFunction}
          onGetEvents={getEventsFunction}
          onHandleError={handleAuthErrorFunction}
          authService={authService || undefined}
          trackingService={trackingService || undefined}
        />
      )}

      {/* Logout Screen */}
      {!resetPassword && showLogout && !showOtpLogin && !showOtpSignup && (
        <Logout
          environment={environmentType}
          clientName={clientName}
          onLogout={logoutFunction}
        />
      )}

      {/* Reset Password Screen */}
      {resetPassword && !showLogout && !showOtpLogin && !showOtpSignup && (
        <ForgotPassword
          environment={environmentType}
          clientName={clientName}
          resetPasswordToken={resetPasswordToken}
          onShowResetPassword={() => showResetPassword()}
          onShowLoginWithOtp={() => showLoginWithOtp()}
          onShowSignupWithOtp={() => showSignupWithOtp()}
          authService={authService || undefined}
        />
      )}

      {/* Phone Number Sign In V3 (Main Screen) - Full screen layout */}
      {isV3Auth && (
        <PhoneNumberSignInV3Complete
          environment={environmentType}
          clientName={clientName}
          loanApplicationId={loanApplicationId}
          merchantId={merchantId}
          MerchantCustomerId={MerchantCustomerId}
          showTruecaller={showTruecaller}
          showGetCallFeatureSwitch={showGetCallFeatureSwitch}
          isReferred={isReferred}
          newTexts={newTexts}
          hideGmail={hideGmail}
          merchantKey={merchantKey}
          googlePayRedirection={googlePayRedirection}
          checkoutParams={checkoutParams}
          onGetToken={getTokenFunction}
          onGetEvents={getEventsFunction}
          authService={authService || undefined}
          applicationService={applicationService || undefined}
          trackingService={trackingService || undefined}
          loaderService={LoaderService}
          getEnvironmentConfig={getEnvironmentConfig}
        />
      )}

      {/* Auth Error Modal */}
      {authError && (
        <AuthErrorComponent
          error={authError}
          onClose={() => setAuthError(null)}
        />
      )}
    </>
  );
};

export default RedirectComponent;
