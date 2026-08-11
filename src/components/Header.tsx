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
};

export function Header({ navItems = [], right, logoHref, appsLauncherHref }: HeaderProps) {
  return (
    <header className="iipe-topbar">
      <div className="iipe-topbar-inner">
        <Logo href={logoHref ?? "/"} />
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
