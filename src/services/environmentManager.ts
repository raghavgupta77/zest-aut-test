import { z } from 'zod';
import type { Environment, EnvironmentName, FeatureFlags } from '../types/environment';

/**
 * Zod schema for environment variable validation
 */
const EnvironmentSchema = z.object({
  VITE_APP_NAME: z.string().min(1, 'App name is required'),
  VITE_ENVIRONMENT: z.enum(['development', 'staging', 'production', 'local']),
  VITE_API_BASE_URL: z.string().url('Invalid API base URL'),
  VITE_API_KEY: z.string().min(1, 'API key is required'),
  VITE_GOOGLE_CLIENT_ID: z.string().optional(),
  VITE_TRUECALLER_APP_KEY: z.string().optional(),
  VITE_FINORAMIC_CLIENT_ID: z.string().optional(),
  VITE_WEBENGAGE_KEY: z.string().optional(),
  VITE_MOENGAGE_KEY: z.string().optional(),
  VITE_ENABLE_GOOGLE_AUTH: z.string().optional().default('false'),
  VITE_ENABLE_TRUECALLER_AUTH: z.string().optional().default('false'),
  VITE_ENABLE_FINORAMIC_AUTH: z.string().optional().default('false'),
  VITE_ENABLE_ANALYTICS: z.string().optional().default('true'),
  VITE_ENABLE_DEBUG_MODE: z.string().optional().default('false'),
});

type EnvironmentVariables = z.infer<typeof EnvironmentSchema>;

/**
 * Environment Manager class for handling environment configuration
 */
export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private environment: Environment;
  private isValidated = false;

  private constructor() {
    this.environment = this.createDefaultEnvironment();
  }

  /**
   * Get singleton instance of EnvironmentManager
   */
  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  /**
   * Validate and initialize environment configuration
   */
  public validateAndInitialize(): Environment {
    try {
      const rawEnv = this.getRawEnvironmentVariables();
      
      // If required env vars are missing, use defaults for local development
      if (!rawEnv.VITE_APP_NAME || !rawEnv.VITE_ENVIRONMENT || !rawEnv.VITE_API_BASE_URL || !rawEnv.VITE_API_KEY) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ Missing required environment variables. Using default local configuration.');
        this.environment = this.createDefaultEnvironment();
        this.isValidated = true;
        return this.environment;
      }
      
      const validatedEnv = EnvironmentSchema.parse(rawEnv);
      
      this.environment = this.mapToEnvironment(validatedEnv);
      this.isValidated = true;
      
      // Log successful validation (only in development)
      if (this.environment.name === 'development' || this.environment.name === 'local') {
        // eslint-disable-next-line no-console
        console.log('✅ Environment configuration validated successfully');
      }
      
      return this.environment;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('⚠️ Environment validation failed, using defaults:', error);
      // Use defaults instead of throwing for local testing
      this.environment = this.createDefaultEnvironment();
      this.isValidated = true;
      return this.environment;
    }
  }

  /**
   * Get current environment configuration
   */
  public getEnvironment(): Environment {
    if (!this.isValidated) {
      throw new Error('Environment not validated. Call validateAndInitialize() first.');
    }
    return this.environment;
  }

  /**
   * Check if a feature flag is enabled
   */
  public isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    const environment = this.getEnvironment();
    const features = environment.features;
    
    // Safe property access with explicit type checking
    switch (feature) {
      case 'enableGoogleAuth':
        return features.enableGoogleAuth;
      case 'enableTruecallerAuth':
        return features.enableTruecallerAuth;
      case 'enableFinoramicAuth':
        return features.enableFinoramicAuth;
      case 'enableAnalytics':
        return features.enableAnalytics;
      case 'enableDebugMode':
        return features.enableDebugMode;
      default:
        return false;
    }
  }

  /**
   * Get environment name
   */
  public getEnvironmentName(): EnvironmentName {
    const env = this.getEnvironment();
    return env.name as EnvironmentName;
  }

  /**
   * Check if running in development mode
   */
  public isDevelopment(): boolean {
    return this.getEnvironmentName() === 'development' || this.getEnvironmentName() === 'local';
  }

  /**
   * Check if running in production mode
   */
  public isProduction(): boolean {
    return this.getEnvironmentName() === 'production';
  }

  /**
   * Get raw environment variables from import.meta.env
   */
  private getRawEnvironmentVariables(): Record<string, string | undefined> {
    return {
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
      VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_API_KEY: import.meta.env.VITE_API_KEY,
      VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      VITE_TRUECALLER_APP_KEY: import.meta.env.VITE_TRUECALLER_APP_KEY,
      VITE_FINORAMIC_CLIENT_ID: import.meta.env.VITE_FINORAMIC_CLIENT_ID,
      VITE_WEBENGAGE_KEY: import.meta.env.VITE_WEBENGAGE_KEY,
      VITE_MOENGAGE_KEY: import.meta.env.VITE_MOENGAGE_KEY,
      VITE_ENABLE_GOOGLE_AUTH: import.meta.env.VITE_ENABLE_GOOGLE_AUTH,
      VITE_ENABLE_TRUECALLER_AUTH: import.meta.env.VITE_ENABLE_TRUECALLER_AUTH,
      VITE_ENABLE_FINORAMIC_AUTH: import.meta.env.VITE_ENABLE_FINORAMIC_AUTH,
      VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
      VITE_ENABLE_DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE,
    };
  }

  /**
   * Map validated environment variables to Environment interface
   */
  private mapToEnvironment(env: EnvironmentVariables): Environment {
    const features: FeatureFlags = {
      enableGoogleAuth: env.VITE_ENABLE_GOOGLE_AUTH === 'true',
      enableTruecallerAuth: env.VITE_ENABLE_TRUECALLER_AUTH === 'true',
      enableFinoramicAuth: env.VITE_ENABLE_FINORAMIC_AUTH === 'true',
      enableAnalytics: env.VITE_ENABLE_ANALYTICS === 'true',
      enableDebugMode: env.VITE_ENABLE_DEBUG_MODE === 'true',
    };

    return {
      name: env.VITE_ENVIRONMENT,
      baseUrl: env.VITE_API_BASE_URL,
      apiKey: env.VITE_API_KEY,
      googleClientId: env.VITE_GOOGLE_CLIENT_ID || '',
      truecallerAppKey: env.VITE_TRUECALLER_APP_KEY || '',
      finoramicClientId: env.VITE_FINORAMIC_CLIENT_ID || '',
      webEngageKey: env.VITE_WEBENGAGE_KEY || '',
      moEngageKey: env.VITE_MOENGAGE_KEY || '',
      features,
    };
  }

  /**
   * Create default environment configuration with fallback values
   */
  private createDefaultEnvironment(): Environment {
    // Use Local environment config from Angular as default
    return {
      name: 'local',
      baseUrl: 'https://staging-auth.zestmoney.in',
      apiKey: '14FTv6F6dj94qA3AiTGyEacUKbQRCj0gZT3C0TKe',
      googleClientId: '508197139032-5eanucd3nfoa49iikn15ahusjeesc7vp.apps.googleusercontent.com',
      truecallerAppKey: '',
      finoramicClientId: 'ae717c9e-5b4f-4a54-99c5-ec26e1937b82',
      webEngageKey: 'in~11b564183',
      moEngageKey: '',
      features: {
        enableGoogleAuth: true,
        enableTruecallerAuth: false,
        enableFinoramicAuth: true,
        enableAnalytics: true,
        enableDebugMode: true,
      },
    };
  }
}

/**
 * Export singleton instance for easy access
 */
export const environmentManager = EnvironmentManager.getInstance();