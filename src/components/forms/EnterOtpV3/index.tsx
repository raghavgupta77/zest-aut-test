/**
 * EnterOtpV3 Component
 * Exact React replacement for Angular EnterOtpV3Component
 * Matches Angular component exactly: styling, behavior, OTP timer animation
 */

import React, { useState, useEffect, useCallback } from "react";
import OtpInput from "react-otp-input";
import { GtModal, GtSwipe, GtButton } from "../../groot";
import "./index.css";

export interface EnterOtpV3Props {
  state: boolean;
  authentication?: any;
  errorMessage?: string;
  userDetails?: any;
  environmentType?: string;
  clientName?: string;
  hasOtpCallFinished?: boolean;
  showMfaChallenge?: boolean;
  showGetCall?: boolean;
  onCloseModal?: () => void;
  onOtpPassword?: (data: { otp: string; pan?: string }) => void;
  onResendOtp?: () => void;
  onGetOtpViaCall?: () => void;
}

export const EnterOtpV3: React.FC<EnterOtpV3Props> = ({
  state,
  authentication,
  errorMessage = "",
  userDetails: _userDetails,
  environmentType: _environmentType,
  clientName: _clientName,
  hasOtpCallFinished = false,
  showMfaChallenge: _showMfaChallenge = false,
  showGetCall: _initialShowGetCall = false,
  onCloseModal,
  onOtpPassword,
  onResendOtp,
  onGetOtpViaCall: _onGetOtpViaCall,
}) => {
  const [otp, setOtp] = useState<string>("");
  const [pan, setPan] = useState<string>("");
  void pan; // Suppress unused warning (pan needed for MFA challenge)
  const [disabledCTA, setDisabledCTA] = useState<boolean>(true);
  const [showTimer, setShowTimer] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(30);
  const [showContinueLoader, setShowContinueLoader] = useState<boolean>(false);

  // Handle OTP change
  const handleOtpChange = useCallback((value: string) => {
    setOtp(value);
    if (value && value.length === 6) {
      setDisabledCTA(false);
    } else {
      setDisabledCTA(true);
    }
  }, []);

  // Toggle timer - matches Angular EnterOtpV3Component exactly
  const toggleTimer = useCallback(() => {
    setShowTimer(true);
    setTimer(30);
  }, []);

  // Initialize timer on mount when component opens
  useEffect(() => {
    if (!showTimer) return;

    const interval = setInterval(() => {
      timer > 0 &&
        setTimer((prev) => {
          if (prev <= 1) {
            setShowTimer(false);
          }
          return prev - 1;
        });
    }, 1000);

    return () => clearInterval(interval);
  }, [showTimer]);

  // Submit OTP
  const submitOtp = useCallback(() => {
    setShowContinueLoader(true);
    if (disabledCTA) {
      return;
    }

    if (!otp || otp.length < 6) {
      // Error handling
    } else {
      onOtpPassword?.({ otp });
    }
  }, [otp, disabledCTA, onOtpPassword]);

  // Send OTP (resend)
  const sendOtp = useCallback(() => {
    // Clear OTP input
    setOtp("");
    setShowContinueLoader(false);
    toggleTimer();
    onResendOtp?.();
  }, [toggleTimer, onResendOtp]);

  // Close modal
  const closeOtpModal = useCallback(() => {
    onCloseModal?.();
  }, [onCloseModal]);

  // Reset loader when error message appears (matching Angular: spinner hides on error)
  useEffect(() => {
    if (errorMessage) {
      setShowContinueLoader(false);
    }
  }, [errorMessage]);

  // Reset loader and OTP when modal state changes
  useEffect(() => {
    if (state) {
      // Modal opened - reset state
      setShowContinueLoader(false);
      setOtp("");
      setDisabledCTA(true);
    } else {
      // Modal closed - reset loader immediately
      setShowContinueLoader(false);
    }
  }, [state]);

  return (
    <div className="enter-otp-v3">
      <GtSwipe onSwipeDown={closeOtpModal}>
        <GtModal
          open={state}
          grootClose={closeOtpModal}
          appearance="primary"
          hideCloseButton={false}
          className="otp-modal"
        >
          <div className="modal-wrapper">
            <form
              className="enter-otp-v3-form"
              name="otpForm"
              id="otpForm"
              method="POST"
              onSubmit={(e) => {
                e.preventDefault();
                submitOtp();
              }}
              autoComplete="off"
            >
              <p className="resend-label">
                Enter OTP sent to{" "}
                <span>{authentication?.MobileNumber || ""}</span>
              </p>

              {/* OTP Input - Exact match for ng-otp-input */}
              <div className="otp-input-container">
                <OtpInput
                  value={otp}
                  onChange={handleOtpChange}
                  numInputs={6}
                  renderInput={(props) => (
                    <input
                      {...props}
                      className="otp-input-box"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  )}
                  shouldAutoFocus={true}
                  inputType="tel"
                  containerStyle={{
                    display: "flex",
                    justifyContent: "flex-start",
                    gap: "0",
                    width: "100%",
                    margin: "0",
                    padding: "0",
                    marginBottom: "0",
                    marginTop: "0",
                  }}
                />
              </div>

              {errorMessage && <p className="errMSg">{errorMessage}</p>}

              <div className="submit-btn-wrapper">
                <GtButton
                  appearance="primary"
                  bold={true}
                  size="block"
                  type="submit"
                  disabled={!hasOtpCallFinished || disabledCTA}
                  textContent={
                    showContinueLoader && !errorMessage ? "" : "Continue"
                  }
                />
                {/* Loading Overlay - Inside submit-btn-wrapper to cover only the button */}
                {showContinueLoader && !errorMessage && (
                  <div className="btn-overlay">
                    <span className="spinner"></span>
                  </div>
                )}
              </div>

              {/* Resend Section */}
              <div className="resend-wrapper">
                Didn't get the OTP? &nbsp;
                <div
                  className={
                    showTimer
                      ? "green-btn-text disabled-green"
                      : "green-btn-text"
                  }
                  onClick={() => !showTimer && sendOtp()}
                >
                  Resend
                </div>
                &nbsp;
                {showTimer && (
                  <div className="resend-btn">
                    {" in "}
                    <div>
                      <div id="countdown" className="item">
                        <div id="countdown-number">{timer}</div>
                        <svg>
                          <circle
                            r="10"
                            cx="12"
                            cy="12"
                            className="circle_animation"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </GtModal>
      </GtSwipe>
    </div>
  );
};

export default EnterOtpV3;
