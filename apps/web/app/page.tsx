import { ArrowRight, Asterisk, Check, CornerDownRight } from "lucide-react";
import { MemberMockup, OpsMockup, OrderingMockup, RailDiagram, WalletMockup } from "@/components/product-mockups";
import { SiteHeader } from "@/components/site-header";

const controls = [
  ["01", "Identity", "One member record across employer, operator, kitchen, and payment systems."],
  ["02", "Ordering", "A single ordering layer across WhatsApp, the member app, and assisted desks."],
  ["03", "Continuity", "A configurable balance that keeps essential access available through payroll gaps."],
  ["04", "Settlement", "Every order, credit, and collection resolves into one auditable ledger."],
];

const services = ["Member registry", "Entitlements", "Catalog & pricing", "Order orchestration", "Wallet ledger", "Collections", "Reconciliation", "Operator console"];

export default function Home() {
  return (
    <main id="top">
      <section className="hero dark-section">
        <SiteHeader />
        <div className="hero-grid page-shell">
          <div className="hero-kicker"><Asterisk aria-hidden="true" /><span>NIA OS / ORDERING INFRASTRUCTURE</span></div>
          <h1>The operating system for <em>everyday food.</em></h1>
          <div className="hero-bottom"><p>Nia connects demand, payment, fulfilment, and books—so an order never becomes an operational mystery.</p><a href="#platform">Explore the platform <ArrowRight aria-hidden="true" /></a></div>
        </div>
        <div className="hero-marquee" aria-hidden="true"><span>ORDER</span><i>→</i><span>PAY</span><i>→</i><span>FULFIL</span><i>→</i><span>RECONCILE</span></div>
      </section>

      <section className="intro paper-section section-pad">
        <div className="page-shell intro-layout"><div className="eyebrow">WHY NIA</div><div><h2>Food ordering looks simple.<br />The system underneath it isn&apos;t.</h2><p className="lead-copy">For managed communities, the hard part isn&apos;t showing a menu. It&apos;s knowing who can order, what they can spend, who fulfils it, who gets paid, and whether every rupee closes cleanly.</p></div></div>
        <div className="page-shell metrics"><div><strong>01</strong><span>Member identity</span></div><div><strong>02</strong><span>Transaction continuity</span></div><div><strong>03</strong><span>Operational truth</span></div></div>
      </section>

      <section id="platform" className="rail-section orange-section section-pad">
        <div className="page-shell"><div className="section-head"><div className="eyebrow">THE ORDERING RAIL</div><h2>One continuous line from appetite to accounting.</h2></div><RailDiagram /><p className="rail-copy">Nia doesn&apos;t sit beside operations. It becomes the connective tissue between the person placing an order and the team closing the books.</p></div>
      </section>

      <section className="showcase dark-section section-pad">
        <div className="page-shell"><div className="section-head split"><div><div className="eyebrow">THE MEMBER EXPERIENCE</div><h2>One place to eat, pay, and stay covered.</h2></div><p>A calm consumer surface, backed by rigorous transaction infrastructure. Designed for daily use, not financial complexity.</p></div><div className="phones-stage"><div className="phone-shot left"><MemberMockup /></div><div className="phone-shot right"><WalletMockup /></div><div className="shot-label label-a"><span>01</span> Member home</div><div className="shot-label label-b"><span>02</span> Nia Wallet</div></div></div>
      </section>

      <section className="channels paper-section section-pad">
        <div className="page-shell"><div className="section-head split"><div><div className="eyebrow">MEET PEOPLE WHERE THEY ARE</div><h2>The interface can change. The rail stays the same.</h2></div><p>Orders from WhatsApp, the app, or an assisted counter enter the same system of record.</p></div><div className="channel-grid"><div className="channel-copy"><span>WHATSAPP ORDERING</span><h3>No new behavior required.</h3><p>Browse today&apos;s menu, confirm delivery, and pay from the wallet in the conversation members already know.</p><ul><li><Check /> Structured menus</li><li><Check /> Identity-linked orders</li><li><Check /> Instant confirmation</li></ul></div><OrderingMockup /></div></div>
      </section>

      <section className="control-section dark-section section-pad">
        <div className="page-shell"><div className="section-head"><div className="eyebrow">CONTROL POINTS</div><h2>Infrastructure that answers the questions operations actually ask.</h2></div><div className="control-list">{controls.map(([n,t,d]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p><CornerDownRight aria-hidden="true" /></article>)}</div></div>
      </section>

      <section className="ops-section paper-section section-pad">
        <div className="page-shell"><div className="section-head split"><div><div className="eyebrow">OPERATIONAL TRUTH</div><h2>See what happened. Know what closes.</h2></div><p>Live order state, payment movement, and settlement exceptions—without stitching together five exports.</p></div><OpsMockup /></div>
      </section>

      <section id="books" className="books orange-section section-pad">
        <div className="page-shell books-grid"><div><div className="eyebrow">NIA BOOKS</div><h2>The ledger isn&apos;t the end of the workflow. It&apos;s the foundation.</h2></div><div className="books-card"><div className="books-mark">N/B</div><p>Every order creates balanced entries across member value, operator receivables, kitchen payables, and settlement.</p><div className="journal"><div><span>Member meals</span><b>DR ₹90</b></div><div><span>Kitchen payable</span><b>CR ₹90</b></div><div className="journal-total"><span>Batch #284</span><b>BALANCED</b></div></div></div></div>
      </section>

      <section className="architecture paper-section section-pad"><div className="page-shell"><div className="section-head"><div className="eyebrow">PLATFORM SERVICES</div><h2>Composable services.<br />One operating model.</h2></div><div className="services-grid">{services.map((service, index) => <div key={service}><span>{String(index + 1).padStart(2, '0')}</span><b>{service}</b><ArrowRight aria-hidden="true" /></div>)}</div></div></section>

      <section id="thesis" className="thesis dark-section section-pad"><div className="page-shell thesis-grid"><div className="eyebrow">OUR THESIS</div><blockquote>“The next category-defining food platform won&apos;t win by adding another marketplace. It will win by making the fragmented system underneath everyday access finally behave as one.”</blockquote><div className="thesis-note"><span>NIA / 2026</span><p>We build the infrastructure layer for institutions responsible for people&apos;s daily essentials.</p></div></div></section>

      <footer className="footer paper-section"><div className="page-shell footer-top"><h2>Build the next food system on Nia.</h2><a href="mailto:hello@nia.one">Start a conversation <ArrowRight /></a></div><div className="page-shell footer-mid"><div className="footer-wordmark">nia<span>.</span></div><div><b>Explore</b><a href="#platform">Platform</a><a href="#books">Nia Books</a><a href="#thesis">Our thesis</a></div><div><b>Connect</b><a href="mailto:hello@nia.one">hello@nia.one</a><a href="#top">LinkedIn ↗</a></div></div><div className="page-shell footer-bottom"><span>© 2026 Nia Technologies</span><span>Bengaluru, India</span><a href="#top">Back to top ↑</a></div></footer>
    </main>
  );
}
