import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div><Link href="/" className="brand">KooMi<span>.</span></Link><p className="muted">A focused portfolio for software, systems and continuous growth.</p></div>
        <div className="footer-links"><Link href="/about">About</Link><Link href="/work">Work</Link><Link href="/resume/software-developer">Resume</Link><Link href="/contact">Contact</Link></div>
        <p className="muted footer-copy">© {new Date().getFullYear()} Hussain</p>
      </div>
    </footer>
  );
}
