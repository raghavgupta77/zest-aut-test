/**
 * Helper Functions
 * Exact React replacements for Angular helper functions
 */

export interface AuthenticationSessionStorageProperties {
  auth: {
    MobileNumber: string;
    Email: string;
    TypoCorrectedEmail: string | null;
    Password: string;
    ConfirmPassword: string;
    Otp: string;
    OtpId: string;
    ShowMfaChallenge: boolean;
  };
  waOpted: boolean;
  issuedAt: number;
}

export interface Feature {
  featureId: string;
  active: boolean;
  version: string;
}

export const AUTHENTICATION_SESSION_STORAGE_KEY = 'ngx-webstorage|zest-authentication';

/**
 * Check if authentication session storage is valid (within 5 minutes)
 */
export const isValidAuthSessionStorage = (): boolean => {
  const authSessionString = sessionStorage.getItem(AUTHENTICATION_SESSION_STORAGE_KEY);
  if (!authSessionString) {
    return false;
  }

  try {
    const authSession: AuthenticationSessionStorageProperties = JSON.parse(authSessionString);
    return Date.now() - authSession.issuedAt < 60000 * 5;
  } catch (err) {
    return false;
  }
};

const emailRegex = new RegExp(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/);

/**
 * Check if string is a valid email
 */
export const isEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

/**
 * Check if current window is in an iframe
 */
export const isIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return false;
  }
};

/**
 * Check if device is mobile
 * Exact match for Angular mobileCheck() function
 */
export const mobileCheck = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
  const mobileShortRegex = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;
  
  return mobileRegex.test(userAgent) || mobileShortRegex.test(userAgent.substr(0, 4));
};

/**
 * Get mobile operating system
 */
export const getMobileOperatingSystem = (): 'Android' | 'iOS' => {
  const userAgent = navigator.userAgent || navigator.vendor;
  if (/android/i.test(userAgent)) {
    return 'Android';
  }
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 'iOS';
  }
  return 'Android';
};

/**
 * App download URLs
 */
export const appDownloadURL = {
  playStoreURL: 'https://play.google.com/store/apps/details?id=in.zestmoney.app',
  iosURL: 'https://apps.apple.com/in/app/zestmoney/id1234567890'
};

/**
 * Load script dynamically
 */
export const loadScript = (src: string, callback?: () => void): void => {
  const script = document.createElement('script');
  script.async = false;
  script.src = src;
  if (callback) {
    script.onload = callback;
  }
  document.body.appendChild(script);
};

/**
 * URL encode parameters (replacement for $.param())
 */
export const urlEncodeParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

/**
 * Check if error code returned from HTTP error
 * Exact match for Angular checkIfErrorCodeRetured()
 */
export const checkIfErrorCodeRetured = (error: any): string | null => {
  try {
    let error_text: any = JSON.stringify(error.error);
    if (error_text && error_text.length > 0) {
      error_text = JSON.parse(error_text);
      const error_description = error_text.error_description || error_text.Message;
      if (error_description && error_description.length > 0) {
        const error_code = error_description.substring(0, error_description.indexOf('|'));
        if (error_code && error_code.length > 5 && error_code.substring(0, 5) === 'ZMAUT') {
          return error_code;
        }
      }
    }
  } catch (e) {
    // Error parsing failed
  }
  return null;
};

/**
 * Check if error code returned from Google error
 * Exact match for Angular checkIfErrorCodeReturedFromGoogle()
 */
export const checkIfErrorCodeReturedFromGoogle = (error: any): string | null => {
  try {
    let error_text: any = JSON.stringify(error.error);
    if (error_text && error_text.length > 0) {
      error_text = JSON.parse(error_text);
      const error_msg = error_text.error || error_text.Message;
      if (error_msg && error_msg.length > 0) {
        const error_code = error_msg.substring(0, error_msg.indexOf('|'));
        if (error_code && error_code.length > 5 && error_code.substring(0, 5) === 'ZMAUT') {
          return error_code;
        }
      }
    }
  } catch (e) {
    // Error parsing failed
  }
  return null;
};

/**
 * Check if email has typo error (Gmail typos)
 * Exact match for Angular emailHasTypoError()
 */
export const emailHasTypoError = (email: string, gmailTypoErrors: string[]): boolean => {
  if (!email || !email.includes('@')) {
    return false;
  }
  const emailDomain = email.substring(email.indexOf('@') + 1);
  return gmailTypoErrors.indexOf(emailDomain) > -1;
};

/**
 * Auto-correct email (replace domain with gmail.com)
 */
export const autoCorrectEmail = (email: string): string => {
  if (!email || !email.includes('@')) {
    return email;
  }
  const emailParts = email.split('@');
  return `${emailParts[0]}@gmail.com`;
};
