/**
 * Authentication Service Extended
 * Additional methods matching Angular AuthenticationService exactly
 * These methods handle ACR Values, OTP generation, and token requests
 */

import { BackendService, backendService as defaultBackendService } from './backendService';
import { getEnvironmentConfig as getEnvConfig } from '../config/environment';
import {
  Authentication,
  AcrValues,
  Token,
  TokenRequest,
  GoogleTokenRequest,
  GenerateOtpResponse,
  AutoSignupCustomer,
  FeatureSwitch
} from '../types/contracts';

export interface AuthenticationServiceExtendedConfig {
  backendService?: BackendService;
}

export class AuthenticationServiceExtended {
  private backendService: BackendService;
  private loginUrl = '/connect/token';
  private triggerOtpViaSmsUrl = '/mobile/otp';
  private triggerOtpViaCallUrl = '/mobile/otp/call';
  private triggerOtpViaSmsUrlV2 = '/v2/mobile/otp/';
  private triggerOtpViaCallUrlV2 = '/v2/mobile/otp/call';
  private consentApi = '/customer-details/api/v1/consent/customers/';
  private sendForgotPasswordEmailUrl = '/Users/ForgotPassword';
  private checkAutoSignupCustomerUrl = '/customer/customerdetails';
  private checkTruecallerAuthenticationEnabledUrl = '/switch/authentication/truecaller_authenticaton.json';
  private checkGetOtpViaCallEnabledUrl = '/switch/authentication/get_otp_via_call.json';

  constructor(config?: AuthenticationServiceExtendedConfig) {
    this.backendService = config?.backendService || defaultBackendService;
  }

  /**
   * Get environment config - uses the centralized config
   */
  private getEnvironmentConfig(environmentType: string) {
    return getEnvConfig(environmentType);
  }

  /**
   * Get ACR Values
   * Exact match for Angular getAcrValues() method
   * Complex logic for building ACR string with all parameters
   */
  getAcrValues(
    acrValues: AcrValues,
    isOtp: boolean,
    isSignup: boolean,
    isTruecaller: boolean,
    authentication: Authentication,
    version: string
  ): string {
    if (isTruecaller) {
      isOtp = false;
    }

    let acrString = 'isOtp:' + isOtp.toString();

    if (version !== '2') {
      if (isSignup) {
        acrString += '&isSignup:true&isLogin:false';
      } else {
        acrString += '&isSignup:false&isLogin:true';
      }
    }

    acrString += '&isTruecaller:' + isTruecaller.toString();

    if (
      (((isOtp || isTruecaller) && !isSignup) || isSignup) &&
      authentication &&
      authentication.MobileNumber &&
      authentication.MobileNumber.length > 0
    ) {
      acrString += '&mobile:' + '91' + authentication.MobileNumber;
    }

    if (
      ((!isOtp && !isTruecaller && !isSignup) || isSignup) &&
      authentication &&
      authentication.Email &&
      authentication.Email.length > 0
    ) {
      acrString += '&email:' + authentication.Email;
    }

    if (acrValues && acrValues.loginContext) {
      acrString += '&loginContext:' + acrValues.loginContext;
    }

    if (isOtp && authentication && authentication.OtpId && authentication.OtpId.length > 0) {
      acrString += '&otpId:' + authentication.OtpId;
    }

    if (acrValues && acrValues.loanApplicationId) {
      acrString += '&loanApplicationId:' + acrValues.loanApplicationId;
    }

    if (acrValues && acrValues.merchantId) {
      acrString += '&merchantId:' + acrValues.merchantId;
    }

    if (acrValues && acrValues.encryptedMerchantId) {
      acrString += '&encryptedMerchantId:' + acrValues.encryptedMerchantId;
    }

    if (acrValues && acrValues.MerchantCustomerId) {
      acrString += '&MerchantCustomerId:' + acrValues.MerchantCustomerId;
    }

    if (version === '2') {
      acrString += '&version:' + version;
    }

    if (
      acrValues &&
      acrValues.qType &&
      acrValues.qType !== '' &&
      acrValues.qValue &&
      acrValues.qValue !== ''
    ) {
      acrString += '&qType:' + acrValues.qType;
      acrString += '&qValue:' + acrValues.qValue;
    }

    return acrString;
  }

  /**
   * Get token using ACR values
   * Exact match for Angular getTokenUsingAcrValues() method
   */
  async getTokenUsingAcrValues(
    environmentType: string,
    authentication: Authentication,
    isSignup: boolean,
    isTruecaller: boolean,
    acrValues: AcrValues,
    version: string
  ): Promise<Token> {
    let isOtp = false;
    let username = authentication.Email;
    let password = authentication.Password;

    if (
      authentication.MobileNumber &&
      authentication.MobileNumber.length > 0 &&
      ((authentication.Otp && authentication.Otp.length > 0) || isTruecaller)
    ) {
      isOtp = true;
      username = '91' + authentication.MobileNumber;
      password = isTruecaller ? username : authentication.Otp;
    }

    const acr_values = this.getAcrValues(acrValues, isOtp, isSignup, isTruecaller, authentication, version);
    const tokenRequest = new TokenRequest(username, password, acr_values, environmentType);
    const envConfig = this.getEnvironmentConfig(environmentType);
    const token = envConfig.hashed_auth_token;

    return this.backendService.setData(
      environmentType,
      this.loginUrl,
      tokenRequest,
      true, // urlEncoded
      token,
      false, // isBucket
      false // isAbsolute
    );
  }

