import type { NavItem } from "./components/Navbar";

export type PlatformSection = "home" | "my-apps" | "applications" | "account" | "notifications";

export type PlatformNavOptions = {
  /** Public URL of sanapp-main (the My Apps launcher — the user's home screen). */
  mainBaseUrl: string;
  /** Public URL of the central SSO (for My Account). */
  ssoBaseUrl: string;
  /**
   * True only inside sanapp-main itself: the launcher IS the current app, so
   * the nav item is "Home" and links to its own root. Every other app shows
   * "My Apps", which always takes the user back to the launcher.
   */
  launcher?: boolean;
  /** Label for the nav item inside Main (default "Home"). */
  homeLabel?: string;
  /** Which item is highlighted on the current page. */
  active?: PlatformSection;
  /**
   * True on pages shown to users who are NOT signed in (login, forgot/reset
   * password, access denied). Only the launcher item is kept so the header
   * still carries the IIPE branding without dead-end links.
   */
  signedOut?: boolean;
};

/**
 * The canonical navigation shown in EVERY IIPE application's header.
 *
 * Exactly one item: the way home. In every application it reads "My Apps" and
 * opens the central launcher (sanapp-main's home page — the user's home
 * screen with all their applications). Inside Main itself it reads "Home" and
 * links to its own root. The current application's identity is shown by the
 * "You are in" badge next to the logo, never duplicated here.
 */
export function getPlatformNav({
  mainBaseUrl,
  launcher = false,
  homeLabel = "Home",
  active,
  signedOut = false,
}: PlatformNavOptions): NavItem[] {
  // Signed-out pages (login, forgot password, public wiki): keep the item
  // inside the current app so the branding link never dead-ends.
  if (signedOut && !launcher) {
    return [{ label: homeLabel, href: "/", active: false }];
  }
  return launcher
    ? [{ label: homeLabel, href: "/", active: active === "home" }]
    : [{ label: "My Apps", href: mainBaseUrl, active: false }];
}
