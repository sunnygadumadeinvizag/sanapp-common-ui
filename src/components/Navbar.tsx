export type NavItem = {
  label: string;
  href: string;
  active?: boolean;
};

export function Navbar({ items }: { items: NavItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav className="iipe-nav" aria-label="Primary">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`iipe-nav-item${item.active ? " active" : ""}`}
          aria-current={item.active ? "page" : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
