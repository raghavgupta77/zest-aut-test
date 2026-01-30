/**
 * UI string constants for authentication flows.
 * Centralizes all user-facing text for easy maintenance and i18n.
 */

export const AUTH_STRINGS = {
  // Common
  CONTINUE: "Continue",
  CANCEL: "Cancel",
  LOADING: "Loading...",
  PLEASE_WAIT: "Please wait...",
  RETRY: "Retry",
  OR: "Or",
  BACK_TO_LOGIN: "Back to Login",

  // Headers
  HELLO: "Hello!",
  HEY_THERE: "Hey there!",
  WELCOME_SUBTITLE: "An incredible credit experience is waiting for you",
  WELCOME_FAMILY: "We are excited to welcome you to the ZestMoney family",

  // Mobile Number
  MOBILE_NUMBER_LABEL: "Mobile number",
  INVALID_MOBILE: "Please enter a valid number",
  DOWNLOAD_APP: "Download the app",
  DOWNLOAD_APP_SUBTITLE: "For the best Zest experience",
  DOWNLOAD: "Download",

  // OTP
  ENTER_OTP_SENT_TO: "Enter OTP sent to",
  DIDNT_GET_OTP: "Didn't get the OTP?",
  RESEND: "Resend",
  INCORRECT_OTP: "Incorrect OTP. Please enter the verification code again",
  OTP_INVALID_TITLE: "OTP Invalid",
  OTP_INVALID_DESCRIPTION: "Sorry, your OTP is invalid. Please login again.",

  // Email
  EMAIL_LABEL: "Email ID",
  INVALID_EMAIL: "Please enter a valid email ID",
  EMAIL_NOT_FOUND_TITLE: "Email ID not found",
  EMAIL_NOT_FOUND_DESCRIPTION: "Sorry, we could not fetch your email ID. Please enter your email ID.",
  EMAIL_BELONGS_TO_ANOTHER_TITLE: "Email ID belongs to another user",
  EMAIL_BELONGS_TO_ANOTHER_DESCRIPTION: "Sorry, this email is linked to a different account. Please login again.",

  // Google Auth
  CONTINUE_WITH_GOOGLE: "Continue with Google",

  // Forgot Password
  FORGOT_PASSWORD_TITLE: "Forgot Password?",
  FORGOT_PASSWORD_SUBTITLE: "Enter your email address and we'll send you a link to reset your password",
  SEND_RESET_LINK: "Send Reset Link",
  SENDING: "Sending...",
  CHECK_YOUR_EMAIL: "Check your email",
  PASSWORD_RESET_SENT: "We've sent a password reset link to your email address",
  NO_USER_WITH_EMAIL: "There is no user registered with this email",

  // Logout
  LOGGING_OUT: "Logging out...",
  LOGOUT_COUNTDOWN: "You will be logged out in {timer} seconds",
  LOGOUT_CONFIRM_TITLE: "Are you sure you want to log out?",
  LOGOUT_CONFIRM_DESCRIPTION: "You will need to verify your phone number again to continue.",
  YES_LOG_OUT: "Yes, Log Out",

  // Consent
  PRIVACY_POLICY: "Privacy Policy",
  TERMS_AND_CONDITIONS: "Terms and Conditions",
  AGREE_TEXT: "By creating an account, I agree with",

  // WhatsApp
  WHATSAPP_CONSENT: "Receive messages on Whatsapp",

  // Errors
  SOMETHING_WENT_WRONG: "Something went wrong",
  SERVICE_NOT_INITIALIZED: "Service not initialized. Please refresh and try again.",
  GENERIC_LOGIN_ERROR: "Something went wrong, please login with OTP / Email",

  // Not Found
  PAGE_NOT_FOUND: "Page Not Found",
  PAGE_NOT_FOUND_DESCRIPTION: "The page you're looking for doesn't exist or has been moved.",
  GO_TO_HOME: "Go to Home",

  // Analytics Consent
  PRIVACY_ANALYTICS_TITLE: "Privacy & Analytics",
  ANALYTICS_DESCRIPTION: "We use analytics to improve your experience and understand how our authentication system is used.",
  WHAT_WE_TRACK: "What we track:",
  WHAT_WE_DONT_TRACK: "What we don't track:",
  ACCEPT_ANALYTICS: "Accept Analytics",
  DECLINE: "Decline",

  // Error Boundary
  ERROR_BOUNDARY_TITLE: "Something went wrong",
  ERROR_BOUNDARY_DESCRIPTION: "We've encountered an unexpected error. Please refresh the page to try again.",
  REFRESH_PAGE: "Refresh Page",

  // Init
  INITIALIZATION_ERROR: "Initialization Error",
  INITIALIZING: "Initializing application...",
} as const;

export const TRACKING_EVENTS = {
  // Auth Events
  AUTHENTICATION_STARTED: "authentication_started",
  MOBILE_SUBMITTED: "Onboarding_Mobile_Submited",
  LOGIN_DONE: "Onboarding_Login_Done",
  SIGNUP_DONE: "Onboarding_Signup_Done",
  EMAIL_SUBMITTED: "Onboarding_Email_Submitted",
  GMAIL_REDIRECT_STARTED: "Onboarding_Gmail_Redirect_Started",
  GMAIL_REDIRECT_COMPLETED: "Onboarding_Gmail_Redirect_Completed",

  // Consent Events
  WHATSAPP_CONSENT_SUBMITTED: "Onboarding_Whatsapp_Consent_Submitted",
  DATASHARING_CONSENT_SUBMITTED: "Onboarding_Datasharing_Consent_Submitted",

  // Misc
  RESEND_OTP_CLICKED: "resend_otp_clicked",
  WA_OPT_IN: "wa_opt_in",
  WA_OPT_OUT: "wa_opt_out",
} as const;

export const AUTH_IDENTIFIERS = {
  PAN_IDENTIFIER: "panIdentifier",
  GMAIL_STATEMENT_PARSING: "GMAIL-STATEMENT-PARSING",
  VERSION: "2",
} as const;
