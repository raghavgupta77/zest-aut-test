/**
 * useAuthServices Hook
 * 
 * Shared hook for auth services initialization used across all auth pages.
 * Centralizes the setup of authentication, tracking, and application services.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AuthenticationServiceExtended } from '../services/authenticationServiceExtended';
import { ApplicationService } from '../services/applicationService';
import { TrackingService } from '../services/trackingService';
import { HeaderService, Header } from '../services/headerService';
import { FooterService, Footer } from '../services/footerService';
import { LoaderService } from '../services/loaderService';
import { initializeSessionStorage } from '../utils/sessionStorage';

const ENVIRONMENT_TYPE = import.meta.env.VITE_ENVIRONMENT ?? 'Local';
const CLIENT_NAME = import.meta.env.VITE_CLIENT_NAME ?? 'default';

interface AuthServicesConfig {
  /** Whether to show header */
  showHeader?: boolean;
  /** Whether to show header back button */
  showBackButton?: boolean;
  /** Whether to show footer */
  showFooter?: boolean;
  /** Whether to initialize session storage with defaults */
  initSessionStorage?: boolean;
  /** Whether to setup Google login script */
  setupGoogleLogin?: boolean;
  /** Whether to setup pixel script */
  setupPixelScript?: boolean;
  /** Check Truecaller enabled feature */
  checkTruecaller?: boolean;
  /** Check OTP via call enabled feature */
  checkOtpViaCall?: boolean;
}

