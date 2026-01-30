/**
 * Authentication error codes and messages
 */

// Authentication error codes
export const AUTH_ERROR_CODES = {
  // General authentication errors
  INVALID_CREDENTIALS: 'AUTH_001',
  ACCOUNT_LOCKED: 'AUTH_002',
  ACCOUNT_DISABLED: 'AUTH_003',
  SESSION_EXPIRED: 'AUTH_004',
  TOKEN_INVALID: 'AUTH_005',
  TOKEN_EXPIRED: 'AUTH_006',
  REFRESH_TOKEN_INVALID: 'AUTH_007',
  
  // OTP-related errors
  OTP_INVALID: 'OTP_001',
  OTP_EXPIRED: 'OTP_002',
  OTP_ATTEMPTS_EXCEEDED: 'OTP_003',
  OTP_GENERATION_FAILED: 'OTP_004',
  OTP_SEND_FAILED: 'OTP_005',
  
  // Phone number errors
  PHONE_INVALID_FORMAT: 'PHONE_001',
  PHONE_NOT_SUPPORTED: 'PHONE_002',
  PHONE_ALREADY_EXISTS: 'PHONE_003',
  
  // Email errors
  EMAIL_INVALID_FORMAT: 'EMAIL_001',
  EMAIL_ALREADY_EXISTS: 'EMAIL_002',
  EMAIL_NOT_VERIFIED: 'EMAIL_003',
  
  // Password errors
  PASSWORD_TOO_WEAK: 'PWD_001',
  PASSWORD_INCORRECT: 'PWD_002',
  PASSWORD_EXPIRED: 'PWD_003',
  
  // Third-party authentication errors
  GOOGLE_AUTH_FAILED: 'GOOGLE_001',
  GOOGLE_TOKEN_INVALID: 'GOOGLE_002',
  TRUECALLER_AUTH_FAILED: 'TRUECALLER_001',
  TRUECALLER_PROFILE_INVALID: 'TRUECALLER_002',
  FINORAMIC_AUTH_FAILED: 'FINORAMIC_001',
  FINORAMIC_TOKEN_INVALID: 'FINORAMIC_002',
  
  // Network and system errors
  NETWORK_ERROR: 'NET_001',
  SERVER_ERROR: 'SYS_001',
  SERVICE_UNAVAILABLE: 'SYS_002',
  TIMEOUT_ERROR: 'NET_002',
  
  // Rate limiting errors
  RATE_LIMIT_EXCEEDED: 'RATE_001',
  TOO_MANY_ATTEMPTS: 'RATE_002',
  
  // Security errors
  CSRF_TOKEN_INVALID: 'SEC_001',
  XSS_ATTEMPT_DETECTED: 'SEC_002',
  INJECTION_ATTEMPT_DETECTED: 'SEC_003',
  
  // Validation errors
  REQUIRED_FIELD_MISSING: 'VAL_001',
  INVALID_INPUT_FORMAT: 'VAL_002',
  INPUT_TOO_LONG: 'VAL_003',
  INPUT_TOO_SHORT: 'VAL_004'
} as const;

