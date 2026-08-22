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
   * Rendered as "You are in: <name>" next to the logo so users always know
   * where they are. Hidden inside Main (the launcher) to avoid noise.
   */
  appName?: string;
};

export function Header({ navItems = [], right, logoHref, appsLauncherHref, appName }: HeaderProps) {
  return (
    <header className="iipe-topbar">
      <div className="iipe-topbar-inner">
        <Logo href={logoHref ?? "/"} />
        {appName && appName !== "Main" && (
          <span className="iipe-app-badge" title={`You are currently in ${appName}`}>
            You are in: {appName}
          </span>
        )}
        <Navbar items={navItems} />
        <div className="iipe-row">
          <ThemeToggle />
          {appsLauncherHref && <AppsMenu launcherHref={appsLauncherHref} />}
          <Notifications />
          {right && <>{right}</>}
        </div>
      </div>
    </header>
  );
}
