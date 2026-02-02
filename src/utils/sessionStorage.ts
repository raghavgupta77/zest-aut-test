/**
 * Session Storage Utilities
 * React replacements for Angular session storage management
 * Matches Angular's ngx-webstorage patterns exactly
 */

import type { AuthTokenResponse } from '../types/auth';
import { AUTHENTICATION_SESSION_STORAGE_KEY } from './helpers';
import type { AuthenticationSessionStorageProperties } from './helpers';
import { decryptToken, encryptToken } from './tokenEncryption';

/**
 * Session storage keys (matching Angular ngx-webstorage format exactly)
 */
export const SESSION_STORAGE_KEYS = {
  SIGN_UP: 'ngx-webstorage|zest-sign-up',
  CONTACT: 'ngx-webstorage|zest-contact',
  RESTRUCTURING_LA: 'ngx-webstorage|zest-restructuring-la',
  PARAMS: 'ngx-webstorage|zest-params',
  CHECKOUT_PARAMS: 'ngx-webstorage|zest-checkout-params',
  AUTHENTICATION: AUTHENTICATION_SESSION_STORAGE_KEY, // 'ngx-webstorage|zest-authentication'
  ZEST: 'ngx-webstorage|zest', // Auth token after login
} as const;

/**
 * Set sign-up flag in session storage
 * Matching Angular: window.sessionStorage.setItem('ngx-webstorage|zest-sign-up', 'true');
 */
export function setSignUpFlag(value: boolean = true): void {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEYS.SIGN_UP, value.toString());
  } catch (e) {
    console.warn('Failed to set sign-up flag in session storage:', e);
  }
}

/**
 * Get sign-up flag from session storage
 */
export function getSignUpFlag(): boolean {
  try {
    const value = window.sessionStorage.getItem(SESSION_STORAGE_KEYS.SIGN_UP);
    return value === 'true';
  } catch (e) {
    console.warn('Failed to get sign-up flag from session storage:', e);
    return false;
  }
}

/**
 * Set contact number in session storage
 * Matching Angular: window.sessionStorage.setItem('ngx-webstorage|zest-contact', this.authentication.MobileNumber);
 */
export function setContactNumber(mobileNumber: string): void {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEYS.CONTACT, mobileNumber);
  } catch (e) {
    console.warn('Failed to set contact number in session storage:', e);
  }
}

/**
 * Get contact number from session storage
 */
export function getContactNumber(): string | null {
  try {
    return window.sessionStorage.getItem(SESSION_STORAGE_KEYS.CONTACT);
  } catch (e) {
    console.warn('Failed to get contact number from session storage:', e);
    return null;
  }
}

/**
 * Check if restructuring loan application exists in session storage
 * Used for auto-signin customer detection
 * Matching Angular: window.sessionStorage.getItem('ngx-webstorage|zest-restructuring-la')
 */
export function hasRestructuringLoanApplication(): boolean {
  try {
    const value = window.sessionStorage.getItem(SESSION_STORAGE_KEYS.RESTRUCTURING_LA);
    return value !== null && value.length > 0;
  } catch (e) {
    console.warn('Failed to check restructuring loan application in session storage:', e);
    return false;
  }
}

/**
 * Set restructuring loan application ID in session storage
 */
export function setRestructuringLoanApplication(loanApplicationId: string): void {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEYS.RESTRUCTURING_LA, loanApplicationId);
  } catch (e) {
    console.warn('Failed to set restructuring loan application in session storage:', e);
  }
}

/**
 * Get params from session storage
 * Matching Angular: window.sessionStorage.getItem('ngx-webstorage|zest-params');
 */
export function getParams(): string | null {
  try {
    return window.sessionStorage.getItem(SESSION_STORAGE_KEYS.PARAMS);
  } catch (e) {
    console.warn('Failed to get params from session storage:', e);
    return null;
  }
}

/**
 * Set params in session storage
 */
export function setParams(params: string): void {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEYS.PARAMS, params);
  } catch (e) {
    console.warn('Failed to set params in session storage:', e);
  }
}

