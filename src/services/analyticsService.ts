/**
 * Analytics and Tracking Service
 * 
 * Handles event tracking with proper categorization and integrates with:
 * - WebEngage platform
 * - MoEngage platform
 * - User journey tracking through authentication flows
 * - Privacy compliance and consent handling
 * - Ensures tracking failures don't affect authentication
 */

import type { User } from '../types/auth';

export interface AnalyticsEvent {
  name: string;
  category: 'authentication' | 'user_journey' | 'error' | 'performance' | 'ui_interaction';
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: Date;
}

export interface UserJourneyStep {
  step: string;
  flow: 'phone_auth' | 'email_auth' | 'google_auth' | 'truecaller_auth' | 'finoramic_auth';
  timestamp: Date;
  duration?: number;
  success?: boolean;
  errorCode?: string;
}

export interface AnalyticsConfig {
  webEngageApiKey?: string;
  moEngageApiKey?: string;
  enableWebEngage?: boolean;
  enableMoEngage?: boolean;
  enableConsoleLogging?: boolean;
  respectDoNotTrack?: boolean;
  consentRequired?: boolean;
}

export class AnalyticsService {
  private config: AnalyticsConfig;
  private hasConsent: boolean = false;
  private isInitialized: boolean = false;
  private eventQueue: AnalyticsEvent[] = [];
  private currentUser: User | null = null;
  private sessionId: string;
  private journeySteps: UserJourneyStep[] = [];

  constructor(config: AnalyticsConfig) {
    this.config = {
      enableConsoleLogging: false,
      respectDoNotTrack: true,
      consentRequired: false,
      ...config
    };
    
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  /**
   * Initialize analytics service
   */
  private async initialize(): Promise<void> {
    try {
      // Check Do Not Track preference
      if (this.config.respectDoNotTrack && this.isDoNotTrackEnabled()) {
        console.info('Analytics disabled due to Do Not Track preference');
        return;
      }

      // Initialize WebEngage if enabled
      if (this.config.enableWebEngage && this.config.webEngageApiKey) {
        await this.initializeWebEngage();
      }

      // Initialize MoEngage if enabled
      if (this.config.enableMoEngage && this.config.moEngageApiKey) {
        await this.initializeMoEngage();
      }

      this.isInitialized = true;

      // Process queued events if we have consent
      if (!this.config.consentRequired || this.hasConsent) {
        this.processEventQueue();
      }

    } catch (error) {
      console.error('Analytics initialization failed:', error);
      // Don't throw - analytics failures shouldn't affect app functionality
    }
  }

  /**
   * Initialize WebEngage
   */
  private async initializeWebEngage(): Promise<void> {
    try {
      if (typeof window === 'undefined') return;

      // Load WebEngage SDK
      if (!window.webengage) {
        const script = document.createElement('script');
        script.src = 'https://ssl.gstatic.com/webengage/js/webengage.min.js';
        script.async = true;
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // Initialize WebEngage
      if (this.config.webEngageApiKey && window.webengage) {
        window.webengage.init(this.config.webEngageApiKey);
      }
      
      console.info('WebEngage initialized successfully');
    } catch (error) {
      console.error('WebEngage initialization failed:', error);
    }
  }

  /**
   * Initialize MoEngage
   */
  private async initializeMoEngage(): Promise<void> {
    try {
      if (typeof window === 'undefined') return;

      // Load MoEngage SDK
      if (!window.Moengage) {
        const script = document.createElement('script');
        script.src = 'https://cdn.moengage.com/webpush/moe_webSdk.min.latest.js';
        script.async = true;
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // Initialize MoEngage
      if (this.config.moEngageApiKey && window.Moengage) {
        window.Moengage.init({
          app_id: this.config.moEngageApiKey,
          debug_logs: this.config.enableConsoleLogging ? 1 : 0
        });
      }

      console.info('MoEngage initialized successfully');
    } catch (error) {
      console.error('MoEngage initialization failed:', error);
    }
  }

  /**
   * Set user consent for tracking
   */
  setConsent(hasConsent: boolean): void {
    this.hasConsent = hasConsent;
    
    if (hasConsent && this.isInitialized) {
      this.processEventQueue();
    } else if (!hasConsent) {
      this.clearEventQueue();
    }
  }

  /**
   * Set current user
   */
  setUser(user: User | null): void {
    this.currentUser = user;
    
    if (user && this.canTrack()) {
      this.identifyUser(user);
    }
  }

  /**
   * Track authentication event
   */
  trackAuthEvent(eventName: string, properties: Record<string, any> = {}): void {
    this.track({
      name: eventName,
      category: 'authentication',
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      },
      userId: this.currentUser?.id
    });
  }

  /**
   * Track user journey step
   */
  trackJourneyStep(step: UserJourneyStep): void {
    this.journeySteps.push(step);
    
    this.track({
      name: 'journey_step',
      category: 'user_journey',
      properties: {
        step: step.step,
        flow: step.flow,
        duration: step.duration,
        success: step.success,
        errorCode: step.errorCode,
        totalSteps: this.journeySteps.length,
        sessionId: this.sessionId
      },
      userId: this.currentUser?.id
    });
  }

  /**
   * Track error event
   */
  trackError(error: string | Error, context: Record<string, any> = {}): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.track({
      name: 'error_occurred',
      category: 'error',
      properties: {
        error: errorMessage,
        stack: errorStack,
        context,
        sessionId: this.sessionId,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      },
      userId: this.currentUser?.id
    });
  }

  /**
   * Track performance event
   */
  trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.track({
      name: 'performance_metric',
      category: 'performance',
      properties: {
        metric,
        value,
        unit,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      },
      userId: this.currentUser?.id
    });
  }

