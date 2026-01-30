/**
 * Tracking Service
 * Exact React replacement for Angular TrackingService
 * Handles backend funnel tracking and WebEngage integration
 */

import { backendService, BackendService } from './backendService';
import { GlobalParams, UserDetails, EventDetails } from '../types/contracts';

// Window interface is extended in analyticsService.ts

export class TrackingService {
  private backendService: BackendService;
  private funnelTrackingUrl = '/funneltrack';

  constructor() {
    this.backendService = backendService;
  }

  /**
   * Get global params from session storage
   */
  getGlobalParamsFromSession(): GlobalParams {
    const params = window.sessionStorage.getItem('ngx-webstorage|zest-params');
    return params ? JSON.parse(params) as GlobalParams : new GlobalParams();
  }

  /**
   * Send event to backend + WebEngage
   * Silently handles 404 errors for tracking endpoints in development
   */
  async sendDataToFunnel(
    userDetails: UserDetails,
    eventDetails: EventDetails,
    environmentType: string,
    clientName: string,
    includeWebEngage: boolean = true
  ): Promise<any> {
    const url = this.backendService.getBaseFunnelUrl(environmentType) + this.funnelTrackingUrl;
    const globalParams = this.getGlobalParamsFromSession();
    const data: any = { ...userDetails, ...eventDetails, ...globalParams };

    if (clientName === 'MyAccounts') {
      data.FlowType = clientName.toLowerCase();
    }

    // WebEngage Event Tracking
    if (includeWebEngage) {
      this.sendEventToWebEngage(data);
    }

    try {
      return await this.backendService.setData(environmentType, url, data, false, null, false, true);
    } catch (error: any) {
      // Handle 404 gracefully - tracking endpoint may not exist in dev
      const is404 = 
        error?.context?.originalError?.includes('404') || 
        error?.context?.originalError?.includes('Not Found') ||
        (error?.code === 'HTTP_ERROR' || error?.code === 'RESPONSE_PARSE_ERROR') && 
        (error?.context?.status === 404 || error?.context?.originalError?.includes('404'));
      
      if (is404) {
        // Silently fail for 404s - tracking endpoint not available
        return { success: true, message: 'Tracking endpoint not available' };
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Send with custom properties
   * Silently handles 404 errors for tracking endpoints in development
   */
  async sendDataToFunnelWithCustomProperties(
    userDetails: UserDetails,
    eventDetails: EventDetails,
    environmentType: string,
    clientName: string,
    includeWebEngage: boolean = true,
    customEventProperties: Record<string, any> = {}
  ): Promise<any> {
    const url = this.backendService.getBaseFunnelUrl(environmentType) + this.funnelTrackingUrl;
    const globalParams = this.getGlobalParamsFromSession();
    const data: any = { ...userDetails, ...eventDetails, ...globalParams };

    if (clientName === 'MyAccounts') {
      data.FlowType = clientName.toLowerCase();
    }

    // WebEngage Event Tracking
    if (includeWebEngage) {
      const mergedProps = { ...data, ...customEventProperties };
      this.sendEventToWebEngage(mergedProps);
    }

    try {
      return await this.backendService.setData(environmentType, url, data, false, null, false, true);
    } catch (error: any) {
      // Handle 404 gracefully - tracking endpoint may not exist in dev
      const is404 = 
        error?.context?.originalError?.includes('404') || 
        error?.context?.originalError?.includes('Not Found') ||
        (error?.code === 'HTTP_ERROR' || error?.code === 'RESPONSE_PARSE_ERROR') && 
        (error?.context?.status === 404 || error?.context?.originalError?.includes('404'));
      
      if (is404) {
        // Silently fail for 404s - tracking endpoint not available
        return { success: true, message: 'Tracking endpoint not available' };
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * WebEngage Event Sender
   */
  private sendEventToWebEngage(data: any): void {
    const webengage = window.webengage;

    if (!webengage || !webengage.track) {
      console.warn('WebEngage not loaded');
      return;
    }

    // Every event must have a name
    const eventName = data.EventName || 'GenericEvent';

    const eventProps = { ...data };
    delete eventProps.EventName;

    webengage.track(eventName, eventProps);
  }
}

// Export singleton instance
export const trackingService = new TrackingService();
