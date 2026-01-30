/**
 * ForgotPassword Component
 * Exact React replacement for Angular ForgotPasswordComponent
 * Handles password reset flow
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GtHeader, GtInput, GtButton } from '../../groot';
import { AuthenticationServiceExtended } from '../../../services/authenticationServiceExtended';
import { Authentication, AuthenticationErrorMessages } from '../../../types/contracts';
import './index.css';

export interface ForgotPasswordProps {
  environment?: string;
  clientName?: string;
  resetPasswordToken?: string;
  onShowResetPassword?: () => void;
  onShowLoginWithOtp?: () => void;
  onShowSignupWithOtp?: () => void;
  authService?: AuthenticationServiceExtended;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  environment = 'Local',
  clientName: _clientName,
  resetPasswordToken,
  onShowResetPassword: _onShowResetPassword,
  onShowLoginWithOtp,
  onShowSignupWithOtp: _onShowSignupWithOtp,
  authService
}) => {
  const [authentication, setAuthentication] = useState<Authentication>(new Authentication());
  const [showResetPasswordForm, setShowResetPasswordForm] = useState<boolean>(true);
  const [showSetNewPasswordForm, setShowSetNewPasswordForm] = useState<boolean>(false);
  const [passwordChangeSuccessful, setPasswordChangeSuccessful] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showResetPasswordFailed, setShowResetPasswordFailed] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('There is no user registered with this email');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Check if reset password token exists
  useEffect(() => {
    if (resetPasswordToken && resetPasswordToken.length > 0) {
      setShowSetNewPasswordForm(true);
      setShowResetPasswordForm(false);
      setPasswordChangeSuccessful(false);
    }
  }, [resetPasswordToken]);

  // Send forgot password email
  const sendForgotPasswordEmail = useCallback(async () => {
    if (!authService) return;

    setShowError(false);
    setIsLoading(true);

    try {
      await authService.sendForgotPasswordEmail(environment, authentication);
      setIsLoading(false);
      setShowSetNewPasswordForm(false);
      setShowResetPasswordForm(false);
      setPasswordChangeSuccessful(true);
    } catch (error: any) {
      setShowError(true);
      const errorCode = checkIfErrorCodeRetured(error);
      if (errorCode && AuthenticationErrorMessages[errorCode as keyof typeof AuthenticationErrorMessages]) {
        setErrorMessage(AuthenticationErrorMessages[errorCode as keyof typeof AuthenticationErrorMessages]);
      }
      setIsLoading(false);
    }
  }, [authService, environment, authentication]);

  // Check error code
  const checkIfErrorCodeRetured = (error: any): string | null => {
    if (error?.error?.error) {
      return error.error.error;
    }
    if (error?.error) {
      return error.error;
    }
    return null;
  };

  // Handle email change
  const handleEmailChange = useCallback((value: string) => {
    setAuthentication(prev => ({ ...prev, Email: value }));
    setEmailError(null);
  }, []);

  // Check email error
  const checkEmailError = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email ID');
    } else {
      setEmailError(null);
    }
  }, []);

  // Show login screen
  const showLoginScreen = useCallback(() => {
    window.history.replaceState({}, '', '/authentication');
    onShowLoginWithOtp?.();
  }, [onShowLoginWithOtp]);

  return (
    <div className="forgot-password-container">
      {showResetPasswordForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendForgotPasswordEmail();
          }}
          className="forgot-password-form"
        >
          <div className="header-groot">
            <GtHeader
              headerTitle="Forgot Password?"
              subtitle="Enter your email address and we'll send you a link to reset your password"
            />
          </div>

          <div className="horizontal-rule"></div>

          <div className="email-container">
            <GtInput
              id="email"
              label="Email ID"
              name="email"
              appearance="block"
              value={authentication.Email}
              valueChange={handleEmailChange}
              grootBlur={checkEmailError}
              type="email"
              errMsg={emailError || undefined}
              removeRef={true}
            />
          </div>

          {showError && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          <GtButton
            appearance="primary"
            bold={true}
            size="block"
            type="submit"
            disabled={isLoading || !authentication.Email || !!emailError}
            textContent={isLoading ? 'Sending...' : 'Send Reset Link'}
          />

          <div className="footer-links">
            <a onClick={showLoginScreen} className="back-to-login">
              Back to Login
            </a>
          </div>
        </form>
      )}

      {showSetNewPasswordForm && (
        <div className="set-new-password-form">
          <p>Set new password form (to be implemented)</p>
        </div>
      )}

      {passwordChangeSuccessful && (
        <div className="success-message">
          <GtHeader
            headerTitle="Check your email"
            subtitle="We've sent a password reset link to your email address"
          />
          <GtButton
            appearance="primary"
            bold={true}
            size="block"
            textContent="Back to Login"
            grootClick={showLoginScreen}
          />
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
