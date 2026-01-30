import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Set base font size (matching Angular)
document.getElementsByTagName("html")[0].style.fontSize = "16px";

// Mobile viewport height calculation (fixes mobile browser address bar issue)
const setViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};

// Set initial viewport height
setViewportHeight();

// Update on resize
window.addEventListener("resize", setViewportHeight);
window.addEventListener("orientationchange", setViewportHeight);

// Scroll to top on mount
window.scrollTo(0, 0);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
