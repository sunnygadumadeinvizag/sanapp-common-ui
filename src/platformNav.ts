import type { NavItem } from "./components/Navbar";

export type PlatformSection = "home" | "my-apps" | "applications" | "account" | "notifications";

export type PlatformNavOptions = {
  /** Public URL of sanapp-main (the app launcher home). */
  mainBaseUrl: string;
  /** Public URL of the central SSO (for My Account). */
  ssoBaseUrl: string;
  /** Label for the current app's home/dashboard item (default "Home"). */
  homeLabel?: string;
  /** Which item is highlighted on the current page. */
  active?: PlatformSection;
  /**
   * True on pages shown to users who are NOT signed in (login, forgot/reset
   * password, access denied). Only the home item is kept so the header still
   * carries the IIPE branding without dead-end links.
   */
  signedOut?: boolean;
};

/**
 * The canonical navigation shown in EVERY IIPE application's header (Main, the
 * SSO account page, and every independent app that consumes sanapp-common-ui).
 *
 * The header carries exactly one item: "Home" — the current application's own
 * dashboard (`/` on its own origin). App switching lives in the "Apps" launcher
 * dropdown next to it (category submenus + favourites), and sanapp-main's home
 * page IS the My Apps launcher, so separate My Apps / Application items are not
 * needed. "My Account" stays in the profile dropdown (UserMenu);
 * application-specific pages go in the sidebar.
 */
export function getPlatformNav({
  homeLabel = "Home",
  active,
}: PlatformNavOptions): NavItem[] {
  return [{ label: homeLabel, href: "/", active: active === "home" }];
}
