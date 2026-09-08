import Hero from './sections/Hero'
import Features from './sections/Features'
import InteractiveDemo from './sections/InteractiveDemo'
import VideoSection from './sections/VideoSection'
import Screenshots from './sections/Screenshots'
import Team from './sections/Team'
import Footer from './sections/Footer'

export default function App() {
  return (
    <div className="relative min-h-screen">
      {/* Ambient glows */}
      <div className="glow-orb" style={{ top: '5%', left: '10%', width: 400, height: 400, background: '#6366f1' }} />
      <div className="glow-orb" style={{ top: '40%', right: '5%', width: 350, height: 350, background: '#a78bfa', animationDelay: '3s' }} />
      <div className="glow-orb" style={{ top: '75%', left: '20%', width: 300, height: 300, background: '#818cf8', animationDelay: '5s' }} />

      <Hero />
      <Features />
      <InteractiveDemo />
      <VideoSection />
      <Screenshots />
      <Team />
      <Footer />
    </div>
  )
}
