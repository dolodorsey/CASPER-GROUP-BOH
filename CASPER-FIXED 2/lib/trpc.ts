import { httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

  if (!url) {
    console.warn('[TRPC] EXPO_PUBLIC_RORK_API_BASE_URL not set - using fallback');
    // Fallback to prevent app crash - Rork should set this automatically
    return 'http://localhost:3000';
  }

  return url;
};

// Safe initialization - won't crash if env var missing
let trpcClient: ReturnType<typeof trpc.createClient>;

try {
  trpcClient = trpc.createClient({
    links: [
      httpLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
      }),
    ],
  });
} catch (error) {
  console.error('[TRPC] Failed to initialize client:', error);
  // Create minimal fallback client to prevent app crash
  trpcClient = trpc.createClient({
    links: [
      httpLink({
        url: 'http://localhost:3000/api/trpc',
        transformer: superjson,
      }),
    ],
  });
}

export { trpcClient };
