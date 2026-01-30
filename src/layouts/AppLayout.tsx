import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { EnvironmentManager } from "../services/environmentManager";
import { AppProvider, useAppContext } from "../contexts/AppContext";
import { ToastContainer } from "../components/common";
import { initializeAnalytics } from "../hooks/useAnalytics";
import { initializeErrorHandling } from "../hooks/useErrorRecovery";
import { initializePerformance } from "../hooks/usePerformance";
import type { Environment } from "../types/environment";

type InitStatus = "loading" | "error" | "ready";

/** Overlay shown during initialization - doesn't unmount route structure */
function InitOverlay({
  status,
  errorMessage,
  onRetry,
}: {
  status: InitStatus;
  errorMessage: string | null;
  onRetry: () => void;
}) {
  if (status === "ready") return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50"
      role="status"
      aria-live="polite"
    >
      {status === "loading" && (
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4">
            <svg
              className="animate-spin w-full h-full text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
      )}

      {status === "error" && errorMessage && (
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

function AppLayoutContent() {
  const { toasts } = useAppContext();
  return (
    <>
      <Outlet />
      <ToastContainer toasts={toasts} position="top-right" />
    </>
  );
}

export function AppLayout() {
  const [status, setStatus] = useState<InitStatus>("loading");
  const [initError, setInitError] = useState<string | null>(null);
  const [envConfig, setEnvConfig] = useState<Environment | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const envManager = EnvironmentManager.getInstance();
        const config = envManager.validateAndInitialize();
        setEnvConfig(config);

        initializePerformance({
          enableApiCache: true,
          enableAssetCache: true,
          apiCacheTTL: 300000,
          assetCacheTTL: 3600000,
          cacheStrategy: "memory",
        });

        initializeErrorHandling({
          enableLogging: true,
          enableRetry: true,
          enableRecoveryActions: true,
          logEndpoint:
            (config.baseUrl ?? "https://staging-auth.zestmoney.in") + "/logs",
        });

        initializeAnalytics({
          webEngageApiKey: config.webEngageKey,
          moEngageApiKey: config.moEngageKey,
          enableWebEngage: config.features.enableAnalytics,
          enableMoEngage: config.features.enableAnalytics,
          enableConsoleLogging: config.features.enableDebugMode,
          respectDoNotTrack: true,
          consentRequired: true,
        });

        setStatus("ready");
      } catch (error) {
        console.error("App initialization failed:", error);
        setInitError(
          error instanceof Error
            ? error.message
            : "Failed to initialize application"
        );
        setStatus("error");
      }
    };

    initializeApp();
  }, []);

  const handleRetry = () => {
    setInitError(null);
    setStatus("loading");
    const envManager = EnvironmentManager.getInstance();
    try {
      const config = envManager.validateAndInitialize();
      setEnvConfig(config);
      setStatus("ready");
    } catch (error) {
      setInitError(
        error instanceof Error
          ? error.message
          : "Failed to initialize application"
      );
      setStatus("error");
    }
  };

  // Always render the route structure - loading/error shown as overlay
  return (
    <AppProvider envConfig={envConfig}>
      <div style={{ minHeight: "100vh", width: "100%" }}>
        {/* Always render Outlet so routes stay mounted */}
        <AppLayoutContent />
        {/* Overlay for loading/error states */}
        <InitOverlay status={status} errorMessage={initError} onRetry={handleRetry} />
      </div>
    </AppProvider>
  );
}
