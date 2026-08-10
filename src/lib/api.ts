// Prefix an app-relative URL with the base path. NEXT_PUBLIC_BASE_PATH is
// inlined at build time, so this works in server and client components and
// keeps working when the app is served behind Apache under /sso, /main, ...
export function apiPath(p: string): string {
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return bp && !p.startsWith(bp) ? bp + p : p;
}
