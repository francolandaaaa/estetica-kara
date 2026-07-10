'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SERVICIOS = [
  'Corte de Cabello',
  'Tinte',
  'Balayage',
  'Mechas',
  'Peinado',
  'Tratamiento Capilar',
  'Keratina',
  'Otro',
]

const HORARIOS = [
  '9:00', '9:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
]

interface FormData {
  nombre: string
  telefono: string
  servicio: string
  fecha: string
  hora: string
  notas: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

const EMPTY: FormData = { nombre: '', telefono: '', servicio: '', fecha: '', hora: '', notas: '' }

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  borderBottom: '1px solid rgba(255,255,255,0.14)',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  padding: '10px 0',
  color: '#F5F5F5',
  fontSize: '16px',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: 'rgba(255,255,255,0.38)',
  fontSize: '12px',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  marginBottom: '8px',
}

function Field({
  label,
  children,
  span2 = false,
}: {
  label: string
  children: React.ReactNode
  span2?: boolean
}) {
  return (
    <div className={span2 ? 'md:col-span-2' : ''}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

export default function BookingForm() {
  const [form, setForm] = useState<FormData>(EMPTY)
  const [status, setStatus] = useState<Status>('idle')
  const [focused, setFocused] = useState<keyof FormData | null>(null)

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  const getFocusStyle = (field: keyof FormData): React.CSSProperties => ({
    ...inputStyle,
    borderBottomColor: focused === field ? '#E8BAD0' : 'rgba(255,255,255,0.14)',
    transition: 'border-color 0.3s',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setTimeout(() => {
        setForm(EMPTY)
        setStatus('idle')
      }, 5500)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <AnimatePresence mode="wait">
      {status === 'success' ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.6 }}
          className="text-center py-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 120 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-7"
            style={{ border: '1px solid #E8BAD0' }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.5"
              className="w-7 h-7"
              style={{ stroke: '#E8BAD0' }}
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </motion.div>
          <h3
            className="text-3xl font-light text-white mb-3"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Cita enviada
          </h3>
          <p className="text-base leading-relaxed max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Tu cita ha sido enviada. Nos pondremos en contacto contigo pronto.
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <Field label="Nombre">
            <input
              type="text"
              value={form.nombre}
              onChange={set('nombre')}
              onFocus={() => setFocused('nombre')}
              onBlur={() => setFocused(null)}
              placeholder="Tu nombre completo"
              required
              style={{
                ...getFocusStyle('nombre'),
                '::placeholder': { color: 'rgba(255,255,255,0.2)' },
              } as React.CSSProperties}
            />
          </Field>

          <Field label="Teléfono">
            <input
              type="tel"
              value={form.telefono}
              onChange={set('telefono')}
              onFocus={() => setFocused('telefono')}
              onBlur={() => setFocused(null)}
              placeholder="+52 55 1234 5678"
              required
              style={getFocusStyle('telefono')}
            />
          </Field>

          <Field label="Servicio">
            <select
              value={form.servicio}
              onChange={set('servicio')}
              onFocus={() => setFocused('servicio')}
              onBlur={() => setFocused(null)}
              required
              style={{
                ...getFocusStyle('servicio'),
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              <option value="" disabled style={{ background: '#0A0A0A' }}>
                Selecciona un servicio
              </option>
              {SERVICIOS.map(s => (
                <option key={s} value={s} style={{ background: '#0A0A0A' }}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Fecha">
            <input
              type="date"
              value={form.fecha}
              onChange={set('fecha')}
              onFocus={() => setFocused('fecha')}
              onBlur={() => setFocused(null)}
              min={minDate}
              required
              style={{
                ...getFocusStyle('fecha'),
                colorScheme: 'dark',
              }}
            />
          </Field>

          <Field label="Hora">
            <select
              value={form.hora}
              onChange={set('hora')}
              onFocus={() => setFocused('hora')}
              onBlur={() => setFocused(null)}
              required
              style={{
                ...getFocusStyle('hora'),
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              <option value="" disabled style={{ background: '#0A0A0A' }}>
                Selecciona un horario
              </option>
              {HORARIOS.map(h => (
                <option key={h} value={h} style={{ background: '#0A0A0A' }}>
                  {h}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Notas adicionales" span2>
            <textarea
              value={form.notas}
              onChange={set('notas')}
              onFocus={() => setFocused('notas')}
              onBlur={() => setFocused(null)}
              placeholder="Preferencias, alergias, información adicional..."
              rows={3}
              style={{
                ...getFocusStyle('notas'),
                resize: 'none',
                paddingTop: '10px',
              }}
            />
          </Field>

          {status === 'error' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="md:col-span-2 text-center text-sm"
              style={{ color: 'rgba(255,100,100,0.7)' }}
            >
              Hubo un error al enviar tu cita. Por favor intenta de nuevo.
            </motion.p>
          )}

          <div className="md:col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="relative overflow-hidden text-sm tracking-[0.3em] uppercase px-12 py-4 transition-colors duration-500 group"
              style={{ border: '1px solid #E8BAD0', color: '#E8BAD0' }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.background = '#E8BAD0'
                el.style.color = '#050505'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.background = 'transparent'
                el.style.color = '#E8BAD0'
              }}
            >
              {status === 'loading' ? 'Enviando...' : 'Agendar Cita'}
            </button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  )
}
