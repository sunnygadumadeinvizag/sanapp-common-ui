import { apiPath } from "../lib/api";
export function Logo({ href = "/", showText = true }: { href?: string; showText?: boolean }) {
  return (
    <a href={apiPath(href)} className="iipe-logo" aria-label="IIPE Intranet home">
      <img src={apiPath("/img/iipe-logo.png")} alt="IIPE" className="iipe-logo-img" />
      {showText && (
        <span className="iipe-logo-text">
          IIPE Intranet
          <span className="iipe-logo-sub">Indian Institute of Petroleum &amp; Energy</span>
        </span>
      )}
    </a>
  );
}
