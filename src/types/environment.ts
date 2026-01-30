/**
 * Environment configuration types and interfaces
 */

export interface FeatureFlags {
  enableGoogleAuth: boolean;
  enableTruecallerAuth: boolean;
  enableFinoramicAuth: boolean;
  enableAnalytics: boolean;
  enableDebugMode: boolean;
}

export interface Environment {
  name: string;
  baseUrl: string;
  apiKey: string;
  googleClientId: string;
  truecallerAppKey: string;
  finoramicClientId: string;
  webEngageKey: string;
  moEngageKey: string;
  features: FeatureFlags;
}

export type EnvironmentName = 'development' | 'staging' | 'production' | 'local';

export interface EnvironmentConfig {
  [key: string]: Environment;
}