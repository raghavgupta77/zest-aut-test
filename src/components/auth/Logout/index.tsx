/**
 * Logout Component
 * Exact React replacement for Angular LogoutComponent
 * 5-second countdown before logout
 */

import React, { useState, useEffect } from 'react';
import './index.css';

export interface LogoutProps {
  environment?: string;
  clientName?: string;
  onLogout?: () => void;
}

export const Logout: React.FC<LogoutProps> = ({
  environment: _environment,
  clientName: _clientName,
  onLogout
}) => {
  const [timer, setTimer] = useState<number>(5);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          onLogout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, [onLogout]);

  return (
    <div className="logout-container">
      <div className="logout-content">
        <h2>Logging out...</h2>
        <p>You will be logged out in {timer} seconds</p>
      </div>
    </div>
  );
};

export default Logout;
