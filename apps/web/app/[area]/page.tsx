import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import {
  getPlatformArea,
  platformAreas,
} from "../../lib/platform-areas";

type AreaPageProps = {
  params: Promise<{ area: string }>;
};

export function generateStaticParams() {
  return platformAreas.map(({ slug }) => ({ area: slug }));
}

export async function generateMetadata({
  params,
}: AreaPageProps): Promise<Metadata> {
  const { area: slug } = await params;
  const area = getPlatformArea(slug);
  if (!area) return {};

  return {
    title: `${area.title} — NiaBooks`,
    description: `${area.title} connects ${area.summary.toLowerCase()} to the Member's continuous NiaBooks record.`,
  };
}

export default async function AreaPage({ params }: AreaPageProps) {
  const { area: slug } = await params;
  const area = getPlatformArea(slug);
  if (!area) notFound();

  const index = platformAreas.findIndex((item) => item.slug === area.slug);
  const previous = index > 0 ? platformAreas[index - 1] : null;
  const next =
    index < platformAreas.length - 1 ? platformAreas[index + 1] : null;

  return (
    <main className="inner-page">
      <SiteHeader />
      <section className="area-hero page-width">
        <div className="area-number">{area.number}</div>
        <div>
          <p className="inner-index">What writes to NiaBooks</p>
          <h1>{area.title}</h1>
        </div>
        <div className="area-summary">
          <p>{area.summary}</p>
          <span>{area.recordRole}</span>
        </div>
      </section>

      <nav className="area-rail" aria-label="NiaBooks platform areas">
        <div className="page-width">
          {platformAreas.map((item) => (
            <Link
              className={item.slug === area.slug ? "active" : ""}
              href={`/${item.slug}`}
              key={item.slug}
              aria-current={item.slug === area.slug ? "page" : undefined}
            >
              <small>{item.number}</small>
              {item.title}
            </Link>
          ))}
        </div>
      </nav>

      <section className="area-content page-width">
        <div>
          <p className="inner-index">Written to the record</p>
          <h2>{area.title} stays connected.</h2>
        </div>
        <ol>
          {area.details.map((detail, detailIndex) => (
            <li key={detail}>
              <span>{String(detailIndex + 1).padStart(2, "0")}</span>
              <strong>{detail}</strong>
            </li>
          ))}
        </ol>
        <aside>
          <p>
            NiaBooks keeps this activity connected to the same Member record,
            so it can be read alongside every other part of the working life.
          </p>
          {area.slug === "essentials" ? (
            <Link className="primary-button" href="/order">
              Order Essentials <ArrowUpRight />
            </Link>
          ) : (
            <Link className="primary-button" href="/niabooks">
              See NiaBooks <ArrowUpRight />
            </Link>
          )}
        </aside>
      </section>

      <nav className="area-pagination page-width" aria-label="Continue through the platform">
        {previous ? (
          <Link href={`/${previous.slug}`}>
            <ArrowLeft aria-hidden="true" />
            <span><small>Previous</small>{previous.title}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/${next.slug}`}>
            <span><small>Next</small>{next.title}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        ) : (
          <Link href="/niabooks">
            <span><small>Destination</small>NiaBooks</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        )}
      </nav>
      <SiteFooter />
    </main>
  );
}
