/**
 * useErrorRecovery Hook
 * 
 * React hook for error handling and recovery with:
 * - Automatic error classification
 * - Recovery action suggestions
 * - Retry mechanisms with exponential backoff
 * - Error logging and monitoring
 * - Circuit breaker pattern for failing services
 */

import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import ErrorHandlingService from '../services/errorHandlingService';
import type { AuthError, ErrorContext, RecoveryAction } from '../types/errors';

// Global error handling service instance
let errorHandlingService: ErrorHandlingService | null = null;

// Initialize error handling service
export const initializeErrorHandling = (config: {
  enableLogging?: boolean;
  enableRetry?: boolean;
  enableRecoveryActions?: boolean;
  logEndpoint?: string;
  maxLogRetries?: number;
}) => {
  if (!errorHandlingService) {
    errorHandlingService = new ErrorHandlingService({
      enableLogging: true,
      enableRetry: true,
      enableRecoveryActions: true,
      ...config
    });
  }
  return errorHandlingService;
};

export interface UseErrorRecoveryOptions {
  enableAutoRetry?: boolean;
  enableLogging?: boolean;
  context?: Partial<ErrorContext>;
}

export const useErrorRecovery = (options: UseErrorRecoveryOptions = {}) => {
  const authContext = useContext(AuthContext);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<AuthError | null>(null);

  const {
    enableAutoRetry = true,
    enableLogging = true,
    context: baseContext = {}
  } = options;

  // Create error context
  const createErrorContext = useCallback((additionalContext?: Partial<ErrorContext>): ErrorContext => {
    return {
      userId: authContext?.state.user?.id,
      sessionId: `session_${Date.now()}`, // This should come from auth context in real implementation
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...baseContext,
      ...additionalContext
    };
  }, [authContext, baseContext]);

  // Handle error with automatic classification and logging
  const handleError = useCallback(async (
    error: unknown,
    context?: Partial<ErrorContext>
  ): Promise<AuthError> => {
    if (!errorHandlingService) {
      throw new Error('Error handling service not initialized');
    }

    const errorContext = createErrorContext(context);
    
    // Handle edge cases and convert to AuthError
    const authError = errorHandlingService.handleEdgeCase(error, errorContext);
    
    // Log error if enabled
    if (enableLogging) {
      errorHandlingService.logError(authError, errorContext);
    }

    setLastError(authError);
    return authError;
  }, [createErrorContext, enableLogging]);

  // Attempt recovery from error
  const recoverFromError = useCallback(async (
    error: AuthError,
    context?: Partial<ErrorContext>
  ): Promise<void> => {
    if (!errorHandlingService) {
      throw new Error('Error handling service not initialized');
    }

    const errorContext = createErrorContext(context);
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await errorHandlingService.recoverFromError(error, errorContext);
      
      // Clear retry state on successful recovery
      setRetryCount(0);
      setLastError(null);
      
      // Clear retry attempts in service
      const attemptKey = `${error.code}_${errorContext.sessionId}`;
      errorHandlingService.clearRetryAttempts(attemptKey);
      
    } catch (recoveryError) {
      // Recovery failed, re-throw the error
      throw recoveryError;
    } finally {
      setIsRetrying(false);
    }
  }, [createErrorContext]);

  // Get user-friendly error message
  const getErrorMessage = useCallback((error: AuthError): string => {
    if (!errorHandlingService) {
      return error.message || 'An error occurred';
    }
    return errorHandlingService.getUserMessage(error);
  }, []);

  // Get recovery actions for error
  const getRecoveryActions = useCallback((
    error: AuthError,
    context?: Partial<ErrorContext>
  ): RecoveryAction[] => {
    if (!errorHandlingService) {
      return [];
    }
    
    const errorContext = createErrorContext(context);
    return errorHandlingService.getRecoveryActions(error, errorContext);
  }, [createErrorContext]);

  // Check if error can be recovered
  const canRecover = useCallback((error: AuthError): boolean => {
    if (!errorHandlingService) {
      return false;
    }
    return errorHandlingService.canRecover(error);
  }, []);

  // Classify error type
  const classifyError = useCallback((error: unknown) => {
    if (!errorHandlingService) {
      return 'SYSTEM';
    }
    return errorHandlingService.classifyError(error);
  }, []);

  // Execute operation with automatic error handling and retry
  const executeWithRecovery = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: Partial<ErrorContext>
  ): Promise<T> => {
    try {
      const result = await operation();
      
      // Clear any previous errors on success
      setLastError(null);
      setRetryCount(0);
      
      return result;
    } catch (error) {
      const authError = await handleError(error, context);
      
      // Attempt automatic recovery if enabled and error is recoverable
      if (enableAutoRetry && canRecover(authError)) {
        try {
          await recoverFromError(authError, context);
          // Retry the operation after recovery
          return await operation();
        } catch (recoveryError) {
          // Recovery failed, throw the original error
          throw authError;
        }
      }
      
      // No recovery attempted or recovery not possible
      throw authError;
    }
  }, [handleError, canRecover, recoverFromError, enableAutoRetry]);

  // Retry last failed operation
  const retryLastOperation = useCallback(async (
    operation: () => Promise<any>,
    context?: Partial<ErrorContext>
  ): Promise<any> => {
    if (!lastError) {
      throw new Error('No previous error to retry');
    }

    try {
      await recoverFromError(lastError, context);
      return await operation();
    } catch (error) {
      throw await handleError(error, context);
    }
  }, [lastError, recoverFromError, handleError]);

  // Clear error state
  const clearError = useCallback(() => {
    setLastError(null);
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  // Reset circuit breaker for a service
  const resetCircuitBreaker = useCallback((serviceKey: string) => {
    if (errorHandlingService) {
      errorHandlingService.resetCircuitBreaker(serviceKey);
    }
  }, []);

  // Convenience methods for common error scenarios
  const handleNetworkError = useCallback(async (error: unknown, context?: Partial<ErrorContext>) => {
    return await handleError(error, { ...context, action: 'network_request' });
  }, [handleError]);

  const handleAuthError = useCallback(async (error: unknown, context?: Partial<ErrorContext>) => {
    return await handleError(error, { ...context, action: 'authentication' });
  }, [handleError]);

  const handleValidationError = useCallback(async (error: unknown, context?: Partial<ErrorContext>) => {
    return await handleError(error, { ...context, action: 'validation' });
  }, [handleError]);

  // Effect to log retry attempts
  useEffect(() => {
    if (retryCount > 0 && lastError && enableLogging) {
      const context = createErrorContext({ 
        action: 'retry_attempt',
        additionalData: { retryCount }
      });
      
      if (errorHandlingService) {
        errorHandlingService.logError(lastError, context);
      }
    }
  }, [retryCount, lastError, enableLogging, createErrorContext]);

  return {
    // Core error handling
    handleError,
    recoverFromError,
    executeWithRecovery,
    retryLastOperation,
    
    // Error information
    getErrorMessage,
    getRecoveryActions,
    canRecover,
    classifyError,
    
    // State management
    clearError,
    resetCircuitBreaker,
    
    // Convenience methods
    handleNetworkError,
    handleAuthError,
    handleValidationError,
    
    // State
    isRetrying,
    retryCount,
    lastError,
    
    // Service availability
    isAvailable: !!errorHandlingService
  };
};

export default useErrorRecovery;