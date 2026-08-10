import { apiPath } from "../lib/api";
export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;
  return (
    <nav className="iipe-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} style={{ display: "contents" }}>
            {item.href && !last ? (
              <a href={apiPath(item.href)}>{item.label}</a>
            ) : (
              <span aria-current={last ? "page" : undefined}>{item.label}</span>
            )}
            {!last && <span className="iipe-breadcrumb-sep">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
