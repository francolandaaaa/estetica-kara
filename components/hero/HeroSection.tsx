'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

const ThreeCanvas = dynamic(() => import('./ThreeCanvas'), {
  ssr: false,
  loading: () => <div className="absolute inset-0" style={{ background: '#050505' }} />,
})

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const NAV_LINKS = [
  { label: 'SERVICIOS', href: '#servicios' },
  { label: 'GALERÍA', href: '#galeria' },
  { label: 'AGENDAR', href: '#agendar' },
]

export default function HeroSection() {
  return (
    <section id="inicio" className="relative h-screen overflow-hidden" style={{ background: 'transparent' }}>
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <ThreeCanvas />
      </div>

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
          style={{ fontFamily: 'var(--font-cormorant)', color: '#C9A84C' }}
        >
          NUDO
        </motion.span>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="hidden md:flex gap-9 text-xs tracking-widest"
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors duration-300 uppercase"
              style={{ color: 'rgba(255,255,255,0.38)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C' }}
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
          animate={{ opacity: 0.55, letterSpacing: '0.38em' }}
          transition={{ duration: 2.4, delay: 0.1 }}
          className="text-xs uppercase mb-6"
          style={{ color: '#C9A84C' }}
        >
          Experiencia Premium
        </motion.p>

        <motion.h1
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut", delay: 0.4 }}
          className="font-light text-white leading-none mb-3"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(64px, 12vw, 140px)',
          }}
        >
          NUDO
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.1, ease, delay: 0.75 }}
          className="font-light mb-6"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(20px, 4vw, 44px)',
            color: '#C9A84C',
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
          style={{ color: 'rgba(255,255,255,0.38)', fontSize: 'clamp(14px, 1.5vw, 17px)' }}
        >
          Agenda tu cita y transforma tu estilo
        </motion.p>

        <motion.a
          href="#agendar"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease, delay: 1.2 }}
          className="pointer-events-auto text-xs tracking-[0.3em] uppercase px-10 py-4 transition-all duration-500"
          style={{ border: '1px solid #C9A84C', color: '#C9A84C' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#C9A84C'
            e.currentTarget.style.color = '#050505'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#C9A84C'
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
          className="text-[10px] tracking-[0.3em] uppercase"
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
            background: 'linear-gradient(to bottom, #C9A84C, transparent)',
          }}
        />
      </motion.div>
    </section>
  )
}
