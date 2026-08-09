"use client";

export type Notification = { id: string; title: string; time: string; href?: string };

export function Notifications({ items = [] }: { items?: Notification[] }) {
  return (
    <details className="iipe-notif">
      <summary aria-label="Notifications">
        🔔
        {items.length > 0 && <span className="iipe-notif-badge">{items.length}</span>}
      </summary>
      <div className="iipe-dropdown">
        <div className="iipe-dropdown-header">
          <div className="iipe-dropdown-name">Notifications</div>
        </div>
        {items.length === 0 && <div className="iipe-dropdown-meta" style={{ padding: "8px 10px" }}>You're all caught up.</div>}
        {items.map((n) => (
          <a key={n.id} href={n.href ?? "#"}>
            <div style={{ fontWeight: 600 }}>{n.title}</div>
            <div className="iipe-dropdown-meta">{n.time}</div>
          </a>
        ))}
      </div>
    </details>
  );
}
