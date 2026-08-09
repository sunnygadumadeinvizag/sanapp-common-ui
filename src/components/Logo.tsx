export function Logo({ href = "/", showText = true }: { href?: string; showText?: boolean }) {
  return (
    <a href={href} className="iipe-logo" aria-label="IIPE Intranet home">
      <span className="iipe-logo-mark">IIPE</span>
      {showText && (
        <span>
          IIPE Intranet
          <span className="iipe-logo-sub">Indian Institute of Petroleum &amp; Energy</span>
        </span>
      )}
    </a>
  );
}
