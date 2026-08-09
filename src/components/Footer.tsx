export type FooterLink = { label: string; href: string };

export function Footer({
  year = new Date().getFullYear(),
  links = [],
  note = "IIPE Intranet Platform — Central SSO & Independent Applications",
}: {
  year?: number;
  links?: FooterLink[];
  note?: string;
}) {
  return (
    <footer className="iipe-footer">
      <div className="iipe-footer-inner">
        {/* suppressHydrationWarning: the year is computed from the clock at
            render time and can differ between the server and the client
            (timezones / year boundaries), which is a known hydration case. */}
        <span suppressHydrationWarning>
          © {year} {note}
        </span>
        {links.length > 0 && (
          <span className="iipe-footer-links">
            {links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </span>
        )}
      </div>
    </footer>
  );
}
