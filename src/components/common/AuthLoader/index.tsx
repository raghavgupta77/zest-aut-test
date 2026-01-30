/**
 * AuthLoader Component
 * Exact React replacement for Angular LoaderComponent
 * Controlled by LoaderService
 */

import React, { useState, useEffect } from "react";
import { LoaderService, Loader } from "../../../services/loaderService";
import "./index.css";

export const AuthLoader: React.FC = () => {
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [loaderTextMessage, setLoaderTextMessage] = useState<string>("");

  useEffect(() => {
    const unsubscribe = LoaderService.subscribe((loader: Loader) => {
      setShowLoader(loader.showLoader);
      setLoaderTextMessage(loader.loaderTextMessage);
    });

    return unsubscribe;
  }, []);

  if (!showLoader) return null;

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <div className="loader-box" aria-hidden="true"></div>
      <div className="loader-block">
        <div className="row">
          <div className="col l12 m12 s12 center">
            <div
              className={`processing-logo ${showLoader && loaderTextMessage ? "text-logo" : ""}`}
            >
              <div className="logo">
                <img
                  src="/src/assets/images/authentication/loader-logo.svg"
                  alt=""
                  aria-hidden="true"
                />
              </div>
            </div>
            {showLoader && (
              <div className="auth-page-container container">
                <div className="welcome-user">
                  <div className="welcome-content">
                    <h2>{loaderTextMessage || "Loading..."}</h2>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLoader;
