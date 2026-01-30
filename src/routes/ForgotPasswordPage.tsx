/**
 * ForgotPasswordPage Route Component
 * 
 * Password reset flow page.
 * Uses react-router-dom for proper URL-based routing.
 */

import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ForgotPassword } from '../components/auth/ForgotPassword';
import { useAuthServices } from '../hooks/useAuthServices';
import { AuthLoader } from '../components/common';
import { ROUTES } from '../constants/routes';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get reset password token from URL query params
  const resetPasswordToken = searchParams.get('token') || undefined;

  const {
    authService,
    environmentType,
    clientName,
    isInitialized,
  } = useAuthServices({
    showBackButton: true,
    checkTruecaller: false,
    checkOtpViaCall: false,
  });

  // Navigate back to login page
  const handleShowLoginWithOtp = useCallback(() => {
    navigate(ROUTES.ROOT, { replace: true });
  }, [navigate]);

  // Navigate to signup flow
  const handleShowSignupWithOtp = useCallback(() => {
    navigate(ROUTES.ROOT);
  }, [navigate]);

  // Show reset password (already on this page)
  const handleShowResetPassword = useCallback(() => {
    // Already on reset password page, no navigation needed
  }, []);

  // Show loader while services initialize
  if (!isInitialized) {
    return <AuthLoader />;
  }

  return (
    <>
      <AuthLoader />
      <ForgotPassword
        environment={environmentType}
        clientName={clientName}
        resetPasswordToken={resetPasswordToken}
        onShowResetPassword={handleShowResetPassword}
        onShowLoginWithOtp={handleShowLoginWithOtp}
        onShowSignupWithOtp={handleShowSignupWithOtp}
        authService={authService || undefined}
      />
    </>
  );
}

export default ForgotPasswordPage;
