/**
 * Error Handling Utilities
 * Comprehensive error code handling for authentication
 */

import { AuthenticationErrorCodes, AuthenticationErrorMessages, AuthenticationV2ErrorMessages } from '../types/contracts';

export interface ErrorResponse {
  error?: any;
  error_description?: string;
  Message?: string;
}

/**
 * Extract error code from HTTP error response
 * Matches Angular checkIfErrorCodeRetured logic
 */
export function checkIfErrorCodeReturned(error: any): string | null {
  try {
    let error_text: any = JSON.stringify(error.error || error);
    if (error_text && error_text.length > 0) {
      error_text = JSON.parse(error_text);
      const error_description = error_text.error_description || error_text.Message;
      if (error_description && error_description.length > 0) {
        const error_code = error_description.substring(0, error_description.indexOf('|'));
        if (error_code && error_code.length > 5 && error_code.substring(0, 5) === 'ZMAUT') {
          return error_code;
        }
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Extract error code from Google login error response
 * Matches Angular checkIfErrorCodeReturedFromGoogle logic
 */
export function checkIfErrorCodeReturnedFromGoogle(error: any): string | null {
  try {
    let error_text: any = JSON.stringify(error.error || error);
    if (error_text && error_text.length > 0) {
      error_text = JSON.parse(error_text);
      const error_msg = error_text.error || error_text.Message;
      if (error_msg && error_msg.length > 0) {
        const error_code = error_msg.substring(0, error_msg.indexOf('|'));
        if (error_code && error_code.length > 5 && error_code.substring(0, 5) === 'ZMAUT') {
          return error_code;
        }
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Get error message for error code (V1)
 */
export function getErrorMessage(errorCode: string | null): string {
  if (!errorCode) {
    return 'Something went wrong, try again.';
  }
  return AuthenticationErrorMessages[errorCode as keyof typeof AuthenticationErrorMessages] || 'Something went wrong, try again.';
}

/**
 * Get error message for error code (V2)
 */
export function getV2ErrorMessage(errorCode: string | null): string {
  if (!errorCode) {
    return 'Something went wrong, try again.';
  }
  return AuthenticationV2ErrorMessages[errorCode as keyof typeof AuthenticationV2ErrorMessages] || 'Something went wrong, try again.';
}

/**
 * Check if error code requires special handling
 */
export interface ErrorCodeAction {
  code: string;
  action: 'show_email_options' | 'show_pan_form' | 'convert_to_login' | 'fallback_to_otp' | 'show_toast' | 'show_error' | 'retry_otp';
  message?: string;
}

export function getErrorCodeAction(errorCode: string | null): ErrorCodeAction | null {
  if (!errorCode) {
    return null;
  }

  switch (errorCode) {
    case AuthenticationErrorCodes.ZMAUT02:
      return { code: errorCode, action: 'show_error', message: 'Incorrect OTP. Please enter the verification code again.' };
    
    case AuthenticationErrorCodes.ZMAUT06:
      return { code: errorCode, action: 'show_email_options' };
    
    case AuthenticationErrorCodes.ZMAUT08:
      return { code: errorCode, action: 'show_error', message: getV2ErrorMessage(errorCode) };
    
    case AuthenticationErrorCodes.ZMAUT09:
      return { code: errorCode, action: 'show_error', message: getV2ErrorMessage(errorCode) };
    
    case AuthenticationErrorCodes.ZMAUT10:
      return { code: errorCode, action: 'show_email_options' };
    
    case AuthenticationErrorCodes.ZMAUT16:
      return { code: errorCode, action: 'fallback_to_otp', message: getErrorMessage(errorCode) };
    
    case AuthenticationErrorCodes.ZMAUT17:
      return { code: errorCode, action: 'show_error', message: getV2ErrorMessage(errorCode) };
    
    case AuthenticationErrorCodes.ZMAUT18:
      return { code: errorCode, action: 'convert_to_login' };
    
    case AuthenticationErrorCodes.ZMAUT23:
      return { code: errorCode, action: 'show_email_options' };
    
    case AuthenticationErrorCodes.ZMAUT25:
      return { code: errorCode, action: 'show_error', message: 'Email ID belongs to another user' };
    
    case AuthenticationErrorCodes.ZMAUT28:
      return { code: errorCode, action: 'show_email_options' };
    
    case AuthenticationErrorCodes.ZMAUT30:
      return { code: errorCode, action: 'show_pan_form', message: getV2ErrorMessage(errorCode) };
    
    default:
      return { code: errorCode, action: 'show_error', message: getV2ErrorMessage(errorCode) };
  }
}

/**
 * Check if error requires OTP retry with custom message
 */
export function shouldShowRetryMessage(errorCode: string | null, retryAttempts: number): boolean {
  return errorCode === AuthenticationErrorCodes.ZMAUT02 && retryAttempts >= 3;
}

/**
 * Get retry error message
 */
export function getRetryErrorMessage(): string {
  return 'Incorrect OTP. Please enter the verification code again.';
}
