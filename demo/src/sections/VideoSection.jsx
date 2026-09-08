import { motion } from 'framer-motion'

export default function VideoSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Watch the <span className="gradient-text">Full Walkthrough</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            See how HexCode transforms your inputs into a deployed portfolio in under 2 minutes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="video-container shadow-2xl shadow-indigo-900/20"
        >
          <iframe
            src="https://www.youtube.com/embed/AAwnEYtBwo4"
            title="HexCode Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
      </div>
    </section>
  )
}
