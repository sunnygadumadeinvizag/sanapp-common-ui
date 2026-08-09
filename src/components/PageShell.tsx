import type { ReactNode } from "react";
import { Header, type HeaderProps } from "./Header";
import { Footer, type FooterLink } from "./Footer";
import { Sidebar } from "./Sidebar";
import type { NavItem } from "./Navbar";

export type PageShellProps = {
  header: HeaderProps;
  sidebarItems?: NavItem[];
  children: ReactNode;
  footerLinks?: FooterLink[];
};

/**
 * Shared page frame for every IIPE application:
 * header (logo + nav + user menu), optional sidebar, content, footer.
 */
export function PageShell({ header, sidebarItems = [], children, footerLinks }: PageShellProps) {
  return (
    <>
      <Header {...header} />
      <div className="iipe-container">
        <div className="iipe-shell">
          <Sidebar items={sidebarItems} />
          <main className="iipe-content">{children}</main>
        </div>
      </div>
      <Footer links={footerLinks} />
    </>
  );
}
