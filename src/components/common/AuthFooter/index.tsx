/**
 * AuthFooter Component
 * Exact React replacement for Angular FooterComponent
 * Controlled by FooterService
 */

import React, { useState, useEffect } from 'react';
import { FooterService, Footer } from '../../../services/footerService';
import './index.css';

export const AuthFooter: React.FC = () => {
  const [showFooter, setShowFooter] = useState<boolean>(false);
  const fullYear = new Date().getFullYear().toString();

  useEffect(() => {
    const unsubscribe = FooterService.subscribe((footer: Footer) => {
      setShowFooter(footer.showFooter);
    });

    return unsubscribe;
  }, []);

  if (!showFooter) return null;

  return (
    <footer className="page-footer auth-footer">
      <div className="footer-copyright auth-copyright">
        <div className="container">
          <span>&copy;</span> {fullYear} DMI Infotech Solutions Private Limited
        </div>
      </div>
    </footer>
  );
};

export default AuthFooter;
