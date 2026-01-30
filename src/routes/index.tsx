import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { AppLayout } from "../layouts/AppLayout";

// Lazy load route components for code splitting
const LoginPage = lazy(() =>
  import("./LoginPage").then((m) => ({ default: m.LoginPage })),
);
const EmailPage = lazy(() =>
  import("./EmailPage").then((m) => ({ default: m.EmailPage })),
);
const ForgotPasswordPage = lazy(() =>
  import("./ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
const LogoutPage = lazy(() =>
  import("./LogoutPage").then((m) => ({ default: m.LogoutPage })),
);
const FinoramicCallbackPage = lazy(() =>
  import("./FinoramicCallbackPage").then((m) => ({
    default: m.FinoramicCallbackPage,
  })),
);
const NotFound = lazy(() =>
  import("./NotFound").then((m) => ({ default: m.NotFound })),
);

// Loading fallback for lazy components
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
    </div>
  );
}

/**
 * Central route configuration. Paths align with ROUTES in constants/routes.ts.
 * Each auth screen has its own route for proper browser navigation.
 * Route components are lazy loaded for better code splitting.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Root: Login/Signup with phone number */}
        <Route
          index
          element={
            <Suspense fallback={<RouteLoading />}>
              <LoginPage />
            </Suspense>
          }
        />

        {/* Email page - for new user registration after OTP verification */}
        <Route
          path={ROUTES.EMAIL.slice(1)}
          element={
            <Suspense fallback={<RouteLoading />}>
              <EmailPage />
            </Suspense>
          }
        />

        {/* Forgot password flow */}
        <Route
          path={ROUTES.FORGOT_PASSWORD.slice(1)}
          element={
            <Suspense fallback={<RouteLoading />}>
              <ForgotPasswordPage />
            </Suspense>
          }
        />

        {/* Logout with countdown */}
        <Route
          path={ROUTES.LOGOUT.slice(1)}
          element={
            <Suspense fallback={<RouteLoading />}>
              <LogoutPage />
            </Suspense>
          }
        />

        {/* Finoramic OAuth callback (Gmail statement parsing) */}
        <Route
          path={ROUTES.FINORAMIC_CALLBACK.slice(1)}
          element={
            <Suspense fallback={<RouteLoading />}>
              <FinoramicCallbackPage />
            </Suspense>
          }
        />

        {/* 404 for unknown routes */}
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteLoading />}>
              <NotFound />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
