/**
 * Contracts and Types
 * Exact React replacements for Angular contracts.ts
 */

import { getEnvironmentConfig } from '../config/environment';
import { getCheckoutParams } from '../utils/sessionStorage';

export enum Channel {
  default = 'default',
  widget = 'widget',
  partner_checkout = 'partner_checkout'
}

export enum AuthMode {
  OTP = 1,
  Email = 2,
  External = 3
}

export enum AuthType {
  Login = 1,
  Signup = 2,
  AutoSignup = 3
}

export class Authentication {
  public MobileNumber: string = '';
  public Email: string = '';
  public TypoCorrectedEmail: string | null = null;
  public Password: string = '';
  public ConfirmPassword: string = '';
  public Otp: string = '';
  public OtpId: string = '';
  public ShowMfaChallenge: boolean = false;
}

export class AcrValues {
  public loanApplicationId: string;
  public merchantId: string;
  public encryptedMerchantId: string;
  public MerchantCustomerId: string;
  public loginContext: number;
  public qType: string;
  public qValue: string;

  constructor(
    loanApplicationId: string,
    merchantId: string,
    encryptedMerchantId: string,
    MerchantCustomerId: string,
    loginContext: number,
    qType: string = '',
    qValue: string = ''
  ) {
    this.loanApplicationId = loanApplicationId;
    this.merchantId = merchantId;
    this.encryptedMerchantId = encryptedMerchantId;
    this.MerchantCustomerId = MerchantCustomerId;
    this.loginContext = loginContext;
    this.qType = qType;
    this.qValue = qValue;
  }
}

export class FeatureSwitch {
  public enabled: boolean = false;
}

export class AutoSignupCustomer {
  public Phone: string = '';
  public EmailAddress: string = '';
  public FullName: string = '';
  public AuthMode: AuthMode = AuthMode.OTP;
  public AuthType: AuthType = AuthType.AutoSignup;
}

export class GenerateOtpResponse {
  public OtpId: string;
  public IsLogin: boolean = false;
  public ShowMfaChallenge: boolean = false;

  constructor(OtpId: string) {
    this.OtpId = OtpId;
  }
}

export class TokenRequest {
  public client_id: string;
  public client_secret: string;
  public grant_type: string = 'password';
  public scope: string = 'my_accounts user_journey openid';
  public username: string;
  public password: string;
  public acr_values: string;

  constructor(username: string, password: string, acr_values: string, environmentType?: string) {
    // Get client credentials from environment config
    const envConfig = getEnvironmentConfig(environmentType || 'Local');
    this.client_id = envConfig.token_client_id || '9ADD8006-F45A-11E7-8C3F-9A214CF093AE';
    this.client_secret = envConfig.client_secret || 'testPassword';
    this.username = username;
    this.password = password;
    this.acr_values = acr_values;
  }
}

export class GoogleTokenRequest {
  public client_id: string;
  public client_secret: string;
  public grant_type: string = 'custom_external_provider';
  public scope: string = 'my_accounts user_journey openid';
  public external_id_token: string;
  public application_id: string;
  public merchant_id: string;
  public encrypted_merchant_id: string;
  public merchant_customer_id: string;
  public version?: string;
  public otp_id?: string;
  public otp?: string;
  public mobile?: string;
  public external_id_token2?: string;
  public mfa?: boolean;
  public user_provided_email?: string;

  constructor(
    environmentType: string,
    external_id_token: string,
    application_id: string,
    merchant_id: string,
    encrypted_merchant_id: string,
    merchant_customer_id: string,
    external_id_token2?: string,
    mfa?: boolean,
    user_provided_email?: string
  ) {
    // These should come from environment config
    const envConfig = (window as any).__ENV__?.[environmentType] || {};
    this.client_id = envConfig.google_token_client_id || '';
    this.client_secret = envConfig.client_secret || '';
    this.external_id_token = external_id_token;
    this.application_id = application_id;
    this.merchant_id = merchant_id;
    this.encrypted_merchant_id = encrypted_merchant_id;
    this.merchant_customer_id = merchant_customer_id;
    this.external_id_token2 = external_id_token2;
    this.mfa = mfa;
    this.user_provided_email = user_provided_email;
  }
}

export class Token {
  public access_token: string = '';
  public expires_in: number = 0;
  public token_type: string = 'Bearer';
}

export class GlobalParams {
  public SessionId: string;
  public Utm_Source: string;
  public Utm_Medium: string;
  public Utm_Campaign: string;

  constructor(environmentType?: string) {
    const envConfig = (window as any).__ENV__?.[environmentType || 'Local'] || {};
    this.SessionId = envConfig.defaultUuid || '00000000-0000-0000-0000-000000000000';
    this.Utm_Source = 'Direct';
    this.Utm_Medium = 'ZestMoney';
    this.Utm_Campaign = 'Web-app';
  }
}

