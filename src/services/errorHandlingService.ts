/**
 * Error Handling and Recovery Service
 * 
 * Comprehensive error handling system that provides:
 * - Error classification and categorization
 * - User-friendly error message system
 * - Error-specific guidance and recovery actions
 * - Retry mechanisms for transient failures
 * - Detailed error logging for debugging
 * - Edge case handling for network timeouts and server errors
 */

import { 
  ErrorType
} from '../types/errors';
import type { 
  AuthError, 
  ErrorContext, 
  RecoveryAction, 
  NetworkError, 
  ThirdPartyError,
  ValidationError 
} from '../types/errors';
import { 
  AUTH_ERROR_CODES, 
  AUTH_ERROR_MESSAGES, 
  ERROR_CATEGORIES, 
  RETRY_CONFIG 
} from '../constants/errors';

export interface RetryConfig {
  maxRetries: number;
  delay: number;
  exponentialBackoff: boolean;
  backoffMultiplier?: number;
}

export interface ErrorHandlingConfig {
  enableLogging: boolean;
  enableRetry: boolean;
  enableRecoveryActions: boolean;
  logEndpoint?: string;
  maxLogRetries?: number;
}

export class ErrorHandlingService {
  private config: ErrorHandlingConfig;
  private retryAttempts: Map<string, number> = new Map();
  private circuitBreakers: Map<string, { failures: number; lastFailure: Date; isOpen: boolean }> = new Map();

  constructor(config: ErrorHandlingConfig) {
    this.config = {
      maxLogRetries: 3,
      ...config
    };
  }

  /**
   * Classify error into appropriate category
   */
  classifyError(error: unknown): ErrorType {
    if (!error) return ErrorType.SYSTEM;

    // Handle string errors
    if (typeof error === 'string') {
      if (error.toLowerCase().includes('network') || error.toLowerCase().includes('connection')) {
        return ErrorType.NETWORK;
      }
      return ErrorType.SYSTEM;
    }

    // Handle Error objects
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
        return ErrorType.NETWORK;
      }
      
      if (message.includes('validation') || message.includes('invalid')) {
        return ErrorType.VALIDATION;
      }
      
