/**
 * Central export file for all type definitions
 */

// Authentication types
export type {
  User,
  AuthToken,
  AuthCredentials,
  OTPResponse,
  TruecallerProfile,
  GoogleProfile,
  FinoramicProfile
} from './auth';

// API types
export type {
  APIResponse,
  ValidationError,
  RequestConfig,
  HTTPMethod,
  APIEndpoint,
  RequestInterceptor,
  ResponseInterceptor,
  PaginatedResponse,
  RateLimitInfo
} from './api';

// Error types
export type {
  AuthError,
  ErrorContext,
  RecoveryAction,
  NetworkError,
  ThirdPartyError,
  ValidationResult
} from './errors';

export {
  ErrorType,
  InputType
} from './errors';

// Environment types
export type {
  Environment,
  FeatureFlags,
  EnvironmentName,
  EnvironmentConfig
} from './environment';

// Schema types and validators
export {
  UserSchema,
  AuthTokenSchema,
  AuthCredentialsSchema,
  OTPResponseSchema,
  APIResponseSchema,
  ValidationErrorSchema,
  AuthErrorSchema,
  TruecallerProfileSchema,
  GoogleProfileSchema,
  FinoramicProfileSchema,
  EmailInputSchema,
  PhoneInputSchema,
  PasswordInputSchema,
  OTPInputSchema,
  NameInputSchema,
  RequestConfigSchema
} from './schemas';

// Re-export schema inferred types
export type {
  User as UserType,
  AuthToken as AuthTokenType,
  AuthCredentials as AuthCredentialsType,
  OTPResponse as OTPResponseType,
  ValidationError as ValidationErrorType,
  AuthErrorSchemaType as AuthErrorType,
  TruecallerProfile as TruecallerProfileType,
  GoogleProfile as GoogleProfileType,
  FinoramicProfile as FinoramicProfileType,
  RequestConfig as RequestConfigType
} from './schemas';