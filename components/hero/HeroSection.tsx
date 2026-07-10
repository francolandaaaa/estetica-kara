'use client'

import { motion } from 'framer-motion'

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const NAV_LINKS = [
  { label: 'SERVICIOS', href: '#servicios' },
  { label: 'GALERÍA', href: '#galeria' },
  { label: 'AGENDAR', href: '#agendar' },
]

export default function HeroSection() {
  return (
    <section id="inicio" className="relative h-screen overflow-hidden" style={{ background: 'transparent' }}>
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(5,5,5,0.62) 100%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-52 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #050505)' }}
      />

      {/* Floating Nav */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 md:px-14 py-6">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-xl font-light tracking-[0.3em]"
          style={{ fontFamily: 'var(--font-cormorant)', color: '#E8BAD0' }}
        >
          Estética Kara
        </motion.span>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="hidden md:flex gap-9 text-sm tracking-widest"
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors duration-300 uppercase"
              style={{ color: 'rgba(255,255,255,0.38)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#E8BAD0' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.38)' }}
            >
              {link.label}
            </a>
          ))}
        </motion.div>
      </nav>

      {/* Hero Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-6 text-center">
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.7em' }}
          animate={{ opacity: 0.85, letterSpacing: '0.38em' }}
          transition={{ duration: 2.4, delay: 0.1 }}
          className="text-sm uppercase mb-6"
          style={{ color: '#E8BAD0' }}
        >
          Experiencia Premium
        </motion.p>

        <motion.h1
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut", delay: 0.4 }}
          className="font-light leading-none mb-3"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(64px, 12vw, 140px)',
            background: 'linear-gradient(160deg, #FFFFFF 30%, #F5D0E8 60%, #FFFFFF 85%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer-gold 6s linear infinite',
            textShadow: 'none',
          }}
        >
          Estética Kara
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.1, ease, delay: 0.75 }}
          className="font-light mb-6"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(20px, 4vw, 44px)',
            color: '#E8BAD0',
            letterSpacing: '0.1em',
          }}
        >
          Salón de Belleza
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mb-10 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.60)', fontSize: 'clamp(14px, 1.5vw, 17px)', letterSpacing: '0.04em' }}
        >
          Agenda tu cita y transforma tu estilo
        </motion.p>

        <motion.a
          href="#agendar"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease, delay: 1.2 }}
          className="pointer-events-auto text-sm tracking-[0.3em] uppercase px-10 py-4 transition-all duration-500"
          style={{
            border: '1px solid rgba(232,186,208,0.80)',
            color: '#E8BAD0',
            background: 'linear-gradient(135deg, rgba(232,186,208,0.14), rgba(232,186,208,0.04))',
            animation: 'pulse-glow 3.5s ease-in-out infinite',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#E8BAD0'
            e.currentTarget.style.color = '#050505'
            e.currentTarget.style.boxShadow = '0 0 40px rgba(232,186,208,0.6)'
            e.currentTarget.style.animation = 'none'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(232,186,208,0.14), rgba(232,186,208,0.04))'
            e.currentTarget.style.color = '#E8BAD0'
            e.currentTarget.style.boxShadow = ''
            e.currentTarget.style.animation = 'pulse-glow 3.5s ease-in-out infinite'
          }}
        >
          Agendar Cita
        </motion.a>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
      >
        <span
          className="text-xs tracking-[0.3em] uppercase"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          style={{
            width: '1px',
            height: '52px',
            background: 'linear-gradient(to bottom, #E8BAD0, transparent)',
          }}
        />
      </motion.div>
    </section>
  )
}
