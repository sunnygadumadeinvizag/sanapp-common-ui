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
  /**
   * The current application's registry name. Shown in the header badge and at
   * the top of the sidebar so users always know which app they are on.
   */
  appName?: string;
};

/**
 * Shared page frame for every IIPE application:
 * header (logo + nav + user menu), optional sidebar, content, footer.
 */
export function PageShell({ header, sidebarItems = [], children, footerLinks, appName }: PageShellProps) {
  return (
    <>
      <Header {...header} appName={appName} />
      <div className="iipe-container">
        <div className="iipe-shell">
          <Sidebar items={sidebarItems} appName={appName} />
          <main className="iipe-content">{children}</main>
        </div>
      </div>
      <Footer links={footerLinks} />
    </>
  );
}
