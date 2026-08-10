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
