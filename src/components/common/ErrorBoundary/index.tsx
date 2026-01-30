/**
 * ErrorBoundary Component
 *
 * Enhanced error boundary with:
 * - Comprehensive error logging
 * - Recovery action suggestions
 * - Fallback UI with retry functionality
 * - Integration with error handling service
 * - Different fallback UIs based on error type
 */

import { Component, type ReactNode, type ErrorInfo } from "react";
import { Button } from "../Button";
import ErrorHandlingService from "../../../services/errorHandlingService";
import type {
  AuthError,
  ErrorContext,
  RecoveryAction,
} from "../../../types/errors";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRecovery?: boolean;
  showErrorDetails?: boolean;
  level?: "page" | "component" | "critical";
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  authError?: AuthError;
  recoveryActions: RecoveryAction[];
  isRetrying: boolean;
  showErrorModal: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private errorHandlingService: ErrorHandlingService | null = null;
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      recoveryActions: [],
      isRetrying: false,
      showErrorModal: false,
    };

    // Initialize error handling service
    this.errorHandlingService = new ErrorHandlingService({
      enableLogging: true,
      enableRetry: true,
      enableRecoveryActions: props.enableRecovery !== false,
    });
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.handleError(error, errorInfo);
  }

  private async handleError(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = "component" } = this.props;

    // Create error context
    const context: ErrorContext = {
      timestamp: new Date(),
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      action: "component_error",
      additionalData: {
        componentStack: errorInfo.componentStack,
        errorBoundaryLevel: level,
        retryCount: this.retryCount,
      },
    };

    // Convert to AuthError and get recovery actions
    let authError: AuthError;
    let recoveryActions: RecoveryAction[] = [];

    if (this.errorHandlingService) {
      authError = this.errorHandlingService.handleEdgeCase(error, context);
      recoveryActions = this.errorHandlingService.getRecoveryActions(
        authError,
        context,
      );

      // Log the error
      this.errorHandlingService.logError(authError, context);
    } else {
      // Fallback error creation
      authError = {
        code: "COMPONENT_ERROR",
        message: error.message || "Component error occurred",
        retryable: true,
        type: "SYSTEM",
        timestamp: new Date(),
        context: context as unknown as Record<string, unknown>,
      };
    }

    // Add retry action if not already present and retries are available
    if (
      this.retryCount < this.maxRetries &&
      !recoveryActions.some((action) => action.type === "retry")
    ) {
      recoveryActions.unshift({
        type: "retry",
        label: "Try Again",
        description: `Retry the operation (${this.maxRetries - this.retryCount} attempts remaining)`,
        action: () => this.handleRetry(),
      });
    }

    // Add refresh action for critical errors
    if (level === "critical" || level === "page") {
      recoveryActions.push({
        type: "refresh",
        label: "Refresh Page",
        description: "Refresh the entire page to reset the application",
        action: () => window.location.reload(),
      });
    }

    this.setState({
      errorInfo,
      authError,
      recoveryActions,
      showErrorModal: level === "critical",
    });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // For critical errors, also log to console
    if (level === "critical") {
      console.error("Critical error in ErrorBoundary:", error, errorInfo);
    }
  }

  private handleRetry = async () => {
    this.setState({ isRetrying: true });
    this.retryCount++;

    try {
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset error state to trigger re-render
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        authError: undefined,
        recoveryActions: [],
        isRetrying: false,
        showErrorModal: false,
      });
    } catch (retryError) {
      this.setState({ isRetrying: false });
      console.error("Retry failed:", retryError);
    }
  };

  private handleRecoveryAction = async (action: RecoveryAction) => {
    try {
      this.setState({ isRetrying: true });
      await action.action();
    } catch (actionError) {
      console.error("Recovery action failed:", actionError);
    } finally {
      this.setState({ isRetrying: false });
    }
  };

  private renderFallbackUI() {
    const {
      fallback,
      level = "component",
      showErrorDetails = false,
    } = this.props;
    const { error, authError, recoveryActions, isRetrying } = this.state;

    // Use custom fallback if provided
    if (fallback) {
      return fallback;
    }

    // Get error message
    const errorMessage =
      this.errorHandlingService && authError
        ? this.errorHandlingService.getUserMessage(authError)
        : error?.message || "Something went wrong";

    // Different UI based on error level
    switch (level) {
      case "critical":
        return this.renderCriticalErrorUI(
          errorMessage,
          recoveryActions,
          isRetrying,
        );
      case "page":
        return this.renderPageErrorUI(
          errorMessage,
          recoveryActions,
          isRetrying,
        );
      default:
        return this.renderComponentErrorUI(
          errorMessage,
          recoveryActions,
          isRetrying,
          showErrorDetails,
        );
    }
  }

  private renderCriticalErrorUI(
    errorMessage: string,
    recoveryActions: RecoveryAction[],
    isRetrying: boolean,
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 text-red-500">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Critical Error
          </h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>

          {this.renderRecoveryActions(recoveryActions, isRetrying)}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              If this problem persists, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    );
  }

  private renderPageErrorUI(
    errorMessage: string,
    recoveryActions: RecoveryAction[],
    isRetrying: boolean,
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-orange-500">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Page Error
          </h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>

          {this.renderRecoveryActions(recoveryActions, isRetrying)}
        </div>
      </div>
    );
  }

  private renderComponentErrorUI(
    errorMessage: string,
    recoveryActions: RecoveryAction[],
    isRetrying: boolean,
    showErrorDetails: boolean,
  ) {
    const { error, errorInfo } = this.state;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <div className="flex items-start">
          <div className="shrink-0">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Component Error
            </h3>
            <p className="text-sm text-red-700 mb-3">{errorMessage}</p>

            {this.renderRecoveryActions(recoveryActions, isRetrying, "small")}

            {showErrorDetails && error && (
              <details className="mt-3">
                <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                  Show Error Details
                </summary>
                <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-800 overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{error.stack}</pre>
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    );
  }

  private renderRecoveryActions(
    recoveryActions: RecoveryAction[],
    isRetrying: boolean,
    size: "small" | "medium" = "medium",
  ) {
    if (recoveryActions.length === 0) {
      return null;
    }

    const buttonSize = size === "small" ? "small" : "medium";
    const containerClass =
      size === "small" ? "flex flex-wrap gap-2" : "space-y-2";

    return (
      <div className={containerClass}>
        {recoveryActions.map((action, index) => (
          <Button
            key={index}
            onClick={() => this.handleRecoveryAction(action)}
            disabled={isRetrying}
            isLoading={isRetrying && action.type === "retry"}
            variant={action.type === "retry" ? "primary" : "secondary"}
            size={buttonSize}
            title={action.description}
          >
            {action.label}
          </Button>
        ))}
      </div>
    );
  }

  private renderErrorModal() {
    const { showErrorModal, authError } = this.state;

    if (!showErrorModal || !authError) {
      return null;
    }

    const errorMessage = this.errorHandlingService
      ? this.errorHandlingService.getUserMessage(authError)
      : authError.message;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => this.setState({ showErrorModal: false })}
        />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Critical Error
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 text-red-500">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Application Error
                </h3>
                <p className="text-sm text-gray-600">{errorMessage}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                The application encountered an unexpected error. You can try
                refreshing the page or contact support if the problem persists.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                className="flex-1"
              >
                Refresh Page
              </Button>
              <Button
                onClick={() => this.setState({ showErrorModal: false })}
                variant="secondary"
                className="flex-1"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { hasError } = this.state;

    if (hasError) {
      return (
        <>
          {this.renderFallbackUI()}
          {this.renderErrorModal()}
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
