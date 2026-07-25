"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "./brand-logo";

const links = [
  ["Order", "/order"],
  ["Record", "/#record"],
  ["How it works", "/#journey"],
  ["System", "/#system"],
  ["Outcomes", "/#outcomes"],
  ["Evidence", "/#evidence"],
];

const SELLER_FORM_URL = "https://nia.one/sell";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="NiaSave home">
        <BrandLogo product="NiaBooks" />
      </a>
      <nav className="desktop-nav" aria-label="Primary navigation">{links.map(([label, href]) => <a href={href} key={label}>{label}</a>)}<a href={SELLER_FORM_URL} target="_blank" rel="noopener noreferrer">Sell on Nia <ArrowUpRight aria-hidden="true" /></a></nav>
      <a className="header-cta" href="https://www.nia.one/">Back to Nia.one <ArrowUpRight aria-hidden="true" /></a>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>{open ? <X /> : <Menu />}</button>
      {open && <nav className="mobile-nav" aria-label="Mobile navigation">{links.map(([label, href]) => <a href={href} key={label} onClick={() => setOpen(false)}>{label}</a>)}<a href={SELLER_FORM_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>Sell on Nia <ArrowUpRight /></a><a href="https://www.nia.one/">Back to Nia.one <ArrowUpRight /></a></nav>}
    </header>
  );
}
