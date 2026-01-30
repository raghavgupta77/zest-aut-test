/**
 * AuthHeader Component
 * Exact React replacement for Angular HeaderComponent
 * Controlled by HeaderService
 */

import React, { useState, useEffect } from 'react';
import { HeaderService, Header } from '../../../services/headerService';
import './index.css';

export interface AuthHeaderProps {
  onBackButtonClicked?: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  onBackButtonClicked
}) => {
  const [showHeader, setShowHeader] = useState<boolean>(false);
  const [showBackButton, setShowBackButton] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = HeaderService.subscribe((header: Header) => {
      setShowHeader(header.showHeader);
      setShowBackButton(header.showBackButton);
    });

    return unsubscribe;
  }, []);

  const goBack = () => {
    onBackButtonClicked?.();
  };

  if (!showHeader) return null;

  return (
    <nav className="auth-nav">
      <div className="auth-nav-wrapper auth-page-container container">
        <div className="auth-page-container container">
          {showBackButton && (
            <a
              className="back-arrow"
              href="javascript:void(0);"
              onClick={(e) => {
                e.preventDefault();
                goBack();
              }}
            >
              <i className="material-icons">arrow_back</i>
            </a>
          )}
          <a href="javascript:void(0);" className="brand-logo auth-brand-logo center">
            <img
              className="responsive-img auth-logo-image"
              src="/src/assets/images/authentication/logo.svg"
              alt="ZestMoney"
            />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default AuthHeader;
