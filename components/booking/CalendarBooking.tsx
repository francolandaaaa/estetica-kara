'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── constants ────────────────────────────────────────────────────────────────
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_ABBR = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const DAYS_FULL = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']

const SERVICIOS_LISTA = [
  { nombre: 'Corte de Cabello',    duracionDefault: 50  },
  { nombre: 'Tinte',               duracionDefault: 60  },
  { nombre: 'Balayage',            duracionDefault: 120 },
  { nombre: 'Mechas',              duracionDefault: 90  },
  { nombre: 'Peinado',             duracionDefault: 45  },
  { nombre: 'Tratamiento Capilar', duracionDefault: 60  },
  { nombre: 'Keratina',            duracionDefault: 90  },
  { nombre: 'Otro',                duracionDefault: 60  },
]

const DURACIONES = [30, 45, 60, 75, 90, 120]

// ─── types ────────────────────────────────────────────────────────────────────
interface DayCell { date: Date | null; disabled: boolean }
interface Availability { allSlots: string[]; busySlots: string[] }
type Step = 'date' | 'service' | 'time' | 'confirm'
export interface ServicioSeleccionado { nombre: string; duracion: number }
interface FormData { nombre: string; telefono: string }

// ─── helpers ─────────────────────────────────────────────────────────────────
function buildCalendar(year: number, month: number): DayCell[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const first = new Date(year, month, 1)
  const last  = new Date(year, month + 1, 0)
  const startOffset = (first.getDay() + 6) % 7
  const cells: DayCell[] = []
  for (let i = 0; i < startOffset; i++) cells.push({ date: null, disabled: true })
  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(year, month, d)
    date.setHours(0, 0, 0, 0)
    cells.push({ date, disabled: date < today || date.getDay() === 0 })
  }
  return cells
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
}

function displayDate(d: Date) {
  return `${DAYS_FULL[d.getDay()]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`
}

function formatDuracion(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  if (m === 0) return h === 1 ? '1 hora' : `${h} horas`
  return `${h}h ${m}min`
}

function totalMinutos(servicios: ServicioSeleccionado[]): number {
  return servicios.reduce((s, sv) => s + sv.duracion, 0)
}

// ─── shared styles ────────────────────────────────────────────────────────────
const GOLD = '#E8BAD0'
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}
const springTrans = { duration: 0.32, ease: [0.4, 0, 0.2, 1] as [number,number,number,number] }

