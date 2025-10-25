
import { useEffect, useState, useRef } from 'react'
import './Portfolio.css'

const NAV_TABS = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'projects', label: 'Projects' },
  { key: 'skills', label: 'Skills' },
  { key: 'experience', label: 'Experience' },
  { key: 'blog', label: 'Blog' },
  { key: 'contact', label: 'Contact' },
]

export default function Portfolio({ onLoginClick = () => {} }) {
  const [selectedTab, setSelectedTab] = useState('home')
  const [tabAnim, setTabAnim] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const lampRef = useRef(null)
  const gearRef = useRef(null)

  // Parallax effect for cards (only on Home/Projects)
  useEffect(() => {
    if (selectedTab !== 'home' && selectedTab !== 'projects') return
    const handleMove = (e) => {
      const cards = document.querySelectorAll('.pf-card')
      // Reduce parallax displacement so movement is subtle when many cards exist
      const speedBase = 0.006 // smaller base speed
      const maxOffset = 12 // clamp maximum translation (px)
      cards.forEach((card, i) => {
        const speed = (i + 1) * speedBase
        let x = (window.innerWidth / 2 - e.clientX) * speed
        let y = (window.innerHeight / 2 - e.clientY) * speed
        // clamp values so cards don't move too far
        x = Math.max(Math.min(x, maxOffset), -maxOffset)
        y = Math.max(Math.min(y, maxOffset), -maxOffset)
        const rotate = x * 0.002 // much smaller rotation
        card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg)`
      })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [selectedTab])

  // Animated lamp/spotlight for About section
  useEffect(() => {
    if (selectedTab !== 'about') return
    const lamp = lampRef.current
    if (!lamp) return
    const moveLamp = (e) => {
      const x = e.clientX
      lamp.style.left = `${x - 80}px`
    }
    window.addEventListener('mousemove', moveLamp)
    return () => window.removeEventListener('mousemove', moveLamp)
  }, [selectedTab])

  // Animated gears for Skills section
  useEffect(() => {
    if (selectedTab !== 'skills') return
    const gear = gearRef.current
    if (!gear) return
    let angle = 0
    let animId
    function animateGear() {
      angle += 1.2
      gear.style.transform = `rotate(${angle}deg)`
      animId = requestAnimationFrame(animateGear)
    }
    animateGear()
    return () => cancelAnimationFrame(animId)
  }, [selectedTab])

  // Animate tab content on change
  const handleTabClick = (key) => {
    if (key === selectedTab) return
    setTabAnim('pf-fadeout')
    setTimeout(() => {
      setSelectedTab(key)
      setTabAnim('pf-fadein')
      setTimeout(() => setTabAnim(''), 400)
    }, 300)
  }

  // Real content for each tab
  function renderTabContent() {
    switch (selectedTab) {
      case 'home':
        return (
          <>
            <section className="pf-hero pf-animate-in">
              <div className="pf-hero-inner">
                <h1 className="pf-title pf-animate-text">Automation-Focused Software Engineer</h1>
                <p className="pf-sub pf-animate-text">1+ years of hands-on experience in Python, VBA, and test automation across rail and software domains. Skilled in building intelligent automation pipelines, APIs, and optimizing document generation and testing workflows. Proven success in reducing documentation and testing effort by up to <b>70%</b> through end-to-end automation at Alstom and Titagarh Rail Systems.</p>
                <div className="pf-cta-row">
                  <button className="pf-cta" onClick={() => handleTabClick('projects')}>View Projects</button>
                  <a className="pf-cta pf-download" href="/src/assets/Divyank_jain_singhvi_resume.pdf" download>Download CV</a>
                </div>
              </div>
              <div className="pf-cards pf-animate-cards">
                <article className="pf-card pf-card-1" role="button" tabIndex={0} aria-label="Project AI-PDF Trainer">
                  <div className="pf-card-content">
                    <h3>AI-PDF Trainer</h3>
                    <p>Python+Flask app for PDF Q&A with NLP chatbot. <a href="https://github.com/divyank-jain-singhvi/AI-PDF-Trainer-backend" className="pf-link" target="_blank">GitHub</a></p>
                  </div>
                </article>
                <article className="pf-card pf-card-2" role="button" tabIndex={0} aria-label="Project LingoBridge AI">
                  <div className="pf-card-content">
                    <h3>LingoBridge AI</h3>
                    <p>Transformer-based translation model. <a href="https://github.com/divyank-jain-singhvi/lingo-bridge-Ai" className="pf-link" target="_blank">GitHub</a></p>
                  </div>
                </article>
                <article className="pf-card pf-card-3" role="button" tabIndex={0} aria-label="Project Background Audio Voice Cancellation">
                  <div className="pf-card-content">
                    <h3>Background Audio Voice Cancellation</h3>
                    <p>Python tool for noise reduction. <a href="https://github.com/divyank-jain-singhvi/background-audio-voice-cancelation-tool" className="pf-link" target="_blank">GitHub</a></p>
                  </div>
                </article>
              </div>
            </section>
            <section className="pf-features">
              <div className="pf-grid">
                <div className="pf-feature">
                  <div className="pf-ico">🤖</div>
                  <h4>Automation</h4>
                  <p>Python, VBA, and API automation for real-world impact.</p>
                </div>
                <div className="pf-feature">
                  <div className="pf-ico">📊</div>
                  <h4>AI/ML & Data</h4>
                  <p>NLP, Transformers, FAISS, real-time data streaming.</p>
                </div>
                <div className="pf-feature">
                  <div className="pf-ico">�️</div>
                  <h4>Engineering</h4>
                  <p>APIs, document generation, test automation, IoT.</p>
                </div>
                <div className="pf-feature">
                  <div className="pf-ico">🌐</div>
                  <h4>Collaboration</h4>
                  <p>Hackathons, open-source, and cross-functional teamwork.</p>
                </div>
              </div>
            </section>
          </>
        )
      case 'about':
        return (
          <section className="pf-section pf-about pf-animate-in pf-about-unique">
            <div className="pf-lamp" ref={lampRef} />
            <div className="pf-about-content">
              <h2 className="pf-animate-text">About Me</h2>
              <p className="pf-animate-text">
                <b>Divyank Jain Singhvi</b> — Automation-focused Software Engineer with 1+ years of hands-on experience in Python, VBA, and test automation across rail and software domains. Skilled in building intelligent automation pipelines, developing APIs (Flask, FastAPI, Django), and optimizing document generation and testing workflows. Experienced in parsing complex data (XML, logs, Wireshark) and managing ALM tools like Polarion for process automation and system traceability. Proficient in AI/ML (NLP, Transformers, FAISS), IoT, Real-time Data Streaming, and cloud integrations.
              </p>
              {/* Education moved out of the small cards to avoid layout stretching */}
              <div className="pf-edu pf-animate-text">🎓 <b>B.Tech CSE</b> — Dayananda Sagar University, Bangalore (2021–2025) • GPA: 8.56/10</div>

              <div className="pf-about-grid pf-animate-cards">
                <div className="pf-link-btn">📍 Bangalore, India</div>
                <div className="pf-link-btn">📞 (+91) 8905525623</div>
                <a className="pf-link-btn" href="mailto:divyanksinghvi@gmail.com">✉️ Email</a>
                <a className="pf-link-btn" href="https://linkedin.com/in/divyank-jain-singhvi" target="_blank">🔗 LinkedIn</a>
                <a className="pf-link-btn" href="https://github.com/divyank-jain-singhvi" target="_blank">🐙 GitHub</a>
              </div>
            </div>
          </section>
        )
      case 'projects':
        return (
          <section className="pf-section pf-projects pf-animate-in">
            <h2>Featured Projects</h2>
            <div className="pf-cards pf-cards-grid">
              <article className="pf-card pf-card-1" tabIndex={0}>
                <div className="pf-card-content">
                  <h3>AI-PDF Trainer</h3>
                  <p>Python+Flask web app for PDF Q&A with an NLP chatbot.<br/>
                  <a href="https://github.com/divyank-jain-singhvi/AI-PDF-Trainer-backend" className="pf-link" target="_blank">GitHub</a></p>
                </div>
              </article>
              <article className="pf-card pf-card-2" tabIndex={0}>
                <div className="pf-card-content">
                  <h3>LingoBridge AI</h3>
                  <p>Transformer-based translation project (model + frontend).<br/>
                  <a href="https://github.com/divyank-jain-singhvi/lingo-bridge-Ai" className="pf-link" target="_blank">GitHub</a></p>
                </div>
              </article>
              <article className="pf-card pf-card-3" tabIndex={0}>
                <div className="pf-card-content">
                  <h3>Background Audio Voice Cancellation</h3>
                  <p>Python tool for noise reduction in audio signals.<br/>
                  <a href="https://github.com/divyank-jain-singhvi/background-audio-voice-cancelation-tool" className="pf-link" target="_blank">GitHub</a></p>
                </div>
              </article>
              <article className="pf-card pf-card-4" tabIndex={0}>
                <div className="pf-card-content">
                  <h3>Smart Mining Helmet (IoT)</h3>
                  <p>Helmet with GPS, DHT11 and MQ-2 sensors for safety monitoring (IoT demo).<br/>
                  <a href="https://github.com/divyank-jain-singhvi/Cole-miner-safety-IOT" className="pf-link" target="_blank">GitHub</a></p>
                </div>
              </article>

              {/* New projects added as requested */}
              <article className="pf-card pf-card-5" tabIndex={0}>
                <div className="pf-card-content">
                  <h3>Multi-Task-To-Do</h3>
                  <p>This repo (React + Firebase) is a multi-task to-do app with realtime updates, task categories and user auth.<br/>
                  <a href="https://github.com/divyank-jain-singhvi/Multi-Task-To-Do" className="pf-link" target="_blank">GitHub</a></p>
                </div>
              </article>

              <a href="https://github.com/divyank-jain-singhvi/Image-recognition-support" 
                 className="pf-card pf-card-6" 
                 target="_blank" 
                 rel="noopener noreferrer">
                <div className="pf-card-content">
                  <h3>Image-recognition-support</h3>
                  <p>A project providing image recognition support (likely uses OpenCV / TensorFlow for classification or detection).</p>
                  <div className="pf-links">
                    <span className="pf-link-label">View Project →</span>
                  </div>
                </div>
              </a>

              <article className="pf-card pf-card-7" tabIndex={0}>
                <div className="pf-card-content">
                  <h3>Quiz-Hunt</h3>
                  <p>Interactive quiz web app with timed questions, scoring and a question bank (frontend likely in JS/React).<br/>
                  <a href="https://github.com/divyank-jain-singhvi/Quiz-Hunt" className="pf-link" target="_blank">GitHub</a></p>
                </div>
              </article>

              <article className="pf-card pf-card-8" tabIndex={0}>
                <div className="pf-card-content">
                  <h3>edge-web</h3>
                  <p>Web interface/demos for edge computing or edge-device data visualization (likely a frontend demo).<br/>
                  <a href="https://github.com/divyank-jain-singhvi/edge-web" className="pf-link" target="_blank">GitHub</a></p>
                </div>
              </article>

              <div className="pf-card pf-card-9">
                <div className="pf-card-content">
                  <h3>pass1-pass2-compiler (backend & frontend)</h3>
                  <p>Two-part compiler project — backend (parsing/IR) and frontend (code/editor/visualizer).</p>
                  <div className="pf-links">
                    <a href="https://github.com/divyank-jain-singhvi/pass1-pass2-compiler-backend" 
                       className="pf-link-label" 
                       target="_blank"
                       rel="noopener noreferrer">Backend →</a>
                    <a href="https://github.com/divyank-jain-singhvi/pass1-pass2-compiler-frontend" 
                       className="pf-link-label" 
                       target="_blank"
                       rel="noopener noreferrer">Frontend →</a>
                  </div>
                </div>
              </div>

              <article className="pf-card pf-card-10" tabIndex={0}>
                <div className="pf-card-content">
                  <h3>Operating-system</h3>
                  <p>Operating systems coursework or a small OS simulator (scheduling, memory management and kernel exercises).<br/>
                  <a href="https://github.com/divyank-jain-singhvi/Operating-system" className="pf-link" target="_blank">GitHub</a></p>
                </div>
              </article>

              {/* Registration-page (Internship Project) removed as requested */}

              <article className="pf-card pf-card-12" tabIndex={0}>
                <div className="pf-card-content">
                  <h3>DJI Website Clone</h3>
                  <p>Static clone of the DJI website (HTML/CSS/JS) showcasing layout and responsive design skills.<br/>
                  <a href="https://github.com/divyank-jain-singhvi/DJI-Website-Clone.github.io" className="pf-link" target="_blank">GitHub</a></p>
                </div>
              </article>

              <article className="pf-card pf-card-13" tabIndex={0}>
                <div className="pf-card-content">
                  <h3>Matrix-Calculator</h3>
                  <p>Matrix calculator for operations like addition, multiplication, inverse and determinant (likely JS/Python based).<br/>
                  <a href="https://github.com/divyank-jain-singhvi/Matrix-Calculator" className="pf-link" target="_blank">GitHub</a></p>
                </div>
              </article>
            </div>
          </section>
        )
      case 'skills':
        return (
          <section className="pf-section pf-skills pf-animate-in pf-skills-unique">
            <div className="pf-gears-bg">
              <svg ref={gearRef} className="pf-gear" width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="24" stroke="#22d3ee" strokeWidth="4" fill="none"/><g stroke="#6366f1" strokeWidth="2"><line x1="30" y1="6" x2="30" y2="0"/><line x1="30" y1="54" x2="30" y2="60"/><line x1="6" y1="30" x2="0" y2="30"/><line x1="54" y1="30" x2="60" y2="30"/><line x1="12" y1="12" x2="7" y2="7"/><line x1="48" y1="12" x2="53" y2="7"/><line x1="12" y1="48" x2="7" y2="53"/><line x1="48" y1="48" x2="53" y2="53"/></g></svg>
            </div>
            <h2 className="pf-animate-text">Technical Skills</h2>
            <div className="pf-skills-list pf-animate-list">
              <div><b>Languages:</b> Python (Flask, FastAPI, Django), C, JavaScript, React, Arduino, VBA</div>
              <div><b>Data & AI/ML:</b> Pandas, Numpy, Matplotlib, NLP (Transformers, FAISS, LangChain)</div>
              <div><b>Database:</b> Firebase, JSON, Pickle (PKL), Vector Storage</div>
              <div><b>Dev Tools:</b> Git/GitHub, Exe Packaging</div>
              <div><b>OS & Networking:</b> Memory Management, Wireshark, TCP/IP</div>
              <div><b>Automation:</b> Python Scripts, VBA (Excel/Word), PDF/XML Parsing, Polarion Admin</div>
              <div><b>Cloud/Deployment:</b> SVN, IoT, Real-time Data Streaming, ThingSpeak</div>
              <div><b>Other Skills:</b> Prompt Engineering (AI/LLMs), Hackathons, Presentations</div>
            </div>
            <div className="pf-skills-badges pf-animate-cards">
              <span className="pf-badge">Python</span>
              <span className="pf-badge">VBA</span>
              <span className="pf-badge">React</span>
              <span className="pf-badge">Flask</span>
              <span className="pf-badge">AI/ML</span>
              <span className="pf-badge">IoT</span>
              <span className="pf-badge">Automation</span>
              <span className="pf-badge">Git</span>
            </div>
            <h3 className="pf-animate-text" style={{marginTop:'24px'}}>Certifications</h3>
            <div className="pf-cert-grid">
              <a className="pf-cert-card pf-animate-cards" href="https://drive.google.com/drive/folders/1g6FJCa5f4cmsbwvxmUMNODVbHKczKvPo" target="_blank" rel="noopener noreferrer">
                <div className="pf-cert-title">Cloud & AI/ML</div>
                <div className="pf-cert-desc">AWS Generative AI, AWSOME Day, OpenCV, TensorFlow & Keras</div>
              </a>
              <a className="pf-cert-card pf-animate-cards" href="https://drive.google.com/drive/folders/1kS088zOcAXovoH1xz_KrdklaXWPbqm7h" target="_blank" rel="noopener noreferrer">
                <div className="pf-cert-title">Programming & Development</div>
                <div className="pf-cert-desc">Python, Full Stack, Hackathon Wins</div>
              </a>
              <a className="pf-cert-card pf-animate-cards" href="https://drive.google.com/drive/folders/1Twhnp6he43yt1EnC24PqMvDnOKUIDD-I" target="_blank" rel="noopener noreferrer">
                <div className="pf-cert-title">Professional Skills</div>
                <div className="pf-cert-desc">Business Presentation, Public Speaking, Time Management</div>
              </a>
              <a className="pf-cert-card pf-animate-cards" href="https://drive.google.com/drive/folders/1s_P44N97c1ePxI4YLHGTEmC2hO9afN8M" target="_blank" rel="noopener noreferrer">
                <div className="pf-cert-title">Additional Participation</div>
                <div className="pf-cert-desc">ACM, AI/ML & JS Workshops, Deloitte, Treasure Hunt</div>
              </a>
            </div>
          </section>
        )
      case 'experience':
        return (
          <section className="pf-section pf-blog pf-animate-in">
            <h2>Experience</h2>
            <div className="pf-blog-list">
              <article className="pf-blog-card">
                <h3>Graduate Engineer Trainee | Titagarh Rail Systems</h3>
                <p>TCMS Software and Network Engineer<br/>
                Jan 2025 – Present, Bangalore, India</p>
                <ul className="pf-list">
                  <li>Automated Excel/Word workflows (brake calculation, heat load) using VBA, cutting manual effort by 70%.</li>
                  <li>Designed hybrid tools converting raw metrics to customer-ready word document deliverables, decreased 60% effort.</li>
                  <li>Managing Polarion tool as admin and developing automation scripts, decreased 20% manual effort.</li>
                  <li>Created cost and functionality analysis slides and prototype project for SVN server implementation.</li>
                  <li><b>Impact:</b> Reduced total time consumption of writing document and structuring by 30%.</li>
                </ul>
              </article>
              <article className="pf-blog-card">
                <h3>Automation Test Engineer Intern | Alstom</h3>
                <p>System Test Automation Developer<br/>
                Aug 2024 – Jan 2025, Bangalore, India</p>
                <ul className="pf-list">
                  <li>Developed python automation scripts for 11 metro projects' system testing across 16 scenarios.</li>
                  <li>Parsed XML Data and Wireshark Network packet captures for live automating report generation and testing.</li>
                  <li>Packaged python tools into a standalone .exe for the validation Team, 2% work efficiency increased.</li>
                  <li><b>Impact:</b> Reduced test report generation and validation time from 2 months to 1 week.</li>
                </ul>
              </article>
            </div>
          </section>
        )

      case 'blog':
        return (
          <section className="pf-section pf-blog pf-animate-in">
            <h2>Blog & Articles</h2>
            <div className="pf-blog-list">
              <article className="pf-blog-card">
                <h3>How to Build a Pro Portfolio in React</h3>
                <p>Step-by-step guide to creating a modern, animated portfolio using React and CSS.</p>
                <span className="pf-blog-meta">Oct 2025 • 7 min read</span>
              </article>
              <article className="pf-blog-card">
                <h3>Design Systems for Developers</h3>
                <p>Why every team should invest in a design system and how to start one.</p>
                <span className="pf-blog-meta">Sep 2025 • 5 min read</span>
              </article>
              <article className="pf-blog-card">
                <h3>Animating with Framer Motion</h3>
                <p>Tips and tricks for smooth, accessible UI animations in React.</p>
                <span className="pf-blog-meta">Aug 2025 • 6 min read</span>
              </article>
            </div>
          </section>
        )
      case 'contact':
        return (
          <section className="pf-section pf-contact pf-animate-in">
            <h2>Contact Me</h2>
            <p>Let’s connect! Reach out via any of the platforms below:</p>
            <div className="pf-contact-list">
              <a className="pf-contact-link" href="mailto:divyanksinghvi@gmail.com" target="_blank" rel="noopener noreferrer">
                <span className="pf-contact-ico">✉️</span> divyanksinghvi@gmail.com
              </a>
              <a className="pf-contact-link" href="https://github.com/divyank-jain-singhvi" target="_blank" rel="noopener noreferrer">
                <span className="pf-contact-ico">🐙</span> github.com/divyank-jain-singhvi
              </a>
              <a className="pf-contact-link" href="https://linkedin.com/in/divyank-jain-singhvi" target="_blank" rel="noopener noreferrer">
                <span className="pf-contact-ico">💼</span> linkedin.com/in/divyank-jain-singhvi
              </a>
              <a className="pf-contact-link" href="tel:+918905525623" target="_blank" rel="noopener noreferrer">
                <span className="pf-contact-ico">📞</span> +91 8905525623
              </a>
            </div>
            <div className="pf-contact-footer">I usually reply within 24 hours. Looking forward to collaborating!</div>
          </section>
        )
      default:
        return null
    }
  }

  return (
    <div className="pf-root">
      <header className="pf-header">
        <div className="pf-brand">Divyank<span className="pf-dot">.</span></div>
        
        {/* Desktop Navigation */}
        <nav className="pf-nav">
          {NAV_TABS.map(tab => (
            <button
              key={tab.key}
              className={`pf-tab${selectedTab === tab.key ? ' pf-tab-active' : ''}`}
              onClick={() => handleTabClick(tab.key)}
              aria-current={selectedTab === tab.key ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="pf-actions">
          <button className="pf-login" onClick={onLoginClick}>Login</button>
          {/* Mobile Navigation Toggle */}
          <button 
            className="pf-mobile-nav-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? '×' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        <div className={`pf-mobile-nav${isMenuOpen ? ' active' : ''}`}>
          {NAV_TABS.map(tab => (
            <button
              key={tab.key}
              className={`pf-tab${selectedTab === tab.key ? ' pf-tab-active' : ''}`}
              onClick={() => {
                handleTabClick(tab.key)
                setIsMenuOpen(false)
              }}
              aria-current={selectedTab === tab.key ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
          <button className="pf-login" onClick={() => {
            onLoginClick()
            setIsMenuOpen(false)
          }}>
            Login
          </button>
        </div>
      </header>

      <main className="pf-main">
        <div className={`pf-tab-content${tabAnim ? ' ' + tabAnim : ''}`}>{renderTabContent()}</div>
        <footer className="pf-footer">© {new Date().getFullYear()} Divyank Jain Singhvi — Portfolio</footer>
      </main>
    </div>
  )
}
