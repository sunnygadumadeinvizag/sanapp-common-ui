"use client";
import { apiPath, appUrl } from "../lib/api";
import { FAVOURITES_EVENT, readFavourites, toggleFavourite } from "../lib/favourites";

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

type ViewMode = "category" | "all";

const VIEW_KEY = "iipe-apps-menu-view";

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

function Chevron() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

/**
 * "Apps" launcher dropdown shown in every app's header.
 *
 * - Search bar at the top filters across every application by name/category.
 * - "By category" (default): only the categories appear; each expands into a
 *   sub-dropdown with its applications.
 * - "View all": every application in one vertical list, grouped under
 *   category headings.
 * - ★ on every app — favourites are pinned into a section at the top.
 * Fetches the current user's accessible applications from the app's own
 * /api/my-apps endpoint (which asks IIPE Main).
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
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("category");

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
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === "category" || saved === "all") setView(saved);
    } catch {
      /* ignore */
    }
    // Live-sync with stars toggled elsewhere on the page (My Apps home) or in
    // other tabs.
    const refresh = () => setFavs(readFavourites());
    window.addEventListener(FAVOURITES_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener(FAVOURITES_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  function changeView(next: ViewMode) {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      /* ignore */
    }
  }

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

  const searching = query.trim().length > 0;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return (apps ?? []).filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        ((a.category ?? "").trim() || "General").toLowerCase().includes(q)
    );
  }, [apps, query]);

  const favouriteApps = useMemo(
    () => (apps ?? []).filter((a) => favs.includes(a.clientId)),
    [apps, favs]
  );

  function toggle(id: string) {
    setFavs(toggleFavourite(id));
  }

  /** One app row: name only (no description) + star toggle. */
  function renderRow(a: AppEntry) {
    const on = favs.includes(a.clientId);
    return (
      <div key={a.clientId} className="iipe-apps-row">
        <a href={appUrl(a.url)} target={a.openInNewTab ? "_blank" : "_self"} rel={a.openInNewTab ? "noreferrer" : undefined}>
          {a.name}
          {a.openInNewTab ? " ↗" : ""}
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

        <div className="iipe-apps-search">
          <input
            type="search"
            className="iipe-input"
            placeholder="Search apps…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search applications"
            autoComplete="off"
          />
        </div>

        {!searching && (
          <div className="iipe-apps-viewtoggle" role="group" aria-label="View mode">
            <button
              type="button"
              className={view === "category" ? "on" : ""}
              onClick={() => changeView("category")}
              aria-pressed={view === "category"}
            >
              ▸ By category
            </button>
            <button
              type="button"
              className={view === "all" ? "on" : ""}
              onClick={() => changeView("all")}
              aria-pressed={view === "all"}
            >
              ☰ View all
            </button>
          </div>
        )}

        {apps === null ? (
          <div className="iipe-dropdown-meta" style={{ padding: "8px 10px" }}>
            Loading…
          </div>
        ) : apps.length === 0 ? (
          <div className="iipe-dropdown-meta" style={{ padding: "8px 10px" }}>
            No applications assigned yet.
          </div>
        ) : searching ? (
          matches.length === 0 ? (
            <div className="iipe-dropdown-meta" style={{ padding: "8px 10px" }}>
              No applications match “{query.trim()}”.
            </div>
          ) : (
            matches.map(renderRow)
          )
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

            {view === "category"
              ? grouped.map(({ category, apps: list }) => (
                  <details key={category} className="iipe-apps-submenu">
                    <summary>
                      <span className="iipe-apps-submenu-name">{category}</span>
                      <span className="iipe-badge">{list.length}</span>
                      <Chevron />
                    </summary>
                    <div className="iipe-apps-submenu-items">{list.map(renderRow)}</div>
                  </details>
                ))
              : grouped.map(({ category, apps: list }) => (
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
