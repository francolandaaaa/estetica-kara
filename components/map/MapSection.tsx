'use client'

export default function MapSection() {
  return (
    <section
      id="ubicacion"
      className="py-24 px-6 md:px-12 lg:px-24"
      style={{ background: 'rgba(5,5,5,0.60)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="mb-14 text-center">
          <p
            className="text-sm tracking-[0.35em] uppercase mb-4"
            style={{ color: '#E8BAD0' }}
          >
            Encuéntranos
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
            Nuestra Ubicación
          </h2>
          <div className="w-14 h-px mx-auto mt-6" style={{ background: '#E8BAD0' }} />
        </div>

        {/* Map wrapper */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '460px',
            border: '1px solid rgba(232,186,208,0.18)',
            overflow: 'hidden',
          }}
        >
          <iframe
            title="Ubicación Estética Kara"
            src="https://maps.google.com/maps?q=Est%C3%A9tica+Kara&output=embed&hl=es&z=15"
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
                background: '#E8BAD0',
                flexShrink: 0,
              }}
            />
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Estética Kara — Tu ciudad, México
            </p>
          </div>
          <a
            href="https://maps.google.com/maps?q=Est%C3%A9tica+Kara"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm tracking-[0.2em] uppercase transition-colors duration-300"
            style={{ color: 'rgba(232,186,208,0.7)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#E8BAD0' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(232,186,208,0.7)' }}
          >
            Abrir en Google Maps ↗
          </a>
        </div>
      </div>
    </section>
  )
}
