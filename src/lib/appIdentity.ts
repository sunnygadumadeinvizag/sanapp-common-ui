/**
 * Resolves the current application's registry name (as configured by the super
 * admin in sanapp-main's Applications registry) from the app's own base path.
 *
 * One project can host several apps: the same Next.js codebase may be deployed
 * at two different base paths (e.g. /logrequest and /app-a), each registered as
 * a separate application in Main. Because each deployment knows its own
 * BASE_PATH, it can ask Main "which app am I?" and show the right name in the
 * header badge and the sidebar.
 *
 * This module is server-only: it performs a fetch to Main and keeps a short
 * in-process cache, so it must never be imported from client components.
 */

type LookupOptions = {
  /** Public URL of sanapp-main (e.g. http://localhost:3001). */
  mainBaseUrl: string;
  /** Shared server-to-server key (MAIN_API_KEY) used to authenticate to Main. */
  appKey?: string;
  /** This deployment's base path (e.g. "/logrequest"). */
  basePath: string;
  /** Used when the registry lookup fails or matches nothing. */
  fallback: string;
  /** Cache TTL in ms (default 60s). */
  ttlMs?: number;
};

const cache = new Map<string, { name: string; at: number }>();

function normPath(p: string): string {
  return (p || "").replace(/\/+$/, "") || "/";
}

/**
 * Returns the registry name for this deployment's base path, or the fallback.
 * Safe to call on every render: repeated calls within the TTL are cached.
 */
export async function lookupAppName({
  mainBaseUrl,
  appKey,
  basePath,
  fallback,
  ttlMs = 60000,
}: LookupOptions): Promise<string> {
  const path = normPath(basePath);
  const cached = cache.get(path);
  if (cached && Date.now() - cached.at < ttlMs) return cached.name;
  if (!appKey) return fallback;

  try {
    const res = await fetch(
      `${mainBaseUrl.replace(/\/+$/, "")}/api/apps/lookup?path=${encodeURIComponent(path)}`,
      {
        headers: { "x-app-key": appKey },
        cache: "no-store",
      }
    );
    if (res.ok) {
      const data = (await res.json()) as { name?: string };
      const name = data.name || fallback;
      cache.set(path, { name, at: Date.now() });
      return name;
    }
  } catch {
    /* Main unreachable — fall back to the app's own name. */
  }
  return fallback;
}
