import { apiPath } from "../lib/api";
import type { NavItem } from "./Navbar";

export function Sidebar({ items }: { items: NavItem[] }) {
  if (items.length === 0) return null;
  return (
    <aside className="iipe-sidebar" aria-label="Secondary">
      {items.map((item) => (
        <a
          key={item.href}
          href={apiPath(item.href)}
          className={`iipe-sidebar-item${item.active ? " active" : ""}`}
          aria-current={item.active ? "page" : undefined}
        >
          {item.label}
        </a>
      ))}
    </aside>
  );
}
