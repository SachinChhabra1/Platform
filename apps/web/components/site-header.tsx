"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [["System", "#system"], ["Outcomes", "#outcomes"], ["Evidence", "#evidence"], ["About", "#about"]];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Nia home"><span className="brand-mark">n</span><span>nia</span></a>
      <nav className="desktop-nav" aria-label="Primary navigation">{links.map(([label, href]) => <a href={href} key={label}>{label}</a>)}</nav>
      <a className="header-cta" href="mailto:hello@nia.one">Partner with Nia <ArrowUpRight aria-hidden="true" /></a>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>{open ? <X /> : <Menu />}</button>
      {open && <nav className="mobile-nav" aria-label="Mobile navigation">{links.map(([label, href]) => <a href={href} key={label} onClick={() => setOpen(false)}>{label}</a>)}<a href="mailto:hello@nia.one">Partner with Nia <ArrowUpRight /></a></nav>}
    </header>
  );
}
