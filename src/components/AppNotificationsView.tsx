"use client";

import { useCallback, useEffect, useState } from "react";
import { apiPath } from "../lib/api";
import type { AppNotificationItem } from "../lib/notifications";

function timeFull(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Body of each application's "App Notifications" page: the notifications
 * THIS application pushed for the signed-in user (scope=app on the app's
 * /api/notifications proxy). The header bell shows every app's notifications;
 * this page is the app-local view.
 */
export function AppNotificationsView({ appName }: { appName: string }) {
  const [items, setItems] = useState<AppNotificationItem[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch(apiPath("/api/notifications?scope=app&limit=100"), {
        credentials: "same-origin",
        cache: "no-store",
      });
      const d = res.ok ? await res.json() : { notifications: [] };
      setItems(Array.isArray(d.notifications) ? d.notifications : []);
    } catch {
      setItems([]);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(ids: string[], all = false) {
    try {
      await fetch(apiPath("/api/notifications/read"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(all ? { all: true } : { ids }),
      });
    } catch {
      /* best-effort */
    }
    setItems((prev) =>
      prev
        ? prev.map((n) => (!all && !ids.includes(n.id) ? n : { ...n, read: true }))
        : prev
    );
  }

  const unread = (items ?? []).filter((n) => !n.read).length;

  return (
    <div>
      <div className="iipe-row" style={{ marginBottom: 14 }}>
        <span>
          {items === null ? "Loading…" : `${items.length} notification${items.length === 1 ? "" : "s"}`}
          {unread > 0 && (
            <span className="iipe-badge accent" style={{ marginLeft: 8 }}>
              {unread} unread
            </span>
          )}
        </span>
        <span className="iipe-spacer" />
        <button type="button" className="iipe-btn secondary" onClick={load} disabled={busy}>
          ⟳ Refresh
        </button>
        {unread > 0 && (
          <button type="button" className="iipe-btn" onClick={() => markRead([], true)}>
            ✓ Mark all as read
          </button>
        )}
      </div>

      {items !== null && items.length === 0 ? (
        <div className="iipe-card">
          <div className="iipe-alert">
            No notifications from {appName} yet. Alerts appear here when something needs
            your attention — you will also see them under the bell in the header.
          </div>
        </div>
      ) : (
        <div className="iipe-card" style={{ padding: 6 }}>
          <div className="iipe-table-scroll">
            <table className="iipe-table">
              <thead>
                <tr>
                  <th>Notification</th>
                  <th>When</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {(items ?? []).map((n) => (
                  <tr key={n.id} style={!n.read ? { background: "var(--iipe-primary-light)" } : undefined}>
                    <td>
                      <strong>{n.title}</strong>
                      {!n.read && (
                        <span className="iipe-badge accent" style={{ marginLeft: 8 }}>
                          New
                        </span>
                      )}
                      {n.body && <div className="iipe-muted">{n.body}</div>}
                    </td>
                    <td className="iipe-muted" style={{ whiteSpace: "nowrap" }}>
                      {timeFull(n.createdAt)}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {n.href ? (
                        <a
                          className="iipe-btn secondary"
                          style={{ padding: "5px 12px", marginRight: 6 }}
                          href={n.href}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            if (!n.read) markRead([n.id]);
                          }}
                        >
                          Open ↗
                        </a>
                      ) : null}
                      {!n.read && (
                        <button
                          type="button"
                          className="iipe-btn secondary"
                          style={{ padding: "5px 12px" }}
                          onClick={() => markRead([n.id])}
                        >
                          Mark read
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
