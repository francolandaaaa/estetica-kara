'use client'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="px-6 md:px-12 lg:px-24 py-16"
      style={{
        background: 'rgba(3,3,3,0.65)',
        borderTop: '1px solid rgba(232,186,208,0.1)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">
          {/* Brand */}
          <div>
            <h3
              className="text-3xl font-light mb-3 tracking-[0.25em]"
              style={{ fontFamily: 'var(--font-cormorant)', color: '#E8BAD0' }}
            >
              Estética Kara
            </h3>
            <p
              className="text-sm tracking-widest uppercase mb-5"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              Salón de Belleza
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Experiencia premium de belleza y estilo en un ambiente de lujo y elegancia.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-sm tracking-widest uppercase mb-6"
              style={{ color: 'rgba(232,186,208,0.65)' }}
            >
              Contacto
            </h4>
            <ul className="space-y-3 text-base" style={{ color: 'rgba(255,255,255,0.38)' }}>
              <li>
                <a
                  href="mailto:franco.landac@gmail.com"
                  className="transition-colors duration-300"
                  onMouseEnter={e => { e.currentTarget.style.color = '#E8BAD0' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.38)' }}
                >
                  franco.landac@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+525512345678"
                  className="transition-colors duration-300"
                  onMouseEnter={e => { e.currentTarget.style.color = '#E8BAD0' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.38)' }}
                >
                  +52 55 1234 5678
                </a>
              </li>
              <li style={{ color: 'rgba(255,255,255,0.25)' }}>Lun – Sáb: 9:00 – 19:00</li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4
              className="text-sm tracking-widest uppercase mb-6"
              style={{ color: 'rgba(232,186,208,0.65)' }}
            >
              Navegación
            </h4>
            <ul className="space-y-3 text-base" style={{ color: 'rgba(255,255,255,0.38)' }}>
              {[
                { label: 'Servicios', href: '#servicios' },
                { label: 'Galería', href: '#galeria' },
                { label: 'Agendar Cita', href: '#agendar' },
              ].map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors duration-300"
                    onMouseEnter={e => { e.currentTarget.style.color = '#E8BAD0' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.38)' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-sm tracking-wider" style={{ color: 'rgba(255,255,255,0.18)' }}>
            © {year} Estética Kara. Todos los derechos reservados.
          </p>
          <div className="flex gap-7">
            {['Instagram', 'Facebook', 'TikTok'].map(social => (
              <a
                key={social}
                href="#"
                className="text-sm tracking-wider transition-colors duration-300"
                style={{ color: 'rgba(255,255,255,0.22)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#E8BAD0' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.22)' }}
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
