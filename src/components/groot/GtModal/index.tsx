/**
 * GtModal Component
 * Exact React replacement for Groot UI gt-modal component
 * Matches Angular gt-modal exactly: bottom sheet on mobile, centered on desktop
 */

import React, { useEffect } from "react";
import "./index.css";

// Close icon SVG (exact match for groot-ui closeIcon.svg - X inside circle)
const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.88552 6.1143L6.11426 9.88496"
      stroke="#1A1A1A"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.11426 6.1143L9.88552 9.88496"
      stroke="#1A1A1A"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.00016 14.6667C11.6821 14.6667 14.6668 11.6819 14.6668 8C14.6668 4.3181 11.6821 1.33334 8.00016 1.33334C4.31826 1.33334 1.3335 4.3181 1.3335 8C1.3335 11.6819 4.31826 14.6667 8.00016 14.6667Z"
      stroke="#1A1A1A"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface GtModalProps {
  open: boolean;
  grootClose?: () => void;
  appearance?: "primary" | "secondary" | "floating";
  hideCloseButton?: boolean;
  className?: string;
  grootId?: string;
  modalCustomStyles?: React.CSSProperties;
  children: React.ReactNode;
  header?: React.ReactNode;
}

export const GtModal: React.FC<GtModalProps> = ({
  open,
  grootClose,
  appearance = "primary",
  hideCloseButton = false,
  className = "",
  grootId,
  modalCustomStyles,
  children,
  header,
}) => {
  // Handle body overflow
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      grootClose?.();
    }
  };

  // Handle close button click
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    grootClose?.();
  };

  // Handle modal content click (stop propagation)
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        grootClose?.();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [open, grootClose]);

  // Modal container classes
  const modalContainerClasses = [
    "modal-container",
    open ? "isopen" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Modal content classes
  const modalContentClasses = ["modal-content", appearance]
    .filter(Boolean)
    .join(" ");

  // Swipe indicator only for primary appearance
  const showSwipeIndicator = appearance === "primary";

  return (
    <div
      className={modalContainerClasses}
      onClick={handleBackdropClick}
      id={grootId ? `${grootId}-modal-outside` : undefined}
      role="dialog"
      aria-modal="true"
    >
      {/* Swipe indicator */}
      {showSwipeIndicator && <div className="swipe-indicator" />}

      {/* Modal content */}
      <div
        className={modalContentClasses}
        id={grootId || undefined}
        onClick={handleModalClick}
        style={modalCustomStyles}
      >
        {/* Close button */}
        {!hideCloseButton && (
          <button
            type="button"
            className="closeIcon"
            id={grootId ? `${grootId}-close-cta` : undefined}
            onClick={handleClose}
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        )}

        {/* Header slot */}
        {header && <div className="header">{header}</div>}

        {/* Content */}
        {children}
      </div>
    </div>
  );
};
