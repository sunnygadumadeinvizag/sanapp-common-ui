"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiPath } from "../lib/api";
import type { AppNotificationItem, AppNotificationList } from "../lib/notifications";

export type { AppNotificationItem, AppNotificationList };

const POLL_MS = 30_000;

/** "5m ago" / "3h ago" / "2d ago" — coarse relative time for the dropdown. */
function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * Header notification bell shown in EVERY application, next to the profile
 * dropdown. Reads the app's own /api/notifications proxy (which asks the
 * central hub in sanapp-main), so the user sees notifications from ALL
 * applications, grouped into per-app sections. Polls every 30s; clicking an
 * item marks it read and follows its deep link into the pushing app.
 */
export function Notifications() {
  const [data, setData] = useState<AppNotificationList | null>(null);
  const [denied, setDenied] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(apiPath("/api/notifications?limit=30"), {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) {
        // 401 on signed-out pages (e.g. the SSO login screen) — show the
        // sign-in hint instead of an endless spinner.
        setDenied(true);
        setData({ notifications: [], unread: 0, total: 0, page: 1, limit: 30 });
        return;
      }
      setDenied(false);
      const d = await res.json();
      setData({
        notifications: Array.isArray(d.notifications) ? d.notifications : [],
        unread: Number(d.unread ?? 0),
        total: Number(d.total ?? 0),
        page: 1,
        limit: 30,
      });
    } catch {
      /* transient — next poll retries */
    }
  }, []);

  useEffect(() => {
    load();
    timer.current = setInterval(load, POLL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [load]);

  const markRead = useCallback(async (ids: string[], all = false) => {
    try {
      fetch(apiPath("/api/notifications/read"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(all ? { all: true } : { ids }),
      }).catch(() => {});
    } catch {
      /* best-effort */
    }
    setData((d) =>
      d
        ? {
            ...d,
            notifications: d.notifications.map((n) =>
              !all && !ids.includes(n.id) ? n : { ...n, read: true }
            ),
            unread: all ? 0 : Math.max(0, d.unread - ids.length),
          }
        : d
    );
  }, []);

  // Group by application; apps ordered by their most recent notification.
  const grouped = useMemo(() => {
    const map = new Map<string, { appName: string; items: AppNotificationItem[] }>();
    for (const n of data?.notifications ?? []) {
      const g = map.get(n.appClientId) ?? { appName: n.appName, items: [] };
      g.items.push(n);
      map.set(n.appClientId, g);
    }
    return Array.from(map.values());
  }, [data]);

  const unread = data?.unread ?? 0;
  const onItem = (n: AppNotificationItem) => {
    if (!n.read) markRead([n.id]);
  };

  return (
    <details className="iipe-notif iipe-notif-menu" aria-label="Notifications">
      <summary title="Notifications">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 01-3.4 0" />
        </svg>
        {unread > 0 && <span className="iipe-notif-badge">{unread > 99 ? "99+" : unread}</span>}
      </summary>
      <div className="iipe-dropdown">
        <div className="iipe-dropdown-header">
          <div className="iipe-dropdown-name">Notifications</div>
          <div className="iipe-dropdown-meta">
            {data === null
              ? "Loading…"
              : unread > 0
                ? `${unread} unread · from all your applications`
                : "All caught up"}
          </div>
        </div>

        {data !== null && unread > 0 && (
          <button type="button" className="iipe-notif-markall" onClick={() => markRead([], true)}>
            ✓ Mark all as read
          </button>
        )}

        {(data?.notifications ?? []).length === 0 ? (
          <div className="iipe-dropdown-meta" style={{ padding: "8px 10px" }}>
            {denied
              ? "Sign in to see your notifications."
              : data === null
                ? "Loading…"
                : "No notifications yet."}
          </div>
        ) : (
          grouped.map((g) => (
            <div key={g.appName} className="iipe-notif-app">
              <div className="iipe-dropdown-section">
                {g.appName}
                {g.items.some((n) => !n.read) && (
                  <span className="iipe-badge accent" style={{ marginLeft: 6 }}>
                    {g.items.filter((n) => !n.read).length}
                  </span>
                )}
              </div>
              {g.items.map((n) => (
                <a
                  key={n.id}
                  href={n.href ?? "#"}
                  target={n.href ? "_blank" : undefined}
                  rel={n.href ? "noreferrer" : undefined}
                  className={`iipe-notif-item${n.read ? "" : " unread"}`}
                  onClick={() => onItem(n)}
                >
                  <div className="iipe-notif-title">
                    {!n.read && <span className="iipe-notif-dot" aria-hidden="true" />}
                    {n.title}
                  </div>
                  {n.body && <div className="iipe-dropdown-meta">{n.body}</div>}
                  <div className="iipe-dropdown-meta">{timeAgo(n.createdAt)}</div>
                </a>
              ))}
            </div>
          ))
        )}
      </div>
    </details>
  );
}
