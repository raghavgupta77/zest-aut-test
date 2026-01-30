/**
 * AuthPage
 * 
 * @deprecated This component is deprecated in favor of direct route components.
 * Use the following routes instead:
 * - LoginPage: / and /email
 * - ForgotPasswordPage: /forgot-password
 * - LogoutPage: /logout
 * - FinoramicCallbackPage: /authentication/finoramic-callback
 * 
 * This file is kept for backward compatibility and re-exports LoginPage.
 */

import { LoginPage } from "./LoginPage";

export function AuthPage() {
  return <LoginPage />;
}
