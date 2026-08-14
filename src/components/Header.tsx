import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { Navbar, type NavItem } from "./Navbar";
import { ThemeToggle } from "./ThemeToggle";
import { AppsMenu } from "./AppsMenu";

export type HeaderProps = {
  navItems?: NavItem[];
  right?: ReactNode;
  logoHref?: string;
  /** When set, shows the shared "Apps" launcher icon before the user menu. */
  appsLauncherHref?: string;
  /**
   * The current application's registry name (e.g. "Log Request"). Shown as a
   * platform-standard badge so users always know which app they are on,
   * regardless of which app they launched. Apps resolve this from the central
   * registry when possible (one project can host several apps).
   */
  appName?: string;
};

export function Header({ navItems = [], right, logoHref, appsLauncherHref, appName }: HeaderProps) {
  return (
    <header className="iipe-topbar">
      <div className="iipe-topbar-inner">
        <Logo href={logoHref ?? "/"} />
        {appName && (
          <span className="iipe-app-badge" title="Current application">
            {appName}
          </span>
        )}
        <Navbar items={navItems} />
        <div className="iipe-row">
          <ThemeToggle />
          {appsLauncherHref && <AppsMenu launcherHref={appsLauncherHref} />}
          {right && <>{right}</>}
        </div>
      </div>
    </header>
  );
}
