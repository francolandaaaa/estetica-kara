'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function IntroReveal({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    // Prevent browser from jumping to URL hash (#agendar, etc.) or restoring
    // scroll position on reload — both are default browser behaviors.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    // behavior:'instant' overrides css scroll-behavior:smooth (spec-mandated)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    const t = setTimeout(() => setRevealed(true), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: revealed ? 1 : 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}
