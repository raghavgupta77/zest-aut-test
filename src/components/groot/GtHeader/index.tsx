/**
 * GtHeader Component
 * React replacement for Groot UI gt-header component
 * Matches Angular gt-header exactly: title, subtitle, iconUrl
 */

import React from "react";
import "./index.css";

export interface GtHeaderProps {
  headerTitle: string;
  subtitle?: string;
  iconUrl?: string;
  className?: string;
}

export const GtHeader: React.FC<GtHeaderProps> = ({
  headerTitle,
  subtitle,
  iconUrl,
  className = "",
}) => {
  return (
    <div className={`gt-header ${className}`}>
      {iconUrl && (
        <div className="gt-header-icon">
          <img src={iconUrl} alt="" />
        </div>
      )}
      <div className="gt-header-content">
        <h2 className="gt-header-title">{headerTitle}</h2>
        {subtitle && <p className="gt-header-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};
