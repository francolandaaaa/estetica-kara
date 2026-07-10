'use client'

import { motion } from 'framer-motion'
import CalendarBooking from './CalendarBooking'

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
      style={{ background: 'rgba(8,8,8,0.60)' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.85 }}
          className="mb-16 text-center"
        >
          <p
            className="text-sm tracking-[0.35em] uppercase mb-4"
            style={{ color: '#E8BAD0' }}
          >
            Reserva tu lugar
          </p>
          <h2
            className="text-5xl md:text-6xl font-light"
            style={{
              fontFamily: 'var(--font-cormorant)',
              background: 'linear-gradient(135deg, #E8BAD0 0%, #F5D0E8 45%, #E8BAD0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Agendar Cita
          </h2>
          <div className="w-14 h-px mx-auto mt-6 mb-6" style={{ background: '#E8BAD0' }} />
          <p
            className="text-base max-w-sm mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Selecciona tu día, servicios y horario preferido.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="p-8 md:p-12"
          style={glass}
        >
          <CalendarBooking />
        </motion.div>
      </div>
    </section>
  )
}
