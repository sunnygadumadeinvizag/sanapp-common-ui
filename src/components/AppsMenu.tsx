"use client";

import { useEffect, useState } from "react";

export type AppEntry = {
  clientId: string;
  name: string;
  description?: string | null;
  url: string;
  /** Whether the application should open in a new tab (set by the super admin in Main). */
  openInNewTab?: boolean;
};

/**
 * "Applications" dropdown shown in every app's header.
 * Fetches the current user's accessible applications from the app's own
 * /api/my-apps endpoint (which asks IIPE Main), so the user can jump
 * between all applications from anywhere.
 */
export function AppsMenu({
  launcherHref,
  label = "Apps",
}: {
  launcherHref: string;
  label?: string;
}) {
  const [apps, setApps] = useState<AppEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/my-apps", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { apps: [] }))
      .then((data) => {
        if (!cancelled) setApps(Array.isArray(data.apps) ? data.apps : []);
      })
      .catch(() => {
        if (!cancelled) setApps([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <details className="iipe-user-menu iipe-apps-menu">
      <summary>
        <span style={{ fontWeight: 600 }}>🗂 {label}</span>
      </summary>
      <div className="iipe-dropdown">
        <div className="iipe-dropdown-header">
          <div className="iipe-dropdown-name">My applications</div>
        </div>
        {apps === null ? (
          <div className="iipe-dropdown-meta" style={{ padding: "8px 10px" }}>
            Loading…
          </div>
        ) : apps.length === 0 ? (
          <div className="iipe-dropdown-meta" style={{ padding: "8px 10px" }}>
            No applications assigned yet.
          </div>
        ) : (
          apps.map((a) => (
            <a
              key={a.clientId}
              href={a.url}
              target={a.openInNewTab ? "_blank" : "_self"}
              rel={a.openInNewTab ? "noreferrer" : undefined}
            >
              <div style={{ fontWeight: 600 }}>
                {a.name}
                {a.openInNewTab ? " ↗" : ""}
              </div>
              {a.description && <div className="iipe-dropdown-meta">{a.description}</div>}
            </a>
          ))
        )}
        <a href={launcherHref}>All my applications…</a>
      </div>
    </details>
  );
}
