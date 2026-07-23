"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "#workers", label: "Workers" },
  { href: "#enterprise", label: "Enterprise" },
  { href: "#platform", label: "Platform" },
  { href: "#impact", label: "Why Nia" },
  { href: "#roi", label: "ROI Model" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Nia home">Nia</a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <a className="header-link" href="#platform">
          RafiQi Central
        </a>
        <a className="header-cta" href="#contact">
          Talk to us
        </a>
      </div>
      <button
        className="menu-button"
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      {open && (
        <nav id="mobile-menu" className="mobile-nav" aria-label="Mobile navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)}>
            Talk to us
          </a>
        </nav>
      )}
    </header>
  );
}
