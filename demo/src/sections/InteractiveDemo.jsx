import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SAMPLE_DATA = {
  name: 'Aryan Gupta',
  title: 'Full-Stack Developer & AI Enthusiast',
  about: 'Passionate developer with expertise in React, Node.js, and AI integration. Building tools that make development faster and more accessible.',
  skills: 'React, Node.js, Python, MongoDB, Express, TailwindCSS, Claude AI, Git',
  projects: 'HexCode — AI Portfolio Generator\nTaskFlow — Collaborative Project Manager\nNeural Canvas — AI Art Generator',
}

const GENERATED_CODE = `{
  "html": "<!DOCTYPE html>\\n<html lang=\\"en\\">\\n<head>\\n  <meta charset=\\"UTF-8\\">\\n  <title>Aryan Gupta | Portfolio</title>\\n  <link rel=\\"stylesheet\\" href=\\"style.css\\">\\n</head>\\n<body>\\n  <nav class=\\"navbar\\">\\n    <div class=\\"logo\\">AG</div>\\n    <ul class=\\"nav-links\\">\\n      <li><a href=\\"#about\\">About</a></li>\\n      <li><a href=\\"#skills\\">Skills</a></li>\\n      <li><a href=\\"#projects\\">Projects</a></li>\\n      <li><a href=\\"#contact\\">Contact</a></li>\\n    </ul>\\n  </nav>\\n  <section id=\\"hero\\">\\n    <h1>Aryan Gupta</h1>\\n    <p>Full-Stack Developer & AI Enthusiast</p>\\n    <a href=\\"#projects\\" class=\\"cta\\">View My Work</a>\\n  </section>\\n  <section id=\\"about\\">...</section>\\n  <section id=\\"skills\\">...</section>\\n  <section id=\\"projects\\">...</section>\\n</body>\\n</html>",
  "css": ".navbar { display: flex; ... }\\n#hero { min-height: 100vh; ... }",
  "js": "document.querySelectorAll('a[href^=\\"#\\"]')...",
  "explanation": "Generated a clean, responsive portfolio..."
}`

const SAMPLE_PORTFOLIO_HTML = `
<div style="font-family: 'Inter', system-ui, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%); color: #e2e8f0; min-height: 100%;">
  <nav style="display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.1);">
    <div style="font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #818cf8, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">AG</div>
    <div style="display: flex; gap: 24px; font-size: 14px; color: #94a3b8;">
      <a href="#" style="color: #e2e8f0; text-decoration: none;">About</a>
      <a href="#" style="color: #94a3b8; text-decoration: none;">Skills</a>
      <a href="#" style="color: #94a3b8; text-decoration: none;">Projects</a>
      <a href="#" style="color: #94a3b8; text-decoration: none;">Contact</a>
    </div>
  </nav>
  <div style="text-align: center; padding: 80px 40px 60px;">
    <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a78bfa); margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 700;">A</div>
    <h1 style="font-size: 42px; font-weight: 800; margin-bottom: 12px; background: linear-gradient(135deg, #e2e8f0, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Aryan Gupta</h1>
    <p style="font-size: 18px; color: #818cf8; margin-bottom: 8px;">Full-Stack Developer & AI Enthusiast</p>
    <p style="font-size: 14px; color: #64748b; max-width: 500px; margin: 0 auto 32px; line-height: 1.6;">Passionate developer with expertise in React, Node.js, and AI integration. Building tools that make development faster and more accessible.</p>
    <a href="#" style="display: inline-block; background: #6366f1; color: white; padding: 12px 32px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 14px;">View My Work →</a>
  </div>
  <div style="padding: 40px; max-width: 800px; margin: 0 auto;">
    <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 20px; text-align: center;">Skills</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 48px;">
      ${['React', 'Node.js', 'Python', 'MongoDB', 'Express', 'TailwindCSS', 'Claude AI', 'Git'].map(s =>
        `<span style="background: rgba(99,102,241,0.15); color: #a5b4fc; padding: 6px 16px; border-radius: 9999px; font-size: 13px; border: 1px solid rgba(99,102,241,0.2);">${s}</span>`
      ).join('')}
    </div>
    <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 20px; text-align: center;">Projects</h2>
    <div style="display: grid; gap: 16px;">
      ${[
        { name: 'HexCode', desc: 'AI Portfolio Generator', color: '#6366f1' },
        { name: 'TaskFlow', desc: 'Collaborative Project Manager', color: '#8b5cf6' },
        { name: 'Neural Canvas', desc: 'AI Art Generator', color: '#a78bfa' },
      ].map(p =>
        `<div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: ${p.color}20; display: flex; align-items: center; justify-content: center; color: ${p.color}; font-weight: 700; font-size: 18px; flex-shrink: 0;">${p.name[0]}</div>
          <div><div style="font-weight: 600; margin-bottom: 4px;">${p.name}</div><div style="font-size: 13px; color: #64748b;">${p.desc}</div></div>
        </div>`
      ).join('')}
    </div>
  </div>
</div>
`

