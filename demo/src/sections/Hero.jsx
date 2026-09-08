import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const words = ['Login', 'Input Details', 'Generate Portfolio', 'Deploy']

export default function Hero() {
  const [text, setText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIndex]
    const speed = isDeleting ? 80 : 150

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex === current.length) {
        setTimeout(() => setIsDeleting(true), 1200)
        return
      }
      if (isDeleting && charIndex === 0) {
        setIsDeleting(false)
        setWordIndex((i) => (i + 1) % words.length)
        return
      }
      setText(current.substring(0, charIndex))
      setCharIndex((c) => c + (isDeleting ? -1 : 1))
    }, speed)

    return () => clearTimeout(timer)
  }, [charIndex, isDeleting, wordIndex])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center max-w-4xl mx-auto"
      >
        {/* Logo + Typewriter */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-20 md:h-20" fill="none">
            <polygon points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5" stroke="#6366f1" strokeWidth="3" fill="rgba(99,102,241,0.1)" />
            <text x="50" y="58" textAnchor="middle" fill="#818cf8" fontSize="28" fontWeight="700" fontFamily="Inter">H</text>
          </svg>
          <div className="text-5xl md:text-7xl font-bold">
            <span className="text-gray-200">{text}</span>
            <span className="cursor-blink text-indigo-400">|</span>
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl md:text-5xl font-bold mb-6 leading-tight"
        >
          Transform Your Vision into a{' '}
          <span className="gradient-text">Professional Portfolio</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Fill out your details, skills, and projects — let our AI craft a beautifully responsive, deployable portfolio website in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a href="#demo" className="btn-primary text-center">
            Try the Demo
          </a>
          <a
            href="https://github.com/aryanthepain/CV_creator"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-center"
          >
            View on GitHub
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-gray-500 flex justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
