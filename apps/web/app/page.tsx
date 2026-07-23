import { ArrowDown, ArrowUpRight, Building2, Landmark, TrendingUp, Users } from "lucide-react";
import { IntelligenceSystem, OutcomeConsole, TrustStrip } from "../components/product-mockups";
import { SiteHeader } from "../components/site-header";

const outcomes = [
  { number: "01", title: "Save more", copy: "AI coordinates housing, transport, and essentials to reduce the everyday cost of staying employed." },
  { number: "02", title: "Earn more", copy: "Fewer missed shifts and more stable work turn continuity into stronger monthly income." },
  { number: "03", title: "Belong more", copy: "Support becomes personal and continuous, helping people build a life—not simply fill a role." },
];
const audiences = [
  { icon: Building2, title: "For employers", copy: "A healthier, more stable workforce without another fragmented vendor stack." },
  { icon: TrendingUp, title: "For investors", copy: "A scalable intelligence layer serving a structural shift in India’s labour economy." },
  { icon: Landmark, title: "For policy", copy: "Outcome-level visibility into mobility, livelihoods, and corridor resilience." },
];

export default function HomePage() {
  return (
    <main id="top">
      <section className="hero-shell"><SiteHeader /><div className="hero-grid"><div className="hero-copy"><div className="kicker"><i /> AI infrastructure for working lives</div><h1>The intelligence behind a <em>better life.</em></h1><p>Nia works quietly in the background—coordinating living, essentials, and work—so people can save more, earn more, and belong more.</p><div className="hero-actions"><a className="primary-button" href="#system">See the system <ArrowDown /></a><a className="text-link" href="mailto:hello@nia.one">Partner with Nia <ArrowUpRight /></a></div></div><IntelligenceSystem /></div><div className="hero-foot"><span>One intelligence layer</span><b>Living</b><i /><b>Essentials</b><i /><b>Work</b><span className="hero-index">NIA / 2026</span></div></section>

      <section className="statement-section page-width" id="system"><div className="section-index">[ 01 — THE SYSTEM ]</div><h2>Complexity stays in the backend. <span>Life gets simpler at the front.</span></h2><div className="statement-grid"><p>Today, every part of a worker&apos;s life is managed separately. Housing does not understand shifts. Transport does not understand earnings. Employers cannot see the whole journey.</p><p>Nia connects those signals, reasons across them, and coordinates the next best action—before a small problem becomes a missed shift, lost income, or an early exit.</p></div><OutcomeConsole /><TrustStrip /></section>

      <section className="outcome-section" id="outcomes"><div className="page-width"><div className="section-index light">[ 02 — HUMAN OUTCOMES ]</div><div className="outcome-title"><h2>Invisible intelligence.<br /><em>Visible progress.</em></h2><p>The technology recedes. What remains is a working life with more agency, continuity, and room to grow.</p></div><div className="outcome-list">{outcomes.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.copy}</p><ArrowUpRight /></article>)}</div></div></section>

      <section className="evidence-section page-width" id="evidence"><div className="section-index">[ 03 — SYSTEM EVIDENCE ]</div><div className="evidence-head"><h2>Better lives create stronger systems.</h2><p>Nia translates member progress into measurable value for the institutions shaping India&apos;s industrial future.</p></div><div className="proof-grid"><div><strong>+18%</strong><span>member savings potential</span></div><div><strong>+12%</strong><span>income continuity</span></div><div><strong>2.3×</strong><span>workforce retention</span></div><div><strong>1</strong><span>connected intelligence layer</span></div></div><div className="audience-grid">{audiences.map(({ icon: Icon, title, copy }) => <article key={title}><Icon /><h3>{title}</h3><p>{copy}</p><a href="mailto:hello@nia.one">Explore partnership <ArrowUpRight /></a></article>)}</div></section>

      <section className="belief-section" id="about"><div className="page-width belief-grid"><div className="section-index light">[ 04 — OUR BELIEF ]</div><blockquote>AI should not make life feel more technical. It should make life feel <em>more possible.</em></blockquote><div className="belief-note"><Users /><p>We are building the intelligence infrastructure for people who move to make modern India possible.</p></div></div></section>

      <footer><div className="page-width footer-grid"><div><a className="brand footer-brand" href="#top"><span className="brand-mark">n</span><span>nia</span></a><p>Intelligence for better working lives.</p></div><div><small>CONNECT</small><a href="mailto:hello@nia.one">hello@nia.one</a><a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></div><div><small>EXPLORE</small><a href="#system">System</a><a href="#outcomes">Outcomes</a><a href="#evidence">Evidence</a></div></div><div className="page-width footer-bottom"><span>© 2026 Nia</span><span>Designed for dignity. Built for scale.</span></div></footer>
    </main>
  );
}