const steps = [
  { id: 0, label: 'Fill Details' },
  { id: 1, label: 'Generate' },
  { id: 2, label: 'Preview' },
]

export default function InteractiveDemo() {
  const [step, setStep] = useState(0)
  const [codeText, setCodeText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const codeRef = useRef(null)

  const handleGenerate = () => {
    setStep(1)
    setIsGenerating(true)
    setCodeText('')

    let i = 0
    const interval = setInterval(() => {
      if (i < GENERATED_CODE.length) {
        setCodeText(GENERATED_CODE.substring(0, i + 1))
        i++
        if (codeRef.current) {
          codeRef.current.scrollTop = codeRef.current.scrollHeight
        }
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setIsGenerating(false)
          setStep(2)
        }, 600)
      }
    }, 8)

    return () => clearInterval(interval)
  }

  const handleReset = () => {
    setStep(0)
    setCodeText('')
    setIsGenerating(false)
  }

  return (
    <section id="demo" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See It <span className="gradient-text">In Action</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Experience the portfolio generation flow — from input to deployment.
          </p>
        </motion.div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`step-dot ${step >= s.id ? 'step-dot-active' : 'step-dot-inactive'}`} />
                <span className={`text-sm font-medium ${step >= s.id ? 'text-indigo-400' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-px ${step > s.id ? 'bg-indigo-500' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {/* Step 0: Form */}
            {step === 0 && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input className="demo-input" value={SAMPLE_DATA.name} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                    <input className="demo-input" value={SAMPLE_DATA.title} readOnly />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">About</label>
                    <textarea className="demo-input" rows={2} value={SAMPLE_DATA.about} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
                    <input className="demo-input" value={SAMPLE_DATA.skills} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Projects</label>
                    <textarea className="demo-input" rows={2} value={SAMPLE_DATA.projects} readOnly />
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <button onClick={handleGenerate} className="btn-primary">
                    ✨ Generate Portfolio
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 1: Generating */}
            {step === 1 && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-0"
              >
                <div className="code-block border-0 rounded-none">
                  <div className="code-block-header">
                    <div className="code-block-dot" style={{ background: '#ef4444' }} />
                    <div className="code-block-dot" style={{ background: '#f59e0b' }} />
                    <div className="code-block-dot" style={{ background: '#22c55e' }} />
                    <span className="text-xs text-gray-400 ml-2">AI generating portfolio...</span>
                    {isGenerating && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="ml-auto w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full"
                      />
                    )}
                  </div>
                  <pre
                    ref={codeRef}
                    className="p-6 overflow-auto text-green-400/80"
                    style={{ maxHeight: 400, minHeight: 350 }}
                  >
                    <code>{codeText}</code>
                  </pre>
                </div>
              </motion.div>
            )}

            {/* Step 2: Preview */}
            {step === 2 && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="p-0"
              >
                {/* Browser chrome */}
                <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 bg-gray-800 rounded-md px-4 py-1.5 text-xs text-gray-400 text-center">
                    aryan-gupta-portfolio.hexcode.dev
                  </div>
                </div>
                {/* Portfolio preview */}
                <div
                  style={{ height: 500, overflow: 'auto' }}
                  dangerouslySetInnerHTML={{ __html: SAMPLE_PORTFOLIO_HTML }}
                />
                <div className="p-6 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-sm text-green-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
                    Portfolio generated successfully
                  </span>
                  <div className="flex gap-3">
                    <button onClick={handleReset} className="btn-outline text-sm py-2 px-5">
                      ← Start Over
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
