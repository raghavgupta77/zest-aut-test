/**
 * Error-related types and interfaces
 */

// Base authentication error interface
export interface AuthError {
  code: string;
  message: string;
  field?: string;
  retryable: boolean;
  timestamp?: Date;
  context?: Record<string, unknown>;
  type?: string; // Error type classification
}


// Error types enumeration
export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  THIRD_PARTY = 'THIRD_PARTY',
  SYSTEM = 'SYSTEM',
  RATE_LIMIT = 'RATE_LIMIT',
  SECURITY = 'SECURITY'
}

// Input validation types
export enum InputType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  PASSWORD = 'PASSWORD',
  OTP = 'OTP',
  NAME = 'NAME',
  GENERAL_TEXT = 'GENERAL_TEXT'
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedValue?: string;
}

// Error context for logging and debugging
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  timestamp: Date;
  url?: string;
  action?: string;
  additionalData?: Record<string, unknown>;
}

// Recovery action interface
export interface RecoveryAction {
  type: 'retry' | 'redirect' | 'refresh' | 'contact_support' | 'manual_action';
  label: string;
  description?: string;
  action: () => void | Promise<void>;
}

// Network error specific interface
export interface NetworkError extends AuthError {
  statusCode?: number;
  status?: number; // Alias for compatibility
  responseBody?: string;
  requestId?: string;
}

// Third-party service error interface
export interface ThirdPartyError extends AuthError {
  service: 'google' | 'truecaller' | 'finoramic' | 'analytics';
  externalCode?: string;
  externalMessage?: string;
}

// Validation error from API responses
export interface ValidationError {
  field: string;
  code: string;
  message: string;
}