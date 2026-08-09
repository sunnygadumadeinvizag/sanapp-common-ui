import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { Navbar, type NavItem } from "./Navbar";
import { ThemeToggle } from "./ThemeToggle";

export type HeaderProps = {
  navItems?: NavItem[];
  right?: ReactNode;
  logoHref?: string;
};

export function Header({ navItems = [], right, logoHref }: HeaderProps) {
  return (
    <header className="iipe-topbar">
      <div className="iipe-topbar-inner">
        <Logo href={logoHref ?? "/"} />
        <Navbar items={navItems} />
        <div className="iipe-row">
          <ThemeToggle />
          {right && <>{right}</>}
        </div>
      </div>
    </header>
  );
}
