/**
 * Authentication-related types and interfaces
 */

// Core User interface
export interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  isVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

// Authentication token interface
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
}

export interface AuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}
// Authentication credentials for different auth methods
export interface AuthCredentials {
  type: 'email' | 'phone' | 'google' | 'truecaller' | 'finoramic';
  email?: string;
  password?: string;
  phoneNumber?: string;
  otp?: string;
  otpId?: string;
  externalToken?: string;
}

// OTP-related interfaces
export interface OTPResponse {
  otpId: string;
  expiresIn: number;
  canResend: boolean;
  nextResendIn?: number;
}

// Third-party authentication profiles
export interface TruecallerProfile {
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  countryCode: string;
  requestId: string;
}

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

export interface FinoramicProfile {
  userId: string;
  email?: string;
  phoneNumber?: string;
  name?: string;
  accessToken: string;
}