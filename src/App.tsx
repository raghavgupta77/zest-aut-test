import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { AnalyticsProvider } from "./components/common/AnalyticsProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { RedirectComponent } from "./components/auth/RedirectComponent";
import { ToastContainer } from "./components/common";
import { initializeAnalytics } from "./hooks/useAnalytics";
import { initializeErrorHandling } from "./hooks/useErrorRecovery";
import { initializePerformance } from "./hooks/usePerformance";
import { EnvironmentManager } from "./services/environmentManager";
import type { ToastProps } from "./components/common";
import "./App.css";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [envConfig, setEnvConfig] = useState<any>(null);

  // Get environment config function
  const getEnvironmentConfig = (_envType: string) => {
    // Map environment type to Angular-style config structure (envType is for future use)
    const currentEnv = envConfig || {};

    // Return Angular-style environment config structure
    // This matches the structure expected by RedirectComponent and services
    return {
      baseUrl: currentEnv.baseUrl || "https://staging-auth.zestmoney.in",
      baseAppUrl: currentEnv.baseAppUrl || "https://staging-app.zestmoney.in",
      s3Url:
        currentEnv.s3Url ||
        "https://s3.ap-south-1.amazonaws.com/staging-merchants-assets",
      funnelUrl:
        currentEnv.funnelUrl || "https://staging-funneltrack.zestmoney.in",
      defaultUuid: "00000000-0000-0000-0000-000000000000",
      zestMerchantId: "a70ce9c4-881a-405d-834a-4a18554fb33a",
      token_client_id: "9ADD8006-F45A-11E7-8C3F-9A214CF093AE",
      google_token_client_id: "1BBA6234-0908-4174-952A-5B2D02A72BAE",
      hashed_client_token:
        "token:135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85",
      hashed_auth_token:
        "135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85",
      client_secret: "testPassword",
      google_login_client_id:
        currentEnv.googleClientId ||
        "508197139032-5eanucd3nfoa49iikn15ahusjeesc7vp.apps.googleusercontent.com",
      partnerCheckoutUrl: [
        "https://staging-partner.zestmoney.in",
        "https://staging-widget.zestmoney.in",
      ],
      finoramicDomain: "https://sandbox.finoramic.com",
      finoramicClientId:
        currentEnv.finoramicClientId || "ae717c9e-5b4f-4a54-99c5-ec26e1937b82",
      finoramicClient: "zestmoney",
      finoramicCallback: "/authentication/finoramic-callback",
      featuresApiKey:
        currentEnv.apiKey || "14FTv6F6dj94qA3AiTGyEacUKbQRCj0gZT3C0TKe",
      featureSwitchUrl: "https://staging-features.zestmoney.in",
      scripts: {
        pixelScriptUrl:
          "https://s3.ap-south-1.amazonaws.com/staging-merchants-assets/pixel.js",
      },
    };
  };

  // Initialize all services
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize environment manager
        const envManager = EnvironmentManager.getInstance();
        const config = envManager.validateAndInitialize();
        setEnvConfig(config);

        // Initialize performance service
        initializePerformance({
          enableApiCache: true,
          enableAssetCache: true,
          apiCacheTTL: 300000, // 5 minutes
          assetCacheTTL: 3600000, // 1 hour
          cacheStrategy: "memory",
        });

        // Initialize error handling
        initializeErrorHandling({
          enableLogging: true,
          enableRetry: true,
          enableRecoveryActions: true,
          logEndpoint:
            (config.baseUrl || "https://staging-auth.zestmoney.in") + "/logs",
        });

        // Initialize analytics
        initializeAnalytics({
          webEngageApiKey: config.webEngageKey,
          moEngageApiKey: config.moEngageKey,
          enableWebEngage: config.features.enableAnalytics,
          enableMoEngage: config.features.enableAnalytics,
          enableConsoleLogging: config.features.enableDebugMode,
          respectDoNotTrack: true,
          consentRequired: true,
        });

        setIsInitialized(true);
      } catch (error) {
        console.error("App initialization failed:", error);
        setInitError(
          error instanceof Error
            ? error.message
            : "Failed to initialize application",
        );
      }
    };

    initializeApp();
  }, []);

  const addToast = (
    type: "success" | "error" | "warning" | "info",
    message: string,
  ) => {
    const newToast: ToastProps = {
      id: Date.now().toString(),
      type,
      message,
      onClose: (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    };
    setToasts((prev) => [...prev, newToast]);
  };

  // Show initialization error
  if (initError) {
    return (
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
            Initialization Error
          </h2>
          <p className="text-gray-600 mb-4">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4">
            <svg
              className="animate-spin w-full h-full text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary level="critical" showErrorDetails={import.meta.env.DEV}>
      <AnalyticsProvider
        config={{
          webEngageApiKey: import.meta.env.VITE_WEBENGAGE_KEY,
          moEngageApiKey: import.meta.env.VITE_MOENGAGE_KEY,
          enableWebEngage: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
          enableMoEngage: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
          enableConsoleLogging: import.meta.env.DEV,
          respectDoNotTrack: true,
          consentRequired: true,
        }}
        autoTrackPageViews={true}
        showConsentBanner={false}
      >
        <AuthProvider>
          <BrowserRouter>
            <div style={{ minHeight: "100vh", width: "100%" }}>
              <ErrorBoundary level="component" showErrorDetails={false}>
                <Routes>
                  {/* Main auth route and /email route both render the same component */}
                  <Route
                    path="/"
                    element={
                      <RedirectComponent
                        environmentType={
                          import.meta.env.VITE_ENVIRONMENT || "Local"
                        }
                        clientName={
                          import.meta.env.VITE_CLIENT_NAME || "default"
                        }
                        authVersion="V3"
                        onGetToken={(_token) => {
                          addToast("success", "Authentication successful!");
                        }}
                        onGetEvents={(events) => {
                          console.log("Events:", events);
                        }}
                        onLogout={() => {
                          addToast("info", "Logged out successfully");
                        }}
                        getEnvironmentConfig={getEnvironmentConfig}
                      />
                    }
                  />
                  <Route
                    path="/email"
                    element={
                      <RedirectComponent
                        environmentType={
                          import.meta.env.VITE_ENVIRONMENT || "Local"
                        }
                        clientName={
                          import.meta.env.VITE_CLIENT_NAME || "default"
                        }
                        authVersion="V3"
                        onGetToken={(_token) => {
                          addToast("success", "Authentication successful!");
                        }}
                        onGetEvents={(events) => {
                          console.log("Events:", events);
                        }}
                        onLogout={() => {
                          addToast("info", "Logged out successfully");
                        }}
                        getEnvironmentConfig={getEnvironmentConfig}
                      />
                    }
                  />
                  {/* Catch-all for other routes */}
                  <Route
                    path="*"
                    element={
                      <RedirectComponent
                        environmentType={
                          import.meta.env.VITE_ENVIRONMENT || "Local"
                        }
                        clientName={
                          import.meta.env.VITE_CLIENT_NAME || "default"
                        }
                        authVersion="V3"
                        onGetToken={(_token) => {
                          addToast("success", "Authentication successful!");
                        }}
                        onGetEvents={(events) => {
                          console.log("Events:", events);
                        }}
                        onLogout={() => {
                          addToast("info", "Logged out successfully");
                        }}
                        getEnvironmentConfig={getEnvironmentConfig}
                      />
                    }
                  />
                </Routes>
              </ErrorBoundary>

              {/* Toast Container */}
              <ToastContainer toasts={toasts} position="top-right" />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </AnalyticsProvider>
    </ErrorBoundary>
  );
}

export default App;
