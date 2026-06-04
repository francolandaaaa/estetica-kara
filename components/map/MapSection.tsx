'use client'

export default function MapSection() {
  return (
    <section
      id="ubicacion"
      className="py-24 px-6 md:px-12 lg:px-24"
      style={{ background: 'rgba(5,5,5,0.90)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="mb-14 text-center">
          <p
            className="text-xs tracking-[0.35em] uppercase mb-4"
            style={{ color: '#C9A84C' }}
          >
            Encuéntranos
          </p>
          <h2
            className="text-5xl md:text-6xl font-light"
            style={{
              fontFamily: 'var(--font-cormorant)',
              background: 'linear-gradient(135deg, #C9A84C 0%, #F0D890 45%, #C9A84C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Nuestra Ubicación
          </h2>
          <div className="w-14 h-px mx-auto mt-6" style={{ background: '#C9A84C' }} />
        </div>

        {/* Map wrapper */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '460px',
            border: '1px solid rgba(201,168,76,0.18)',
            overflow: 'hidden',
          }}
        >
          <iframe
            title="Ubicación NUDO Salón de Belleza"
            src="https://maps.google.com/maps?q=NUDO+Sal%C3%B3n+de+Belleza&output=embed&hl=es&z=15"
            width="100%"
            height="100%"
            style={{ border: 0, display: 'block', filter: 'grayscale(20%) contrast(1.05)' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Address strip below map */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 mt-5 px-6 py-4"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#C9A84C',
                flexShrink: 0,
              }}
            />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              NUDO Salón de Belleza — Tu ciudad, México
            </p>
          </div>
          <a
            href="https://maps.google.com/maps?q=NUDO+Sal%C3%B3n+de+Belleza"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-[0.2em] uppercase transition-colors duration-300"
            style={{ color: 'rgba(201,168,76,0.7)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(201,168,76,0.7)' }}
          >
            Abrir en Google Maps ↗
          </a>
        </div>
      </div>
    </section>
  )
}