  /**
   * Track UI interaction
   */
  trackUIInteraction(element: string, action: string, properties: Record<string, any> = {}): void {
    this.track({
      name: 'ui_interaction',
      category: 'ui_interaction',
      properties: {
        element,
        action,
        ...properties,
        sessionId: this.sessionId
      },
      userId: this.currentUser?.id
    });
  }

  /**
   * Get user journey summary
   */
  getJourneySummary(): {
    totalSteps: number;
    totalDuration: number;
    successfulSteps: number;
    failedSteps: number;
    currentFlow?: string;
  } {
    const totalSteps = this.journeySteps.length;
    const totalDuration = this.journeySteps.reduce((sum, step) => sum + (step.duration || 0), 0);
    const successfulSteps = this.journeySteps.filter(step => step.success === true).length;
    const failedSteps = this.journeySteps.filter(step => step.success === false).length;
    const currentFlow = this.journeySteps[this.journeySteps.length - 1]?.flow;

    return {
      totalSteps,
      totalDuration,
      successfulSteps,
      failedSteps,
      currentFlow
    };
  }

  /**
   * Clear user journey
   */
  clearJourney(): void {
    this.journeySteps = [];
  }

  /**
   * Main tracking method
   */
  private track(event: AnalyticsEvent): void {
    try {
      // Add timestamp if not provided
      if (!event.timestamp) {
        event.timestamp = new Date();
      }

      // Check if we can track
      if (!this.canTrack()) {
        if (this.config.consentRequired && !this.hasConsent) {
          // Queue event for later if consent is required but not given
          this.eventQueue.push(event);
        }
        return;
      }

      // Console logging if enabled
      if (this.config.enableConsoleLogging) {
        console.log('Analytics Event:', event);
      }

      // Send to WebEngage
      if (this.config.enableWebEngage && window.webengage) {
        this.sendToWebEngage(event);
      }

      // Send to MoEngage
      if (this.config.enableMoEngage && window.Moengage) {
        this.sendToMoEngage(event);
      }

    } catch (error) {
      console.error('Analytics tracking failed:', error);
      // Don't throw - tracking failures shouldn't affect app functionality
    }
  }

  /**
   * Send event to WebEngage
   */
  private sendToWebEngage(event: AnalyticsEvent): void {
    try {
      if (!window.webengage) return;

      window.webengage.track(event.name, {
        category: event.category,
        ...event.properties,
        timestamp: event.timestamp?.toISOString()
      });
    } catch (error) {
      console.error('WebEngage tracking failed:', error);
    }
  }

  /**
   * Send event to MoEngage
   */
  private sendToMoEngage(event: AnalyticsEvent): void {
    try {
      if (!window.Moengage) return;

      window.Moengage.track_event(event.name, {
        category: event.category,
        ...event.properties,
        timestamp: event.timestamp?.toISOString()
      });
    } catch (error) {
      console.error('MoEngage tracking failed:', error);
    }
  }

  /**
   * Identify user in analytics platforms
   */
  private identifyUser(user: User): void {
    try {
      const userProperties = {
        userId: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt.toISOString()
      };

      // Identify in WebEngage
      if (this.config.enableWebEngage && window.webengage) {
        window.webengage.user.login(user.id);
        window.webengage.user.setAttribute(userProperties);
      }

      // Identify in MoEngage
      if (this.config.enableMoEngage && window.Moengage) {
        window.Moengage.add_unique_user_id(user.id);
        window.Moengage.add_user_attribute('email', user.email);
        window.Moengage.add_user_attribute('phone', user.phoneNumber);
        window.Moengage.add_user_attribute('isVerified', user.isVerified);
      }

    } catch (error) {
      console.error('User identification failed:', error);
    }
  }

  /**
   * Check if tracking is allowed
   */
  private canTrack(): boolean {
    // Check Do Not Track
    if (this.config.respectDoNotTrack && this.isDoNotTrackEnabled()) {
      return false;
    }

    // Check consent requirement
    if (this.config.consentRequired && !this.hasConsent) {
      return false;
    }

    // Check initialization
    if (!this.isInitialized) {
      return false;
    }

    return true;
  }

  /**
   * Check if Do Not Track is enabled
   */
  private isDoNotTrackEnabled(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    return navigator.doNotTrack === '1' || 
           navigator.doNotTrack === 'yes' || 
           (window as any).doNotTrack === '1';
  }

  /**
   * Process queued events
   */
  private processEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.track(event);
      }
    }
  }

  /**
   * Clear event queue
   */
  private clearEventQueue(): void {
    this.eventQueue = [];
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Extend Window interface for analytics SDKs
declare global {
  interface Window {
    webengage?: {
      init: (apiKey: string) => void;
      track: (eventName: string, properties: Record<string, any>) => void;
      user: {
        login: (userId: string) => void;
        setAttribute: (properties: Record<string, any>) => void;
      };
    };
    Moengage?: {
      init: (config: { app_id: string; debug_logs: number }) => void;
      track_event: (eventName: string, properties?: Record<string, any>) => void;
      add_unique_user_id: (userId: string) => void;
      add_user_attribute: (key: string, value: any) => void;
      add_email: (email: string) => void;
      add_mobile: (mobile: string) => void;
    };
  }
}

export default AnalyticsService;