/**
 * Session Storage Utilities
 * React replacements for Angular session storage management
 */

/**
 * Session storage keys (matching Angular ngx-webstorage format)
 */
export const SESSION_STORAGE_KEYS = {
  SIGN_UP: 'ngx-webstorage|zest-sign-up',
  CONTACT: 'ngx-webstorage|zest-contact',
  RESTRUCTURING_LA: 'ngx-webstorage|zest-restructuring-la'
} as const;

/**
 * Set sign-up flag in session storage
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
