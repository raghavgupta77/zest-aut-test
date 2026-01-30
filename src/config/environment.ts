/**
 * Environment Configuration
 * EXACT copy from Angular src/environments/environment.ts
 * Provides all environment-specific configuration for API calls
 */

import { ROUTES } from '../constants/routes';

export interface EnvironmentConfig {
  baseUrl: string;
  baseAppUrl: string;
  s3Url: string;
  funnelUrl: string;
  defaultUuid: string;
  zestMerchantId: string;
  token_client_id: string;
  google_token_client_id: string;
  hashed_client_token: string;
  hashed_auth_token: string;
  client_secret: string;
  google_login_client_id: string;
  partnerCheckoutUrl?: string[];
  finoramicDomain: string;
  finoramicClientId: string;
  finoramicClient: string;
  finoramicCallback: string;
  featuresApiKey: string;
  featureSwitchUrl: string;
  scripts: {
    pixelScriptUrl: string;
  };
}

export interface Environment {
  production: boolean;
  Local: EnvironmentConfig;
  Staging: EnvironmentConfig;
  Production: EnvironmentConfig;
  Sandbox: EnvironmentConfig;
  Docker: EnvironmentConfig;
  Develop2: EnvironmentConfig;
  Test: EnvironmentConfig;
  [key: string]: EnvironmentConfig | boolean;
}

