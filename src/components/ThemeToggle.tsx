"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

const MODES: ThemeMode[] = ["light", "dark", "system"];
const ICONS: Record<ThemeMode, string> = { light: "☀️", dark: "🌙", system: "🖥️" };
const LABELS: Record<ThemeMode, string> = { light: "Light", dark: "Dark", system: "System" };

function effective(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

function apply(mode: ThemeMode) {
  const eff = effective(mode);
  const root = document.documentElement;
  root.dataset.theme = eff;
  root.style.colorScheme = eff;
}

/**
 * Header theme toggle. Cycles Light → Dark → System → Light. The choice is
 * persisted per browser (localStorage "iipe-theme"). "System" follows the
 * OS preference and updates live. The admin-configured brand colors are
 * applied from the platform /api/theme endpoint.
 */
export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const stored = localStorage.getItem("iipe-theme");
    const initial: ThemeMode =
      stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    setMode(initial);
    apply(initial);

    // Apply admin brand colors (mode comes from the bootstrap script already).
    fetch("/api/theme")
      .then((r) => (r.ok ? r.json() : null))
      .then((t: { primary?: string; accent?: string } | null) => {
        if (!t) return;
        const root = document.documentElement;
        if (t.primary) root.style.setProperty("--iipe-primary", t.primary);
        if (t.accent) root.style.setProperty("--iipe-accent", t.accent);
      })
      .catch(() => {});

    // Follow OS changes while in "system" mode.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      const cur = localStorage.getItem("iipe-theme");
      if (!cur || cur === "system") apply("system");
    };
    mq.addEventListener("change", onSystemChange);
    return () => mq.removeEventListener("change", onSystemChange);
  }, []);

  function cycle() {
    const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
    setMode(next);
    localStorage.setItem("iipe-theme", next);
    apply(next);
  }

  return (
    <button
      type="button"
      className="iipe-theme-toggle"
      onClick={cycle}
      aria-label={`Theme: ${LABELS[mode]}. Click to switch.`}
      title={`Theme: ${LABELS[mode]} — click to change`}
    >
      <span aria-hidden="true">{ICONS[mode]}</span>
      <span className="iipe-theme-toggle-label">{LABELS[mode]}</span>
    </button>
  );
}
