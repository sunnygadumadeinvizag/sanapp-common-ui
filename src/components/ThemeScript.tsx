export type ThemeScriptProps = {
  /** Platform default mode set by the super admin (used when the user has no saved choice). */
  defaultMode?: "light" | "dark" | "system";
  /** Platform primary brand color (hex). */
  primary?: string;
  /** Platform accent brand color (hex). */
  accent?: string;
};

/**
 * Renders an inline script (as the first element of <body>) that applies the
 * theme before the browser paints, so there is no flash of the wrong theme.
 * The values are the admin-configured platform defaults fetched server-side
 * by each application's root layout; a user's own localStorage choice wins.
 */
export function ThemeScript({
  defaultMode = "system",
  primary = "#0b5d4f",
  accent = "#d9a441",
}: ThemeScriptProps) {
  const script = `(function(){try{
    var root=document.documentElement;
    var mode=localStorage.getItem("iipe-theme")||${JSON.stringify(defaultMode)};
    var dark=mode==="dark"||(mode==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.theme=dark?"dark":"light";
    root.style.colorScheme=dark?"dark":"light";
    root.style.setProperty("--iipe-primary",${JSON.stringify(primary)});
    root.style.setProperty("--iipe-accent",${JSON.stringify(accent)});
  }catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
