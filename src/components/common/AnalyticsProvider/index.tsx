/**
 * AnalyticsProvider Component
 *
 * Higher-order component that provides analytics tracking capabilities:
 * - Automatic page view tracking
 * - Performance monitoring
 * - Error boundary with error tracking
 * - Consent management UI
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { initializeAnalytics } from "../../../hooks/useAnalytics";
import AnalyticsService from "../../../services/analyticsService";
import { Button } from "../Button";

interface AnalyticsContextValue {
  analyticsService: AnalyticsService | null;
  hasConsent: boolean;
  autoTrackPageViews: boolean;
  setConsent: (consent: boolean) => void;
  showConsentModal: boolean;
  setShowConsentModal: (show: boolean) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export interface AnalyticsProviderProps {
  children: ReactNode;
  config: {
    webEngageApiKey?: string;
    moEngageApiKey?: string;
    enableWebEngage?: boolean;
    enableMoEngage?: boolean;
    enableConsoleLogging?: boolean;
    respectDoNotTrack?: boolean;
    consentRequired?: boolean;
  };
  autoTrackPageViews?: boolean;
  showConsentBanner?: boolean;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  config,
  autoTrackPageViews = true,
  showConsentBanner = true,
}) => {
  const [analyticsService, setAnalyticsService] =
    useState<AnalyticsService | null>(null);
  const [hasConsent, setHasConsent] = useState<boolean>(
    !config.consentRequired,
  );
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);

  // Initialize analytics service
  useEffect(() => {
    const service = initializeAnalytics(config);
    setAnalyticsService(service);

    // Show consent modal if required and not given
    if (config.consentRequired && !hasConsent && showConsentBanner) {
      const consentGiven = localStorage.getItem("analytics_consent");
      if (consentGiven === "true") {
        setHasConsent(true);
        service.setConsent(true);
      } else if (consentGiven === null) {
        setShowConsentModal(true);
      }
    }
  }, [config, hasConsent, showConsentBanner]);

  // Handle consent change
  const handleSetConsent = useCallback(
    (consent: boolean) => {
      setHasConsent(consent);
      localStorage.setItem("analytics_consent", consent.toString());

      if (analyticsService) {
        analyticsService.setConsent(consent);
      }

      setShowConsentModal(false);
    },
    [analyticsService],
  );

  // Performance monitoring
  useEffect(() => {
    if (analyticsService && hasConsent) {
      // Track page load performance
      const trackPerformance = () => {
        if (typeof window !== "undefined" && window.performance) {
          const navigation = performance.getEntriesByType(
            "navigation",
          )[0] as PerformanceNavigationTiming;

          if (navigation) {
            analyticsService.trackPerformance(
              "page_load_time",
              navigation.loadEventEnd - navigation.fetchStart,
            );
            analyticsService.trackPerformance(
              "dom_content_loaded",
              navigation.domContentLoadedEventEnd - navigation.fetchStart,
            );
            analyticsService.trackPerformance(
              "first_paint",
              navigation.responseEnd - navigation.fetchStart,
            );
          }
        }
      };

      // Track performance after page load
      if (document.readyState === "complete") {
        trackPerformance();
      } else {
        window.addEventListener("load", trackPerformance);
        return () => window.removeEventListener("load", trackPerformance);
      }
    }
  }, [analyticsService, hasConsent]);

  const contextValue = useMemo<AnalyticsContextValue>(
    () => ({
      analyticsService,
      hasConsent,
      autoTrackPageViews,
      setConsent: handleSetConsent,
      showConsentModal,
      setShowConsentModal,
    }),
    [
      analyticsService,
      hasConsent,
      autoTrackPageViews,
      handleSetConsent,
      showConsentModal,
    ],
  );

  const handleAccept = useCallback(
    () => handleSetConsent(true),
    [handleSetConsent],
  );
  const handleDecline = useCallback(
    () => handleSetConsent(false),
    [handleSetConsent],
  );
  const handleClose = useCallback(() => setShowConsentModal(false), []);

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}

      {/* Consent Modal */}
      {showConsentModal && (
        <ConsentModal
          onAccept={handleAccept}
          onDecline={handleDecline}
          onClose={handleClose}
        />
      )}
    </AnalyticsContext.Provider>
  );
};

/**
 * Tracks page views on location change. Must be rendered inside both
 * AnalyticsProvider and BrowserRouter so SPA navigations are tracked.
 */
export function PageViewTracker() {
  const location = useLocation();
  const { analyticsService, hasConsent, autoTrackPageViews } =
    useAnalyticsContext();

  useEffect(() => {
    if (!autoTrackPageViews || !analyticsService || !hasConsent) return;
    analyticsService.trackAuthEvent("page_view", {
      page: location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });
  }, [
    location.pathname,
    location.key,
    autoTrackPageViews,
    analyticsService,
    hasConsent,
  ]);

  return null;
}

// Consent Modal Component
interface ConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({
  onAccept,
  onDecline,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Privacy & Analytics
        </h2>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-3">
              We use analytics to improve your experience and understand how our
              authentication system is used.
            </p>

            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <h4 className="font-medium text-blue-900 mb-2">What we track:</h4>
              <ul className="text-blue-800 text-xs space-y-1">
                <li>• Authentication flow usage and success rates</li>
                <li>• Performance metrics and error rates</li>
                <li>• User interface interactions</li>
                <li>• General usage patterns (anonymized)</li>
              </ul>
            </div>

            <div className="bg-green-50 p-3 rounded-lg mb-4">
              <h4 className="font-medium text-green-900 mb-2">
                What we don't track:
              </h4>
              <ul className="text-green-800 text-xs space-y-1">
                <li>• Personal information like passwords or OTPs</li>
                <li>• Full phone numbers or email addresses</li>
                <li>• Browsing history outside this app</li>
                <li>• Any sensitive authentication data</li>
              </ul>
            </div>

            <p className="text-xs text-gray-500">
              You can change your preference at any time in settings. Declining
              won't affect app functionality.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button onClick={onAccept} variant="primary" className="flex-1">
              Accept Analytics
            </Button>
            <Button onClick={onDecline} variant="secondary" className="flex-1">
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook to use analytics context
export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error(
      "useAnalyticsContext must be used within an AnalyticsProvider",
    );
  }
  return context;
};

// Error Boundary with Analytics
interface AnalyticsErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface AnalyticsErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class AnalyticsErrorBoundary extends React.Component<
  AnalyticsErrorBoundaryProps,
  AnalyticsErrorBoundaryState
> {
  constructor(props: AnalyticsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AnalyticsErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track error in analytics
    const analyticsService = initializeAnalytics({});
    if (analyticsService) {
      analyticsService.trackError(error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 text-red-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">
                We've encountered an unexpected error. Please refresh the page
                to try again.
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default AnalyticsProvider;
