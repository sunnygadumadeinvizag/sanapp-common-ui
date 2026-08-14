import type { NavItem } from "./components/Navbar";
import { apiPath } from "./lib/api";

export type PlatformSection = "home" | "my-apps" | "applications" | "account";

export type PlatformNavOptions = {
  /** Public URL of iipe-main (for My Apps / Applications). */
  mainBaseUrl: string;
  /** Public URL of the central SSO (for My Account). */
  ssoBaseUrl: string;
  /** Label for the current app's home/dashboard item (default "Home"). */
  homeLabel?: string;
  /** Which item is highlighted on the current page. */
  active?: PlatformSection;
  /**
   * True on pages shown to users who are NOT signed in (login, forgot/reset
   * password, access denied). Auth-gated links (My Apps / Applications /
   * My Account) are hidden; only the home item is kept so the header still
   * carries the IIPE branding without dead-end links.
   */
  signedOut?: boolean;
};

/**
 * The canonical navigation shown in EVERY IIPE application's header (Main, the
 * SSO account page, and every independent app that consumes iipe-common-ui).
 *
 * - "Home" — the current application's own dashboard (`/` on its own origin).
 * - "My Apps" / "Applications" — the central launcher and registry in iipe-main.
 *
 * Apps render exactly this menu so users always see the same navigation,
 * wherever they are. "My Account" is available from the profile dropdown in
 * every app; application-specific pages go in the sidebar instead.
 */
export function getPlatformNav({
  mainBaseUrl,
  ssoBaseUrl,
  homeLabel = "Home",
  active,
  signedOut = false,
}: PlatformNavOptions): NavItem[] {
  if (signedOut) {
    return [{ label: homeLabel, href: "/", active: false }];
  }
  // "My Account" intentionally lives only in the profile dropdown (UserMenu),
  // never in the top navigation bar — every app sharing common-ui shows the
  // exact same menu: Home · My Apps · Applications.
  //
  // The My Apps link carries ?from=<this app's base path> so iipe-main can
  // mark the app the user is currently on with a "You are here" indicator.
  const from = apiPath("/");
  const myAppsHref = from && from !== "/"
    ? `${mainBaseUrl}/my-apps?from=${encodeURIComponent(from)}`
    : `${mainBaseUrl}/my-apps`;
  return [
    { label: homeLabel, href: "/", active: active === "home" },
    { label: "My Apps", href: myAppsHref, active: active === "my-apps" },
    { label: "Applications", href: `${mainBaseUrl}/applications`, active: active === "applications" },
  ];
}
