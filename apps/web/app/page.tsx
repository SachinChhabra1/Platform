import { ArrowRight, Asterisk, Check } from "lucide-react";
import { CorridorRail, MemberMockup, OpsMockup, WalletMockup } from "@/components/product-mockups";
import { SiteHeader } from "@/components/site-header";

const heroStats = [
  ["7,000+", "Members served across industrial corridors"],
  ["76", "Studios across 4 corridors"],
  ["7 in 10", "Still with us at six months"],
  ["Every rupee", "Earned, kept, sent home"],
];

const fertility = [
  ["Bihar", 3.0, "source"],
  ["UP", 2.4, "source"],
  ["Gujarat", 1.9, "hub"],
  ["TN", 1.8, "hub"],
  ["Maharashtra", 1.7, "hub"],
  ["Kerala", 1.8, "hub"],
  ["Goa", 1.3, "hub"],
];

const controls = [
  ["01", "Managed living", "Clean, safe studios near the plant, with everything a member needs to settle in from day one."],
  ["02", "Work continuity", "Attendance, shift transport, and onboarding managed so production lines stay staffed."],
  ["03", "Daily essentials", "Meals, savings, remittance, and healthcare that travel with the worker across corridors."],
  ["04", "Employer truth", "Retention, attendance, and output tracked against cost in one enterprise console."],
];

const services = [
  "Member registry",
  "Managed housing",
  "Shift transport",
  "Payroll & remittance",
  "Wellbeing & healthcare",
  "Attendance",
  "RafiQi Central",
  "Corridor analytics",
];

const roiRows = [
  ["Month 0", "Survey & construction", "First quarter's fee paid at signing. No savings counted yet."],
  ["Month 2", "Operations begin", "Members retain their studio; attendance lifts to ~90%."],
  ["Month 8", "Full year's fee recovered", "Savings cross the full year's fee of ₹20L."],
  ["Year 1+", "Full benefit realized", "Facility saves a full year's fee roughly every three months."],
];