// Error messages mapping
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // General authentication errors
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [AUTH_ERROR_CODES.ACCOUNT_LOCKED]: 'Your account has been temporarily locked due to multiple failed attempts. Please try again later.',
  [AUTH_ERROR_CODES.ACCOUNT_DISABLED]: 'Your account has been disabled. Please contact support for assistance.',
  [AUTH_ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [AUTH_ERROR_CODES.TOKEN_INVALID]: 'Authentication token is invalid. Please log in again.',
  [AUTH_ERROR_CODES.TOKEN_EXPIRED]: 'Authentication token has expired. Please log in again.',
  [AUTH_ERROR_CODES.REFRESH_TOKEN_INVALID]: 'Session refresh failed. Please log in again.',
  
  // OTP-related errors
  [AUTH_ERROR_CODES.OTP_INVALID]: 'Invalid OTP. Please check the code and try again.',
  [AUTH_ERROR_CODES.OTP_EXPIRED]: 'OTP has expired. Please request a new code.',
  [AUTH_ERROR_CODES.OTP_ATTEMPTS_EXCEEDED]: 'Too many incorrect OTP attempts. Please request a new code.',
  [AUTH_ERROR_CODES.OTP_GENERATION_FAILED]: 'Failed to generate OTP. Please try again.',
  [AUTH_ERROR_CODES.OTP_SEND_FAILED]: 'Failed to send OTP. Please check your phone number and try again.',
  
  // Phone number errors
  [AUTH_ERROR_CODES.PHONE_INVALID_FORMAT]: 'Please enter a valid phone number.',
  [AUTH_ERROR_CODES.PHONE_NOT_SUPPORTED]: 'Phone number from this region is not supported.',
  [AUTH_ERROR_CODES.PHONE_ALREADY_EXISTS]: 'An account with this phone number already exists.',
  
  // Email errors
  [AUTH_ERROR_CODES.EMAIL_INVALID_FORMAT]: 'Please enter a valid email address.',
  [AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS]: 'An account with this email already exists.',
  [AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED]: 'Please verify your email address before proceeding.',
  
  // Password errors
  [AUTH_ERROR_CODES.PASSWORD_TOO_WEAK]: 'Password must be at least 8 characters with uppercase, lowercase, and numbers.',
  [AUTH_ERROR_CODES.PASSWORD_INCORRECT]: 'Incorrect password. Please try again.',
  [AUTH_ERROR_CODES.PASSWORD_EXPIRED]: 'Your password has expired. Please reset your password.',
  
  // Third-party authentication errors
  [AUTH_ERROR_CODES.GOOGLE_AUTH_FAILED]: 'Google authentication failed. Please try again.',
  [AUTH_ERROR_CODES.GOOGLE_TOKEN_INVALID]: 'Google authentication token is invalid. Please try again.',
  [AUTH_ERROR_CODES.TRUECALLER_AUTH_FAILED]: 'Truecaller authentication failed. Please try again.',
  [AUTH_ERROR_CODES.TRUECALLER_PROFILE_INVALID]: 'Unable to retrieve Truecaller profile. Please try again.',
  [AUTH_ERROR_CODES.FINORAMIC_AUTH_FAILED]: 'Finoramic authentication failed. Please try again.',
  [AUTH_ERROR_CODES.FINORAMIC_TOKEN_INVALID]: 'Finoramic authentication token is invalid. Please try again.',
  
  // Network and system errors
  [AUTH_ERROR_CODES.NETWORK_ERROR]: 'Network connection error. Please check your internet connection and try again.',
  [AUTH_ERROR_CODES.SERVER_ERROR]: 'Server error occurred. Please try again later.',
  [AUTH_ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
  [AUTH_ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  
  // Rate limiting errors
  [AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait before trying again.',
  [AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS]: 'Too many failed attempts. Please wait before trying again.',
  
  // Security errors
  [AUTH_ERROR_CODES.CSRF_TOKEN_INVALID]: 'Security token is invalid. Please refresh the page and try again.',
  [AUTH_ERROR_CODES.XSS_ATTEMPT_DETECTED]: 'Invalid input detected. Please check your input and try again.',
  [AUTH_ERROR_CODES.INJECTION_ATTEMPT_DETECTED]: 'Invalid input detected. Please check your input and try again.',
  
  // Validation errors
  [AUTH_ERROR_CODES.REQUIRED_FIELD_MISSING]: 'This field is required.',
  [AUTH_ERROR_CODES.INVALID_INPUT_FORMAT]: 'Invalid input format. Please check your input.',
  [AUTH_ERROR_CODES.INPUT_TOO_LONG]: 'Input is too long. Please shorten your input.',
  [AUTH_ERROR_CODES.INPUT_TOO_SHORT]: 'Input is too short. Please provide more characters.'
};

// User-friendly error categories for UI display
export const ERROR_CATEGORIES = {
  AUTHENTICATION: 'Authentication Error',
  VALIDATION: 'Input Validation Error',
  NETWORK: 'Connection Error',
  THIRD_PARTY: 'Third-Party Service Error',
  SYSTEM: 'System Error',
  RATE_LIMIT: 'Rate Limit Error',
  SECURITY: 'Security Error'
} as const;

// Retry configuration for different error types
export const RETRY_CONFIG = {
  [AUTH_ERROR_CODES.NETWORK_ERROR]: { maxRetries: 3, delay: 1000, exponentialBackoff: true },
  [AUTH_ERROR_CODES.TIMEOUT_ERROR]: { maxRetries: 2, delay: 2000, exponentialBackoff: true },
  [AUTH_ERROR_CODES.SERVER_ERROR]: { maxRetries: 2, delay: 5000, exponentialBackoff: true },
  [AUTH_ERROR_CODES.SERVICE_UNAVAILABLE]: { maxRetries: 1, delay: 10000, exponentialBackoff: false },
  [AUTH_ERROR_CODES.OTP_GENERATION_FAILED]: { maxRetries: 2, delay: 3000, exponentialBackoff: false },
  [AUTH_ERROR_CODES.OTP_SEND_FAILED]: { maxRetries: 2, delay: 5000, exponentialBackoff: false }
} as const;