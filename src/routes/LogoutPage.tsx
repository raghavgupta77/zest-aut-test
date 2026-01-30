/**
 * LogoutPage Route Component
 * 
 * Logout flow with countdown timer.
 * Uses react-router-dom for proper URL-based routing.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logout } from '../components/auth/Logout';
import { useAuthServices } from '../hooks/useAuthServices';
import { AuthLoader } from '../components/common';
import { ROUTES } from '../constants/routes';
import { removeAuthenticationSession } from '../utils/sessionStorage';

export function LogoutPage() {
  const navigate = useNavigate();

  const {
    environmentType,
    clientName,
    isInitialized,
    addToast,
  } = useAuthServices({
    showHeader: true,
    showFooter: false,
    checkTruecaller: false,
    checkOtpViaCall: false,
  });

  // Handle logout completion
  const handleLogout = useCallback(() => {
    // Clear session storage
    removeAuthenticationSession();
    
    // Show toast
    addToast('info', 'Logged out successfully');
    
    // Navigate to login page
    navigate(ROUTES.ROOT, { replace: true });
  }, [navigate, addToast]);

  // Show loader while services initialize
  if (!isInitialized) {
    return <AuthLoader />;
  }

  return (
    <>
      <AuthLoader />
      <Logout
        environment={environmentType}
        clientName={clientName}
        onLogout={handleLogout}
      />
    </>
  );
}

export default LogoutPage;
