import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import "./NotFound.css";

export function NotFound() {
  return (
    <main className="not-found-container" role="main" aria-labelledby="not-found-title">
      <div className="not-found-content">
        {/* 404 Illustration */}
        <div className="not-found-illustration" aria-hidden="true">
          <div className="error-code">404</div>
          <svg
            className="not-found-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M8 15C8.5 13.5 10 12.5 12 12.5C14 12.5 15.5 13.5 16 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="9" cy="9" r="1.5" fill="currentColor" />
            <circle cx="15" cy="9" r="1.5" fill="currentColor" />
          </svg>
        </div>

        {/* Content */}
        <h1 id="not-found-title" className="not-found-title">
          Oops! Page not found
        </h1>
        <p className="not-found-description">
          The page you're looking for doesn't exist or has been moved.
          Don't worry, let's get you back on track.
        </p>

        {/* Action Button */}
        <Link to={ROUTES.ROOT} className="not-found-button">
          <svg
            className="button-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Go to Home
        </Link>

      </div>
    </main>
  );
}