      return ErrorType.SYSTEM;
    }

    // Handle AuthError objects
    if (this.isAuthError(error)) {
      const authError = error as AuthError;
      
      if (authError.type) {
        return authError.type as ErrorType;
      }

      // Classify based on error code
      const code = authError.code;
      
      if (code.startsWith('AUTH_') || code.startsWith('OTP_') || code.startsWith('PWD_')) {
        return ErrorType.AUTHENTICATION;
      }
      
      if (code.startsWith('PHONE_') || code.startsWith('EMAIL_') || code.startsWith('VAL_')) {
        return ErrorType.VALIDATION;
      }
      
      if (code.startsWith('NET_') || code.startsWith('TIMEOUT_')) {
        return ErrorType.NETWORK;
      }
      
      if (code.startsWith('GOOGLE_') || code.startsWith('TRUECALLER_') || code.startsWith('FINORAMIC_')) {
        return ErrorType.THIRD_PARTY;
      }
      
      if (code.startsWith('RATE_')) {
        return ErrorType.RATE_LIMIT;
      }
      
      if (code.startsWith('SEC_')) {
        return ErrorType.SECURITY;
      }
    }

    // Handle network-specific errors
    if (this.isNetworkError(error)) {
      return ErrorType.NETWORK;
    }

    // Handle third-party errors
    if (this.isThirdPartyError(error)) {
      return ErrorType.THIRD_PARTY;
    }

    return ErrorType.SYSTEM;
  }

  /**
   * Check if error can be recovered from
   */
  canRecover(error: AuthError): boolean {
    const errorType = this.classifyError(error);
    
    // Check if error is explicitly marked as retryable
    if (error.retryable !== undefined) {
      return error.retryable;
    }

    // Default recovery rules based on error type
    switch (errorType) {
      case ErrorType.NETWORK:
        return true; // Network errors are usually transient
      case ErrorType.RATE_LIMIT:
        return true; // Rate limits are temporary
      case ErrorType.SYSTEM:
        return true; // Some system errors might be transient
      case ErrorType.THIRD_PARTY:
        return true; // Third-party services might recover
      case ErrorType.AUTHENTICATION:
        return false; // Auth errors usually require user action
      case ErrorType.VALIDATION:
        return false; // Validation errors require input correction
      case ErrorType.SECURITY:
        return false; // Security errors should not be retried
      default:
        return false;
    }
  }

  /**
   * Attempt to recover from error
   */
  async recoverFromError(error: AuthError, context?: ErrorContext): Promise<void> {
    const errorType = this.classifyError(error);
    const retryConfig = this.getRetryConfig(error.code);
    
    if (!this.canRecover(error) || !retryConfig) {
      throw error;
    }

    // Check circuit breaker
    if (this.isCircuitBreakerOpen(error.code)) {
      throw this.createError(
        'CIRCUIT_BREAKER_OPEN',
        'Service is temporarily unavailable due to repeated failures',
        false,
        ErrorType.SYSTEM
      );
    }

    const attemptKey = `${error.code}_${context?.sessionId || 'default'}`;
    const currentAttempts = this.retryAttempts.get(attemptKey) || 0;

    if (currentAttempts >= retryConfig.maxRetries) {
      this.recordCircuitBreakerFailure(error.code);
      throw this.createError(
        'MAX_RETRIES_EXCEEDED',
        `Maximum retry attempts (${retryConfig.maxRetries}) exceeded`,
        false,
        ErrorType.SYSTEM
      );
    }

    // Calculate delay with exponential backoff
    const delay = retryConfig.exponentialBackoff
      ? retryConfig.delay * Math.pow(retryConfig.backoffMultiplier || 2, currentAttempts)
      : retryConfig.delay;

    // Wait before retry
    await this.delay(delay);

    // Increment retry count
    this.retryAttempts.set(attemptKey, currentAttempts + 1);

    // Log retry attempt
    if (this.config.enableLogging && context) {
      this.logError(error, {
        ...context,
        timestamp: context.timestamp || new Date(),
        action: 'retry_attempt',
        additionalData: {
          attempt: currentAttempts + 1,
          maxRetries: retryConfig.maxRetries,
          delay
        }
      });
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: AuthError): string {
    // Check if we have a predefined message
    if (AUTH_ERROR_MESSAGES[error.code]) {
      return AUTH_ERROR_MESSAGES[error.code];
    }

    // Fallback to error message or generic message
    if (error.message) {
      return error.message;
    }

    // Generic messages based on error type
    const errorType = this.classifyError(error);
    switch (errorType) {
      case ErrorType.AUTHENTICATION:
        return 'Authentication failed. Please check your credentials and try again.';
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorType.NETWORK:
        return 'Network error occurred. Please check your connection and try again.';
      case ErrorType.THIRD_PARTY:
        return 'External service error. Please try again later.';
      case ErrorType.RATE_LIMIT:
        return 'Too many requests. Please wait a moment before trying again.';
      case ErrorType.SECURITY:
        return 'Security error detected. Please refresh the page and try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Get recovery actions for error
   */
  getRecoveryActions(error: AuthError, context?: ErrorContext): RecoveryAction[] {
    if (!this.config.enableRecoveryActions) {
      return [];
    }

    const actions: RecoveryAction[] = [];
    const errorType = this.classifyError(error);

    // Add retry action if error is retryable
    if (this.canRecover(error)) {
      actions.push({
        type: 'retry',
        label: 'Try Again',
        description: 'Retry the operation',
        action: async () => {
          await this.recoverFromError(error, context);
        }
      });
    }

    // Add specific actions based on error type
    switch (errorType) {
      case ErrorType.NETWORK:
        actions.push({
          type: 'refresh',
          label: 'Refresh Page',
          description: 'Refresh the page to reset the connection',
          action: () => {
            window.location.reload();
          }
        });
        break;

      case ErrorType.AUTHENTICATION:
        if (error.code === AUTH_ERROR_CODES.SESSION_EXPIRED || error.code === AUTH_ERROR_CODES.TOKEN_EXPIRED) {
          actions.push({
            type: 'redirect',
            label: 'Login Again',
            description: 'Redirect to login page',
            action: () => {
              // This would be handled by the auth context
              window.location.href = '/login';
            }
          });
        }
        break;

      case ErrorType.RATE_LIMIT:
        actions.push({
          type: 'manual_action',
          label: 'Wait and Retry',
          description: 'Wait for the rate limit to reset',
          action: async () => {
            await this.delay(60000); // Wait 1 minute
          }
        });
        break;

      case ErrorType.SYSTEM:
        actions.push({
          type: 'contact_support',
          label: 'Contact Support',
          description: 'Get help from our support team',
          action: () => {
            // This would open support chat or email
            window.open('mailto:support@example.com', '_blank');
          }
        });
        break;
    }

    return actions;
  }

  /**
   * Log error with context
   */
  logError(error: AuthError, context?: ErrorContext): void {
    if (!this.config.enableLogging) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        code: error.code,
        message: error.message,
        type: this.classifyError(error),
        retryable: error.retryable,
        field: error.field
      },
      context: {
        userId: context?.userId,
        sessionId: context?.sessionId,
        userAgent: context?.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
        url: context?.url || (typeof window !== 'undefined' ? window.location.href : undefined),
        action: context?.action,
        timestamp: context?.timestamp || new Date(),
        additionalData: context?.additionalData
      },
      severity: this.getErrorSeverity(error),
      category: ERROR_CATEGORIES[this.classifyError(error) as keyof typeof ERROR_CATEGORIES] || 'Unknown'
    };

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', logEntry);
    }

    // Send to logging endpoint if configured
    if (this.config.logEndpoint) {
      this.sendToLoggingEndpoint(logEntry).catch(logError => {
        console.error('Failed to send error log:', logError);
      });
    }
  }

  /**
   * Handle edge cases like network timeouts and server errors
   */
  handleEdgeCase(error: unknown, context?: ErrorContext): AuthError {
    // Handle fetch timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return this.createError(
        AUTH_ERROR_CODES.TIMEOUT_ERROR,
        'Request timed out. Please try again.',
        true,
        ErrorType.NETWORK,
        context
      );
    }

    // Handle network connection errors
    if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      return this.createError(
        AUTH_ERROR_CODES.NETWORK_ERROR,
        'Network connection failed. Please check your internet connection.',
        true,
        ErrorType.NETWORK,
        context
      );
    }

    // Handle server errors (5xx)
    if (this.isNetworkError(error) && (error as NetworkError).statusCode && (error as NetworkError).statusCode! >= 500) {
      return this.createError(
        AUTH_ERROR_CODES.SERVER_ERROR,
        'Server error occurred. Please try again later.',
        true,
        ErrorType.SYSTEM,
        context
      );
    }

    // Handle service unavailable
    if (this.isNetworkError(error) && (error as NetworkError).statusCode === 503) {
      return this.createError(
        AUTH_ERROR_CODES.SERVICE_UNAVAILABLE,
        'Service is temporarily unavailable. Please try again later.',
        true,
        ErrorType.SYSTEM,
        context
      );
    }

    // Handle unknown errors
    if (error instanceof Error) {
      return this.createError(
        'UNKNOWN_ERROR',
        error.message || 'An unexpected error occurred',
        false,
        ErrorType.SYSTEM,
        context
      );
    }

    // Handle string errors
    if (typeof error === 'string') {
      return this.createError(
        'UNKNOWN_ERROR',
        error,
        false,
        ErrorType.SYSTEM,
        context
      );
    }

    // Default unknown error
    return this.createError(
      'UNKNOWN_ERROR',
      'An unexpected error occurred',
      false,
      ErrorType.SYSTEM,
      context
    );
  }

  /**
   * Clear retry attempts for successful operations
   */
  clearRetryAttempts(key: string): void {
    this.retryAttempts.delete(key);
  }

  /**
   * Reset circuit breaker for a service
   */
  resetCircuitBreaker(serviceKey: string): void {
    this.circuitBreakers.delete(serviceKey);
  }

  // Private helper methods

  private isAuthError(error: unknown): error is AuthError {
    return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
  }

  private isNetworkError(error: unknown): error is NetworkError {
    return this.isAuthError(error) && ('statusCode' in error || 'status' in error);
  }

  private isThirdPartyError(error: unknown): error is ThirdPartyError {
    return this.isAuthError(error) && 'service' in error;
  }

  private getRetryConfig(errorCode: string): RetryConfig | null {
    const config = RETRY_CONFIG[errorCode as keyof typeof RETRY_CONFIG];
    if (config) {
      return {
        ...config,
        backoffMultiplier: 2
      };
    }

    // Default retry config for retryable errors
    return {
      maxRetries: 2,
      delay: 1000,
      exponentialBackoff: true,
      backoffMultiplier: 2
    };
  }

  private isCircuitBreakerOpen(serviceKey: string): boolean {
    const breaker = this.circuitBreakers.get(serviceKey);
    if (!breaker) return false;

    // Circuit breaker is open if there are too many failures recently
    const now = new Date();
    const timeSinceLastFailure = now.getTime() - breaker.lastFailure.getTime();
    const cooldownPeriod = 60000; // 1 minute

    if (breaker.failures >= 5 && timeSinceLastFailure < cooldownPeriod) {
      return true;
    }

    // Reset circuit breaker if cooldown period has passed
    if (timeSinceLastFailure >= cooldownPeriod) {
      this.circuitBreakers.delete(serviceKey);
    }

    return false;
  }

  private recordCircuitBreakerFailure(serviceKey: string): void {
    const breaker = this.circuitBreakers.get(serviceKey) || { failures: 0, lastFailure: new Date(), isOpen: false };
    breaker.failures++;
    breaker.lastFailure = new Date();
    breaker.isOpen = breaker.failures >= 5;
    this.circuitBreakers.set(serviceKey, breaker);
  }

  private getErrorSeverity(error: AuthError): 'low' | 'medium' | 'high' | 'critical' {
    const errorType = this.classifyError(error);
    
    switch (errorType) {
      case ErrorType.SECURITY:
        return 'critical';
      case ErrorType.AUTHENTICATION:
        return 'high';
      case ErrorType.SYSTEM:
        return 'high';
      case ErrorType.THIRD_PARTY:
        return 'medium';
      case ErrorType.NETWORK:
        return 'medium';
      case ErrorType.RATE_LIMIT:
        return 'low';
      case ErrorType.VALIDATION:
        return 'low';
      default:
        return 'medium';
    }
  }

  private async sendToLoggingEndpoint(logEntry: any): Promise<void> {
    if (!this.config.logEndpoint) return;

    const maxRetries = this.config.maxLogRetries || 3;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        const response = await fetch(this.config.logEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(logEntry)
        });

        if (response.ok) {
          return;
        }

        throw new Error(`Logging endpoint returned ${response.status}`);
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) {
          throw error;
        }
        await this.delay(1000 * attempts); // Exponential backoff
      }
    }
  }

  private createError(
    code: string, 
    message: string, 
    retryable: boolean, 
    type: ErrorType,
    context?: ErrorContext
  ): AuthError {
    return {
      code,
      message,
      retryable,
      type: type.toString(),
      timestamp: new Date(),
      context: context ? {
        userId: context.userId,
        sessionId: context.sessionId,
        action: context.action,
        additionalData: context.additionalData
      } : undefined
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ErrorHandlingService;