/**
 * RedirectComponent
 * 
 * @deprecated This component is deprecated. Use react-router-dom routes instead:
 * - LoginPage: For phone login/signup flow (routes: /, /email)
 * - ForgotPasswordPage: For password reset (route: /forgot-password)
 * - LogoutPage: For logout with countdown (route: /logout)
 * - FinoramicCallbackPage: For OAuth callback (route: /authentication/finoramic-callback)
 * 
 * This component is kept for backward compatibility and will be removed in a future version.
 * It now acts as a router-based redirect based on props.
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { SESSION_STORAGE_KEYS } from '../../../utils/sessionStorage';
import { AuthLoader } from '../../common';
import type { Token, EventDetails } from '../../../types/contracts';
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

/**
 * @deprecated Use react-router-dom routes instead.
 * This component redirects to the appropriate route based on props.
 */
export const RedirectComponent: React.FC<RedirectComponentProps> = ({
  isLogout = false,
  resetPasswordToken,
  getEnvironmentConfig,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!getEnvironmentConfig) return;

    const environmentType = import.meta.env.VITE_ENVIRONMENT ?? 'Local';
    const envConfig = getEnvironmentConfig(environmentType);
    const { finoramicCallback = ROUTES.FINORAMIC_CALLBACK } = envConfig || {};

    // Determine which route to navigate to based on props and current location
    if (isLogout) {
      // Redirect to logout page
      navigate(ROUTES.LOGOUT, { replace: true });
    } else if (resetPasswordToken && resetPasswordToken.length > 0) {
      // Redirect to forgot password page with token
      navigate(`${ROUTES.FORGOT_PASSWORD}?token=${resetPasswordToken}`, { replace: true });
    } else if (location.pathname === finoramicCallback && sessionStorage.getItem(SESSION_STORAGE_KEYS.AUTHENTICATION)) {
      // Already on Finoramic callback route, let router handle it
      // No redirect needed - the route will handle it
    } else if (location.pathname === ROUTES.EMAIL) {
      // Already on email route, let router handle it
      // No redirect needed
    } else {
      // Default: show login page (already handled by router for root route)
      if (location.pathname !== ROUTES.ROOT) {
        navigate(ROUTES.ROOT, { replace: true });
      }
    }
  }, [navigate, location.pathname, isLogout, resetPasswordToken, getEnvironmentConfig]);

  // Show loader while redirecting
  return <AuthLoader />;
};

export default RedirectComponent;
