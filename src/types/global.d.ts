/**
 * Global type declarations for window extensions and third-party libraries.
 */

// WebEngage SDK types
interface WebEngageUser {
  login(userId: string): void;
  setAttribute(key: string, value: string | number | boolean): void;
  logout(): void;
}

interface WebEngageTrack {
  (eventName: string, eventData?: Record<string, unknown>): void;
}

interface WebEngage {
  user: WebEngageUser;
  track: WebEngageTrack;
  init(apiKey: string): void;
}

// MoEngage SDK types
interface MoEngageUser {
  setUniqueId(userId: string): void;
  setFirstName(name: string): void;
  setEmail(email: string): void;
  setMobileNumber(phone: string): void;
  setUserAttribute(key: string, value: string | number | boolean): void;
}

interface MoEngage {
  add_unique_user_id(userId: string): void;
  add_first_name(name: string): void;
  add_email(email: string): void;
  add_mobile(phone: string): void;
  add_user_attribute(key: string, value: string | number | boolean): void;
  track_event(eventName: string, eventData?: Record<string, unknown>): void;
  destroy_session(): void;
}

// Google Microapps types
interface MicroappsIdentityResponse {
  status: "SUCCESS" | "ERROR";
  gtoken?: string;
  error?: string;
}

interface Microapps {
  getIdentity(options: { reason: string }): Promise<MicroappsIdentityResponse>;
}

// Yellow Messenger types
interface YmConfig {
  bot: string;
  host: string;
  payload?: Record<string, unknown>;
}

// Extend Window interface
declare global {
  interface Window {
    // Analytics SDKs
    webengage?: WebEngage;
    Moengage?: MoEngage;
    moe?: MoEngage;

    // Google
    microapps?: Microapps;
    google?: {
      accounts?: {
        id: {
          initialize(config: Record<string, unknown>): void;
          prompt(): void;
        };
      };
    };

    // Yellow Messenger
    ymConfig?: YmConfig;

    // Opera browser detection
    opera?: unknown;

    // Environment config (legacy)
    __ENV__?: Record<string, string>;
  }
}

export {};
