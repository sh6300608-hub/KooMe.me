"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  ["About", "/about"],
  ["Work", "/work"],
  ["Skills", "/skills"],
  ["Credentials", "/certificates"],
  ["Education", "/education"],
  ["Goals", "/goals"],
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-nav">
      <div className="container nav-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>KooMi<span>.</span></Link>
        <nav aria-label="Primary navigation" className={`nav-links ${open ? "nav-open" : ""}`}>
          {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        </nav>
        <div className="nav-actions">
          <Link href="/resume/software-developer" className="nav-resume">Resume</Link>
          <Link href="/dashboard" className="nav-workspace">Workspace</Link>
        </div>
        <button className="nav-menu" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(v => !v)}>{open ? "×" : "☰"}</button>
      </div>
    </header>
  );
}
