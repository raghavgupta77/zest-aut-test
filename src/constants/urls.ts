/**
 * External URLs and asset paths.
 * Centralizes all URLs for easy maintenance and environment switching.
 */

export const EXTERNAL_URLS = {
  // App Downloads
  ANDROID_APP: "https://play.google.com/store/apps/details?id=in.zestmoney.app",
  IOS_APP: "https://apps.apple.com/in/app/zestmoney/id1270498498",

  // Legal
  TERMS_AND_CONDITIONS: "https://www.zestmoney.in/terms-and-conditions",
  PRIVACY_POLICY: "https://www.zestmoney.in/privacy",
  TNC_PDF_VIEWER: "https://docs.google.com/viewerng/viewer?url=https://assets.zestmoney.in/assets/pdfs/Terms+and+Conditions.pdf&embedded=true",
  PRIVACY_POLICY_PDF_VIEWER: "https://docs.google.com/viewerng/viewer?url=https://assets.zestmoney.in/assets/pdfs/Privacy+Policy.pdf&embedded=true",

  // External Scripts
  GOOGLE_PLATFORM_SCRIPT: "https://apis.google.com/js/platform.js",
  GOOGLE_MICROAPPS_SCRIPT: "https://microapps.google.com/apis/v1alpha/microapps.js",
  WEBENGAGE_SCRIPT: "https://ssl.gstatic.com/webengage/js/webengage.min.js",
  MOENGAGE_SCRIPT: "https://cdn.moengage.com/webpush/moe_webSdk.min.latest.js",
} as const;

export const ASSET_URLS = {
  // Logos and Icons
  LOGO: "/src/assets/images/authentication/logo.svg",
  NEW_LOGO: "/src/assets/images/authentication/new-logo.svg",
  LOADER_LOGO: "/src/assets/images/authentication/loader-logo.svg",
  WELCOME_IMAGE: "/src/assets/images/authentication/welcome-image.svg",
  GOOGLE_ICON: "/src/assets/images/authentication/google.png",
  TRUECALLER_ICON: "/src/assets/images/authentication/truecaller.png",
  WHATSAPP_ICON: "/src/assets/images/authentication/wa.png",
  EMAIL_ICON: "/src/assets/images/authentication/email-icon.svg",
  PASSWORD_ICON: "/src/assets/images/authentication/password-icon.svg",
  ALERT_WARNING: "/src/assets/images/authentication/alert-warning.png",
  REFERRED_IMAGE: "/src/assets/images/authentication/reffered-image.png",

  // Remote Assets
  HEADER_ICON: "https://assets.zestmoney.in/assets/customers/bolt/header_type_1.svg",
  REMOTE_GOOGLE_ICON: "https://assets.zestmoney.in/assets/UI/google.svg",
  DOWNLOAD_APP_ICON: "https://assets.zestmoney.in/assets/payment_app/zest-icon-for-download-app.svg",
} as const;

export const STORAGE_KEYS = {
  ANALYTICS_CONSENT: "analytics_consent",
  AUTH_STATE: "auth_state",
} as const;

export const DEFAULT_VALUES = {
  DEFAULT_UUID: "00000000-0000-0000-0000-000000000000",
  COUNTRY_CODE: "91",
  AUTH_VERSION: "2",
  SESSION_TIMEOUT_MS: 5 * 60 * 1000, // 5 minutes
  AUTH_MAX_AGE_MS: 24 * 60 * 60 * 1000, // 24 hours
  AUTO_FOCUS_DELAY_MS: 500,
} as const;

export const COMPANY_INFO = {
  NAME: "DMI Infotech Solutions Private Limited",
  ALT_TEXT: "ZestMoney",
  SUPPORT_EMAIL: "support@zestmoney.in",
} as const;
