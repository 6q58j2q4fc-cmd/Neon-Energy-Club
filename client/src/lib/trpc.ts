import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";

export const trpc = createTRPCReact<AppRouter>();

// Helper to get the OAuth login URL
export function getLoginUrl(returnPath?: string): string {
  const appId = import.meta.env.VITE_APP_ID || '';
  const portalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || 'https://portal.manus.im';
  const currentUrl = window.location.origin + (returnPath || '/');
  const state = btoa(currentUrl);
  return `${portalUrl}/login?client_id=${appId}&redirect_uri=${encodeURIComponent(currentUrl)}&state=${state}`;
}