/**
 * Get checkout params from session storage
 * Matching Angular: window.sessionStorage.getItem('ngx-webstorage|zest-checkout-params');
 */
export function getCheckoutParams(): any | null {
  try {
    const checkoutParams = window.sessionStorage.getItem(SESSION_STORAGE_KEYS.CHECKOUT_PARAMS);
    return checkoutParams ? JSON.parse(checkoutParams) : null;
  } catch (e) {
    console.warn('Failed to get checkout params from session storage:', e);
    return null;
  }
}

/**
 * Set checkout params in session storage
 */
export function setCheckoutParams(params: any): void {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEYS.CHECKOUT_PARAMS, JSON.stringify(params));
  } catch (e) {
    console.warn('Failed to set checkout params in session storage:', e);
  }
}

/**
 * Set auth token in session storage (after login)
 * Key: ngx-webstorage|zest - store on submission when token API succeeds (login screen, email screen)
 */
export const setZestToken = async (token: object): Promise<void> => {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEYS.ZEST, JSON.stringify(token));
    const tokenObj = token as AuthTokenResponse;
    console.log('token', token)
    const tokenURL = `access_token=${tokenObj.access_token}&token_type=${tokenObj.token_type}&expires_in=${tokenObj.expires_in}`

    const encryptedToken = await encryptToken(tokenURL, 'secret');
    console.log('encryptedToken', encryptedToken);
    const decryptedToken = await decryptToken(encryptedToken, 'secret');
    console.log('decryptedToken', decryptedToken);

    window.location.href = `http://localhost:4200/loggedinredirect?token=${encryptedToken}`;
   
  } catch (e) {
    console.warn('Failed to set zest token in session storage:', e);
  }
}

/**
 * Get auth token from session storage
 */
export function getZestToken(): string | null {
  try {
    return window.sessionStorage.getItem(SESSION_STORAGE_KEYS.ZEST);
  } catch (e) {
    console.warn('Failed to get zest token from session storage:', e);
    return null;
  }
}

/**
 * Get authentication session from storage
 * Matching Angular: sessionStorage.getItem(AUTHENTICATION_SESSION_STORAGE_KEY)
 */
export function getAuthenticationSession(): AuthenticationSessionStorageProperties | null {
  try {
    const authSessionString = window.sessionStorage.getItem(SESSION_STORAGE_KEYS.AUTHENTICATION);
    if (!authSessionString) {
      return null;
    }
    return JSON.parse(authSessionString);
  } catch (e) {
    console.warn('Failed to get authentication session from storage:', e);
    return null;
  }
}

/**
 * Set authentication session in storage
 * Matching Angular: sessionStorage.setItem(AUTHENTICATION_SESSION_STORAGE_KEY, JSON.stringify(authSessionObject));
 */
export function setAuthenticationSession(authSession: AuthenticationSessionStorageProperties): void {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEYS.AUTHENTICATION, JSON.stringify(authSession));
  } catch (e) {
    console.warn('Failed to set authentication session in storage:', e);
  }
}

/**
 * Remove authentication session from storage
 * Matching Angular: sessionStorage.removeItem(AUTHENTICATION_SESSION_STORAGE_KEY)
 */
export function removeAuthenticationSession(): void {
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEYS.AUTHENTICATION);
  } catch (e) {
    console.warn('Failed to remove authentication session from storage:', e);
  }
}

/**
 * Clear all authentication-related session storage
 */
export function clearAuthSessionStorage(): void {
  try {
    Object.values(SESSION_STORAGE_KEYS).forEach(key => {
      window.sessionStorage.removeItem(key);
    });
  } catch (e) {
    console.warn('Failed to clear auth session storage:', e);
  }
}

/**
 * Initialize session storage with default values
 * Matching Angular's ngOnInit in RedirectComponent:
 * window.sessionStorage.setItem('ngx-webstorage|zest-sign-up', 'false');
 */
export function initializeSessionStorage(): void {
  try {
    // Set default sign-up flag to false (matching Angular)
    window.sessionStorage.setItem(SESSION_STORAGE_KEYS.SIGN_UP, 'false');
  } catch (e) {
    console.warn('Failed to initialize session storage:', e);
  }
}