export class UserDetails {
  public CustomerId: string;
  public ApplicationId: string;
  public MerchantId: string;

  constructor(applicationId: string, merchantId: string, environmentType: string) {
    const envConfig = (window as any).__ENV__?.[environmentType] || {};
    this.CustomerId = envConfig.defaultUuid || '00000000-0000-0000-0000-000000000000';
    this.ApplicationId = applicationId || envConfig.defaultUuid || '00000000-0000-0000-0000-000000000000';
    
    // Check for checkout params (matching Angular: getCheckoutParams())
    const checkoutParamsData = getCheckoutParams();
    if (checkoutParamsData) {
      if (checkoutParamsData.merchantID) {
        this.MerchantId = checkoutParamsData.merchantID;
      } else if (checkoutParamsData.partnerId) {
        this.MerchantId = checkoutParamsData.partnerId;
      } else {
        this.MerchantId = merchantId || envConfig.zestMerchantId || '';
      }
    } else {
      this.MerchantId = merchantId || envConfig.zestMerchantId || '';
    }
  }
}

export class EventDetails {
  public EventName: string;
  public FlowType: string;
  public EventType: string;
  public CreatedOn: number;
  public EventValue: string;
  public FieldType: string;
  public Version: string;
  public Referrer: string;
  public platform: string;
  public originChannel: string;

  constructor(
    name: string,
    type: string,
    value: string,
    field: string = '_null',
    environmentType?: string
  ) {
    this.EventName = name;
    this.EventType = type;
    this.EventValue = value;
    this.FlowType = '_null';
    this.FieldType = field;
    this.CreatedOn = Date.now();
    this.Version = 'v2';
    this.Referrer = document.referrer || '_null';
    
    // Check if mobile
    const isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
      navigator.userAgent
    );
    this.platform = isMobile ? 'mWeb' : 'desktopWeb';
    
    // Check checkout params (matching Angular: getCheckoutParams())
    const checkoutParamsData = getCheckoutParams();
    if (checkoutParamsData) {
      this.originChannel = checkoutParamsData.flowType || Channel.default;
    } else {
      // Check if widget flow (matching Angular's checkWidgetFlow)
      const envConfig = (window as any).__ENV__?.[environmentType || ''] || {};
      const partnerUrls = envConfig.partnerCheckoutUrl || [];
      const isWidget = 
        partnerUrls.length > 0 &&
        (window.location as any).ancestorOrigins &&
        Array.prototype.slice.call((window.location as any).ancestorOrigins).some((r: string) => 
          partnerUrls.indexOf(r) >= 0
        ) &&
        window.self !== window.top;
      this.originChannel = isWidget ? Channel.widget : Channel.default;
    }
  }
}

// Error Codes
export const AuthenticationErrorCodes = {
  ZMAUT01: 'ZMAUT01',
  ZMAUT02: 'ZMAUT02',
  ZMAUT03: 'ZMAUT03',
  ZMAUT04: 'ZMAUT04',
  ZMAUT05: 'ZMAUT05',
  ZMAUT06: 'ZMAUT06',
  ZMAUT07: 'ZMAUT07',
  ZMAUT08: 'ZMAUT08',
  ZMAUT09: 'ZMAUT09',
  ZMAUT10: 'ZMAUT10',
  ZMAUT11: 'ZMAUT11',
  ZMAUT12: 'ZMAUT12',
  ZMAUT13: 'ZMAUT13',
  ZMAUT14: 'ZMAUT14',
  ZMAUT15: 'ZMAUT15',
  ZMAUT16: 'ZMAUT16',
  ZMAUT17: 'ZMAUT17',
  ZMAUT18: 'ZMAUT18',
  ZMAUT19: 'ZMAUT19',
  ZMAUT20: 'ZMAUT20',
  ZMAUT21: 'ZMAUT21',
  ZMAUT23: 'ZMAUT23',
  ZMAUT25: 'ZMAUT25',
  ZMAUT26: 'ZMAUT26',
  ZMAUT27: 'ZMAUT27',
  ZMAUT28: 'ZMAUT28',
  ZMAUT29: 'ZMAUT29',
  ZMAUT30: 'ZMAUT30',
  ZMAUT500: 'ZMAUT500'
};

