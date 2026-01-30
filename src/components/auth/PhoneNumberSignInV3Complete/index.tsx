/**
 * PhoneNumberSignInV3 Component - COMPLETE IMPLEMENTATION
 * Exact React replacement for Angular PhoneNumberSignInV3Component (738 lines)
 * All 20+ state variables and all methods implemented
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { EnterMobileNumberV3 } from "../../forms/EnterMobileNumberV3";
import { EnterOtpV3 } from "../../forms/EnterOtpV3";
import { EnterEmailV3 } from "../../forms/EnterEmailV3";
import { GtModal, GtSwipe, GtButton } from "../../groot";
import { AuthErrorComponent, AuthErrorType } from "../AuthError";
import type { AuthError } from "../AuthError";
import { AuthenticationServiceExtended } from "../../../services/authenticationServiceExtended";
import { ApplicationService } from "../../../services/applicationService";
import { TrackingService } from "../../../services/trackingService";
import type { LoaderServiceType } from "../../../services/loaderService";
import {
  Authentication,
  AcrValues,
  Token,
  EventDetails,
  UserDetails,
  AutoSignupCustomer,
  AuthType,
  AuthenticationErrorCodes,
  AuthenticationV2ErrorMessages,
} from "../../../types/contracts";
import {
  AUTHENTICATION_SESSION_STORAGE_KEY,
  isValidAuthSessionStorage,
  isEmail,
  isIframe,
  mobileCheck,
  checkIfErrorCodeRetured,
  checkIfErrorCodeReturedFromGoogle,
} from "../../../utils/helpers";
import type { AuthenticationSessionStorageProperties } from "../../../utils/helpers";
import {
  setSignUpFlag,
  setContactNumber,
  hasRestructuringLoanApplication,
} from "../../../utils/sessionStorage";
import { focusElementById, scrollToTop } from "../../../utils/autoFocus";
import "./index.css";

// Extend Window interface for microapps (Google Pay)
declare global {
  interface Window {
    microapps?: any;
  }
}

export interface PhoneNumberSignInV3Props {
  environment?: string;
  clientName?: string;
  loanApplicationId?: string;
  merchantId?: string;
  MerchantCustomerId?: string;
  autoSignupCustomer?: AutoSignupCustomer;
  hideGmail?: boolean;
  merchantKey?: string;
  googlePayRedirection?: boolean;
  authError?: AuthError;
  checkoutParams?: any;
  showTruecaller?: boolean;
  showGetCallFeatureSwitch?: boolean;
  isReferred?: boolean;
  newTexts?: boolean;
  onGetToken?: (token: Token) => void;
  onGetEvents?: (events: EventDetails[]) => void;
  authService?: AuthenticationServiceExtended;
  applicationService?: ApplicationService;
  trackingService?: TrackingService;
  loaderService?: LoaderServiceType;
  getEnvironmentConfig?: (envType: string) => any;
}

export const PhoneNumberSignInV3Complete: React.FC<
  PhoneNumberSignInV3Props
> = ({
  environment = "Local",
  clientName,
  loanApplicationId,
  merchantId,
  MerchantCustomerId,
  autoSignupCustomer,
  hideGmail,
  merchantKey,
  googlePayRedirection,
  authError: initialAuthError,
  checkoutParams,
  onGetToken,
  onGetEvents,
  authService,
  applicationService,
  trackingService,
  loaderService,
  getEnvironmentConfig,
}) => {
  // URL Navigation
  const navigate = useNavigate();
  const location = useLocation();

  // ALL STATE VARIABLES
  const [authentication, setAuthentication] = useState<Authentication>(
    new Authentication(),
  );
  const [disabled, setDisabled] = useState<boolean>(false);
  const [, setSliderCheck] = useState<boolean>(true);
  const [, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [otherEmail, setOtherEmail] = useState<boolean>(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean>(false);
  const [, setGoogleSignup] = useState<boolean>(false);
  const [showEmailOptions, setShowEmailOptions] = useState<boolean>(false);
  const [showGetCall] = useState<boolean>(false);
  const [version] = useState<string>("2");
  const [isAutoSignupCustomer, setIsAutoSignupCustomer] =
    useState<boolean>(false);
  const [isAutoSignInCustomer, setIsAutoSignInCustomer] =
    useState<boolean>(false);
  const [retryOtpAttemts, setRetryOtpAttemts] = useState<number>(0);
  const [, setEmError] = useState<boolean>(false);
  const [signUpPosition] = useState<number>(0);
  const [waOpted, setWaOpted] = useState<boolean>(true);
  const [incomeConsent, setIncomeConsent] = useState<boolean>(false);
  const [phoneToken, setPhoneToken] = useState<string>("");
  const [, setHideEditCta] = useState<boolean>(false);
  const [qType] = useState<string>("panIdentifier");
  const [qValue, setQValue] = useState<string>("");
  const [isPanForm, setIsPanForm] = useState<boolean>(false);
  const [isGpay, setIsGpay] = useState<boolean>(false);
  const [, setEnteredEmail] = useState<string>("");
  const [, setEmailErrorMsg] = useState<string | null>(null);
  const [googlepayAuthentication, setGooglepayAuthentication] =
    useState<boolean>(false);
  const [showFinoramicParsing, setShowFinoramicParsing] =
    useState<boolean>(false);
  const [, setFinoramicParsingFeature] = useState<any>(null);
  const [hasOtpCallFinished, setHasOtpCallFinished] = useState<boolean>(false);
  const [isSubmitInProgress, setIsSubmitInProgress] = useState<boolean>(false);
  const [showOtpForm, setShowOtpForm] = useState<boolean>(false);
  const [authError, setAuthError] = useState<AuthError | null>(
    initialAuthError || null,
  );
  const [, setToken] = useState<Token | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [environmentType, setEnvironmentType] = useState<string>(environment);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] =
    useState<boolean>(false);

  // Refs for debouncing and state management
  const generateOtpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const getTokenUsingAcrValuesRef = useRef<
    ((signUp?: boolean, consent?: boolean) => Promise<void>) | null
  >(null);
  // Ref to store latest authentication state (including OTP) for synchronous access - matching Angular's direct property access
  const authenticationRef = useRef<Authentication>(authentication);

  // Initialize
  useEffect(() => {
    // Set font size
    document.getElementsByTagName("html")[0].style.fontSize = "16px";

    // Hide loader after 1 second
    setTimeout(() => {
      loaderService?.next({ showLoader: false, loaderTextMessage: "" });
    }, 1000);

    // Set environment type
    setEnvironmentType(environment);

    // Initialize user details
    setUserDetails(
      new UserDetails(loanApplicationId || "", merchantId || "", environment),
    );

    // Check Google Pay
    if (authService?.checkIframeForGooglePay()) {
      setIsGpay(true);
      setIncomeConsent(true);
      loadScript("https://microapps.google.com/apis/v1alpha/microapps.js");
    }

    // Set email options based on auth error or session storage
    const shouldShowEmailOptions = (() => {
      if (initialAuthError && initialAuthError.error) {
        return initialAuthError.error === AuthErrorType.email;
      }
      return isValidAuthSessionStorage();
    })();
    setShowEmailOptions(shouldShowEmailOptions);

    // Set mobile height
    if (mobileCheck()) {
      setMobileHeight();
    }

    // Auto signup/signin detection
    const isAutoSignup = !!(
      autoSignupCustomer &&
      autoSignupCustomer.AuthType === AuthType.AutoSignup &&
      autoSignupCustomer.EmailAddress &&
      autoSignupCustomer.EmailAddress.length > 0 &&
      autoSignupCustomer.Phone &&
      autoSignupCustomer.Phone.length > 0
    );
    setIsAutoSignupCustomer(isAutoSignup);

    const isAutoSignIn = !!(
      autoSignupCustomer &&
      autoSignupCustomer.AuthType === AuthType.Login &&
      autoSignupCustomer.Phone &&
      autoSignupCustomer.Phone.length > 0
    );
    setIsAutoSignInCustomer(isAutoSignIn);

    // Check Google Pay authentication
    setGooglepayAuthentication(authService?.checkIframeForGooglePay() || false);

    // Track authentication started
    if (trackingService && userDetails) {
      const event = new EventDetails(
        "authentication_started",
        "page",
        "loaded",
        "_null",
        environment,
      );
      trackingService.sendDataToFunnel(
        userDetails,
        event,
        environment,
        clientName || "",
        true,
      );
    }

    // Handle checkout params
    if (checkoutParams && checkoutParams.mobileNumber) {
      setDisabled(false);
      setMobileNumber(checkoutParams.mobileNumber);
    }

    // Handle auto signup/signin
    if (isAutoSignup || isAutoSignIn) {
      setDisabled(true);
      setMobileNumber(autoSignupCustomer?.Phone || "");
    }

    // Check Finoramic parsing feature
    const authSessionStorage = sessionStorage.getItem(
      AUTHENTICATION_SESSION_STORAGE_KEY,
    );
    if (authSessionStorage && isValidAuthSessionStorage()) {
      try {
        const authSession: AuthenticationSessionStorageProperties =
          JSON.parse(authSessionStorage);
        if (applicationService) {
          applicationService
            .getFeatureVersion(
              environment,
              "GMAIL-STATEMENT-PARSING",
              authSession.auth.MobileNumber,
            )
            .then((gmailFeature) => {
              if (
                gmailFeature.version === "1.0" &&
                !isIframe() &&
                !googlePayRedirection
              ) {
                setShowFinoramicParsing(true);
              }
            });
        }
      } catch (e) {
        console.error("Error while deserializing auth session key", e);
      }
    }

    // Scroll to top
    scrollToTop();
  }, []);

  // Track previous values to detect what changed
  const prevShowEmailOptionsRef = useRef(showEmailOptions);
  const prevPathnameRef = useRef(location.pathname);

  // Single effect to handle URL <-> state sync without infinite loops
  useEffect(() => {
    const prevShowEmailOptions = prevShowEmailOptionsRef.current;
    const prevPathname = prevPathnameRef.current;

    // Update refs for next render
    prevShowEmailOptionsRef.current = showEmailOptions;
    prevPathnameRef.current = location.pathname;

    // Case 1: State changed (app logic triggered it) - update URL
    if (showEmailOptions !== prevShowEmailOptions) {
      if (showEmailOptions && location.pathname !== "/email") {
        navigate("/email", { replace: false });
      } else if (!showEmailOptions && location.pathname === "/email") {
        navigate("/", { replace: false });
      }
      return; // Don't process URL change in the same cycle
    }

    // Case 2: URL changed (browser back/forward) - update state
    if (location.pathname !== prevPathname) {
      if (location.pathname === "/email" && !showEmailOptions) {
        if (isValidAuthSessionStorage()) {
          setShowEmailOptions(true);
        }
      } else if (
        (location.pathname === "/" || location.pathname === "") &&
        showEmailOptions &&
        !showLogoutConfirmModal
      ) {
        // User pressed back button from /email - show confirmation modal
        // Only show if modal is not already showing (prevents issues with multiple back presses)
        setShowLogoutConfirmModal(true);
        // Push back to /email to prevent immediate navigation
        navigate("/email", { replace: true });
      }
    }
  }, [showEmailOptions, location.pathname, navigate, showLogoutConfirmModal]);

  // Handle logout confirmation
  const handleLogoutConfirm = useCallback(() => {
    setShowLogoutConfirmModal(false);
    setShowEmailOptions(false);
    setShowOtpForm(false);
    sessionStorage.removeItem(AUTHENTICATION_SESSION_STORAGE_KEY);
    navigate("/", { replace: true });
  }, [navigate]);

  // Handle logout cancel
  const handleLogoutCancel = useCallback(() => {
    setShowLogoutConfirmModal(false);
  }, []);

  // Set mobile height
  const setMobileHeight = useCallback(() => {
    const vh = window.innerHeight * 0.01;
    document.body.style.setProperty("--vh", `${vh}px`);
  }, []);

  // Load script
  const loadScript = useCallback((src: string) => {
    const script = document.createElement("script");
    script.async = false;
    script.src = src;
    document.body.appendChild(script);
  }, []);

  // Call generate OTP (actual API call) - accepts mobile number directly to avoid state timing issues
  // Matching Angular exactly: opens OTP modal IMMEDIATELY, no loader before modal
  const callGenerateOtp = useCallback(
    async (mobileNumber?: string) => {
      // Use passed mobile number OR fall back to state (for retry scenarios)
      const mobile = mobileNumber || authentication?.MobileNumber;

      if (mobile && mobile.length === 10 && mobile.match(/^[0-9]+$/)) {
        // Matching Angular: hide error, clear OTP, show modal IMMEDIATELY, set hasOtpCallFinished to false
        setShowError(false);
        setAuthentication((prev) => ({ ...prev, Otp: "", OtpId: "" }));
        setShowOtpForm(true); // Open modal IMMEDIATELY (no loader before this)
        setHasOtpCallFinished(false); // Continue button disabled while API is calling

        if (authService && getEnvironmentConfig) {
          try {
            // NO loader shown here - matching Angular behavior
            // Create authentication object with the mobile number for the API call
            const authForApi = new Authentication();
            authForApi.MobileNumber = mobile;

            const response = await authService.triggerOtpViaSmsV2(
              environmentType,
              authForApi,
              merchantKey || "",
              merchantId || "",
            );

            setAuthentication((prev) => ({
              ...prev,
              MobileNumber: mobile,
              OtpId: response.OtpId,
              ShowMfaChallenge: response.ShowMfaChallenge || false,
            }));
            setHasOtpCallFinished(true); // Now enable Continue button

            // Focus OTP input (replacement for $().focus())
            focusElementById("otp_number", 500);
          } catch (error: any) {
            setShowOtpForm(false);
            setHasOtpCallFinished(false);
            setShowError(true);

            const errorCode = checkIfErrorCodeRetured(error);
            if (
              errorCode &&
              AuthenticationV2ErrorMessages[
                errorCode as keyof typeof AuthenticationV2ErrorMessages
              ]
            ) {
              setErrorMessage(
                AuthenticationV2ErrorMessages[
                  errorCode as keyof typeof AuthenticationV2ErrorMessages
                ],
              );
            }
          }
        } else {
          console.error(
            "OTP generation failed: authService or getEnvironmentConfig not available",
          );
          setShowOtpForm(false);
          setShowError(true);
          setErrorMessage(
            "Service not initialized. Please refresh and try again.",
          );
        }
      } else {
        setShowError(true);
        setErrorMessage(AuthenticationV2ErrorMessages.ZMAUT17);
      }
    },
    [
      authentication?.MobileNumber,
      authService,
      merchantKey,
      merchantId,
      environmentType,
      getEnvironmentConfig,
    ],
  );

  // Generate OTP (debounced) - accepts mobile number directly to avoid state timing issues
  const generateOtp = useCallback(
    (mobileNumber: string) => {
      if (generateOtpTimeoutRef.current) {
        clearTimeout(generateOtpTimeoutRef.current);
      }
      generateOtpTimeoutRef.current = setTimeout(() => {
        callGenerateOtp(mobileNumber);
      }, 500);
    },
    [callGenerateOtp],
  );

  // Set mobile number
  const setMobileNumber = useCallback(
    (mobileNumber: string) => {
      if (mobileNumber.length === 10 && mobileNumber.match(/^[0-9]+$/)) {
        if (hasRestructuringLoanApplication() && isAutoSignInCustomer) {
          setHideEditCta(true);
        }
        setAuthentication((prev) => ({ ...prev, MobileNumber: mobileNumber }));
        // Pass mobile number directly to avoid state timing issues
        generateOtp(mobileNumber);

        // Track event
        const eventName = emailAvailable
          ? `google_${signUpPosition}_mobile_submit`
          : "Onboarding_Mobile_Submited";
        const moengage = window.Moengage;
        moengage && moengage.track_event("mobile_submit", {});

        if (trackingService && userDetails) {
          const event = new EventDetails(
            eventName,
            "field",
            mobileNumber,
            "textbox",
            environmentType,
          );
          trackingService.sendDataToFunnel(
            userDetails,
            event,
            environmentType,
            clientName || "",
            googlepayAuthentication ? false : true,
          );
        }
      }
    },
    [
      emailAvailable,
      signUpPosition,
      isAutoSignInCustomer,
      trackingService,
      userDetails,
      environmentType,
      clientName,
      googlepayAuthentication,
      generateOtp,
    ],
  );

  // Update authentication ref whenever authentication state changes (keep ref in sync with state)
  useEffect(() => {
    authenticationRef.current = authentication;
  }, [authentication]);

  // Verify OTP - matching Angular's verifyOtp method exactly
  // Angular: this.authentication.Otp = otp; then this.getTokenUsingAcrValues();
  const verifyOtp = useCallback(
    async (verificationData: { otp: string; pan?: string }) => {
      const otp = verificationData?.otp || "";
      const pan = verificationData?.pan ? verificationData.pan.toString() : "";

      // Match Angular: directly update authentication.Otp (synchronously via ref, async via state)
      // Angular doesn't clear Email here, but we ensure it's empty in getTokenUsingAcrValues
      const updatedAuth = { ...authenticationRef.current, Otp: otp };
      authenticationRef.current = updatedAuth; // Synchronous update (like Angular's this.authentication.Otp = otp)
      setAuthentication(updatedAuth); // Async state update
      setQValue(pan);

      // Match Angular: if (otp && otp.length === 6 && otp.match(/^[0-9]+$/)) { this.getTokenUsingAcrValues(); }
      if (otp && otp.length === 6 && otp.match(/^[0-9]+$/)) {
        const getTokenFn = getTokenUsingAcrValuesRef.current;
        if (getTokenFn) {
          if (updatedAuth.ShowMfaChallenge) {
            if (pan && pan.length === 4) {
              await getTokenFn();
            }
          } else {
            await getTokenFn();
          }
        }
      }
    },
    [setQValue],
  );

  // Get token using ACR values
  const getTokenUsingAcrValues = useCallback(
    async (signUp = false, consent = false) => {
      if (!authService || !getEnvironmentConfig) return;

      setRetryOtpAttemts((prev) => prev + 1);
      setShowError(false);
      setIsPanForm(false);

      let isSignup = signUp;
      if (isAutoSignupCustomer) {
        isSignup = true;
      }

      const acrValues = new AcrValues(
        loanApplicationId || "",
        merchantId || "",
        merchantKey || "",
        MerchantCustomerId || "",
        2,
        qType,
        qValue,
      );

      try {
        // NO full-page loader - matching Angular behavior
        // The OTP modal's Continue button shows its own spinner via showContinueLoader

        // Use authenticationRef to get the latest authentication state (including OTP)
        const currentAuth = { ...authenticationRef.current };

        // When doing initial OTP verification (NOT signup), clear Email and Password
        // to avoid backend validation errors (backend validates Email even when isOtp=true)
        // But when signing up with email (isSignup=true), we NEED to keep the email
        // This matches Angular's behavior where authentication object keeps all data
        if (currentAuth.Otp && currentAuth.Otp.length > 0 && !isSignup) {
          currentAuth.Email = "";
          currentAuth.Password = "";
        }

        const response = await authService.getTokenUsingAcrValues(
          environmentType,
          currentAuth,
          isSignup,
          false,
          acrValues,
          version,
        );

        // Track events
        if (otherEmail && trackingService && userDetails) {
          const otherEmailEvent = new EventDetails(
            "other_email_success",
            "event",
            "triggered",
            "_null",
            environment,
          );
          trackingService.sendDataToFunnel(
            userDetails,
            otherEmailEvent,
            environmentType,
            clientName || "",
            googlepayAuthentication ? false : true,
          );
        }

        if (isPanForm && trackingService && userDetails) {
          const panEvent = new EventDetails(
            "auth_pan_success",
            "event",
            "triggered",
            "_null",
            environment,
          );
          trackingService.sendDataToFunnel(
            userDetails,
            panEvent,
            environmentType,
            clientName || "",
            googlepayAuthentication ? false : true,
          );
        }

        const eventName = !isSignup
          ? "Onboarding_Login_Done"
          : "Onboarding_Signup_Done";
        const event = new EventDetails(
          eventName,
          "Event",
          "AuthType",
          "_null",
          environment,
        );
        const wa_eventName = waOpted ? "wa_opt_in" : "wa_opt_out";
        const wa_event = new EventDetails(
          wa_eventName,
          "event",
          "triggered",
          "_null",
          environment,
        );
        const events = !isSignup ? [event] : [event, wa_event];
        onGetEvents?.(events);

        setToken(response);

        // Post consent if needed
        if (consent && !isGpay && response.access_token) {
          try {
            const tokenPayload = JSON.parse(
              atob(response.access_token.split(".")[1]),
            );
            const consentObj = {
              consents: [
                {
                  dataSharingConsent: {
                    isAccepted: true,
                    source: "signup",
                  },
                },
              ],
            };
            await authService.postConsent(
              environment,
              tokenPayload.sub,
              response,
              consentObj,
            );
          } catch (e) {
            console.error("Error posting consent:", e);
          }
        }

        // Update session storage
        sessionStorage.removeItem(AUTHENTICATION_SESSION_STORAGE_KEY);
        setContactNumber(currentAuth.MobileNumber);
        if (isSignup) {
          setSignUpFlag(true);
        }

        emitGetToken(response);
      } catch (error: any) {
        const errorCode = checkIfErrorCodeRetured(error);
        setIsPanForm(false);

        const emailFromRedirectURL =
          autoSignupCustomer &&
          autoSignupCustomer.EmailAddress &&
          autoSignupCustomer.EmailAddress.length > 0;

        if (
          errorCode &&
          (errorCode === AuthenticationErrorCodes.ZMAUT23 ||
            errorCode === AuthenticationErrorCodes.ZMAUT28)
        ) {
          if (emailFromRedirectURL) {
            setShowOtpForm(false);
            signUpUser();
          } else {
            setShowEmailOptions(true);
            setShowOtpForm(false);
            if (hideGmail) {
              setOtherEmail(true);
            }
            setAuthSessionStorage();

            // Get Finoramic feature
            if (applicationService) {
              const currentAuthForFeature = authenticationRef.current;
              applicationService
                .getFeatureVersion(
                  environmentType,
                  "GMAIL-STATEMENT-PARSING",
                  currentAuthForFeature.MobileNumber,
                )
                .then((gmailFeature) => {
                  if (
                    gmailFeature.version === "1.0" &&
                    !isIframe() &&
                    !googlePayRedirection
                  ) {
                    setShowFinoramicParsing(true);
                  }
                  setFinoramicParsingFeature(gmailFeature);
                  applicationService.tagFeatureToCustomer(
                    "GMAIL-STATEMENT-PARSING",
                    gmailFeature.version,
                    environmentType,
                    currentAuthForFeature.MobileNumber,
                  );

                  if (trackingService && userDetails) {
                    const eventEmailLoaded = new EventDetails(
                      "Onboarding_Email_Page_Loaded",
                      "event",
                      "triggered",
                      "_null",
                      environment,
                    );
                    trackingService.sendDataToFunnelWithCustomProperties(
                      userDetails,
                      eventEmailLoaded,
                      environment,
                      clientName || "",
                      true,
                      {
                        abVariant: showFinoramicParsing
                          ? "withGmailAuth"
                          : "withoutGmailAuth",
                      },
                    );
                  }
                });
            }
            loaderService?.next({ showLoader: false, loaderTextMessage: "" });
          }
        } else if (errorCode) {
          if (
            errorCode === AuthenticationErrorCodes.ZMAUT06 &&
            emailFromRedirectURL
          ) {
            setShowEmailOptions(true);
            setShowOtpForm(false);
            if (hideGmail) {
              setOtherEmail(true);
            }
            if (trackingService && userDetails) {
              const event = new EventDetails(
                "email_options",
                "page",
                "loaded",
                "_null",
                environment,
              );
              trackingService.sendDataToFunnel(
                userDetails,
                event,
                environmentType,
                clientName || "",
                googlepayAuthentication ? false : true,
              );
            }
            loaderService?.next({ showLoader: false, loaderTextMessage: "" });
          } else if (errorCode === AuthenticationErrorCodes.ZMAUT30) {
            setShowError(true);
            setIsPanForm(true);
            setErrorMessage(
              AuthenticationV2ErrorMessages[
                errorCode as keyof typeof AuthenticationV2ErrorMessages
              ],
            );
            if (trackingService && userDetails) {
              const event = new EventDetails(
                "auth_pan_failed",
                "event",
                "triggered",
                "_null",
                environment,
              );
              trackingService.sendDataToFunnel(
                userDetails,
                event,
                environmentType,
                clientName || "",
                googlepayAuthentication ? false : true,
              );
            }
            loaderService?.next({ showLoader: false, loaderTextMessage: "" });
          } else {
            loaderService?.next({ showLoader: false, loaderTextMessage: "" });

            if (showEmailOptions) {
              sessionStorage.removeItem(AUTHENTICATION_SESSION_STORAGE_KEY);
              setShowEmailOptions(false);
              setShowError(false);
              setErrorMessage("");

              if (errorCode === AuthenticationErrorCodes.ZMAUT25) {
                setAuthentication((prev) => ({ ...prev, Email: "" }));
                setAuthError({
                  error: AuthErrorType.otp,
                  heading: "Email ID belongs to another user",
                  description:
                    "Sorry, this email is linked to a different account. Please login again.",
                });
                setIsSubmitInProgress(false);
                setIncomeConsent(false);
              } else if (errorCode === AuthenticationErrorCodes.ZMAUT02) {
                setAuthError({
                  error: AuthErrorType.otp,
                  heading: "OTP Invalid",
                  description:
                    "Sorry, your OTP is invalid. Please login again.",
                });
                setIsSubmitInProgress(false);
                setIncomeConsent(false);
              }
            } else {
              setShowError(true);
              setErrorMessage(
                AuthenticationV2ErrorMessages[
                  errorCode as keyof typeof AuthenticationV2ErrorMessages
                ] || "Something went wrong",
              );
            }
          }
        }

        if (
          !showEmailOptions &&
          errorCode === AuthenticationErrorCodes.ZMAUT02 &&
          retryOtpAttemts >= 3
        ) {
          setShowError(true);
          setErrorMessage(
            "Incorrect OTP. Please enter the verification code again",
          );
          loaderService?.next({ showLoader: false, loaderTextMessage: "" });
        }

        if (otherEmail && trackingService && userDetails) {
          const otherEmailError = new EventDetails(
            "other_email_error",
            "event",
            "triggered",
            "_null",
            environment,
          );
          trackingService.sendDataToFunnel(
            userDetails,
            otherEmailError,
            environmentType,
            clientName || "",
            googlepayAuthentication ? false : true,
          );
          loaderService?.next({ showLoader: false, loaderTextMessage: "" });
        }
      }
    },
    [
      authService,
      authentication,
      isAutoSignupCustomer,
      loanApplicationId,
      merchantId,
      MerchantCustomerId,
      merchantKey,
      qType,
      qValue,
      version,
      environmentType,
      otherEmail,
      isPanForm,
      waOpted,
      isGpay,
      hideGmail,
      googlePayRedirection,
      googlepayAuthentication,
      retryOtpAttemts,
      showEmailOptions,
      autoSignupCustomer,
      applicationService,
      trackingService,
      userDetails,
      clientName,
      environment,
      loaderService,
      onGetEvents,
      getEnvironmentConfig,
    ],
  );

  // Update ref with getTokenUsingAcrValues function after it's defined
  useEffect(() => {
    getTokenUsingAcrValuesRef.current = getTokenUsingAcrValues;
  }, [getTokenUsingAcrValues]);

  // Get token using Google login
  const getTokenUsingGoogleLogin = useCallback(
    async (
      external_id_token: string,
      external_id_token2?: string,
      mfaDisabled = false,
    ) => {
      if (!authService || !getEnvironmentConfig) return;

      setPhoneToken(external_id_token);
      setShowError(false);
      loaderService?.next({ showLoader: true, loaderTextMessage: "" });

      const acrValues = new AcrValues(
        loanApplicationId || "",
        merchantId || "",
        merchantKey || "",
        MerchantCustomerId || "",
        2,
      );

      let googleAuthPayload: any;
      if (external_id_token2) {
        googleAuthPayload = {
          environmentType,
          acrValues,
          external_id_token,
          version,
          external_id_token2,
          mfa: true,
        };
      } else {
        googleAuthPayload = {
          environmentType,
          acrValues,
          external_id_token,
          version,
          user_provided_email: authentication.Email,
          mfa: true,
        };
      }

      if (mfaDisabled) {
        googleAuthPayload = {
          environmentType,
          acrValues,
          external_id_token,
          version,
        };
      }

      try {
        const response =
          await authService.getTokenUsingGoogleLogin(googleAuthPayload);

        const eventName = googlePayRedirection
          ? "OTP_autologin"
          : `google_${signUpPosition}_sign_in_successful`;
        const eventValue = googlePayRedirection ? "event" : "google";
        const event = new EventDetails(
          eventName,
          "click",
          eventValue,
          "_null",
          environment,
        );
        onGetEvents?.([event]);

        setToken(response);

        if (external_id_token2) {
          sessionStorage.setItem("ngx-webstorage|zest-sign-up", "true");
          sessionStorage.setItem(
            "ngx-webstorage|zest-contact",
            authentication.MobileNumber,
          );
        }

        emitGetToken(response);
      } catch (error: any) {
        const errorCode = checkIfErrorCodeReturedFromGoogle(error);

        if (
          errorCode &&
          errorCode === AuthenticationErrorCodes.ZMAUT10 &&
          googlepayAuthentication
        ) {
          setShowEmailOptions(true);
          setOtherEmail(true);
          setShowOtpForm(false);
          getEmailAddress();
        } else if (
          errorCode &&
          errorCode === AuthenticationErrorCodes.ZMAUT17
        ) {
          setGoogleSignup(true);
          setEmailAvailable(true);
          if (trackingService && userDetails) {
            const event = new EventDetails(
              `google_${signUpPosition}_mobile_loaded`,
              "event",
              "triggered",
              "_null",
              environment,
            );
            trackingService.sendDataToFunnel(
              userDetails,
              event,
              environmentType,
              clientName || "",
              googlepayAuthentication ? false : true,
            );
          }
          setShowOtpForm(false);
        } else {
          setShowError(true);
          if (errorCode) {
            setErrorMessage(
              AuthenticationV2ErrorMessages[
                errorCode as keyof typeof AuthenticationV2ErrorMessages
              ] || "Something went wrong",
            );
          } else {
            setErrorMessage(
              "Something went wrong, please login with OTP / Email",
            );
          }
        }
        loaderService?.next({ showLoader: false, loaderTextMessage: "" });
      }
    },
    [
      authService,
      loanApplicationId,
      merchantId,
      MerchantCustomerId,
      merchantKey,
      version,
      environmentType,
      authentication.Email,
      googlePayRedirection,
      signUpPosition,
      googlepayAuthentication,
      trackingService,
      userDetails,
      clientName,
      environment,
      loaderService,
      onGetEvents,
      getEnvironmentConfig,
    ],
  );

  // Get email address from Google Pay
  const getEmailAddress = useCallback(
    async (validateOnlyEmail = false) => {
      if (!window.microapps) return;

      try {
        const response = await window.microapps.getIdentity();
        const payload = JSON.parse(atob(response.split(".")[1]));
        const emailToken: any = {};
        Object.assign(emailToken, payload);

        if (emailToken && emailToken.email_verified && emailToken.email) {
          if (emailToken.email.length > 1) {
            setAuthentication((prev) => ({ ...prev, Email: emailToken.email }));
            setTimeout(() => {
              if (phoneToken) {
                getTokenUsingGoogleLogin(phoneToken, response);
              } else {
                getTokenUsingAcrValues(true);
              }
            }, 0);
          }
        }
      } catch (error) {
        if (validateOnlyEmail) {
          getTokenUsingAcrValues(true);
        }
      }
    },
    [phoneToken, getTokenUsingGoogleLogin, getTokenUsingAcrValues],
  );

  // Set Finoramic redirect
  const setFinoramicRedirect = useCallback(
    (_e?: React.MouseEvent) => {
      if (!getEnvironmentConfig) return;

      if (incomeConsent) {
        const envConfig = getEnvironmentConfig(environmentType);
        const {
          baseAppUrl,
          finoramicClient,
          finoramicClientId,
          finoramicDomain,
          finoramicCallback,
        } = envConfig || {
          finoramicClient: "",
          finoramicClientId: "",
          finoramicDomain: "",
          finoramicCallback: "/authentication/finoramic-callback",
          baseAppUrl: "",
        };

        if (trackingService && userDetails) {
          const event = new EventDetails(
            "Onboarding_Gmail_Redirect_Started",
            "event",
            "triggered",
            "_null",
            environment,
          );
          trackingService.sendDataToFunnelWithCustomProperties(
            userDetails,
            event,
            environmentType,
            clientName || "",
            true,
          );
        }

        const userId = authentication && authentication.MobileNumber;
        const url = `${finoramicDomain}/client/${finoramicClient}/login?client_id=${finoramicClientId}&api_type=TYPE_1&user_id=${userId}&redirect_url=${baseAppUrl}${finoramicCallback}`;
        window.location.href = url;
      } else {
        checkConsent();
      }
    },
    [
      incomeConsent,
      authentication,
      environmentType,
      trackingService,
      userDetails,
      clientName,
      environment,
      getEnvironmentConfig,
    ],
  );

  // Handle email submit from EnterEmailV3 component
  const handleEmailSubmit = useCallback(
    (email: string, consent: boolean, waConsent: boolean) => {
      // Update both ref (synchronous) and state (async) - matching Angular's direct property access
      const updatedAuth = { ...authenticationRef.current, Email: email };
      authenticationRef.current = updatedAuth; // Synchronous update for immediate use
      setAuthentication(updatedAuth); // Async state update
      setEnteredEmail(email);
      setIncomeConsent(consent);
      setWaOpted(waConsent);
      setSliderCheck(waConsent);
      // signUpUser will be called after state updates via useEffect or directly
      setTimeout(() => {
        // Trigger signup after state is updated
        signUpUserRef.current?.();
      }, 0);
    },
    [],
  );

  // Ref to hold signUpUser for async calls
  const signUpUserRef = useRef<(() => void) | null>(null);

  // Sign up user
  const signUpUser = useCallback(async () => {
    if (isSubmitInProgress) return;

    setIsSubmitInProgress(true);

    // Handle Finoramic email parsing failure
    if (!authentication.MobileNumber) {
      const email = authentication.Email;
      try {
        const authSessionString = sessionStorage.getItem(
          AUTHENTICATION_SESSION_STORAGE_KEY,
        );
        if (authSessionString) {
          const authSession: AuthenticationSessionStorageProperties =
            JSON.parse(authSessionString);
          setAuthentication(authSession.auth);
        }
      } catch (e) {
        // Error parsing
      }
      setAuthentication((prev) => ({ ...prev, Email: email }));
    }

    if (!checkEmailError(authentication.Email, "submit")) {
      if (trackingService && userDetails) {
        const event = new EventDetails(
          "Onboarding_Email_Submitted",
          "event",
          "triggered",
          "_null",
          environmentType,
        );
        const waevent = new EventDetails(
          "Onboarding_Whatsapp_Consent_Submitted",
          "event",
          "triggered",
          "_null",
          environmentType,
        );

        trackingService.sendDataToFunnelWithCustomProperties(
          userDetails,
          event,
          environmentType,
          clientName || "",
          true,
          { AuthActivity: "Onboarding_Email_Submitted" },
        );

        trackingService.sendDataToFunnelWithCustomProperties(
          userDetails,
          waevent,
          environmentType,
          clientName || "",
          true,
          { consent: waOpted },
        );
      }

      const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
      if (
        authentication &&
        authentication.Email &&
        authentication.Email.length > 0 &&
        emailRegex.test(authentication.Email) &&
        incomeConsent
      ) {
        if (trackingService && userDetails) {
          const consentGiven = new EventDetails(
            "Onboarding_Datasharing_Consent_Submitted",
            "event",
            "triggered",
            "_null",
            environmentType,
          );
          trackingService.sendDataToFunnelWithCustomProperties(
            userDetails,
            consentGiven,
            environmentType,
            clientName || "",
            true,
            { consentGiven: true },
          );
        }

        await getTokenUsingAcrValues(true, true);
      } else {
        setEmError(true);
        setIsSubmitInProgress(false);
      }
    } else {
      setIsSubmitInProgress(false);
    }
  }, [
    isSubmitInProgress,
    authentication,
    incomeConsent,
    waOpted,
    trackingService,
    userDetails,
    environmentType,
    clientName,
    getTokenUsingAcrValues,
  ]);

  // Keep signUpUserRef in sync with signUpUser
  useEffect(() => {
    signUpUserRef.current = signUpUser;
  }, [signUpUser]);

  // Resend OTP
  const resendOtp = useCallback(() => {
    focusElementById("otp_number", 500);
    setRetryOtpAttemts(0);
    const eventName = emailAvailable
      ? `google_${signUpPosition}_resend_otp_clicked`
      : "resend_otp_clicked";
    const event = new EventDetails(
      eventName,
      "event",
      "triggered",
      "_null",
      environment,
    );
    setErrorMessage("");

    if (trackingService && userDetails) {
      trackingService.sendDataToFunnel(
        userDetails,
        event,
        environmentType,
        clientName || "",
        googlepayAuthentication ? false : true,
      );
    }

    // Pass the mobile number from authentication state for resend
    if (authentication.MobileNumber) {
      generateOtp(authentication.MobileNumber);
    }
  }, [
    emailAvailable,
    signUpPosition,
    trackingService,
    userDetails,
    environmentType,
    clientName,
    googlepayAuthentication,
    generateOtp,
    environment,
    authentication.MobileNumber,
  ]);

  // Check email error
  const checkEmailError = useCallback(
    (
      val: string | React.FocusEvent<HTMLInputElement>,
      type: string,
    ): boolean => {
      const email =
        type === "submit"
          ? val
          : (val as React.FocusEvent<HTMLInputElement>).target.value;
      setEnteredEmail(email as string);

      if (isEmail(email as string)) {
        setEmailErrorMsg(null);
        return false;
      } else {
        setEmailErrorMsg("Please enter a valid email ID");
        return true;
      }
    },
    [],
  );

  // Set auth session storage
  const setAuthSessionStorage = useCallback(
    (reuseIssuedAt = false) => {
      try {
        let issuedAt = Date.now();
        let auth = authentication;
        const tokenString = sessionStorage.getItem(
          AUTHENTICATION_SESSION_STORAGE_KEY,
        );

        if (reuseIssuedAt && tokenString) {
          const token: AuthenticationSessionStorageProperties =
            JSON.parse(tokenString);
          issuedAt = token.issuedAt;
          auth = token.auth;
        }

        const authSessionObject: AuthenticationSessionStorageProperties = {
          auth,
          waOpted,
          issuedAt,
        };
        sessionStorage.setItem(
          AUTHENTICATION_SESSION_STORAGE_KEY,
          JSON.stringify(authSessionObject),
        );
      } catch (e) {
        console.error("Failed to serialize authentication object");
      }
    },
    [authentication, waOpted],
  );

  // Check consent
  const checkConsent = useCallback((reverse = false) => {
    const element = document.getElementById("IC");
    if (element) {
      element.style.outline = reverse
        ? "#FF0000 solid 0px"
        : "#FF0000 solid 1px";
    }
  }, []);

  // Emit get token
  const emitGetToken = useCallback(
    (token: Token) => {
      onGetToken?.(token);
      loaderService?.next({ showLoader: false, loaderTextMessage: "" });
      setShowOtpForm(false);

      // MoEngage integration
      const moengage = window.Moengage;
      if (moengage) {
        moengage.add_email(authentication.Email);
        moengage.add_mobile(`+91${authentication.MobileNumber}`);
        moengage.add_user_attribute("EmailAddress", authentication.Email);
        moengage.add_user_attribute(
          "MobileNumber",
          `+91${authentication.MobileNumber}`,
        );
      }
    },
    [authentication, onGetToken, loaderService],
  );

  // Close OTP modal (matching Angular: just close the modal)
  const closeOtpModal = useCallback(() => {
    setShowOtpForm(false);
    setErrorMessage("");
  }, []);

  return (
    <div className="auth-bg-wrapper">
      <div className="auth-v3-contianer">
        {/* Logo Header */}
        <div className="logo-header">
          <img
            src="https://assets.zestmoney.in/assets/customers/icons/Zest_logo_green.png"
            alt="zest-logo"
            className="zest-logo"
          />
        </div>

        {/* Enter Mobile Number - Matching Angular: *ngIf="!emailAvailable && !showEmailOptions" */}
        {!emailAvailable && !showEmailOptions && (
          <EnterMobileNumberV3
            authentication={authentication}
            disabled={disabled}
            environmentType={environmentType}
            clientName={clientName}
            merchantId={merchantId}
            googlePayRedirection={googlePayRedirection}
            MerchantCustomerId={MerchantCustomerId}
            onGenerateOtp={setMobileNumber}
            onMobileNumberUpdate={(response) =>
              getTokenUsingGoogleLogin(response)
            }
            className="enter-mobile-v3-container"
          />
        )}

        {/* Enter OTP - Matching Angular: *ngIf="showOtpForm" (modal overlay on top of mobile) */}
        {showOtpForm && (
          <EnterOtpV3
            state={showOtpForm}
            authentication={authentication}
            errorMessage={errorMessage}
            userDetails={userDetails || undefined}
            hasOtpCallFinished={hasOtpCallFinished}
            showMfaChallenge={authentication.ShowMfaChallenge}
            showGetCall={showGetCall}
            environmentType={environmentType}
            clientName={clientName}
            onCloseModal={closeOtpModal}
            onOtpPassword={verifyOtp}
            onResendOtp={resendOtp}
            onGetOtpViaCall={async () => {
              if (authService && authentication.OtpId) {
                try {
                  await authService.triggerOtpViaCallV2(
                    environmentType,
                    authentication.OtpId,
                  );
                } catch (error) {
                  console.error("Error triggering OTP via call:", error);
                }
              }
            }}
          />
        )}

        {/* Email Options Form - Matching Angular: *ngIf="showEmailOptions" */}
        {showEmailOptions && (
          <EnterEmailV3
            authentication={authentication}
            disabled={disabled}
            isGpay={isGpay}
            showFinoramicParsing={showFinoramicParsing}
            onEmailSubmit={handleEmailSubmit}
            onFinoramicRedirect={setFinoramicRedirect}
            className="enter-email-v3-container"
          />
        )}
      </div>

      {/* Auth Error Modal */}
      {authError && (
        <AuthErrorComponent
          error={authError}
          onClose={() => setAuthError(null)}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmModal && (
        <div className="logout-confirm-modal">
          <GtSwipe onSwipeDown={handleLogoutCancel}>
            <GtModal
              open={showLogoutConfirmModal}
              grootClose={handleLogoutCancel}
              appearance="primary"
              hideCloseButton={false}
              className="otp-modal"
            >
              <div className="modal-wrapper">
                <div className="text-wrapper">
                  <div className="circle-wrapper">🤔</div>
                  <p className="heading">Are you sure you want to log out?</p>
                  <p className="description">
                    You will need to enter your phone number and verify OTP
                    again to continue.
                  </p>
                </div>
                <div className="logout-modal-buttons">
                  <GtButton
                    appearance="primary"
                    bold={true}
                    size="block"
                    type="button"
                    textContent="Yes, Log Out"
                    grootClick={handleLogoutConfirm}
                  />
                  <GtButton
                    appearance="secondary"
                    bold={true}
                    size="block"
                    type="button"
                    textContent="Cancel"
                    grootClick={handleLogoutCancel}
                    className="cancel-btn"
                  />
                </div>
              </div>
            </GtModal>
          </GtSwipe>
        </div>
      )}
    </div>
  );
};

export default PhoneNumberSignInV3Complete;
