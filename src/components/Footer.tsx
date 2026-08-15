import { apiPath } from "../lib/api";
export type FooterLink = { label: string; href: string };

export function Footer({
  year = new Date().getFullYear(),
  links = [],
  note = "Indian Institute of Petroleum and Energy (IIPE), Visakhapatnam. All Rights Reserved.",
}: {
  year?: number;
  links?: FooterLink[];
  note?: string;
}) {
  return (
    <footer className="iipe-footer">
      <div className="iipe-footer-grid">
        <div className="iipe-footer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={apiPath("/img/iipe-logo.png")}
            alt="IIPE logo"
            className="iipe-footer-logo"
          />
          <div>
            <div className="iipe-footer-institute">
              INDIAN INSTITUTE OF PETROLEUM AND ENERGY
            </div>
            <div className="iipe-footer-native">
              భారతీయ పెట్రోలియం మరియు శక్తి విజ్ఞాన సంస్థ
            </div>
            <div className="iipe-footer-native">
              भारतीय पेट्रोलियम और ऊर्जा संस्थान
            </div>
            <div className="iipe-footer-tagline">
              (An Institute of National Importance by an Act of Parliament)
            </div>
          </div>
        </div>

        <div className="iipe-footer-block">
          <h4>Institute Address</h4>
          <div>Indian Institute of Petroleum &amp; Energy (IIPE)</div>
          <div>Vangali, Sabbavaram</div>
          <div>Distt. Anakapalli, Andhra Pradesh – 531035</div>
        </div>

        <div className="iipe-footer-block">
          <h4>Contact</h4>
          <div>support@iipe.ac.in</div>
          <div className="iipe-footer-credit">
            Designed &amp; Developed by{" "}
            <span className="iipe-footer-credit-name">Sanyasi Naidu Paila</span>
          </div>
        </div>

        {links.length > 0 && (
          <div className="iipe-footer-block">
            <h4>Quick Links</h4>
            <div className="iipe-footer-links">
              {links.map((l) => (
                <a key={l.href} href={apiPath(l.href)}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="iipe-footer-bottom">
        {/* suppressHydrationWarning: the year is computed from the clock at
            render time and can differ between the server and the client
            (timezones / year boundaries), which is a known hydration case. */}
        <span suppressHydrationWarning>© {year} {note}</span>
      </div>
    </footer>
  );
}