  /**
   * Get token using Google login
   * Exact match for Angular getTokenUsingGoogleLogin() method
   */
  async getTokenUsingGoogleLogin(googleAuthPayload: {
    environmentType: string;
    external_id_token: string;
    acrValues: AcrValues;
    version: string;
    external_id_token2?: string;
    user_provided_email?: string;
    mfa?: boolean;
  }): Promise<Token> {
    const isGooglePayAuthentication = this.checkIframeForGooglePay();
    const {
      environmentType,
      external_id_token,
      acrValues,
      version,
      external_id_token2,
      user_provided_email
    } = googleAuthPayload;

    let googleTokenRequest: GoogleTokenRequest;

    if (isGooglePayAuthentication) {
      if (external_id_token2) {
        googleTokenRequest = new GoogleTokenRequest(
          environmentType,
          external_id_token,
          acrValues.loanApplicationId,
          acrValues.merchantId,
          acrValues.encryptedMerchantId,
          acrValues.MerchantCustomerId,
          external_id_token2,
          true
        );
      } else if (googleAuthPayload.mfa) {
        googleTokenRequest = new GoogleTokenRequest(
          environmentType,
          external_id_token,
          acrValues.loanApplicationId,
          acrValues.merchantId,
          acrValues.encryptedMerchantId,
          acrValues.MerchantCustomerId,
          undefined,
          true,
          user_provided_email
        );
      } else {
        googleTokenRequest = new GoogleTokenRequest(
          environmentType,
          external_id_token,
          acrValues.loanApplicationId,
          acrValues.merchantId,
          acrValues.encryptedMerchantId,
          acrValues.MerchantCustomerId
        );
      }
    } else {
      googleTokenRequest = new GoogleTokenRequest(
        environmentType,
        external_id_token,
        acrValues.loanApplicationId,
        acrValues.merchantId,
        acrValues.encryptedMerchantId,
        acrValues.MerchantCustomerId
      );
    }

    if (version === '2') {
      googleTokenRequest.version = version;
    }

    return this.backendService.setData(
      environmentType,
      this.loginUrl,
      googleTokenRequest,
      true, // urlEncoded
      null, // addTokenHeader
      false, // isBucket
      false // isAbsolute
    );
  }

  /**
   * Trigger OTP via SMS (V1)
   */
  async triggerOtpViaSms(
    environmentType: string,
    isLogin: boolean,
    authentication: Authentication,
    applicationId: string | null
  ): Promise<GenerateOtpResponse> {
    const triggerOtpViaSmsData = {
      MobileNumber: '91' + authentication.MobileNumber,
      EmailAddress: authentication.Email,
      IsLogin: isLogin,
      ApplicationId: applicationId
    };

    return this.backendService.setData(
      environmentType,
      this.triggerOtpViaSmsUrl,
      triggerOtpViaSmsData,
      false, // urlEncoded
      null, // addTokenHeader
      false, // isBucket
      false // isAbsolute
    );
  }

  /**
   * Trigger OTP via Call (V1)
   */
  async triggerOtpViaCall(environmentType: string, OtpId: string): Promise<any> {
    const triggerOtpViaCallData = new GenerateOtpResponse(OtpId);
    return this.backendService.setData(
      environmentType,
      this.triggerOtpViaCallUrl,
      triggerOtpViaCallData,
      false,
      null,
      false,
      false
    );
  }

  /**
   * Trigger OTP via SMS (V2)
   */
  async triggerOtpViaSmsV2(
    environmentType: string,
    authentication: Authentication,
    merchantKey: string,
    merchantId: string
  ): Promise<GenerateOtpResponse> {
    const triggerOtpViaSmsData: any = {
      MobileNumber: '91' + authentication.MobileNumber
    };

    if (merchantId) {
      triggerOtpViaSmsData.MessageParams = {
        MerchantId: merchantId
      };
    } else if (merchantKey) {
      triggerOtpViaSmsData.MessageParams = {
        MerchantKey: merchantKey
      };
    }

    const envConfig = this.getEnvironmentConfig(environmentType);
    const token = envConfig.hashed_auth_token;

    return this.backendService.setData(
      environmentType,
      this.triggerOtpViaSmsUrlV2,
      triggerOtpViaSmsData,
      false,
      token,
      false,
      false
    );
  }

