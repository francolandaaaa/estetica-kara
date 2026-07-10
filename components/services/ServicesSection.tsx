'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const SERVICES = [
  {
    number: '01',
    title: 'Corte de Cabello',
    description:
      'Cortes precisos y personalizados adaptados a la forma de tu rostro y a tu estilo de vida.',
    tags: 'Cabello corto · Medio · Largo',
    image: '/gallery/corte-1.jpg',
    accent: 'rgba(232,186,208,0.12)',
  },
  {
    number: '02',
    title: 'Tinte',
    description:
      'Coloración profesional con productos de alta gama. Desde tintes lisos hasta técnicas avanzadas.',
    tags: 'Coloración · Balayage · Mechas',
    image: '/gallery/tinte-1.jpg',
    accent: 'rgba(200,80,120,0.12)',
  },
  {
    number: '03',
    title: 'Peinado',
    description:
      'Estilos sofisticados para bodas, eventos especiales y ocasiones que exigen perfección.',
    tags: 'Eventos · Bodas · Graduaciones',
    image: '/gallery/peinado-1.jpg',
    accent: 'rgba(180,80,120,0.12)',
  },
  {
    number: '04',
    title: 'Tratamientos Capilares',
    description:
      'Nutrición profunda y restauración para un cabello sano, brillante y lleno de vitalidad.',
    tags: 'Keratina · Hidratación · Botox',
    image: '/gallery/tratamiento-1.jpg',
    accent: 'rgba(150,70,110,0.12)',
  },
]

const glassFront: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)',
}

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const [flipped, setFlipped] = useState<number | null>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.from(headRef.current, {
        y: 50,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="servicios"
      ref={sectionRef}
      className="py-28 px-6 md:px-12 lg:px-24"
      style={{ background: 'rgba(8,8,8,0.60)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div ref={headRef} className="mb-20 text-center">
          <p
            className="text-sm tracking-[0.35em] uppercase mb-4"
            style={{ color: '#E8BAD0' }}
          >
            Lo que ofrecemos
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
            Nuestros Servicios
          </h2>
          <div className="w-14 h-px mx-auto mt-6" style={{ background: '#E8BAD0' }} />
        </div>

        {/* Flip Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SERVICES.map((svc, i) => (
            <motion.div
              key={svc.number}
              initial={{ opacity: 0, y: 44 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ duration: 0.85, delay: i * 0.11 }}
              style={{ perspective: '1200px', height: '300px', cursor: 'pointer' }}
              onMouseEnter={() => setFlipped(i)}
              onMouseLeave={() => setFlipped(null)}
            >
              {/* Inner flip container */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                  transition: 'transform 0.75s cubic-bezier(0.4, 0.2, 0.2, 1)',
                  transform: flipped === i ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* ── Front face ── */}
                <div
                  style={{
                    ...glassFront,
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    gap: '0.25rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '3rem',
                      fontWeight: 300,
                      lineHeight: 1,
                      color: 'rgba(232,186,208,0.22)',
                    }}
                  >
                    {svc.number}
                  </span>

                  <h3
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
                      fontWeight: 300,
                      color: '#ffffff',
                      textAlign: 'center',
                      lineHeight: 1.15,
                      marginTop: '0.5rem',
                    }}
                  >
                    {svc.title}
                  </h3>

                  <div
                    style={{
                      width: '40px',
                      height: '1px',
                      background: 'rgba(232,186,208,0.55)',
                      margin: '0.85rem 0',
                    }}
                  />

                  <span
                    style={{
                      fontSize: '14px',
                      letterSpacing: '0.14em',
                      color: 'rgba(232,186,208,0.6)',
                      textAlign: 'center',
                    }}
                  >
                    {svc.tags}
                  </span>

                  {/* Hover hint */}
                  <span
                    style={{
                      fontSize: '11px',
                      letterSpacing: '0.2em',
                      color: 'rgba(255,255,255,0.18)',
                      textTransform: 'uppercase',
                      marginTop: '1.25rem',
                    }}
                  >
                    Ver portafolio →
                  </span>
                </div>

                {/* ── Back face ── */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    overflow: 'hidden',
                    border: '1px solid rgba(232,186,208,0.25)',
                  }}
                >
                  {/* Service image */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url('${svc.image}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: '#111',
                    }}
                  />

                  {/* Gradient overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.35) 55%, transparent 100%)',
                    }}
                  />

                  {/* Back content */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      padding: '2rem',
                      textAlign: 'center',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontSize: '1.8rem',
                        fontWeight: 300,
                        color: '#ffffff',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {svc.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '15px',
                        lineHeight: 1.65,
                        color: 'rgba(255,255,255,0.55)',
                        maxWidth: '320px',
                      }}
                    >
                      {svc.description}
                    </p>
                    <div
                      style={{
                        marginTop: '1rem',
                        fontSize: '12px',
                        letterSpacing: '0.18em',
                        color: 'rgba(232,186,208,0.7)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {svc.tags}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