// ─── StepIndicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'date',    label: 'Fecha'     },
    { key: 'service', label: 'Servicios' },
    { key: 'time',    label: 'Horario'   },
    { key: 'confirm', label: 'Confirmar' },
  ]
  const idx = steps.findIndex(s => s.key === current)

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40, userSelect: 'none' }}>
      {steps.map((s, i) => (
        <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <motion.div
              animate={{
                background: i < idx ? GOLD : i === idx ? 'rgba(232,186,208,0.14)' : 'transparent',
                borderColor: i <= idx ? GOLD : 'rgba(255,255,255,0.12)',
              }}
              transition={{ duration: 0.4 }}
              style={{
                width: 26, height: 26, borderRadius: '50%',
                border: '1px solid', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 11, flexShrink: 0,
                color: i <= idx ? GOLD : 'rgba(255,255,255,0.22)',
              }}
            >
              {i < idx ? '✓' : i + 1}
            </motion.div>
            <span style={{
              fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: i <= idx ? GOLD : 'rgba(255,255,255,0.22)',
              transition: 'color 0.4s', whiteSpace: 'nowrap',
            }}>
              {s.label}
            </span>
          </div>
          {i < 3 && (
            <motion.div
              animate={{ background: i < idx ? GOLD : 'rgba(255,255,255,0.1)' }}
              transition={{ duration: 0.4 }}
              style={{ width: 22, height: 1, margin: '0 4px', marginBottom: 20, flexShrink: 0 }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── MonthCalendar ───────────────────────────────────────────────────────────
function MonthCalendar({
  year, month, cells, selected, onPrev, onNext, onSelect,
}: {
  year: number; month: number; cells: DayCell[]
  selected: Date | null
  onPrev: () => void; onNext: () => void; onSelect: (d: Date) => void
}) {
  const today = new Date(); today.setHours(0,0,0,0)
  const [hovered, setHovered] = useState<number | null>(null)

  const now = new Date()
  const isPastMonth = year < now.getFullYear() || (year === now.getFullYear() && month <= now.getMonth())

  return (
    <div style={{ maxWidth: 440, margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onPrev}
          disabled={isPastMonth}
          style={{
            width: 38, height: 38, borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', cursor: isPastMonth ? 'default' : 'pointer',
            color: isPastMonth ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.5)',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!isPastMonth) (e.currentTarget.style.borderColor = 'rgba(232,186,208,0.5)') }}
          onMouseLeave={e => { (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)') }}
        >
          ←
        </button>

        <h3 style={{
          fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem',
          fontWeight: 300, letterSpacing: '0.2em', color: '#F5F5F5',
        }}>
          {MONTHS_ES[month].toUpperCase()} {year}
        </h3>

        <button
          onClick={onNext}
          style={{
            width: 38, height: 38, borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget.style.borderColor = 'rgba(232,186,208,0.5)') }}
          onMouseLeave={e => { (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)') }}
        >
          →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {DAYS_ABBR.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 11, letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '4px 0',
            color: d === 'Dom' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.25)',
          }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((cell, i) => {
          if (!cell.date) return <div key={i} />
          const isSelected = selected
            ? dateKey(cell.date) === dateKey(selected)
            : false
          const isToday   = cell.date.getTime() === today.getTime()
          const isHovered = hovered === i && !cell.disabled && !isSelected

          return (
            <motion.button
              key={i}
              whileTap={cell.disabled ? {} : { scale: 0.9 }}
              onClick={() => !cell.disabled && onSelect(cell.date!)}
              onMouseEnter={() => !cell.disabled && setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                aspectRatio: '1', borderRadius: 8, fontSize: 14,
                fontWeight: isSelected ? 600 : 300,
                cursor: cell.disabled ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s ease',
                background: isSelected ? GOLD
                  : isHovered ? 'rgba(232,186,208,0.12)'
                  : 'transparent',
                border: isSelected ? 'none'
                  : isToday ? `1px solid rgba(232,186,208,0.65)`
                  : isHovered ? '1px solid rgba(232,186,208,0.45)'
                  : '1px solid transparent',
                color: isSelected ? '#050505'
                  : cell.disabled ? 'rgba(255,255,255,0.1)'
                  : isToday || isHovered ? GOLD
                  : 'rgba(255,255,255,0.7)',
              }}
            >
              {cell.date.getDate()}
            </motion.button>
          )
        })}
      </div>

      <p style={{ marginTop: 18, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.05em' }}>
        Domingos cerrado · Selecciona un día disponible
      </p>
    </div>
  )
}

// ─── ServicePicker ───────────────────────────────────────────────────────────
function ServicePicker({
  date,
  servicios,
  onAdd,
  onRemove,
  onContinue,
  onBack,
}: {
  date: Date
  servicios: ServicioSeleccionado[]
  onAdd: (s: ServicioSeleccionado) => void
  onRemove: (i: number) => void
  onContinue: () => void
  onBack: () => void
}) {
  const [showForm, setShowForm]           = useState(servicios.length === 0)
  const [pendingNombre,   setPendingNombre]   = useState('')
  const [pendingDuracion, setPendingDuracion] = useState(0)
  const [errors, setErrors]               = useState<{ nombre?: boolean; duracion?: boolean }>({})

  // If all services are removed, re-show the form
  useEffect(() => {
    if (servicios.length === 0) setShowForm(true)
  }, [servicios.length])

  const total      = totalMinutos(servicios)
  const canAddMore = servicios.length < 4

  function handleSelectServicio(nombre: string) {
    setPendingNombre(nombre)
    const def = SERVICIOS_LISTA.find(s => s.nombre === nombre)?.duracionDefault ?? 60
    setPendingDuracion(def)
    setErrors(prev => ({ ...prev, nombre: false }))
  }

  function handleAdd() {
    const errs: typeof errors = {}
    if (!pendingNombre)   errs.nombre   = true
    if (!pendingDuracion) errs.duracion = true
    if (Object.keys(errs).length) { setErrors(errs); return }
    onAdd({ nombre: pendingNombre, duracion: pendingDuracion })
    setPendingNombre('')
    setPendingDuracion(0)
    setErrors({})
    setShowForm(false)
  }

  const selectSt: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8, padding: '12px 16px',
    color: '#F5F5F5', fontSize: 15, outline: 'none',
    cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.35)', fontSize: 13, letterSpacing: '0.1em',
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
          padding: 0, transition: 'color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = GOLD }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
      >
        ← Cambiar fecha
      </button>

      <p style={{
        fontFamily: 'var(--font-cormorant)', fontSize: '1.45rem',
        fontWeight: 300, color: GOLD, letterSpacing: '0.1em', marginBottom: 24,
      }}>
        {displayDate(date)}
      </p>

      {/* Selected services list */}
      {servicios.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{
            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)', marginBottom: 12,
          }}>
            Servicios seleccionados
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {servicios.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(232,186,208,0.07)',
                  border: '1px solid rgba(232,186,208,0.2)',
                  borderRadius: 8, padding: '12px 16px',
                }}
              >
                <div>
                  <p style={{ color: '#F5F5F5', fontSize: 14 }}>{s.nombre}</p>
                  <p style={{ color: 'rgba(232,186,208,0.75)', fontSize: 12, marginTop: 3 }}>
                    {formatDuracion(s.duracion)}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(i)}
                  style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4, color: 'rgba(255,255,255,0.35)', cursor: 'pointer',
                    width: 28, height: 28, fontSize: 12, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,100,100,0.5)'
                    e.currentTarget.style.color = 'rgba(255,100,100,0.8)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
                  }}
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </div>

          {/* Total */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTop: '1px solid rgba(232,186,208,0.15)', paddingTop: 12,
          }}>
            <span style={{
              fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.38)',
            }}>
              Duración total estimada
            </span>
            <span style={{
              color: GOLD, fontFamily: 'var(--font-cormorant)',
              fontSize: '1.25rem', fontWeight: 300, letterSpacing: '0.05em',
            }}>
              {formatDuracion(total)}
            </span>
          </div>
        </div>
      )}

      {/* Service form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            style={{ marginBottom: 20 }}
          >
            <p style={{
              fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)', marginBottom: 16,
            }}>
              {servicios.length === 0 ? 'Selecciona tu servicio' : 'Agregar otro servicio'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Servicio */}
              <select
                value={pendingNombre}
                onChange={e => handleSelectServicio(e.target.value)}
                style={{
                  ...selectSt,
                  borderColor: errors.nombre ? 'rgba(255,100,100,0.6)' : 'rgba(255,255,255,0.12)',
                  color: pendingNombre ? '#F5F5F5' : 'rgba(255,255,255,0.38)',
                }}
              >
                <option value="" disabled style={{ background: '#0A0A0A' }}>Selecciona un servicio</option>
                {SERVICIOS_LISTA.map(s => (
                  <option key={s.nombre} value={s.nombre} style={{ background: '#0A0A0A', color: '#F5F5F5' }}>
                    {s.nombre}
                  </option>
                ))}
              </select>

              {/* Duración */}
              <select
                value={pendingDuracion || ''}
                onChange={e => {
                  setPendingDuracion(Number(e.target.value))
                  setErrors(prev => ({ ...prev, duracion: false }))
                }}
                style={{
                  ...selectSt,
                  borderColor: errors.duracion ? 'rgba(255,100,100,0.6)' : 'rgba(255,255,255,0.12)',
                  color: pendingDuracion ? '#F5F5F5' : 'rgba(255,255,255,0.38)',
                }}
              >
                <option value="" disabled style={{ background: '#0A0A0A' }}>Tiempo estimado</option>
                {DURACIONES.map(d => (
                  <option key={d} value={d} style={{ background: '#0A0A0A', color: '#F5F5F5' }}>
                    {formatDuracion(d)}
                  </option>
                ))}
              </select>

              {(errors.nombre || errors.duracion) && (
                <p style={{ color: 'rgba(255,100,100,0.75)', fontSize: 12, letterSpacing: '0.04em' }}>
                  Por favor selecciona el servicio y el tiempo estimado.
                </p>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleAdd}
                  style={{
                    flex: 1, padding: '12px 0',
                    border: `1px solid ${GOLD}`, background: 'transparent',
                    color: GOLD, fontSize: 13, letterSpacing: '0.2em',
                    textTransform: 'uppercase', cursor: 'pointer',
                    borderRadius: 4, transition: 'all 0.25s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = GOLD
                    e.currentTarget.style.color = '#050505'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = GOLD
                  }}
                >
                  Agregar Servicio
                </button>
                {servicios.length > 0 && (
                  <button
                    onClick={() => { setShowForm(false); setErrors({}) }}
                    style={{
                      padding: '12px 20px', flexShrink: 0,
                      border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                      color: 'rgba(255,255,255,0.4)', fontSize: 13,
                      cursor: 'pointer', borderRadius: 4, transition: 'all 0.25s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                      e.currentTarget.style.color = '#F5F5F5'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons once at least one service selected and form is hidden */}
      {!showForm && servicios.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {canAddMore && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                width: '100%', padding: '12px 0',
                border: '1px dashed rgba(232,186,208,0.4)', background: 'transparent',
                color: 'rgba(232,186,208,0.75)', fontSize: 13, letterSpacing: '0.15em',
                textTransform: 'uppercase', cursor: 'pointer',
                borderRadius: 4, transition: 'all 0.25s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = GOLD
                e.currentTarget.style.color = GOLD
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(232,186,208,0.4)'
                e.currentTarget.style.color = 'rgba(232,186,208,0.75)'
              }}
            >
              + Agregar otro servicio
              <span style={{ fontSize: 11, opacity: 0.65, marginLeft: 8 }}>
                ({4 - servicios.length} restante{4 - servicios.length !== 1 ? 's' : ''})
              </span>
            </button>
          )}

          <button
            onClick={onContinue}
            style={{
              width: '100%', padding: '14px 0',
              border: `1px solid ${GOLD}`, background: 'transparent',
              color: GOLD, fontSize: 13, letterSpacing: '0.3em',
              textTransform: 'uppercase', cursor: 'pointer',
              borderRadius: 2, transition: 'all 0.35s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = GOLD
              e.currentTarget.style.color = '#050505'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = GOLD
            }}
          >
            Seleccionar Horario →
          </button>
        </div>
      )}
    </div>
  )
}

