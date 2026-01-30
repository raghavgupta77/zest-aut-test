/**
 * AuthError Component
 * Exact React replacement for Angular AuthErrorComponent
 * Modal-based error display
 */

import React, { useEffect, useState } from 'react';
import { GtModal, GtSwipe, GtButton } from '../../groot';
import './index.css';

export const AuthErrorType = {
  email: 'email',
  otp: 'otp'
} as const;

export type AuthErrorType = typeof AuthErrorType[keyof typeof AuthErrorType];

export interface AuthError {
  error: AuthErrorType | null;
  heading: string;
  description: string;
}

export interface AuthErrorProps {
  error: AuthError | null;
  onClose?: () => void;
}

export const AuthErrorComponent: React.FC<AuthErrorProps> = ({
  error,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const shouldOpen =
      error?.error === AuthErrorType.email || error?.error === AuthErrorType.otp;
    setIsOpen(shouldOpen);
  }, [error]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!error || !isOpen) return null;

  return (
    <div className="auth-modal-error">
      <GtSwipe onSwipeDown={handleClose}>
        <GtModal open={isOpen} grootClose={handleClose} className="otp-modal">
          <div className="modal-wrapper">
            <div className="text-wrapper">
              <div className="circle-wrapper">🤔</div>
              <p className="heading">{error.heading}</p>
              <p className="description">{error.description}</p>
            </div>
            <GtButton
              appearance="primary"
              bold={true}
              size="block"
              type="submit"
              textContent="Okay, sounds cool."
              grootClick={handleClose}
            />
          </div>
        </GtModal>
      </GtSwipe>
    </div>
  );
};

export default AuthErrorComponent;
