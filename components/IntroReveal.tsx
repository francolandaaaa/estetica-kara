'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function IntroReveal({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    // Scissors cut solo for 2.8 s, then page fades in
    const t = setTimeout(() => setRevealed(true), 2800)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: revealed ? 1 : 0 }}
      transition={{ duration: 1.1, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}
