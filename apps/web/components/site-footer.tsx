import Link from "next/link";
import { BrandLogo } from "./brand-logo";

export function SiteFooter() {
  return (
    <footer>
      <div className="page-width footer-grid">
        <div>
          <Link className="brand footer-brand" href="/">
            <BrandLogo product="NiaBooks" />
          </Link>
          <p>Intelligence for better working lives.</p>
        </div>
        <div>
          <small>PLATFORM</small>
          <Link href="/membership">Membership</Link>
          <Link href="/work">Work</Link>
          <Link href="/living">Living</Link>
          <Link href="/essentials">Essentials</Link>
          <Link href="/wallet">Wallet</Link>
          <Link href="/edge">Edge</Link>
        </div>
        <div>
          <small>EXPLORE</small>
          <Link href="/niabooks">NiaBooks</Link>
          <Link href="/#system">System</Link>
          <Link href="/#outcomes">Outcomes</Link>
          <Link href="/#evidence">Evidence</Link>
          <Link href="/order">Order Essentials</Link>
        </div>
        <div>
          <small>CONNECT</small>
          <a href="mailto:hello@nia.one">hello@nia.one</a>
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://www.nia.one/">Nia.one</a>
        </div>
      </div>
      <div className="page-width footer-bottom">
        <span>© 2026 Nia</span>
        <span>Designed for dignity. Built for scale.</span>
      </div>
    </footer>
  );
}
