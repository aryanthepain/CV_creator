import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const screenshots = [
  {
    title: 'Landing Page',
    url: 'https://i.ibb.co/wNTJz2gg/Screenshot-2025-02-03-012759.png',
  },
  {
    title: 'Prompt Space',
    url: 'https://i.ibb.co/YB9Q91DR/Screenshot-2025-02-03-013144.png',
  },
  {
    title: 'Explore Page',
    url: 'https://i.ibb.co/whtqM7Vq/explore.jpg',
  },
  {
    title: 'Profile Page',
    url: 'https://i.ibb.co/HfMDQqH8/suck.jpg',
  },
  {
    title: 'Generated Preview',
    url: 'https://i.ibb.co/zhGn5mBv/preview.jpg',
  },
  {
    title: 'Generated Codebase',
    url: 'https://i.ibb.co/k6BM0Tyy/main-2.jpg',
  },
]

export default function Screenshots() {
  const [active, setActive] = useState(0)

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The Full <span className="gradient-text">Experience</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            A peek at every screen of the HexCode application.
          </p>
        </motion.div>

        {/* Tab bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {screenshots.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                i === active
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Screenshot display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass overflow-hidden"
        >
          {/* Browser chrome */}
          <div className="bg-black/40 border-b border-white/5 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 bg-white/5 rounded-md px-4 py-1.5 text-xs text-gray-500 text-center">
              hexcode.app / {screenshots[active].title.toLowerCase().replace(/ /g, '-')}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <img
                src={screenshots[active].url}
                alt={screenshots[active].title}
                className="w-full object-cover"
                style={{ maxHeight: 500 }}
                loading="lazy"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
