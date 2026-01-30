/**
 * Zod validation schemas for type safety and runtime validation
 */

import { z } from 'zod';

// User schema
export const UserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email format').optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  isVerified: z.boolean(),
  createdAt: z.coerce.date(),
  lastLoginAt: z.coerce.date()
});

// AuthToken schema
export const AuthTokenSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().min(1, 'Refresh token is required'),
  tokenType: z.string().min(1, 'Token type is required'),
  expiresIn: z.number().positive('Expires in must be positive'),
  scope: z.string().min(1, 'Scope is required')
});

// AuthCredentials schema
export const AuthCredentialsSchema = z.object({
  type: z.enum(['email', 'phone', 'google', 'truecaller', 'finoramic']),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  otp: z.string().regex(/^\d{4,6}$/, 'OTP must be 4-6 digits').optional(),
  otpId: z.string().optional(),
  externalToken: z.string().optional()
}).refine((data) => {
  // Validate required fields based on auth type
  switch (data.type) {
    case 'email':
      return data.email && data.password;
    case 'phone':
      return data.phoneNumber && (data.otp ? data.otpId : true);
    case 'google':
    case 'truecaller':
    case 'finoramic':
      return data.externalToken;
    default:
      return false;
  }
}, {
  message: 'Required fields missing for authentication type'
});

// OTPResponse schema
export const OTPResponseSchema = z.object({
  otpId: z.string().min(1, 'OTP ID is required'),
  expiresIn: z.number().positive('Expires in must be positive'),
  canResend: z.boolean(),
  nextResendIn: z.number().nonnegative('Next resend time must be non-negative').optional()
});

// APIResponse schema (generic)
export const APIResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    success: z.boolean(),
    message: z.string().optional(),
    errors: z.array(z.object({
      field: z.string(),
      code: z.string(),
      message: z.string()
    })).optional()
  });

// ValidationError schema
export const ValidationErrorSchema = z.object({
  field: z.string().min(1, 'Field name is required'),
  code: z.string().min(1, 'Error code is required'),
  message: z.string().min(1, 'Error message is required')
});

// AuthError schema
export const AuthErrorSchema = z.object({
  code: z.string().min(1, 'Error code is required'),
  message: z.string().min(1, 'Error message is required'),
  field: z.string().optional(),
  retryable: z.boolean(),
  timestamp: z.coerce.date().optional(),
  context: z.record(z.string(), z.unknown()).optional()
});

// Third-party profile schemas
export const TruecallerProfileSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  countryCode: z.string().min(1, 'Country code is required'),
  requestId: z.string().min(1, 'Request ID is required')
});

export const GoogleProfileSchema = z.object({
  id: z.string().min(1, 'Google ID is required'),
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required'),
  picture: z.string().url('Invalid picture URL').optional(),
  emailVerified: z.boolean()
});

export const FinoramicProfileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email format').optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  name: z.string().optional(),
  accessToken: z.string().min(1, 'Access token is required')
});

// Input validation schemas
export const EmailInputSchema = z.string()
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long');

export const PhoneInputSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
  .min(10, 'Phone number is too short')
  .max(15, 'Phone number is too long');

export const PasswordInputSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and numbers');

export const OTPInputSchema = z.string()
  .regex(/^\d{4,6}$/, 'OTP must be 4-6 digits')
  .length(6, 'OTP must be exactly 6 digits');

export const NameInputSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Request configuration schema
export const RequestConfigSchema = z.object({
  headers: z.record(z.string(), z.string()).optional(),
  timeout: z.number().positive('Timeout must be positive').optional(),
  retries: z.number().nonnegative('Retries must be non-negative').optional(),
  retryDelay: z.number().nonnegative('Retry delay must be non-negative').optional()
});

// Type inference helpers
export type User = z.infer<typeof UserSchema>;
export type AuthToken = z.infer<typeof AuthTokenSchema>;
export type AuthCredentials = z.infer<typeof AuthCredentialsSchema>;
export type OTPResponse = z.infer<typeof OTPResponseSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
// Note: AuthError is defined in errors.ts, using AuthErrorSchemaType here to avoid conflict
export type AuthErrorSchemaType = z.infer<typeof AuthErrorSchema>;
export type TruecallerProfile = z.infer<typeof TruecallerProfileSchema>;
export type GoogleProfile = z.infer<typeof GoogleProfileSchema>;
export type FinoramicProfile = z.infer<typeof FinoramicProfileSchema>;
export type RequestConfig = z.infer<typeof RequestConfigSchema>;