export const environment: Environment = {
  production: true,
  Local: {
    baseUrl: 'https://staging-auth.zestmoney.in',
    baseAppUrl: 'https://staging-app.zestmoney.in',
    s3Url: 'https://s3.ap-south-1.amazonaws.com/staging-merchants-assets',
    funnelUrl: 'https://staging-funneltrack.zestmoney.in',
    defaultUuid: '00000000-0000-0000-0000-000000000000',
    zestMerchantId: 'a70ce9c4-881a-405d-834a-4a18554fb33a',
    token_client_id: '9ADD8006-F45A-11E7-8C3F-9A214CF093AE',
    google_token_client_id: '1BBA6234-0908-4174-952A-5B2D02A72BAE',
    hashed_client_token: 'token:135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85',
    hashed_auth_token: '135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85',
    client_secret: 'testPassword',
    google_login_client_id: '508197139032-5eanucd3nfoa49iikn15ahusjeesc7vp.apps.googleusercontent.com',
    partnerCheckoutUrl: ['https://staging-partner.zestmoney.in', 'https://staging-widget.zestmoney.in'],
    finoramicDomain: 'https://sandbox.finoramic.com',
    finoramicClientId: 'ae717c9e-5b4f-4a54-99c5-ec26e1937b82',
    finoramicClient: 'zestmoney',
    finoramicCallback: ROUTES.FINORAMIC_CALLBACK,
    featuresApiKey: '14FTv6F6dj94qA3AiTGyEacUKbQRCj0gZT3C0TKe',
    featureSwitchUrl: 'https://staging-features.zestmoney.in',
    scripts: {
      pixelScriptUrl: 'https://s3.ap-south-1.amazonaws.com/staging-merchants-assets/pixel.js'
    }
  },
  Staging: {
    baseUrl: 'https://staging-auth.zestmoney.in',
    baseAppUrl: 'https://staging-app.zestmoney.in',
    s3Url: 'https://s3.ap-south-1.amazonaws.com/staging-merchants-assets',
    funnelUrl: 'https://staging-funneltrack.zestmoney.in',
    defaultUuid: '00000000-0000-0000-0000-000000000000',
    zestMerchantId: 'a70ce9c4-881a-405d-834a-4a18554fb33a',
    token_client_id: '9ADD8006-F45A-11E7-8C3F-9A214CF093AE',
    google_token_client_id: '1BBA6234-0908-4174-952A-5B2D02A72BAE',
    hashed_client_token: 'token:135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85',
    hashed_auth_token: '135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85',
    client_secret: 'testPassword',
    google_login_client_id: '1067995482640-5q1qva1qjeku59qs0fgm0lt7f4btkh46.apps.googleusercontent.com',
    partnerCheckoutUrl: ['https://staging-partner.zestmoney.in', 'https://staging-widget.zestmoney.in'],
    finoramicDomain: 'https://sandbox.finoramic.com',
    finoramicClientId: 'sandbox1-12c3-4c5c-9b80-cbf73aec05b6',
    finoramicClient: 'zestmoney-qat',
    finoramicCallback: ROUTES.FINORAMIC_CALLBACK,
    featuresApiKey: '14FTv6F6dj94qA3AiTGyEacUKbQRCj0gZT3C0TKe',
    featureSwitchUrl: 'https://staging-features.zestmoney.in',
    scripts: {
      pixelScriptUrl: 'https://s3.ap-south-1.amazonaws.com/staging-merchants-assets/pixel.js'
    }
  },
  Production: {
    baseUrl: 'https://authentication.zestmoney.in',
    baseAppUrl: 'https://app.zestmoney.in',
    s3Url: 'https://s3.ap-south-1.amazonaws.com/prod-merchants-assets',
    funnelUrl: 'https://funneltrack.zestmoney.in',
    defaultUuid: '00000000-0000-0000-0000-000000000000',
    zestMerchantId: 'b84e625e-9d51-4aeb-af36-d98552dfc0e3',
    token_client_id: '9ADD8006-F45A-11E7-8C3F-9A214CF093AE',
    google_token_client_id: '1BBA6234-0908-4174-952A-5B2D02A72BAE',
    hashed_client_token: 'token:135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85',
    hashed_auth_token: '135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85',
    client_secret: 'testPassword',
    google_login_client_id: '1067995482640-5q1qva1qjeku59qs0fgm0lt7f4btkh46.apps.googleusercontent.com',
    partnerCheckoutUrl: ['https://partner.zestmoney.in', 'https://widget.zestmoney.in'],
    finoramicDomain: 'https://www.finoramic.com',
    finoramicClientId: '6cc8c2df-a347-44a6-9522-245342444ed4',
    finoramicClient: 'zestmoney',
    finoramicCallback: ROUTES.FINORAMIC_CALLBACK,
    featuresApiKey: 'cSRJSgt7nzaYsV4tBwrTuaIUZNei3YBg7fJ4ei5e',
    featureSwitchUrl: 'https://features.zestmoney.in',
    scripts: {
      pixelScriptUrl: 'https://s3.ap-south-1.amazonaws.com/prod-merchants-assets/pixel.js'
    }
  },
  Sandbox: {
    baseUrl: 'https://sandbox-auth.zestmoney.in',
    baseAppUrl: 'https://sandbox-app.zestmoney.in',
    s3Url: 'https://s3.ap-south-1.amazonaws.com/staging-merchants-assets',
    funnelUrl: 'https://test-funneltrack.zestmoney.in',
    defaultUuid: '00000000-0000-0000-0000-000000000000',
    zestMerchantId: 'a70ce9c4-881a-405d-834a-4a18554fb33a',
    token_client_id: '9ADD8006-F45A-11E7-8C3F-9A214CF093AE',
    google_token_client_id: '1BBA6234-0908-4174-952A-5B2D02A72BAE',
    hashed_client_token: 'token:135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85',
    hashed_auth_token: '135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85',
    client_secret: 'testPassword',
    google_login_client_id: '1067995482640-5q1qva1qjeku59qs0fgm0lt7f4btkh46.apps.googleusercontent.com',
    finoramicDomain: 'https://sandbox.finoramic.com',
    finoramicClientId: 'ae717c9e-5b4f-4a54-99c5-ec26e1937b82',
    finoramicClient: 'zestmoney',
    finoramicCallback: ROUTES.FINORAMIC_CALLBACK,
    featuresApiKey: '14FTv6F6dj94qA3AiTGyEacUKbQRCj0gZT3C0TKe',
    featureSwitchUrl: 'https://staging-features.zestmoney.in',
    scripts: {
      pixelScriptUrl: 'https://s3.ap-south-1.amazonaws.com/staging-merchants-assets/pixel.js'
    }
  },
  Docker: {
    baseUrl: 'https://docker-auth.zestmoney.in',
    baseAppUrl: 'https://docker-app.zestmoney.in',
    s3Url: 'https://s3.ap-south-1.amazonaws.com/staging-merchants-assets',
    funnelUrl: 'https://test-funneltrack.zestmoney.in',
    defaultUuid: '00000000-0000-0000-0000-000000000000',
    zestMerchantId: 'a70ce9c4-881a-405d-834a-4a18554fb33a',
    token_client_id: '9ADD8006-F45A-11E7-8C3F-9A214CF093AE',
    google_token_client_id: '1BBA6234-0908-4174-952A-5B2D02A72BAE',
    hashed_client_token: 'token:135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85',
    hashed_auth_token: '135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85',
    client_secret: 'testPassword',
    google_login_client_id: '1067995482640-5q1qva1qjeku59qs0fgm0lt7f4btkh46.apps.googleusercontent.com',
    partnerCheckoutUrl: ['https://partner.zestmoney.in', 'https://widget.zestmoney.in'],
    finoramicDomain: 'https://sandbox.finoramic.com',
    finoramicClientId: 'ae717c9e-5b4f-4a54-99c5-ec26e1937b82',
    finoramicClient: 'zestmoney',
    finoramicCallback: ROUTES.FINORAMIC_CALLBACK,
    featuresApiKey: '14FTv6F6dj94qA3AiTGyEacUKbQRCj0gZT3C0TKe',
    featureSwitchUrl: 'https://staging-features.zestmoney.in',
    scripts: {
      pixelScriptUrl: 'https://s3.ap-south-1.amazonaws.com/staging-merchants-assets/pixel.js'
    }
  },
  Develop2: {
    baseUrl: 'https://develop2-auth.zestmoney.in',
    baseAppUrl: 'https://develop2-app.zestmoney.in',
    s3Url: 'https://s3.ap-south-1.amazonaws.com/staging-merchants-assets',
    funnelUrl: 'https://staging-funneltrack.zestmoney.in',
    defaultUuid: '00000000-0000-0000-0000-000000000000',
    zestMerchantId: 'a70ce9c4-881a-405d-834a-4a18554fb33a',
    token_client_id: '9ADD8006-F45A-11E7-8C3F-9A214CF093AE',
    google_token_client_id: '1BBA6234-0908-4174-952A-5B2D02A72BAE',
    hashed_client_token: 'token:135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85',
    hashed_auth_token: '135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85',
    client_secret: 'testPassword',
    google_login_client_id: '1067995482640-5q1qva1qjeku59qs0fgm0lt7f4btkh46.apps.googleusercontent.com',
    finoramicDomain: 'https://sandbox.finoramic.com',
    finoramicClientId: 'ae717c9e-5b4f-4a54-99c5-ec26e1937b82',
    finoramicClient: 'zestmoney',
    finoramicCallback: ROUTES.FINORAMIC_CALLBACK,
    featuresApiKey: '14FTv6F6dj94qA3AiTGyEacUKbQRCj0gZT3C0TKe',
    featureSwitchUrl: 'https://staging-features.zestmoney.in',
    scripts: {
      pixelScriptUrl: 'https://s3.ap-south-1.amazonaws.com/staging-merchants-assets/pixel.js'
    }
  },
  Test: {
    baseUrl: 'https://test-auth.zestmoney.in',
    baseAppUrl: 'https://test-app.zestmoney.in',
    s3Url: 'https://s3.ap-south-1.amazonaws.com/staging-merchants-assets',
    funnelUrl: 'https://test-funneltrack.zestmoney.in',
    defaultUuid: '00000000-0000-0000-0000-000000000000',
    zestMerchantId: 'a70ce9c4-881a-405d-834a-4a18554fb33a',
    token_client_id: '9ADD8006-F45A-11E7-8C3F-9A214CF093AE',
    google_token_client_id: '1BBA6234-0908-4174-952A-5B2D02A72BAE',
    hashed_client_token: 'token:135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85',
    hashed_auth_token: '135b043150475d7288b936606e086af5c1fb7f0eff15256748f5ad078ebdcf85',
    client_secret: 'testPassword',
    google_login_client_id: '1067995482640-5q1qva1qjeku59qs0fgm0lt7f4btkh46.apps.googleusercontent.com',
    partnerCheckoutUrl: ['https://test-partner.zestmoney.in', 'https://test-widget.zestmoney.in'],
    finoramicDomain: 'https://sandbox.finoramic.com',
    finoramicClientId: 'ae717c9e-5b4f-4a54-99c5-ec26e1937b82',
    finoramicClient: 'zestmoney',
    finoramicCallback: ROUTES.FINORAMIC_CALLBACK,
    featuresApiKey: '14FTv6F6dj94qA3AiTGyEacUKbQRCj0gZT3C0TKe',
    featureSwitchUrl: 'https://staging-features.zestmoney.in',
    scripts: {
      pixelScriptUrl: 'https://s3.ap-south-1.amazonaws.com/staging-merchants-assets/pixel.js'
    }
  }
};

/**
 * Get environment configuration by type
 */
export function getEnvironmentConfig(environmentType: string): EnvironmentConfig {
  const config = environment[environmentType];
  if (!config || typeof config === 'boolean') {
    // Default to Local if not found
    return environment.Local;
  }
  return config as EnvironmentConfig;
}

/**
 * Get current environment type from URL or default
 */
export function getCurrentEnvironmentType(): string {
  // Check URL parameters first
  const urlParams = new URLSearchParams(window.location.search);
  const envParam = urlParams.get('env') || urlParams.get('environment');
  if (envParam && environment[envParam]) {
    return envParam;
  }

  // Check hostname
  const hostname = window.location.hostname;
  if (hostname.includes('staging')) return 'Staging';
  if (hostname.includes('sandbox')) return 'Sandbox';
  if (hostname.includes('test')) return 'Test';
  if (hostname.includes('docker')) return 'Docker';
  if (hostname.includes('develop2')) return 'Develop2';
  if (hostname === 'authentication.zestmoney.in') return 'Production';
  
  // Default to Local for development
  return 'Local';
}
