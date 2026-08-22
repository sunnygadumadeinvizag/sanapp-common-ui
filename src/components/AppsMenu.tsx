"use client";
import { apiPath, appUrl } from "../lib/api";
import { readFavourites, toggleFavourite } from "../lib/favourites";

import { useEffect, useMemo, useState } from "react";

export type AppEntry = {
  clientId: string;
  name: string;
  description?: string | null;
  url: string;
  /** Category the super admin assigned (e.g. Finance, ESTB, Admin). */
  category?: string | null;
  /** Whether the application should open in a new tab (set by the super admin in Main). */
  openInNewTab?: boolean;
};

function Star({ on }: { on: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={on ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45l-5.8 3.05 1.1-6.45-4.7-4.6 6.5-.95L12 2.6z" />
    </svg>
  );
}

/**
 * "Apps" launcher dropdown shown in every app's header. Apps are grouped into
 * category submenus (assigned by the super admin in Main), with a ★ on every
 * app — favourited apps are pinned into a "Favourites" section at the top.
 * Fetches the current user's accessible applications from the app's own
 * /api/my-apps endpoint (which asks IIPE Main), so the user can jump between
 * all applications from anywhere.
 */
export function AppsMenu({
  launcherHref,
  label = "Apps",
}: {
  launcherHref: string;
  label?: string;
}) {
  const [apps, setApps] = useState<AppEntry[] | null>(null);
  const [favs, setFavs] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(apiPath("/api/my-apps"), { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { apps: [] }))
      .then((data) => {
        if (!cancelled) setApps(Array.isArray(data.apps) ? data.apps : []);
      })
      .catch(() => {
        if (!cancelled) setApps([]);
      });
    setFavs(readFavourites());
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, AppEntry[]>();
    for (const app of apps ?? []) {
      const cat = (app.category ?? "").trim() || "General";
      const list = map.get(cat) ?? [];
      list.push(app);
      map.set(cat, list);
    }
    return Array.from(map.entries())
      .map(([category, list]) => ({
        category,
        apps: list.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [apps]);

  const favouriteApps = useMemo(
    () => (apps ?? []).filter((a) => favs.includes(a.clientId)),
    [apps, favs]
  );

  function toggle(id: string) {
    setFavs(toggleFavourite(id));
  }

  function renderRow(a: AppEntry) {
    const on = favs.includes(a.clientId);
    return (
      <div key={a.clientId} className="iipe-apps-row">
        <a href={appUrl(a.url)} target={a.openInNewTab ? "_blank" : "_self"} rel={a.openInNewTab ? "noreferrer" : undefined}>
          <div style={{ fontWeight: 600 }}>
            {a.name}
            {a.openInNewTab ? " ↗" : ""}
          </div>
          {a.description && <div className="iipe-dropdown-meta">{a.description}</div>}
        </a>
        <button
          type="button"
          className={`iipe-apps-star${on ? " on" : ""}`}
          onClick={() => toggle(a.clientId)}
          aria-pressed={on}
          aria-label={on ? `Remove ${a.name} from favourites` : `Add ${a.name} to favourites`}
          title={on ? "Remove from favourites" : "Add to favourites"}
        >
          <Star on={on} />
        </button>
      </div>
    );
  }

  return (
    <details className="iipe-user-menu iipe-apps-menu">
      <summary aria-label="Apps menu">
        <span style={{ fontWeight: 600 }}>🗂 <span className="iipe-apps-label">{label}</span></span>
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
          <>
            {favouriteApps.length > 0 && (
              <div className="iipe-apps-category">
                <div className="iipe-dropdown-section" style={{ borderTop: "none", marginTop: 0 }}>
                  ★ Favourites
                </div>
                {favouriteApps.map(renderRow)}
              </div>
            )}
            {grouped.map(({ category, apps: list }) => (
              <div key={category} className="iipe-apps-category">
                <div className="iipe-dropdown-section">{category}</div>
                {list.map(renderRow)}
              </div>
            ))}
          </>
        )}
        <a href={launcherHref}>All my applications…</a>
      </div>
    </details>
  );
}
