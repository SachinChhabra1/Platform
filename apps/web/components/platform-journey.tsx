import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { platformAreas } from "../lib/platform-areas";

export function PlatformJourney() {
  return (
    <section className="journey-section page-width" id="journey" aria-labelledby="journey-title">
      <div className="journey-intro">
        <p>How the platform fits together</p>
        <h2 id="journey-title">Everything feeds the Member&apos;s record.</h2>
        <span>
          Begin with Membership. Follow work, living, essentials and money as
          they become one continuous NiaBooks record.
        </span>
      </div>

      <nav className="journey-list" aria-label="Explore the NiaBooks platform">
        {platformAreas.map((area) => (
          <Link href={`/${area.slug}`} key={area.slug}>
            <small>{area.number}</small>
            <div>
              <h3>{area.title}</h3>
              <p>{area.summary}</p>
            </div>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        ))}
      </nav>

      <Link className="journey-destination" href="/niabooks">
        <span>
          <small>The destination</small>
          <strong>NiaBooks</strong>
        </span>
        <p>Earned · Kept · Saved · Sent home</p>
        <ArrowUpRight aria-hidden="true" />
      </Link>
    </section>
  );
}
