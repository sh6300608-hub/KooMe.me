import Link from 'next/link';

const sections = [
  ['About', 'about'], ['My Work', 'work'], ['Skills', 'skills'], ['Certificates', 'certificates'], ['Education', 'education'], ['Goals', 'goals'], ['Contact', 'contact']
];

export default function Home() {
  return <main>
    <nav className="container" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'24px 0',position:'sticky',top:0,zIndex:10,background:'rgba(7,11,18,.88)',backdropFilter:'blur(14px)'}}>
      <Link href="/" style={{fontWeight:700,fontSize:22,letterSpacing:'-.04em'}}>KooMi<span style={{color:'var(--accent)'}}>.</span></Link>
      <div style={{display:'flex',gap:18,fontSize:13}}>{sections.slice(0,4).map(([label,id])=><a key={id} href={'#'+id}>{label}</a>)}<Link href="/dashboard">Workspace</Link></div>
    </nav>
    <section className="container" style={{minHeight:'78vh',display:'grid',gridTemplateColumns:'1.2fr .8fr',gap:60,alignItems:'center'}}>
      <div><p style={{color:'var(--accent)',fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',fontSize:12}}>Software • Systems • Growth</p><h1 style={{fontSize:'clamp(56px,9vw,108px)',lineHeight:.9,margin:'20px 0'}}>Hussain<span style={{color:'var(--accent)'}}>.</span></h1><p className="muted" style={{fontSize:20,maxWidth:620,lineHeight:1.6}}>Aspiring Software Developer building practical, thoughtful digital systems with a focus on learning, reliability, and clean engineering.</p><div style={{display:'flex',gap:12,marginTop:32}}><a href="#work" style={{background:'var(--accent)',padding:'13px 18px',borderRadius:10,fontWeight:600}}>View My Work</a><a href="/resume/software-developer" style={{border:'1px solid var(--border)',padding:'13px 18px',borderRadius:10}}>View Resume</a></div></div>
      <div className="surface" style={{height:440,display:'grid',placeItems:'center',position:'relative',overflow:'hidden'}}><div style={{width:210,height:210,borderRadius:'50%',border:'1px solid #315b93',boxShadow:'0 0 100px rgba(59,130,246,.18)'}}/><span className="muted" style={{position:'absolute',bottom:24,fontSize:12}}>Interactive 3D layer initializes progressively</span></div>
    </section>
    <section id="about" className="container" style={{padding:'100px 0'}}><p className="muted">01 / ABOUT</p><h2 style={{fontSize:48}}>Building toward software that matters.</h2><p className="muted" style={{maxWidth:760,fontSize:18,lineHeight:1.8}}>This portfolio is backed by KooMi, a private career workspace for managing projects, skills, credentials, applications, interviews, documents and publishing. Public content is intentionally separated from private career data.</p></section>
    <section id="work" className="container" style={{padding:'60px 0'}}><p className="muted">02 / MY WORK</p><div className="surface" style={{padding:28,marginTop:18}}><h3>Project Example 01</h3><p className="muted">Placeholder project data. Replace this from the private workspace before publishing.</p></div></section>
    <section id="skills" className="container" style={{padding:'80px 0'}}><p className="muted">03 / SKILLS</p><div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:20}}>{['Python','Java','JavaScript','AWS','Azure','Git','GitHub','HTML/CSS'].map(x=><span key={x} className="surface" style={{padding:'10px 14px'}}>{x}</span>)}</div></section>
    <section id="certificates" className="container" style={{padding:'80px 0'}}><p className="muted">04 / CREDENTIALS</p><h2>Certificates & achievements</h2><p className="muted">Certificate Example · Organization placeholder</p></section>
    <section id="education" className="container" style={{padding:'80px 0'}}><p className="muted">05 / EDUCATION</p><h2>Education</h2><p className="muted">University / Institution · Course placeholder</p></section>
    <section id="goals" className="container" style={{padding:'80px 0'}}><p className="muted">06 / FUTURE</p><h2>Future goals</h2><p className="muted">Career goals, skills to learn, future projects and long-term ambitions will be managed privately and selectively published.</p></section>
    <section id="contact" className="container" style={{padding:'100px 0'}}><div className="surface" style={{padding:36}}><p className="muted">07 / CONTACT</p><h2 style={{fontSize:48}}>Let’s build something useful.</h2><form action="/api/contact" method="post" style={{display:'grid',gap:12,maxWidth:650}}><input name="name" required placeholder="Name" style={input}/><input name="email" type="email" required placeholder="Email" style={input}/><input name="company" placeholder="Company" style={input}/><input name="role" placeholder="Role" style={input}/><textarea name="message" required placeholder="Message" rows={6} style={input}/><button type="submit" style={{background:'var(--accent)',border:0,color:'white',padding:14,borderRadius:10,fontWeight:600}}>Send message</button></form></div></section>
    <footer className="container" style={{padding:'30px 0 60px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span className="muted">© KooMi</span><span className="muted">Professional portfolio · Private career workspace</span></footer>
  </main>;
}
const input={background:'#0a1019',border:'1px solid var(--border)',borderRadius:10,padding:13,color:'var(--foreground)',font:'inherit'};
