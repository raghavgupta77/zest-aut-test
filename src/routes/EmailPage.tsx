/**
 * EmailPage Route Component
 * 
 * Handles email entry for new user registration.
 * - Requires valid session from OTP verification (redirects to / if not)
 * - Completes signup with email and emits token
 * - Shows logout confirmation when user tries to go back
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnterEmailV3 } from '../components/forms/EnterEmailV3';
import { AuthErrorComponent, AuthErrorType } from '../components/auth/AuthError';
import type { AuthError } from '../components/auth/AuthError';
import { GtModal, GtSwipe, GtButton } from '../components/groot';
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
  getAuthenticationSession,
  removeAuthenticationSession,
  setContactNumber,
  setSignUpFlag,
  setZestToken,
} from '../utils/sessionStorage';
import { isValidAuthSessionStorage, safeParseAccessToken, checkIfErrorCodeRetured, isIframe } from '../utils/helpers';
import { scrollToTop } from '../utils/autoFocus';
import '../components/auth/PhoneNumberSignInV3Complete/index.css';

export function EmailPage() {
  const navigate = useNavigate();

  const {
    authService,
    applicationService,
    trackingService,
    loaderService,
    environmentType,
    clientName,
    getEnvironmentConfig,
    isInitialized,
    addToast,
  } = useAuthServices({
    showHeader: true,
    showBackButton: true,
  });

  // State
  const [authentication, setAuthentication] = useState<Authentication>(new Authentication());
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waOpted, setWaOpted] = useState(true);
  const [incomeConsent, setIncomeConsent] = useState(false);
  const [showFinoramicParsing, setShowFinoramicParsing] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);

  // Track if we've pushed a history state for back button handling
  const hasAddedHistoryState = useRef(false);

  // Check session and restore authentication
  useEffect(() => {
    if (!isInitialized) return;

    // Check if user has valid auth session (completed OTP verification)
    if (!isValidAuthSessionStorage()) {
      // No valid session, redirect to login
      navigate(ROUTES.ROOT, { replace: true });
      return;
    }

    // Restore authentication from session storage
    const authSession = getAuthenticationSession();
    if (authSession) {
      setAuthentication(authSession.auth);
      setWaOpted(authSession.waOpted);
      setUserDetails(new UserDetails('', '', environmentType));
      setSessionChecked(true);
    } else {
      navigate(ROUTES.ROOT, { replace: true });
      return;
    }

    scrollToTop();

    // Check Finoramic feature
    if (applicationService && authSession) {
      applicationService
        .getFeatureVersion(environmentType, 'GMAIL-STATEMENT-PARSING', authSession.auth.MobileNumber)
        .then((gmailFeature) => {
          if (gmailFeature.version === '1.0' && !isIframe()) {
            setShowFinoramicParsing(true);
          }
        })
        .catch(() => {
          // Feature check failed - non-critical
        });
    }

    // Track page load
    if (trackingService && authSession) {
      const event = new EventDetails('Onboarding_Email_Page_Loaded', 'event', 'triggered', '_null', environmentType);
      trackingService.sendDataToFunnel(
        new UserDetails('', '', environmentType),
        event,
        environmentType,
        clientName,
        true
      );
    }

    // Hide loader
    loaderService.next({ showLoader: false, loaderTextMessage: '' });
  }, [isInitialized, navigate, environmentType, applicationService, trackingService, clientName, loaderService]);

  // Handle browser back button - show logout confirmation
  useEffect(() => {
    if (!sessionChecked) return;

    // Push a history state so we can intercept the back button
    if (!hasAddedHistoryState.current) {
      window.history.pushState({ emailPage: true }, '', ROUTES.EMAIL);
      hasAddedHistoryState.current = true;
    }

    const handlePopState = (event: PopStateEvent) => {
      // User pressed browser back button - show confirmation modal
      event.preventDefault();
      setShowLogoutConfirmModal(true);
      // Push state again to prevent actual navigation
      window.history.pushState({ emailPage: true }, '', ROUTES.EMAIL);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [sessionChecked]);

  // Handle logout confirmation - user confirms they want to go back
  const handleLogoutConfirm = useCallback(() => {
    setShowLogoutConfirmModal(false);
    removeAuthenticationSession();
    navigate(ROUTES.ROOT, { replace: true });
  }, [navigate]);

  // Handle logout cancel - user wants to stay on email page
  const handleLogoutCancel = useCallback(() => {
    setShowLogoutConfirmModal(false);
  }, []);

  // Handle email submission - complete signup
  const handleEmailSubmit = useCallback(async (email: string, consent: boolean, waConsent: boolean) => {
    if (isSubmitting || !authService) return;

    setIsSubmitting(true);
    setIncomeConsent(consent);
    setWaOpted(waConsent);

    // Update authentication with email
    const updatedAuth = { ...authentication, Email: email };
    setAuthentication(updatedAuth);

    // Create ACR values for signup
    const acrValues = new AcrValues('', '', '', '', 2, 'panIdentifier', '');

    try {
      // Call token API with signup flag
      const response = await authService.getTokenUsingAcrValues(
        environmentType,
        updatedAuth,
        true, // isSignup = true
        false,
        acrValues,
        '2',
      );

      // Track signup events
      if (trackingService && userDetails) {
        const signupEvent = new EventDetails('Onboarding_Signup_Done', 'Event', 'AuthType', '_null', environmentType);
        const waEvent = new EventDetails(waConsent ? 'wa_opt_in' : 'wa_opt_out', 'event', 'triggered', '_null', environmentType);
        trackingService.sendDataToFunnel(userDetails, signupEvent, environmentType, clientName, true);
        trackingService.sendDataToFunnel(userDetails, waEvent, environmentType, clientName, true);

        // Track email submitted
        const emailEvent = new EventDetails('Onboarding_Email_Submitted', 'event', 'triggered', '_null', environmentType);
        trackingService.sendDataToFunnelWithCustomProperties(
          userDetails,
          emailEvent,
          environmentType,
          clientName,
          true,
          { AuthActivity: 'Onboarding_Email_Submitted' }
        );

        // Track WhatsApp consent
        const waConsentEvent = new EventDetails('Onboarding_Whatsapp_Consent_Submitted', 'event', 'triggered', '_null', environmentType);
        trackingService.sendDataToFunnelWithCustomProperties(
          userDetails,
          waConsentEvent,
          environmentType,
          clientName,
          true,
          { consent: waConsent }
        );
      }

      // Post consent if accepted
      if (consent && response.access_token) {
        const tokenPayload = safeParseAccessToken<{ sub?: string }>(response);
        if (tokenPayload?.sub) {
          try {
            const consentObj = {
              consents: [
                {
                  dataSharingConsent: {
                    isAccepted: true,
                    source: 'signup',
                  },
                },
              ],
            };
            await authService.postConsent(environmentType, tokenPayload.sub, response, consentObj);

            // Track data sharing consent
            if (trackingService && userDetails) {
              const consentEvent = new EventDetails('Onboarding_Datasharing_Consent_Submitted', 'event', 'triggered', '_null', environmentType);
              trackingService.sendDataToFunnelWithCustomProperties(
                userDetails,
                consentEvent,
                environmentType,
                clientName,
                true,
                { consentGiven: true }
              );
            }
          } catch {
            // Consent posting failed - non-critical
          }
        }
      }

      // Clear session and update storage
      removeAuthenticationSession();
      setContactNumber(updatedAuth.MobileNumber);
      setSignUpFlag(true);

      // Show success
      loaderService.next({ showLoader: true, loaderTextMessage: '' });
      addToast('success', 'Registration successful!');
      console.log('Signup token received:', response);
      setZestToken(response);

    } catch (error: any) {
      const errorCode = checkIfErrorCodeRetured(error);

      if (errorCode === AuthenticationErrorCodes.ZMAUT25) {
        // Email belongs to another user
        setAuthError({
          error: AuthErrorType.otp,
          heading: 'Email ID belongs to another user',
          description: 'Sorry, this email is linked to a different account. Please try a different email.',
        });
      } else if (errorCode === AuthenticationErrorCodes.ZMAUT02) {
        // Session expired - redirect to login
        setAuthError({
          error: AuthErrorType.otp,
          heading: 'Session Expired',
          description: 'Your session has expired. Please login again.',
        });
        setTimeout(() => {
          removeAuthenticationSession();
          navigate(ROUTES.ROOT, { replace: true });
        }, 2000);
      } else {
        addToast('error', 'Registration failed. Please try again.');
      }

      setIsSubmitting(false);
      loaderService.next({ showLoader: false, loaderTextMessage: '' });
    }
  }, [authentication, authService, environmentType, isSubmitting, trackingService, userDetails, clientName, loaderService, addToast, navigate]);

  // Handle Finoramic redirect (Gmail parsing)
  const handleFinoramicRedirect = useCallback(() => {
    if (!incomeConsent) {
      // Highlight consent checkbox
      const element = document.getElementById('IC');
      if (element) {
        element.style.outline = '#FF0000 solid 1px';
      }
      return;
    }

    const envConfig = getEnvironmentConfig(environmentType);
    const {
      baseAppUrl,
      finoramicClient,
      finoramicClientId,
      finoramicDomain,
      finoramicCallback,
    } = envConfig || {};

    if (authentication.MobileNumber) {
      // Track redirect event
      if (trackingService && userDetails) {
        const event = new EventDetails('Onboarding_Gmail_Redirect_Started', 'event', 'triggered', '_null', environmentType);
        trackingService.sendDataToFunnelWithCustomProperties(userDetails, event, environmentType, clientName, true);
      }

      const userId = authentication.MobileNumber;
      const url = `${finoramicDomain}/client/${finoramicClient}/login?client_id=${finoramicClientId}&api_type=TYPE_1&user_id=${userId}&redirect_url=${baseAppUrl}${finoramicCallback}`;
      window.location.href = url;
    }
  }, [authentication.MobileNumber, environmentType, getEnvironmentConfig, incomeConsent, trackingService, userDetails, clientName]);

  // Show loader while initializing or checking session
  if (!isInitialized || !sessionChecked) {
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

        {/* Email Form */}
        <EnterEmailV3
          authentication={authentication}
          disabled={isSubmitting}
          isGpay={false}
          showFinoramicParsing={showFinoramicParsing}
          onEmailSubmit={handleEmailSubmit}
          onFinoramicRedirect={handleFinoramicRedirect}
          className="enter-email-v3-container"
        />
      </div>

      {/* Auth Error Modal */}
      {authError && (
        <AuthErrorComponent
          error={authError}
          onClose={() => setAuthError(null)}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmModal && (
        <div className="logout-confirm-modal">
          <GtSwipe onSwipeDown={handleLogoutCancel}>
            <GtModal
              open={showLogoutConfirmModal}
              grootClose={handleLogoutCancel}
              appearance="primary"
              hideCloseButton={false}
              className="otp-modal"
            >
              <div className="modal-wrapper">
                <div className="text-wrapper">
                  <div className="circle-wrapper">🤔</div>
                  <p className="heading">Are you sure you want to log out?</p>
                  <p className="description">
                    You will need to enter your phone number and verify OTP
                    again to continue.
                  </p>
                </div>
                <div className="logout-modal-buttons">
                  <GtButton
                    appearance="primary"
                    bold={true}
                    size="block"
                    type="button"
                    textContent="Yes, Log Out"
                    grootClick={handleLogoutConfirm}
                  />
                  <GtButton
                    appearance="secondary"
                    bold={true}
                    size="block"
                    type="button"
                    textContent="Cancel"
                    grootClick={handleLogoutCancel}
                    className="cancel-btn"
                  />
                </div>
              </div>
            </GtModal>
          </GtSwipe>
        </div>
      )}

      <AuthLoader />
    </div>
  );
}

export default EmailPage;
