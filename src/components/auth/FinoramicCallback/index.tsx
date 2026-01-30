/**
 * FinoramicCallback Component
 * Exact React replacement for Angular FinoramicCallbackComponent
 * Handles OAuth callback, query parsing, session storage restoration
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthenticationServiceExtended } from '../../../services/authenticationServiceExtended';
import { TrackingService } from '../../../services/trackingService';
import {
  Authentication,
  AcrValues,
  Token,
  EventDetails,
  UserDetails
} from '../../../types/contracts';
import {
  AUTHENTICATION_SESSION_STORAGE_KEY,
  isEmail
} from '../../../utils/helpers';
import type { AuthenticationSessionStorageProperties } from '../../../utils/helpers';

export interface FinoramicCallbackProps {
  environment?: string;
  loanApplicationId?: string;
  merchantId?: string;
  MerchantCustomerId?: string;
  merchantKey?: string;
  clientName?: string;
  onGetToken?: (token: Token) => void;
  onGetEvents?: (events: EventDetails[]) => void;
  onHandleError?: (error: any) => void;
  authService?: AuthenticationServiceExtended;
  trackingService?: TrackingService;
}

export const FinoramicCallback: React.FC<FinoramicCallbackProps> = ({
  environment = 'Local',
  loanApplicationId,
  merchantId,
  MerchantCustomerId,
  merchantKey,
  clientName,
  onGetToken,
  onGetEvents,
  onHandleError,
  authService,
  trackingService
}) => {
  const [searchParams] = useSearchParams();
  const [authentication, setAuthentication] = useState<Authentication>(new Authentication());
  const [waOpted, setWaOpted] = useState<boolean>(true);
  const [isGpay, setIsGpay] = useState<boolean>(false);
  const [, setToken] = useState<Token | null>(null);

  const qType = 'panIdentifier';
  const qValue = '';
  const version = '2';

  // Check if Google Pay
  useEffect(() => {
    if (authService?.checkIframeForGooglePay()) {
      setIsGpay(true);
    }
  }, [authService]);

  // Restore authentication from session storage
  useEffect(() => {
    try {
      const authSessionString = sessionStorage.getItem(AUTHENTICATION_SESSION_STORAGE_KEY);
      if (authSessionString) {
        const authSession: AuthenticationSessionStorageProperties = JSON.parse(authSessionString);
        setAuthentication(authSession.auth);
        setWaOpted(authSession.waOpted);
      }
    } catch (e) {
      console.error('Error while deserializing auth', e);
      onHandleError?.({});
    }
  }, [onHandleError]);

  // Get email from query params and process
  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      const decodedEmail = decodeURIComponent(email);
      if (isEmail(decodedEmail)) {
        setAuthentication(prev => ({ ...prev, Email: decodedEmail }));
        getTokenUsingAcrValues();
      } else {
        const userDetails = new UserDetails(loanApplicationId || '', merchantId || '', environment);
        const event = new EventDetails(
          'Onboarding_Gmail_Redirect_Completed',
          'event',
          'triggered',
          '_null',
          environment
        );
        trackingService?.sendDataToFunnelWithCustomProperties?.(
          userDetails,
          event,
          environment,
          clientName || '',
          true,
          { emailFetched: 'No' }
        );
        onHandleError?.(null);
      }
    }
  }, [searchParams, environment, loanApplicationId, merchantId, clientName, trackingService, onHandleError]);

  // Get token using ACR values
  const getTokenUsingAcrValues = useCallback(async () => {
    if (!authService) return;

    const signUp = true;
    const userDetails = new UserDetails(loanApplicationId || '', merchantId || '', environment);
    const acrValues = new AcrValues(
      loanApplicationId || '',
      merchantId || '',
      merchantKey || '',
      MerchantCustomerId || '',
      2,
      qType,
      qValue
    );

    // Track email fetched event
    const event = new EventDetails(
      'Onboarding_Gmail_Redirect_Completed',
      'event',
      'triggered',
      '_null',
      environment
    );
    trackingService?.sendDataToFunnelWithCustomProperties?.(
      userDetails,
      event,
      environment,
      clientName || '',
      true,
      { emailFetched: 'Yes' }
    );

    try {
      const response = await authService.getTokenUsingAcrValues(
        environment,
        authentication,
        signUp,
        false,
        acrValues,
        version
      );

      const eventName = 'Onboarding_Signup_Done';
      const signupEvent = new EventDetails(eventName, 'Event', 'AuthType', '_null', environment);
      const wa_eventName = waOpted ? 'wa_opt_in' : 'wa_opt_out';
      const wa_event = new EventDetails(wa_eventName, 'event', 'triggered', '_null', environment);
      const events = [signupEvent, wa_event];
      onGetEvents?.(events);

      setToken(response);

      // Post consent if not Google Pay
      if (!isGpay && response.access_token) {
        try {
          const tokenPayload = JSON.parse(atob(response.access_token.split('.')[1]));
          const consentObj = {
            consents: [
              {
                dataSharingConsent: {
                  isAccepted: true,
                  source: 'signup'
                }
              }
            ]
          };
          authService.postConsent(environment, tokenPayload.sub, response, consentObj);
        } catch (e) {
          console.error('Error posting consent:', e);
        }
      }

      // Track WhatsApp consent
      const waeventLatest = new EventDetails(
        'Onboarding_Whatsapp_Consent_Submitted',
        'event',
        'triggered',
        '_null',
        environment
      );
      trackingService?.sendDataToFunnelWithCustomProperties?.(
        userDetails,
        waeventLatest,
        environment,
        clientName || '',
        true,
        { consent: waOpted }
      );

      // Update session storage
      sessionStorage.removeItem(AUTHENTICATION_SESSION_STORAGE_KEY);
      sessionStorage.setItem('ngx-webstorage|zest-contact', authentication.MobileNumber);
      sessionStorage.setItem('ngx-webstorage|zest-sign-up', 'true');

      emitGetToken(response);
    } catch (error) {
      onHandleError?.(error);
    }
  }, [
    authService,
    authentication,
    waOpted,
    isGpay,
    environment,
    loanApplicationId,
    merchantId,
    MerchantCustomerId,
    merchantKey,
    clientName,
    trackingService,
    onGetEvents,
    onHandleError
  ]);

  // Emit get token
  const emitGetToken = useCallback((token: Token) => {
    onGetToken?.(token);

    // WebEngage integration
    const webengage = (window as any).webengage;
    if (webengage) {
      webengage.user.login(`${authentication.MobileNumber}`);
      webengage.user.setAttribute('email', authentication.Email);
      webengage.user.setAttribute('phone', `+91${authentication.MobileNumber}`);
      webengage.user.setAttribute('EmailAddress', authentication.Email);
      webengage.user.setAttribute('MobileNumber', `+91${authentication.MobileNumber}`);
    }
  }, [authentication, onGetToken]);

  return null; // This component doesn't render anything, just handles callback
};

export default FinoramicCallback;