// ─── TimeSlotPicker ──────────────────────────────────────────────────────────
function TimeSlotPicker({
  date, duracionTotal, availability, loading, selected, onSelect, onBack,
}: {
  date: Date; duracionTotal: number; availability: Availability | null; loading: boolean
  selected: string | null; onSelect: (t: string) => void; onBack: () => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.35)', fontSize: 13, letterSpacing: '0.1em',
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
          padding: 0, transition: 'color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = GOLD }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
      >
        ← Cambiar servicios
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
        <p style={{
          fontFamily: 'var(--font-cormorant)', fontSize: '1.45rem',
          fontWeight: 300, color: GOLD, letterSpacing: '0.1em',
        }}>
          {displayDate(date)}
        </p>
        <span style={{
          fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em',
          border: '1px solid rgba(232,186,208,0.2)', borderRadius: 4,
          padding: '4px 10px', whiteSpace: 'nowrap',
        }}>
          Duración: {formatDuracion(duracionTotal)}
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{
              height: 60, borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
              animation: `skeleton-pulse 1.5s ease-in-out ${i * 0.07}s infinite`,
            }} />
          ))}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {(availability?.allSlots ?? []).map(slot => {
              const isBusy     = availability?.busySlots.includes(slot) ?? false
              const isSelected = selected === slot
              const isHov      = hovered === slot && !isBusy && !isSelected

              return (
                <motion.button
                  key={slot}
                  whileTap={isBusy ? {} : { scale: 0.95 }}
                  onClick={() => !isBusy && onSelect(slot)}
                  onMouseEnter={() => !isBusy && setHovered(slot)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    padding: '14px 8px', borderRadius: 8, textAlign: 'center',
                    cursor: isBusy ? 'not-allowed' : 'pointer',
                    transition: 'all 0.18s ease',
                    background: isSelected ? GOLD
                      : isHov ? 'rgba(232,186,208,0.14)'
                      : isBusy ? 'rgba(255,255,255,0.025)'
                      : 'rgba(232,186,208,0.05)',
                    border: isSelected ? 'none'
                      : isHov ? `1px solid ${GOLD}`
                      : isBusy ? '1px solid rgba(255,255,255,0.05)'
                      : '1px solid rgba(232,186,208,0.28)',
                    color: isSelected ? '#050505'
                      : isHov ? GOLD
                      : isBusy ? 'rgba(255,255,255,0.18)'
                      : 'rgba(255,255,255,0.78)',
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: isSelected ? 600 : 300, letterSpacing: '0.05em' }}>
                    {slot}
                  </div>
                  {isBusy && (
                    <div style={{
                      fontSize: 10, letterSpacing: '0.15em', marginTop: 3,
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)',
                    }}>
                      Ocupado
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.28)' }}>
            <span className="flex items-center gap-1.5">
              <span style={{ width: 10, height: 10, borderRadius: 2, display: 'inline-block', border: '1px solid rgba(232,186,208,0.5)', background: 'rgba(232,186,208,0.05)' }} />
              Disponible
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ width: 10, height: 10, borderRadius: 2, display: 'inline-block', background: 'rgba(255,255,255,0.05)' }} />
              Ocupado
            </span>
          </div>
        </>
      )}
    </div>
  )
}