  /**
   * Trigger OTP via Call (V2)
   */
  async triggerOtpViaCallV2(environmentType: string, OtpId: string): Promise<any> {
    const triggerOtpViaCallData = new GenerateOtpResponse(OtpId);
    return this.backendService.setData(
      environmentType,
      this.triggerOtpViaCallUrlV2,
      triggerOtpViaCallData,
      false,
      null,
      false,
      false
    );
  }

  /**
   * Post consent
   */
  async postConsent(
    environmentType: string,
    customerid: string,
    token: Token,
    data: object
  ): Promise<any> {
    return this.backendService.putAppData(
      environmentType,
      this.consentApi + customerid,
      data,
      false,
      token,
      false
    );
  }

  /**
   * Send forgot password email
   */
  async sendForgotPasswordEmail(
    environmentType: string,
    authentication: Authentication
  ): Promise<any> {
    const sendForgotPasswordEmailData = {
      Email: authentication.Email,
      AuthSource: 1
    };
    return this.backendService.putData(
      environmentType,
      this.sendForgotPasswordEmailUrl,
      sendForgotPasswordEmailData,
      false,
      null,
      false
    );
  }

  /**
   * Check auto signup customer
   */
  async checkAutoSignupCustomer(
    environmentType: string,
    acrValues: AcrValues
  ): Promise<AutoSignupCustomer> {
    const checkAutoSignupCustomerData = {
      MerchantCustomerId: acrValues.MerchantCustomerId,
      ApplicationId: acrValues.loanApplicationId
    };
    return this.backendService.setData(
      environmentType,
      this.checkAutoSignupCustomerUrl,
      checkAutoSignupCustomerData,
      false,
      null,
      false,
      false
    );
  }

  /**
   * Check Truecaller enabled
   * Returns default { enabled: false } if endpoint doesn't exist (404)
   */
  async checkTruecallerEnabled(environmentType: string): Promise<FeatureSwitch> {
    try {
      return await this.backendService.getData(
        environmentType,
        this.checkTruecallerAuthenticationEnabledUrl,
        false,
        null,
        true
      );
    } catch (error: any) {
      // Handle 404 gracefully - feature switch endpoint may not exist in dev
      const is404 = 
        error?.context?.originalError?.includes('404') || 
        error?.context?.originalError?.includes('Not Found') ||
        (error?.code === 'HTTP_ERROR' || error?.code === 'RESPONSE_PARSE_ERROR') && 
        (error?.context?.status === 404 || error?.context?.originalError?.includes('404'));
      
      if (is404) {
        // Silently return default for 404s - feature switch not available
        return { enabled: false };
      }
      // For other errors, still return default but log warning
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error checking Truecaller enabled:', error);
      }
      return { enabled: false };
    }
  }

  /**
   * Check Get OTP via Call enabled
   * Returns default { enabled: false } if endpoint doesn't exist (404)
   */
  async checkGetOtpViaCallEnabled(environmentType: string): Promise<FeatureSwitch> {
    try {
      return await this.backendService.getData(
        environmentType,
        this.checkGetOtpViaCallEnabledUrl,
        false,
        null,
        true
      );
    } catch (error: any) {
      // Handle 404 gracefully - feature switch endpoint may not exist in dev
      const is404 = 
        error?.context?.originalError?.includes('404') || 
        error?.context?.originalError?.includes('Not Found') ||
        (error?.code === 'HTTP_ERROR' || error?.code === 'RESPONSE_PARSE_ERROR') && 
        (error?.context?.status === 404 || error?.context?.originalError?.includes('404'));
      
      if (is404) {
        // Silently return default for 404s - feature switch not available
        return { enabled: false };
      }
      // For other errors, still return default but log warning
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error checking Get OTP via Call enabled:', error);
      }
      return { enabled: false };
    }
  }

  /**
   * Check iframe for Google Pay
   */
  checkIframeForGooglePay(): boolean {
    try {
      return navigator.userAgent.includes('GPay');
    } catch (e) {
      return false;
    }
  }

  /**
   * Sign up using Google Login
   * Used in V2 component for Google signup flow
   */
  async signUpUsingGoogleLogin(
    environmentType: string,
    acrValues: AcrValues,
    external_id_token: string,
    authentication: Authentication,
    version: string
  ): Promise<Token> {
    const googleTokenRequest = new GoogleTokenRequest(
      environmentType,
      external_id_token,
      acrValues.loanApplicationId,
      acrValues.merchantId,
      acrValues.encryptedMerchantId,
      acrValues.MerchantCustomerId
    );

    if (version === '2') {
      googleTokenRequest.version = version;
      googleTokenRequest.otp_id = authentication.OtpId;
      googleTokenRequest.otp = authentication.Otp;
      googleTokenRequest.mobile = '91' + authentication.MobileNumber;
    }

    return this.backendService.setData(
      environmentType,
      this.loginUrl,
      googleTokenRequest,
      true, // urlEncoded
      null, // addTokenHeader
      false, // isBucket
      false // isAbsolute
    );
  }
}

// Export singleton instance for easy use
export const authenticationServiceExtended = new AuthenticationServiceExtended();
