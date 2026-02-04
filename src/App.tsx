import { BrowserRouter, useLocation } from "react-router-dom";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import {
  AnalyticsProvider,
  PageViewTracker,
} from "./components/common/AnalyticsProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { AppRoutes } from "./routes";
import "./App.css";
import { useEffect } from "react";
import { setRedirectedSource } from "./utils/sessionStorage";

const analyticsConfig = {
  webEngageApiKey: import.meta.env.VITE_WEBENGAGE_KEY,
  moEngageApiKey: import.meta.env.VITE_MOENGAGE_KEY,
  enableWebEngage: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
  enableMoEngage: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
  enableConsoleLogging: import.meta.env.DEV,
  respectDoNotTrack: true,
  consentRequired: true,
};


function App() {

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    if (source) {
      console.log('setting redirected source', source);
      setRedirectedSource(source);
    }
  }, [])
  return (
    <ErrorBoundary level="critical" showErrorDetails={import.meta.env.DEV}>
      <AnalyticsProvider
        config={analyticsConfig}
        autoTrackPageViews={true}
        showConsentBanner={false}
      >
        <AuthProvider>
          <BrowserRouter>
            <PageViewTracker />
            <ErrorBoundary level="component" showErrorDetails={false}>
              <AppRoutes />
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </AnalyticsProvider>
    </ErrorBoundary>
  );
}

export default App;
