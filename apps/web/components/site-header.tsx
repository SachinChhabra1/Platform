"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "#platform", label: "Platform" },
  { href: "#books", label: "Nia Books" },
  { href: "#thesis", label: "Our thesis" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Nia home">nia<span>.</span></a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
      </nav>
      <a className="header-cta" href="mailto:hello@nia.one">Build with us <span aria-hidden="true">↗</span></a>
      <button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      {open && (
        <nav id="mobile-menu" className="mobile-nav" aria-label="Mobile navigation">
          {links.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>)}
          <a href="mailto:hello@nia.one">Build with us ↗</a>
        </nav>
      )}
    </header>
  );
}
