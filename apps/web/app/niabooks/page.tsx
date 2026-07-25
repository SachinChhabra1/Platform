import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { NiaBooksRecord } from "../../components/niabooks-record";
import { PlatformJourney } from "../../components/platform-journey";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

export const metadata: Metadata = {
  title: "NiaBooks — One Continuous Member Record",
  description:
    "See how Membership, Work, Living, Essentials, Wallet and Edge write to one continuous NiaBooks record of what a Member earned, kept, saved and sent home.",
};

export default function NiaBooksPage() {
  return (
    <main className="inner-page">
      <SiteHeader />
      <section className="inner-hero page-width">
        <div>
          <p className="inner-index">NiaBooks</p>
          <h1>The Member&apos;s continuous record.</h1>
        </div>
        <div className="inner-hero-copy">
          <p>
            Every part of the platform writes to one place. The Member can see
            what was earned, what remains in hand, what was set aside and what
            reached family.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#record">
              See the record <ArrowDown />
            </a>
            <Link className="text-link" href="/membership">
              Start with Membership <ArrowUpRight />
            </Link>
          </div>
        </div>
      </section>
      <NiaBooksRecord />
      <PlatformJourney />
      <SiteFooter />
    </main>
  );
}
