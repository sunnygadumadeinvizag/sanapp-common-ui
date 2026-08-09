"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("iipe-theme");
    const initial = stored === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("iipe-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      style={{
        background: "rgba(255,255,255,0.12)",
        border: "none",
        borderRadius: 6,
        color: "#fff",
        cursor: "pointer",
        padding: "6px 10px",
        fontSize: "0.9rem",
      }}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