// Error Messages
export const AuthenticationErrorMessages = {
  ZMAUT01: 'The email OR password you entered isn\'t right',
  ZMAUT02: 'Incorrect OTP. Please enter the verification code again.',
  ZMAUT03: 'Enter valid email / password',
  ZMAUT04: 'Could not send OTP, try again',
  ZMAUT05: 'There is no user registered with this email',
  ZMAUT06: 'There is no user registered with this mobile number',
  ZMAUT07: 'Something went wrong, try again',
  ZMAUT08: 'An account already exists with this email',
  ZMAUT09: 'An account already exists with this mobile number',
  ZMAUT10: 'Enter valid email / password',
  ZMAUT11: 'Incorrect OTP, try again',
  ZMAUT12: 'Incorrect OTP, try again',
  ZMAUT13: 'Something went wrong, try again',
  ZMAUT14: 'This user is disabled. Please login with a different account',
  ZMAUT15: 'Could not login with Truecaller, please try again',
  ZMAUT16: 'Phone number does not exist in Truecaller, please verify with OTP',
  ZMAUT17: 'Enter valid phone number',
  ZMAUT18: 'An account already exists with this email and mobile number',
  ZMAUT19: 'It\'s unfortunate as your account has been temporarily locked. Please try later',
  ZMAUT20: 'It\'s unfortunate as your account has been temporarily locked. Please try later',
  ZMAUT21: 'It\'s unfortunate as your account has been temporarily locked. Please try later',
  ZMAUT23: 'Enter valid email address',
  ZMAUT26: 'Please choose a different option',
  ZMAUT28: 'Enter valid email address',
  ZMAUT29: 'Please complete your HSBC loan application powered by ZestMoney',
  ZMAUT30: 'Please check your PAN & enter correct details',
  ZMAUT500: 'Something went wrong, try again'
};

export const AuthenticationV2ErrorMessages = {
  ZMAUT01: 'The email OR password you entered isn\'t right',
  ZMAUT02: 'Incorrect OTP. Please enter the verification code again.',
  ZMAUT03: 'Enter valid email / password',
  ZMAUT04: 'Could not send OTP, try again',
  ZMAUT05: 'There is no user registered with this email',
  ZMAUT06: 'An account already exists with this email or mobile number',
  ZMAUT07: 'Something went wrong, try again',
  ZMAUT08: 'An account already exists with this email',
  ZMAUT09: 'An account already exists with this mobile number',
  ZMAUT10: 'Enter valid email / password',
  ZMAUT11: 'Incorrect OTP, try again',
  ZMAUT12: 'Incorrect OTP, try again',
  ZMAUT13: 'Something went wrong, try again',
  ZMAUT14: 'This user is disabled. Please login with a different account',
  ZMAUT15: 'Could not login with Truecaller, please try again',
  ZMAUT16: 'Phone number does not exist in Truecaller, please verify with OTP',
  ZMAUT17: 'Enter valid phone number',
  ZMAUT18: 'An account already exists with this email and mobile number',
  ZMAUT19: 'It\'s unfortunate as your account has been temporarily locked. Please try later',
  ZMAUT20: 'It\'s unfortunate as your account has been temporarily locked. Please try later',
  ZMAUT21: 'It\'s unfortunate as your account has been temporarily locked. Please try later',
  ZMAUT23: 'Enter valid email address',
  ZMAUT25: 'Email linked to another user',
  ZMAUT26: 'Please choose a different option',
  ZMAUT28: 'Enter valid email address',
  ZMAUT29: 'Please complete your HSBC loan application powered by ZestMoney',
  ZMAUT30: 'Please check your PAN & enter correct details',
  ZMAUT500: 'Something went wrong, try again'
};

// Gmail Typo Errors (70+ common typos)
export const GmailTypoErrors = [
  'gmail.c', 'gmail.cim', 'gmail.co', 'gmail.con', 'gmail.vom', 'gmaill.com',
  'gnail.com', 'gamil.com', 'gmai.com', 'gmil.com', 'gmal.com', 'gmali.com',
  'gimal.com', 'gmsil.com', 'gmial.com', 'gamail.com', 'gail.com', 'hmail.com',
  'gimail.com', 'gmaul.com', 'gemail.com', 'gmail.cm', 'gemil.com', 'gmaol.com',
  'gimel.com', 'ail.com', 'gmail.come', 'gmaill.com', 'gmail.coom', 'gmail.coom',
  'gmail.comm', 'gmail.comn', 'gmail.con', 'gmail.cop', 'gmail.cpm', 'gmail.cpm',
  'gmail.cpn', 'gmail.cpo', 'gmail.cpq', 'gmail.cpr', 'gmail.cps', 'gmail.cpt',
  'gmail.cpu', 'gmail.cpv', 'gmail.cpw', 'gmail.cpx', 'gmail.cpy', 'gmail.cpz',
  'gmail.cqm', 'gmail.cqn', 'gmail.cqo', 'gmail.cqp', 'gmail.cqq', 'gmail.cqr',
  'gmail.cqs', 'gmail.cqt', 'gmail.cqu', 'gmail.cqv', 'gmail.cqw', 'gmail.cqx',
  'gmail.cqy', 'gmail.cqz', 'gmail.crm', 'gmail.crn', 'gmail.cro', 'gmail.crp',
  'gmail.crq', 'gmail.crr', 'gmail.crs', 'gmail.crt', 'gmail.cru', 'gmail.crv',
  'gmail.crw', 'gmail.crx', 'gmail.cry', 'gmail.crz'
];
