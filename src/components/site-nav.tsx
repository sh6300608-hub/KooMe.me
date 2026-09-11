import Link from "next/link";

const links = [
  ["About", "/about"],
  ["Work", "/work"],
  ["Skills", "/skills"],
  ["Credentials", "/certificates"],
  ["Education", "/education"],
];

export function SiteNav() {
  return (
    <header className="site-nav">
      <div className="container nav-inner">
        <Link href="/" className="brand">KooMi<span>.</span></Link>
        <nav aria-label="Primary navigation" className="nav-links">
          {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <div className="nav-actions">
          <Link href="/resume/software-developer" className="nav-resume">Resume</Link>
          <Link href="/dashboard" className="nav-workspace">Workspace</Link>
        </div>
      </div>
    </header>
  );
}
