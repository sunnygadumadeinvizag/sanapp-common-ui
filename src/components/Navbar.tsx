import { apiPath } from "../lib/api";
export type NavItem = {
  label: string;
  href: string;
  active?: boolean;
  /** Rendered as a sidebar section heading (still a link) instead of a plain item. */
  heading?: boolean;
};

export function Navbar({ items }: { items: NavItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav className="iipe-nav" aria-label="Primary">
      {items.map((item) => (
        <a
          key={item.href}
          href={apiPath(item.href)}
          className={`iipe-nav-item${item.active ? " active" : ""}`}
          aria-current={item.active ? "page" : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
