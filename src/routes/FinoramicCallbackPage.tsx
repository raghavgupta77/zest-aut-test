/**
 * FinoramicCallbackPage Route Component
 * 
 * Handles OAuth callback from Finoramic (Gmail statement parsing).
 * Uses react-router-dom for proper URL-based routing.
 */

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinoramicCallback } from '../components/auth/FinoramicCallback';
import { AuthErrorComponent, AuthErrorType } from '../components/auth/AuthError';
import type { AuthError } from '../components/auth/AuthError';
import { useAuthServices } from '../hooks/useAuthServices';
import { AuthLoader } from '../components/common';
import { ROUTES } from '../constants/routes';
import { checkIfErrorCodeRetured } from '../utils/helpers';
import { AuthenticationErrorCodes } from '../types/contracts';
import type { Token, EventDetails } from '../types/contracts';

export function FinoramicCallbackPage() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const {
    authService,
    trackingService,
    loaderService,
    environmentType,
    clientName,
    isInitialized,
    addToast,
  } = useAuthServices({
    showHeader: true,
    showFooter: true,
    checkTruecaller: false,
    checkOtpViaCall: false,
  });

  // Get URL params (in a real app these might come from URL or context)
  const loanApplicationId = undefined;
  const merchantId = undefined;
  const MerchantCustomerId = undefined;
  const merchantKey = undefined;

  // Handle successful token
  const handleGetToken = useCallback((token: Token) => {
    loaderService.next({ showLoader: true, loaderTextMessage: '' });
    addToast('success', 'Authentication successful!');
    console.log('Token received from Finoramic callback:', token);
  }, [loaderService, addToast]);

  // Handle events
  const handleGetEvents = useCallback((events: EventDetails[]) => {
    console.log('Finoramic callback events:', events);
  }, []);

  // Handle auth errors - matching Angular's handleAuthErrorFunction
  const handleAuthError = useCallback((backendError: any) => {
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
    
    // After showing error, redirect back to signup flow
    setTimeout(() => {
      navigate(ROUTES.EMAIL, { replace: true });
    }, 200);
  }, [navigate]);

  // Close error modal
  const handleCloseError = useCallback(() => {
    setAuthError(null);
    navigate(ROUTES.EMAIL, { replace: true });
  }, [navigate]);

  // Show loader while services initialize
  if (!isInitialized) {
    return <AuthLoader />;
  }

  return (
    <>
      <AuthLoader />
      <FinoramicCallback
        environment={environmentType}
        loanApplicationId={loanApplicationId}
        merchantId={merchantId}
        MerchantCustomerId={MerchantCustomerId}
        merchantKey={merchantKey}
        clientName={clientName}
        onGetToken={handleGetToken}
        onGetEvents={handleGetEvents}
        onHandleError={handleAuthError}
        authService={authService || undefined}
        trackingService={trackingService || undefined}
      />

      {/* Auth Error Modal */}
      {authError && (
        <AuthErrorComponent
          error={authError}
          onClose={handleCloseError}
        />
      )}
    </>
  );
}

export default FinoramicCallbackPage;
