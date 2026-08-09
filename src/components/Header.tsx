import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { Navbar, type NavItem } from "./Navbar";

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
        {right && <div className="iipe-row">{right}</div>}
      </div>
    </header>
  );
}