interface AuthServicesResult {
  /** Authentication service instance */
  authService: AuthenticationServiceExtended | null;
  /** Application service instance */
  applicationService: ApplicationService | null;
  /** Tracking service instance */
  trackingService: TrackingService | null;
  /** Loader service instance */
  loaderService: typeof LoaderService;
  /** Environment type */
  environmentType: string;
  /** Client name */
  clientName: string;
  /** Environment config getter function */
  getEnvironmentConfig: (envType: string) => any;
  /** Whether Truecaller is enabled */
  showTruecaller: boolean;
  /** Whether OTP via call is enabled */
  showGetCallFeatureSwitch: boolean;
  /** Whether services are initialized */
  isInitialized: boolean;
  /** Show header back button */
  showHeaderBackButton: (sourceDirectiveName?: string) => void;
  /** Hide header back button */
  hideHeaderBackButton: () => void;
  /** Add toast notification */
  addToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

const defaultConfig: AuthServicesConfig = {
  showHeader: true,
  showBackButton: false,
  showFooter: true,
  initSessionStorage: true,
  setupGoogleLogin: true,
  setupPixelScript: true,
  checkTruecaller: true,
  checkOtpViaCall: true,
};

export function useAuthServices(config: AuthServicesConfig = {}): AuthServicesResult {
  const { getEnvironmentConfig, addToast } = useAppContext();

  // Memoize config to prevent infinite loops - use individual properties for stable references
  const showHeader = config.showHeader ?? defaultConfig.showHeader;
  const showBackButton = config.showBackButton ?? defaultConfig.showBackButton;
  const showFooter = config.showFooter ?? defaultConfig.showFooter;
  const initSessionStorage = config.initSessionStorage ?? defaultConfig.initSessionStorage;
  const setupGoogleLogin = config.setupGoogleLogin ?? defaultConfig.setupGoogleLogin;
  const setupPixelScript = config.setupPixelScript ?? defaultConfig.setupPixelScript;
  const checkTruecaller = config.checkTruecaller ?? defaultConfig.checkTruecaller;
  const checkOtpViaCall = config.checkOtpViaCall ?? defaultConfig.checkOtpViaCall;

  // Services state
  const [authService, setAuthService] = useState<AuthenticationServiceExtended | null>(null);
  const [applicationService, setApplicationService] = useState<ApplicationService | null>(null);
  const [trackingService, setTrackingService] = useState<TrackingService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Feature flags
  const [showTruecaller, setShowTruecaller] = useState(false);
  const [showGetCallFeatureSwitch, setShowGetCallFeatureSwitch] = useState(false);

  // Back button state
  const [backButtonDirectiveStack, setBackButtonDirectiveStack] = useState<string[]>([]);

  // Setup Google login script
  const setupGoogleLoginScriptFn = useCallback((envConfig: any) => {
    const googleLoginScriptUrl = 'https://apis.google.com/js/platform.js';
    const google_login_client_id = envConfig.google_login_client_id;

    // Check if already added
    if (document.querySelector(`script[src="${googleLoginScriptUrl}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = googleLoginScriptUrl;
    script.type = 'text/javascript';
    script.async = false;
    script.defer = false;
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(script, firstScript);

    // Create meta tag if not exists
    if (!document.querySelector('meta[name="google-signin-client_id"]')) {
      const meta = document.createElement('meta');
      meta.name = 'google-signin-client_id';
      meta.content = google_login_client_id;
      const firstMeta = document.getElementsByTagName('meta')[0];
      firstMeta.parentNode?.insertBefore(meta, firstMeta);
    }
  }, []);

  // Setup pixel script
  const setupPixelScriptFn = useCallback((envConfig: any) => {
    const pixelScriptUrl = envConfig.scripts?.pixelScriptUrl;
    if (!pixelScriptUrl) return;

    // Check if already added
    if (document.querySelector(`script[src="${pixelScriptUrl}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = pixelScriptUrl;
    script.type = 'text/javascript';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(script, firstScript);
  }, []);

  // Initialize services - only run once on mount
  useEffect(() => {
    // Prevent re-initialization if already initialized
    if (isInitialized) return;
    if (!getEnvironmentConfig) return;

    const envConfig = getEnvironmentConfig(ENVIRONMENT_TYPE);

    // Initialize session storage with default values
    if (initSessionStorage) {
      initializeSessionStorage();
    }

    // Setup header and footer
    HeaderService.next(new Header(showHeader ?? true, showBackButton ?? false));
    FooterService.next(new Footer(showFooter ?? true));

    // Initialize services using singleton instances
    const authServiceInstance = new AuthenticationServiceExtended();
    const applicationServiceInstance = new ApplicationService();
    const trackingServiceInstance = new TrackingService();

    setAuthService(authServiceInstance);
    setApplicationService(applicationServiceInstance);
    setTrackingService(trackingServiceInstance);

    // Setup Google login script
    if (setupGoogleLogin) {
      setupGoogleLoginScriptFn(envConfig);
    }

    // Setup pixel script
    if (setupPixelScript) {
      setupPixelScriptFn(envConfig);
    }

    // Check feature flags
    const checkFeatures = async () => {
      // Check Truecaller enabled
      if (checkTruecaller) {
        try {
          const truecallerResponse = await authServiceInstance.checkTruecallerEnabled(ENVIRONMENT_TYPE);
          setShowTruecaller(truecallerResponse?.enabled === true);
        } catch {
          setShowTruecaller(false);
        }
      }

      // Check Get OTP via Call enabled
      if (checkOtpViaCall) {
        try {
          const otpCallResponse = await authServiceInstance.checkGetOtpViaCallEnabled(ENVIRONMENT_TYPE);
          setShowGetCallFeatureSwitch(otpCallResponse?.enabled === true);
        } catch {
          setShowGetCallFeatureSwitch(false);
        }
      }

      setIsInitialized(true);
    };

    checkFeatures();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Show header back button
  const showHeaderBackButton = useCallback((sourceDirectiveName?: string) => {
    setBackButtonDirectiveStack(prev => {
      const updated = sourceDirectiveName 
        ? [...prev, sourceDirectiveName].filter(d => d !== 'zest-forgot-password')
        : prev;
      HeaderService.next(new Header(true, true));
      return updated;
    });
  }, []);

  // Hide header back button
  const hideHeaderBackButton = useCallback(() => {
    setBackButtonDirectiveStack(prev => {
      const updated = prev.filter(d => d !== 'zest-forgot-password');
      if (updated.length > 0) {
        updated.pop();
      }
      if (updated.length === 0) {
        HeaderService.next(new Header(true, false));
      }
      return updated;
    });
  }, []);

  return useMemo(() => ({
    authService,
    applicationService,
    trackingService,
    loaderService: LoaderService,
    environmentType: ENVIRONMENT_TYPE,
    clientName: CLIENT_NAME,
    getEnvironmentConfig,
    showTruecaller,
    showGetCallFeatureSwitch,
    isInitialized,
    showHeaderBackButton,
    hideHeaderBackButton,
    addToast,
  }), [
    authService,
    applicationService,
    trackingService,
    getEnvironmentConfig,
    showTruecaller,
    showGetCallFeatureSwitch,
    isInitialized,
    showHeaderBackButton,
    hideHeaderBackButton,
    addToast,
  ]);
}

export default useAuthServices;