// ─── ConfirmForm ─────────────────────────────────────────────────────────────
function ConfirmForm({
  date, time, servicios, form, onChange, onBack, onSubmit, status,
}: {
  date: Date; time: string
  servicios: ServicioSeleccionado[]
  form: FormData
  onChange: (f: FormData) => void
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
  status: 'idle' | 'loading' | 'error'
}) {
  const [focused, setFocused] = useState<string | null>(null)
  const total = totalMinutos(servicios)

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...form, [k]: e.target.value })

  const fieldStyle = (field: string): React.CSSProperties => ({
    width: '100%', background: 'transparent',
    border: 'none', borderBottom: `1px solid ${focused === field ? GOLD : 'rgba(255,255,255,0.14)'}`,
    padding: '10px 0', color: '#F5F5F5', fontSize: 16, outline: 'none',
    transition: 'border-color 0.3s',
  })

  const labelStyle: React.CSSProperties = {
    display: 'block', color: 'rgba(255,255,255,0.38)',
    fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 8,
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.35)', fontSize: 13, letterSpacing: '0.1em',
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, padding: 0,
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = GOLD }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
      >
        ← Cambiar horario
      </button>

      {/* Booking summary */}
      <div style={{
        background: 'rgba(232,186,208,0.06)', border: '1px solid rgba(232,186,208,0.2)',
        borderRadius: 10, padding: '20px 24px', marginBottom: 32,
      }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: 14 }}>
          Resumen de tu cita
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontWeight: 300, color: '#F5F5F5' }}>
              {displayDate(date)}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 4, letterSpacing: '0.05em' }}>
              Duración estimada: {formatDuracion(total)}
            </p>
          </div>
          <div style={{
            fontFamily: 'var(--font-cormorant)', fontSize: '2rem',
            fontWeight: 300, color: GOLD, letterSpacing: '0.05em', textAlign: 'right',
          }}>
            {time} <span style={{ fontSize: '0.9rem', color: 'rgba(232,186,208,0.6)' }}>hrs</span>
          </div>
        </div>

        {/* Services list */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
          {servicios.map((s, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: i < servicios.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{s.nombre}</span>
              <span style={{ color: 'rgba(232,186,208,0.65)', fontSize: 12 }}>{formatDuracion(s.duracion)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div>
          <label style={labelStyle}>Nombre</label>
          <input
            type="text" required value={form.nombre} onChange={set('nombre')}
            onFocus={() => setFocused('nombre')} onBlur={() => setFocused(null)}
            placeholder="Tu nombre completo"
            style={fieldStyle('nombre')}
          />
        </div>

        <div>
          <label style={labelStyle}>Teléfono</label>
          <input
            type="tel" required value={form.telefono} onChange={set('telefono')}
            onFocus={() => setFocused('telefono')} onBlur={() => setFocused(null)}
            placeholder="+52 55 1234 5678"
            style={fieldStyle('telefono')}
          />
        </div>

        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', color: 'rgba(255,100,100,0.7)', fontSize: 13 }}
          >
            Hubo un error al agendar. Por favor intenta de nuevo.
          </motion.p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              padding: '14px 48px', border: `1px solid ${GOLD}`, color: GOLD,
              background: 'transparent', fontSize: 14, letterSpacing: '0.3em',
              textTransform: 'uppercase', cursor: status === 'loading' ? 'wait' : 'pointer',
              transition: 'all 0.35s ease', borderRadius: 2,
            }}
            onMouseEnter={e => { if (status !== 'loading') { e.currentTarget.style.background = GOLD; e.currentTarget.style.color = '#050505' }}}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = GOLD }}
          >
            {status === 'loading' ? 'Agendando...' : 'Confirmar Cita'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── SuccessView ─────────────────────────────────────────────────────────────
function SuccessView({
  date, time, nombre, servicios,
}: {
  date: Date; time: string; nombre: string; servicios: ServicioSeleccionado[]
}) {
  const total = totalMinutos(servicios)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ textAlign: 'center', padding: '40px 0' }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 120, delay: 0.1 }}
        style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 28px',
          border: `1px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" width="32" height="32" style={{ stroke: GOLD }}>
          <polyline points="20,6 9,17 4,12" />
        </svg>
      </motion.div>

      <h3 style={{
        fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300,
        color: '#F5F5F5', letterSpacing: '0.1em', marginBottom: 8,
      }}>
        ¡Cita confirmada!
      </h3>
      <p style={{ color: GOLD, fontSize: 14, marginBottom: 28, letterSpacing: '0.05em' }}>
        Te esperamos, {nombre}
      </p>

      <div style={{
        display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 0,
        background: 'rgba(232,186,208,0.07)', border: '1px solid rgba(232,186,208,0.2)',
        borderRadius: 10, padding: '20px 40px', minWidth: 240,
      }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.05em', marginBottom: 4 }}>
          {displayDate(date)}
        </p>
        <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.5rem', fontWeight: 300, color: GOLD, marginBottom: 4 }}>
          {time} <span style={{ fontSize: '1rem', color: 'rgba(232,186,208,0.55)' }}>hrs</span>
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
          {formatDuracion(total)} · {servicios.map(s => s.nombre).join(', ')}
        </p>
      </div>

      <p style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>
        Te contactaremos para confirmar tu cita
      </p>
    </motion.div>
  )
}

// ─── CalendarBooking (main) ───────────────────────────────────────────────────
export default function CalendarBooking() {
  const now = new Date()

  const [step,         setStep]         = useState<Step>('date')
  const [viewYear,     setViewYear]     = useState(now.getFullYear())
  const [viewMonth,    setViewMonth]    = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [servicios,    setServicios]    = useState<ServicioSeleccionado[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [form,         setForm]         = useState<FormData>({ nombre: '', telefono: '' })
  const [status,       setStatus]       = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [direction,    setDirection]    = useState(1)

  const cells = buildCalendar(viewYear, viewMonth)
  const total = totalMinutos(servicios)

  // Fetch availability when entering the time step
  useEffect(() => {
    if (step !== 'time' || !selectedDate) return
    setLoadingSlots(true)
    setAvailability(null)
    fetch(`/api/calendar/availability?date=${dateKey(selectedDate)}&duration=${total}`)
      .then(r => r.json())
      .then(data => setAvailability(data))
      .catch(() => setAvailability({ allSlots: [], busySlots: [] }))
      .finally(() => setLoadingSlots(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedDate])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function selectDate(date: Date) {
    setSelectedDate(date)
    setServicios([])
    setSelectedTime(null)
    setDirection(1)
    setStep('service')
  }

  function proceedToTime() {
    setSelectedTime(null)
    setDirection(1)
    setStep('time')
  }

  function selectTime(time: string) {
    setSelectedTime(time)
    setDirection(1)
    setStep('confirm')
  }

  function goBack() {
    setDirection(-1)
    if (step === 'service') setStep('date')
    if (step === 'time')    setStep('service')
    if (step === 'confirm') setStep('time')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/calendar/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateKey(selectedDate!),
          time: selectedTime,
          nombre: form.nombre,
          telefono: form.telefono,
          servicios,
          duracionTotal: total,
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  if (status === 'success') {
    return (
      <SuccessView
        date={selectedDate!}
        time={selectedTime!}
        nombre={form.nombre}
        servicios={servicios}
      />
    )
  }

  return (
    <div>
      <StepIndicator current={step} />

      <AnimatePresence mode="wait" custom={direction}>
        {step === 'date' && (
          <motion.div key="date" custom={direction}
            variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={springTrans}
          >
            <MonthCalendar
              year={viewYear} month={viewMonth} cells={cells}
              selected={selectedDate}
              onPrev={prevMonth} onNext={nextMonth} onSelect={selectDate}
            />
          </motion.div>
        )}

        {step === 'service' && (
          <motion.div key="service" custom={direction}
            variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={springTrans}
          >
            <ServicePicker
              date={selectedDate!}
              servicios={servicios}
              onAdd={s => setServicios(prev => [...prev, s])}
              onRemove={i => setServicios(prev => prev.filter((_, idx) => idx !== i))}
              onContinue={proceedToTime}
              onBack={goBack}
            />
          </motion.div>
        )}

        {step === 'time' && (
          <motion.div key="time" custom={direction}
            variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={springTrans}
          >
            <TimeSlotPicker
              date={selectedDate!}
              duracionTotal={total}
              availability={availability}
              loading={loadingSlots}
              selected={selectedTime}
              onSelect={selectTime}
              onBack={goBack}
            />
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div key="confirm" custom={direction}
            variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={springTrans}
          >
            <ConfirmForm
              date={selectedDate!}
              time={selectedTime!}
              servicios={servicios}
              form={form}
              onChange={setForm}
              onBack={goBack}
              onSubmit={handleSubmit}
              status={status}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
