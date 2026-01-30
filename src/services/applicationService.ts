/**
 * Application Service
 * Exact React replacement for Angular ApplicationService
 * Handles feature flag API calls with custom x-api-key headers
 */

import { getEnvironmentConfig } from '../config/environment';

export interface FeatureSwitch {
  enabled: boolean;
}

export interface FeatureVersion {
  version: string;
  active: boolean;
}

export class ApplicationService {
  private featureSwitchUrl = '/features/{featureId}?merchantId={merchantId}';
  private featureTagUrl = '/features/{featureId}/tag';

  constructor() {
    // Uses centralized environment config
  }

  /**
   * Get environment configuration
   */
  private getEnvConfig(environmentType: string) {
    return getEnvironmentConfig(environmentType);
  }

  /**
   * Set headers for features API with x-api-key
   */
  private setHeadersForFeaturesApi(environmentType: string, apiKey?: string): HeadersInit {
    const envConfig = this.getEnvConfig(environmentType);
    return {
      'Content-Type': 'application/json',
      'x-api-key': apiKey || envConfig.featuresApiKey
    };
  }

  /**
   * Get feature version
   * GET /features/{featureId}?merchantId={merchantId}&customerId={customerId}
   */
  async getFeatureVersion(
    environmentType: string,
    featureId: string,
    customerId?: string,
    merchantId?: string
  ): Promise<FeatureVersion> {
    let url = this.featureSwitchUrl.replace('{featureId}', featureId);
    url = url.replace('{merchantId}', merchantId || '00000000-0000-0000-0000-000000000000');
    
    if (customerId) {
      url = `${url}&customerId=${customerId}`;
    }

    const envConfig = this.getEnvConfig(environmentType);
    const fullUrl = `${envConfig.featureSwitchUrl}${url}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: this.setHeadersForFeaturesApi(environmentType, envConfig.featuresApiKey)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Tag feature to customer
   * POST /features/{featureId}/tag
   */
  async tagFeatureToCustomer(
    featureId: string,
    version: string,
    environmentType: string,
    customerId: string,
    merchantId?: string
  ): Promise<any> {
    const envConfig = this.getEnvConfig(environmentType);
    let url = this.featureTagUrl.replace('{featureId}', featureId);
    url = `${envConfig.featureSwitchUrl}${url}`;
    
    merchantId = merchantId || '00000000-0000-0000-0000-000000000000';
    const data = { customerId, merchantId, featureId, version };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.setHeadersForFeaturesApi(environmentType, envConfig.featuresApiKey),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const applicationService = new ApplicationService();
