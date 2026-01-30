import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Environment } from "../types/environment";
import type { ToastProps } from "../components/common";
import { ROUTES } from "../constants/routes";

/** Angular-style config structure expected by RedirectComponent and services */
export interface ResolvedEnvironmentConfig {
  baseUrl: string;
  baseAppUrl: string;
  s3Url: string;
  funnelUrl: string;
  defaultUuid: string;
  zestMerchantId: string;
  token_client_id: string;
  google_token_client_id: string;
  hashed_client_token: string;
  hashed_auth_token: string;
  client_secret: string;
  google_login_client_id: string;
  partnerCheckoutUrl: string[];
  finoramicDomain: string;
  finoramicClientId: string;
  finoramicClient: string;
  finoramicCallback: string;
  featuresApiKey: string;
  featureSwitchUrl: string;
  scripts: { pixelScriptUrl: string };
}

interface AppContextValue {
  envConfig: Environment | null;
  getEnvironmentConfig: (envType: string) => ResolvedEnvironmentConfig;
  toasts: ToastProps[];
  addToast: (
    type: "success" | "error" | "warning" | "info",
    message: string
  ) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function buildResolvedConfig(currentEnv: Environment | null): ResolvedEnvironmentConfig {
  const baseUrl = currentEnv?.baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? "https://staging-auth.zestmoney.in";
  const s3Url = import.meta.env.VITE_S3_URL ?? "https://s3.ap-south-1.amazonaws.com/staging-merchants-assets";
  
  return {
    baseUrl,
    baseAppUrl: import.meta.env.VITE_APP_BASE_URL ?? "https://staging-app.zestmoney.in",
    s3Url,
    funnelUrl: import.meta.env.VITE_FUNNEL_URL ?? "https://staging-funneltrack.zestmoney.in",
    defaultUuid: import.meta.env.VITE_DEFAULT_UUID ?? "00000000-0000-0000-0000-000000000000",
    zestMerchantId: import.meta.env.VITE_ZEST_MERCHANT_ID ?? "",
    token_client_id: import.meta.env.VITE_TOKEN_CLIENT_ID ?? "",
    google_token_client_id: import.meta.env.VITE_GOOGLE_TOKEN_CLIENT_ID ?? "",
    hashed_client_token: import.meta.env.VITE_HASHED_CLIENT_TOKEN ?? "",
    hashed_auth_token: import.meta.env.VITE_HASHED_AUTH_TOKEN ?? "",
    client_secret: import.meta.env.VITE_CLIENT_SECRET ?? "",
    google_login_client_id:
      currentEnv?.googleClientId ?? import.meta.env.VITE_GOOGLE_LOGIN_CLIENT_ID ?? "",
    partnerCheckoutUrl: [
      "https://staging-partner.zestmoney.in",
      "https://staging-widget.zestmoney.in",
    ],
    finoramicDomain: import.meta.env.VITE_FINORAMIC_DOMAIN ?? "https://sandbox.finoramic.com",
    finoramicClientId:
      currentEnv?.finoramicClientId ?? import.meta.env.VITE_FINORAMIC_CLIENT_ID ?? "",
    finoramicClient: import.meta.env.VITE_FINORAMIC_CLIENT ?? "zestmoney",
    finoramicCallback: ROUTES.FINORAMIC_CALLBACK,
    featuresApiKey: currentEnv?.apiKey ?? import.meta.env.VITE_API_KEY ?? "",
    featureSwitchUrl: import.meta.env.VITE_FEATURES_URL ?? "https://staging-features.zestmoney.in",
    scripts: {
      pixelScriptUrl: `${s3Url}/pixel.js`,
    },
  };
}

interface AppProviderProps {
  envConfig: Environment | null;
  children: ReactNode;
}

export function AppProvider({ envConfig, children }: AppProviderProps) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const getEnvironmentConfig = useCallback(
    (_envType: string) => buildResolvedConfig(envConfig),
    [envConfig]
  );

  const addToast = useCallback(
    (type: "success" | "error" | "warning" | "info", message: string) => {
      const newToast: ToastProps = {
        id: Date.now().toString(),
        type,
        message,
        onClose: (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
      };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const value = useMemo<AppContextValue>(() => ({
    envConfig,
    getEnvironmentConfig,
    toasts,
    addToast,
  }), [envConfig, getEnvironmentConfig, toasts, addToast]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return ctx;
}
