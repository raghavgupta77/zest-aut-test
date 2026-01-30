/**
 * useAnalytics Hook
 * 
 * React hook for using the analytics service with:
 * - Easy event tracking
 * - User journey tracking
 * - Performance monitoring
 * - Error tracking
 * - Consent management
 */

import { useCallback, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import AnalyticsService from '../services/analyticsService';
import type { UserJourneyStep } from '../services/analyticsService';

// Global analytics service instance
let analyticsService: AnalyticsService | null = null;

// Initialize analytics service
export const initializeAnalytics = (config: {
  webEngageApiKey?: string;
  moEngageApiKey?: string;
  enableWebEngage?: boolean;
  enableMoEngage?: boolean;
  enableConsoleLogging?: boolean;
  respectDoNotTrack?: boolean;
  consentRequired?: boolean;
}) => {
  if (!analyticsService) {
    analyticsService = new AnalyticsService(config);
  }
  return analyticsService;
};

export const useAnalytics = () => {
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.state.user || null;

  // Update user in analytics service when auth state changes
  useEffect(() => {
    if (analyticsService) {
      analyticsService.setUser(currentUser);
    }
  }, [currentUser]);

  // Track authentication events
  const trackAuth = useCallback((eventName: string, properties: Record<string, any> = {}) => {
    if (!analyticsService) return;
    analyticsService.trackAuthEvent(eventName, properties);
  }, []);

  // Track user journey steps
  const trackJourneyStep = useCallback((step: UserJourneyStep) => {
    if (!analyticsService) return;
    analyticsService.trackJourneyStep(step);
  }, []);

  // Track errors
  const trackError = useCallback((error: string | Error, context: Record<string, any> = {}) => {
    if (!analyticsService) return;
    analyticsService.trackError(error, context);
  }, []);

  // Track performance metrics
  const trackPerformance = useCallback((metric: string, value: number, unit: string = 'ms') => {
    if (!analyticsService) return;
    analyticsService.trackPerformance(metric, value, unit);
  }, []);

  // Track UI interactions
  const trackUIInteraction = useCallback((element: string, action: string, properties: Record<string, any> = {}) => {
    if (!analyticsService) return;
    analyticsService.trackUIInteraction(element, action, properties);
  }, []);

  // Set consent
  const setConsent = useCallback((hasConsent: boolean) => {
    if (!analyticsService) return;
    analyticsService.setConsent(hasConsent);
  }, []);

  // Get journey summary
  const getJourneySummary = useCallback(() => {
    if (!analyticsService) return null;
    return analyticsService.getJourneySummary();
  }, []);

  // Clear journey
  const clearJourney = useCallback(() => {
    if (!analyticsService) return;
    analyticsService.clearJourney();
  }, []);

  // Convenience methods for common authentication events
  const trackLoginStart = useCallback((method: 'phone' | 'email' | 'google' | 'truecaller' | 'finoramic') => {
    trackAuth('login_started', { method });
    trackJourneyStep({
      step: 'login_started',
      flow: `${method}_auth` as any,
      timestamp: new Date()
    });
  }, [trackAuth, trackJourneyStep]);

  const trackLoginSuccess = useCallback((method: 'phone' | 'email' | 'google' | 'truecaller' | 'finoramic', duration?: number) => {
    trackAuth('login_success', { method, duration });
    trackJourneyStep({
      step: 'login_success',
      flow: `${method}_auth` as any,
      timestamp: new Date(),
      duration,
      success: true
    });
  }, [trackAuth, trackJourneyStep]);

  const trackLoginFailure = useCallback((method: 'phone' | 'email' | 'google' | 'truecaller' | 'finoramic', error: string, duration?: number) => {
    trackAuth('login_failed', { method, error, duration });
    trackJourneyStep({
      step: 'login_failed',
      flow: `${method}_auth` as any,
      timestamp: new Date(),
      duration,
      success: false,
      errorCode: error
    });
  }, [trackAuth, trackJourneyStep]);

  const trackOTPSent = useCallback((phoneNumber: string) => {
    trackAuth('otp_sent', { phoneNumber: phoneNumber.replace(/\d(?=\d{4})/g, '*') }); // Mask phone number
    trackJourneyStep({
      step: 'otp_sent',
      flow: 'phone_auth',
      timestamp: new Date()
    });
  }, [trackAuth, trackJourneyStep]);

  const trackOTPVerified = useCallback((success: boolean, attempts: number = 1) => {
    trackAuth('otp_verified', { success, attempts });
    trackJourneyStep({
      step: 'otp_verified',
      flow: 'phone_auth',
      timestamp: new Date(),
      success
    });
  }, [trackAuth, trackJourneyStep]);

  const trackFormInteraction = useCallback((formName: string, fieldName: string, action: 'focus' | 'blur' | 'change' | 'submit') => {
    trackUIInteraction('form_field', action, { formName, fieldName });
  }, [trackUIInteraction]);

  const trackButtonClick = useCallback((buttonName: string, context?: string) => {
    trackUIInteraction('button', 'click', { buttonName, context });
  }, [trackUIInteraction]);

  const trackPageView = useCallback((pageName: string, properties: Record<string, any> = {}) => {
    trackAuth('page_view', { pageName, ...properties });
  }, [trackAuth]);

  return {
    // Core tracking methods
    trackAuth,
    trackJourneyStep,
    trackError,
    trackPerformance,
    trackUIInteraction,
    
    // Consent and user management
    setConsent,
    
    // Journey management
    getJourneySummary,
    clearJourney,
    
    // Convenience methods for authentication
    trackLoginStart,
    trackLoginSuccess,
    trackLoginFailure,
    trackOTPSent,
    trackOTPVerified,
    
    // UI interaction helpers
    trackFormInteraction,
    trackButtonClick,
    trackPageView,
    
    // Service availability
    isAvailable: !!analyticsService
  };
};

export default useAnalytics;