export default function Home() {
  return (
    <main id="top">
      <section className="hero dark-section">
        <img className="hero-bg" src="/images/industrial-corridor.png" alt="A modern Indian manufacturing corridor at blue hour with managed worker housing" />
        <div className="hero-overlay" aria-hidden="true" />
        <SiteHeader />
        <div className="hero-grid page-shell">
          <div className="hero-kicker">
            <Asterisk aria-hidden="true" />
            <span>WORKFORCE INFRASTRUCTURE FOR INDIA&apos;S MANUFACTURING CORRIDORS</span>
          </div>
          <h1>Make leaving home <em>worth it.</em></h1>
          <p className="hero-lede">
            Nia helps manufacturers retain migrant workers by providing managed living, work continuity, and daily essentials across industrial corridors. Employers get a workforce that stays longer, with retention, attendance, and output tracked against cost.
          </p>
          <div className="hero-actions">
            <a className="btn-primary" href="#enterprise">Keep the production lines running <ArrowRight aria-hidden="true" /></a>
            <a className="btn-ghost" href="#impact">See our impact</a>
          </div>
          <dl className="hero-stats">
            {heroStats.map(([value, label]) => (
              <div key={label}><dt>{value}</dt><dd>{label}</dd></div>
            ))}
          </dl>
        </div>
        <div className="hero-marquee" aria-hidden="true">
          <span>Same wage, same job, more money home.</span>
        </div>
      </section>

      <section id="impact" className="divide paper-section section-pad">
        <div className="page-shell">
          <div className="section-head">
            <div className="eyebrow">THE DEMOGRAPHIC DIVIDE</div>
            <h2>Where capital pools, fertility has already fallen below replacement.</h2>
            <p className="lead-copy">
              A high concentration of young workers sits in states with below-replacement fertility, creating a structural labour&ndash;capital mismatch. Investment flows to regions with declining populations while young workers concentrate where jobs are scarce.
            </p>
          </div>
          <figure className="fertility-chart">
            <figcaption>
              <span>TOTAL FERTILITY RATE · NFHS-5</span>
              <span className="replacement-note">Replacement, 2.1</span>
            </figcaption>
            <div className="bars">
              {fertility.map(([state, rate, kind]) => (
                <div className="bar-col" key={state as string}>
                  <span className="bar-value">{(rate as number).toFixed(1)}</span>
                  <div className={`bar bar-${kind}`} style={{ height: `${(rate as number) / 3 * 100}%` }} />
                  <span className="bar-label">{state as string}</span>
                </div>
              ))}
              <div className="replacement-line" style={{ bottom: `${2.1 / 3 * 100}%` }} aria-hidden="true" />
            </div>
            <div className="chart-legend">
              <span><i className="dot-source" /> Labour source · youth bulge</span>
              <span><i className="dot-hub" /> Capital hub · below replacement</span>
            </div>
          </figure>
          <p className="source-note">Source: NFHS-5 (National Family Health Survey); Sample Registration System (SRS).</p>
        </div>
      </section>

      <section className="retention orange-section section-pad">
        <div className="page-shell retention-grid">
          <div>
            <div className="eyebrow">THE PROBLEM WE SOLVE FIRST</div>
            <h2>The hardest retention problem is migrant women beyond six months.</h2>
          </div>
          <div className="retention-points">
            <p>Nia manages the living infrastructure that determines whether migrant women remain on the factory floor. Manufacturers see the return through retention, attendance, and output.</p>
            <ul>
              <li><Check aria-hidden="true" /> Co-funded model: you invest, we partner</li>
              <li><Check aria-hidden="true" /> Commercial deployment tied to retention targets</li>
              <li><Check aria-hidden="true" /> Retention, attendance, and output tracked against cost</li>
              <li><Check aria-hidden="true" /> One operating partner across living, work, and essentials</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="enterprise" className="rail-section dark-section section-pad">
        <div className="page-shell">
          <div className="section-head">
            <div className="eyebrow">THE MEMBER JOURNEY</div>
            <h2>One continuous system from recruitment to a life worth staying for.</h2>
          </div>
          <CorridorRail />
          <p className="rail-copy">
            Managed living is the entry point, not the business. Once a worker lives with us, work, meals, savings, and remittance travel with them at no new acquisition cost. Continuity is what compounds.
          </p>
        </div>
      </section>

      <section id="workers" className="showcase paper-section section-pad">
        <div className="page-shell">
          <div className="section-head split">
            <div>
              <div className="eyebrow">THE MEMBER EXPERIENCE · RAFIQI</div>
              <h2>One app for work, home, and the money that goes back.</h2>
            </div>
            <p>A calm, multilingual surface members actually use every day &mdash; shift transport, studio life, earnings, and wellbeing in one place.</p>
          </div>
          <div className="phones-stage">
            <div className="phone-shot left"><MemberMockup /></div>
            <div className="phone-shot right"><WalletMockup /></div>
          </div>
        </div>
      </section>

      <section className="control-section paper-section section-pad">
        <div className="page-shell">
          <div className="section-head">
            <div className="eyebrow">WHAT NIA OPERATES</div>
            <h2>The full stack of living, work, and daily essentials.</h2>
          </div>
          <div className="control-list">
            {controls.map(([n, t, d]) => (
              <article key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="platform" className="ops-section dark-section section-pad">
        <div className="page-shell">
          <div className="section-head split">
            <div>
              <div className="eyebrow">RAFIQI CENTRAL</div>
              <h2>See who stays. Know what it returns.</h2>
            </div>
            <p>Live retention, attendance, and cost across every corridor &mdash; the enterprise view manufacturers use to run the workforce.</p>
          </div>
          <OpsMockup />
        </div>
      </section>

      <section id="roi" className="roi paper-section section-pad">
        <div className="page-shell">
          <div className="section-head">
            <div className="eyebrow">THE ROI MODEL</div>
            <h2>Nia Shift costs ₹20 lakh a year for 1,000 migrant women workers.</h2>
            <p className="lead-copy">Replacing the women who leave costs more. Here is how the model pays back.</p>
          </div>
          <div className="roi-metrics">
            <div><b>275%</b><span>Return over time</span></div>
            <div><b>Month 8</b><span>Payback period</span></div>
            <div><b>1 day</b><span>Fee per worker per month</span></div>
            <div><b>5%</b><span>Of factory cost, or lower</span></div>
          </div>
          <ol className="roi-timeline">
            {roiRows.map(([when, title, note]) => (
              <li key={when}><span className="roi-when">{when}</span><div><b>{title}</b><p>{note}</p></div></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="architecture orange-section section-pad">
        <div className="page-shell">
          <div className="section-head">
            <div className="eyebrow">THE PLATFORM</div>
            <h2>Composable services. One operating model.</h2>
          </div>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={service}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{service}</b>
                <ArrowRight aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="thesis" className="thesis dark-section section-pad">
        <div className="page-shell thesis-grid">
          <div className="eyebrow">THE PLATFORM THESIS</div>
          <blockquote>
            &ldquo;Managed living is the entry point, not the business. Once a worker lives with us, work, meals, savings, and remittance travel with them at no new acquisition cost. Living acquires the member. Continuity is what compounds.&rdquo;
          </blockquote>
          <div className="thesis-note">
            <span>NIA / 2026</span>
            <p>We build the workforce infrastructure layer for the institutions responsible for India&apos;s manufacturing corridors.</p>
          </div>
        </div>
      </section>

      <footer id="contact" className="footer dark-section">
        <div className="page-shell footer-top">
          <h2>Infrastructure that makes leaving home <em>worth it.</em></h2>
          <div className="footer-cta">
            <a className="btn-primary" href="mailto:hello@nia.one">Talk to us <ArrowRight aria-hidden="true" /></a>
            <a className="btn-ghost" href="mailto:hello@nia.one">Join on WhatsApp</a>
          </div>
        </div>
        <div className="page-shell footer-mid">
          <div className="footer-wordmark">Nia</div>
          <div><b>Company</b><a href="#impact">Why Nia</a><a href="#platform">Platform</a><a href="#roi">ROI Model</a></div>
          <div><b>For</b><a href="#workers">Workers</a><a href="#enterprise">Enterprise</a><a href="#platform">RafiQi Central</a></div>
          <div><b>Connect</b><a href="mailto:hello@nia.one">hello@nia.one</a><a href="#top">LinkedIn ↗</a></div>
        </div>
        <div className="page-shell footer-bottom">
          <span>© 2026 Nia Technologies</span>
          <span>Chennai, India</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </main>
  );
}
