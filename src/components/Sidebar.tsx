"use client";
import { useEffect, useState } from "react";
import { apiPath } from "../lib/api";
import type { NavItem } from "./Navbar";

/** Origin-wide preference so the collapse state carries across all apps. */
const STORAGE_KEY = "iipe.sidebar.collapsed";

/** Up to two initials from the first two words, e.g. "Facilities Home" -> "FH". */
function initials(label: string): string {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => (w.replace(/[^a-zA-Z0-9]/g, "")[0] ?? "").toUpperCase())
    .join("");
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  const d = dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6";
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export function Sidebar({ items, appName }: { items: NavItem[]; appName?: string }) {
  const [collapsed, setCollapsed] = useState(false);

  // Hydration-safe: start expanded, then restore the stored preference.
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* localStorage unavailable (private mode) — keep the default */
    }
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  if (items.length === 0) return null;

  return (
    <aside
      className={`iipe-sidebar${collapsed ? " collapsed" : ""}`}
      aria-label="Secondary"
    >
      <button
        type="button"
        className="iipe-sidebar-toggle"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Chevron dir={collapsed ? "right" : "left"} />
      </button>
      {appName && (
        <div className="iipe-sidebar-app" title={appName}>
          <span className="iipe-sidebar-glyph">{initials(appName)}</span>
          <span className="iipe-sidebar-label">{appName}</span>
        </div>
      )}
      {items.map((item) => (
        <a
          key={item.href}
          href={apiPath(item.href)}
          className={`iipe-sidebar-item${item.active ? " active" : ""}${item.heading ? " iipe-sidebar-heading" : ""}`}
          aria-current={item.active ? "page" : undefined}
          title={collapsed && !item.heading ? item.label : undefined}
        >
          <span className="iipe-sidebar-glyph">{item.heading ? "" : initials(item.label)}</span>
          <span className="iipe-sidebar-label">{item.label}</span>
        </a>
      ))}
    </aside>
  );
}
