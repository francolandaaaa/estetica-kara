'use client'

import { motion } from 'framer-motion'
import BookingForm from './BookingForm'

const glass = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.07)',
}

export default function BookingSection() {
  return (
    <section
      id="agendar"
      className="py-28 px-6 md:px-12 lg:px-24"
      style={{ background: 'rgba(8,8,8,0.90)' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85 }}
          className="mb-16 text-center"
        >
          <p
            className="text-xs tracking-[0.35em] uppercase mb-4"
            style={{ color: '#C9A84C' }}
          >
            Reserva tu lugar
          </p>
          <h2
            className="text-5xl md:text-6xl font-light text-white"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Agendar Cita
          </h2>
          <div className="w-14 h-px mx-auto mt-6 mb-6" style={{ background: '#C9A84C' }} />
          <p
            className="text-sm max-w-sm mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Completa el formulario y nos pondremos en contacto contigo para confirmar tu cita.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="p-8 md:p-12"
          style={glass}
        >
          <BookingForm />
        </motion.div>
      </div>
    </section>
  )
}
