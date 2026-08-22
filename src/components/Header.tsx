import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { Navbar, type NavItem } from "./Navbar";
import { ThemeToggle } from "./ThemeToggle";
import { AppsMenu } from "./AppsMenu";
import { Notifications } from "./Notifications";

export type HeaderProps = {
  navItems?: NavItem[];
  right?: ReactNode;
  logoHref?: string;
  /** When set, shows the shared "Apps" launcher icon before the user menu. */
  appsLauncherHref?: string;
  /**
   * The current application's registry name (e.g. "Facilities Booking").
   * Rendered as "You are in: <name>" after the nav so users always know where
   * they are. Hidden on the platform apps (Main, SSO) and on signed-out pages.
   */
  appName?: string;
  /**
   * True on pages shown to users who are NOT signed in (login, forgot/reset
   * password, access denied): hides signed-in-only chrome (the notification
   * bell and the "You are in" badge).
   */
  signedOut?: boolean;
};

/** Main and the SSO are the platform itself — no app badge or bell there. */
const PLATFORM_APPS = new Set(["Main", "SSO"]);

export function Header({
  navItems = [],
  right,
  logoHref,
  appsLauncherHref,
  appName,
  signedOut = false,
}: HeaderProps) {
  const showBadge = !!appName && !PLATFORM_APPS.has(appName) && !signedOut;
  const showBell = !PLATFORM_APPS.has(appName ?? "") && !signedOut;
  return (
    <header className="iipe-topbar">
      <div className="iipe-topbar-inner">
        <Logo href={logoHref ?? "/"} />
        <Navbar items={navItems} />
        {showBadge && (
          <span className="iipe-app-badge" title={`You are currently in ${appName}`}>
            You are in: {appName}
          </span>
        )}
        <div className="iipe-row">
          <ThemeToggle />
          {appsLauncherHref && <AppsMenu launcherHref={appsLauncherHref} />}
          {showBell && <Notifications />}
          {right && <>{right}</>}
        </div>
      </div>
    </header>
  );
}
