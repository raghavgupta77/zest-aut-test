/**
 * Central route path constants. Use these for navigation and path checks
 * instead of hardcoded strings so routes stay in sync with src/routes/index.tsx.
 */
export const ROUTES = {
  /** Root auth screen (phone/OTP flow) */
  ROOT: "/",
  /** Email options screen (part of signup flow) */
  EMAIL: "/email",
  /** Forgot password screen */
  FORGOT_PASSWORD: "/forgot-password",
  /** Logout screen */
  LOGOUT: "/logout",
  /** Finoramic OAuth callback */
  FINORAMIC_CALLBACK: "/authentication/finoramic-callback",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
