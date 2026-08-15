// Prefix an app-relative URL with the base path. NEXT_PUBLIC_BASE_PATH is
// inlined at build time, so this works in server and client components and
// keeps working when the app is served behind Apache under /sso, /main, ...
//
// Only root-relative paths ("/...") are prefixed. Absolute URLs
// ("http(s)://...") and protocol-relative URLs ("//...") pass through
// unchanged, so the same helper is safe for links that point at other
// applications (e.g. `${SSO_BASE_URL}/account`).
export function apiPath(p: string): string {
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!bp) return p;
  if (p === "/") return bp;
  if (!p.startsWith("/") || p.startsWith("//")) return p;
  return p.startsWith(bp) ? p : bp + p;
}
/**
 * Local-development ports for each registered application (path -> port).
 * During `next dev` the registry URLs (intranet.iipe.ac.in/...) are rewritten
 * to the matching localhost instance so navigation stays inside the local
 * stack; production builds use the registry URL unchanged (the reverse-proxy
 * origin). Override the mapping with NEXT_PUBLIC_DEV_APP_URLS
 * (JSON object { "/path": "http://localhost:PORT/path" }).
 */
const DEV_APP_PORTS: Record<string, number> = {
  "/sso": 3000,
  "/main": 3001,
  "/app1": 3002,
  "/app2": 3003,
  "/app3": 3004,
  "/facilities": 3005,
  "/logrequest": 3006,
  "/inventory": 3007,
};

function devAppUrlOverrides(): Record<string, string> | null {
  try {
    const raw = process.env.NEXT_PUBLIC_DEV_APP_URLS;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Returns the best URL for a registered application (from Main's registry):
 * - production builds: the registry URL unchanged (served through Apache);
 * - local `next dev` runs: rewritten to the matching localhost:PORT so the
 *   apps launcher / menu / "my apps" pages never point at the production
 *   host while developing.
 */
export function appUrl(u: string): string {
  if (process.env.NODE_ENV !== "development") return u;
  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    return u;
  }
  const path = parsed.pathname.replace(/\/+$/, "") || "/";
  const overrides = devAppUrlOverrides();
  const local = overrides?.[path];
  let base: string;
  if (local) {
    base = local.replace(/\/+$/, "");
  } else {
    const port = DEV_APP_PORTS[path];
    if (!port) return u;
    base = `http://localhost:${port}${path}`;
  }
  return base + (parsed.pathname.endsWith("/") ? "/" : "") + parsed.search + parsed.hash;
}
