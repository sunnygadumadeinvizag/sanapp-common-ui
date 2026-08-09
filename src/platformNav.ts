import type { NavItem } from "./components/Navbar";

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
};

/**
 * The canonical navigation shown in EVERY IIPE application's header (Main, the
 * SSO account page, and every independent app that consumes iipe-common-ui).
 *
 * - "Home" — the current application's own dashboard (`/` on its own origin).
 * - "My Apps" / "Applications" — the central launcher and registry in iipe-main.
 * - "My Account" — the identity page in the SSO.
 *
 * Apps render exactly this menu so users always see the same navigation,
 * wherever they are. Application-specific pages go in the sidebar instead.
 */
export function getPlatformNav({
  mainBaseUrl,
  ssoBaseUrl,
  homeLabel = "Home",
  active,
}: PlatformNavOptions): NavItem[] {
  return [
    { label: homeLabel, href: "/", active: active === "home" },
    { label: "My Apps", href: `${mainBaseUrl}/my-apps`, active: active === "my-apps" },
    { label: "Applications", href: `${mainBaseUrl}/applications`, active: active === "applications" },
    { label: "My Account", href: `${ssoBaseUrl}/account`, active: active === "account" },
  ];
}
