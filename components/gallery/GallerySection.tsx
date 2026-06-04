'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { galleryImages, type GalleryImage } from './galleryData'

const CATEGORIES = ['Todos', 'Corte', 'Tinte', 'Peinado', 'Tratamiento']

const PLACEHOLDERS = [
  'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(5,5,5,1) 100%)',
  'linear-gradient(135deg, rgba(192,192,192,0.12) 0%, rgba(5,5,5,1) 100%)',
  'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(112,90,60,0.25) 100%)',
  'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(5,5,5,1) 100%)',
]

function GalleryCard({ image }: { image: GalleryImage }) {
  const [missing, setMissing] = useState(false)
  const gradient = PLACEHOLDERS[image.id % PLACEHOLDERS.length]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.48 }}
      className="relative overflow-hidden group cursor-pointer"
      style={{
        border: '1px solid rgba(255,255,255,0.06)',
        aspectRatio: '3/4',
      }}
    >
      {missing ? (
        <div className="absolute inset-0 flex items-end" style={{ background: gradient }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-4xl font-light"
              style={{ fontFamily: 'var(--font-cormorant)', color: 'rgba(201,168,76,0.3)' }}
            >
              {image.category}
            </span>
          </div>
        </div>
      ) : (
        <img
          src={image.src}
          alt={image.alt}
          onError={() => setMissing(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      )}

      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background: 'linear-gradient(to top, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.1) 60%, transparent 100%)' }}
      >
        <span
          className="text-xs tracking-widest uppercase mb-1"
          style={{ color: '#C9A84C' }}
        >
          {image.category}
        </span>
        <p className="text-white text-sm font-light">{image.alt}</p>
      </div>
    </motion.div>
  )
}

export default function GallerySection() {
  const [active, setActive] = useState('Todos')

  const filtered =
    active === 'Todos' ? galleryImages : galleryImages.filter(img => img.category === active)

  return (
    <section id="galeria" className="py-28 px-6 md:px-12 lg:px-24" style={{ background: 'rgba(5,5,5,0.90)' }}>
      <div className="max-w-6xl mx-auto">
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
            Nuestro trabajo
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
            Galería
          </h2>
          <div className="w-14 h-px mx-auto mt-6" style={{ background: '#C9A84C' }} />
        </motion.div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className="px-6 py-2 text-xs tracking-widest uppercase transition-all duration-350"
              style={
                active === cat
                  ? { background: '#C9A84C', color: '#050505' }
                  : {
                      background: 'transparent',
                      color: 'rgba(255,255,255,0.35)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }
              }
              onMouseEnter={e => {
                if (active !== cat) {
                  e.currentTarget.style.color = '#C9A84C'
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'
                }
              }}
              onMouseLeave={e => {
                if (active !== cat) {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(img => (
              <GalleryCard key={img.id} image={img} />
            ))}
          </AnimatePresence>
        </motion.div>

        <p
          className="text-center text-xs mt-10 tracking-wider"
          style={{ color: 'rgba(255,255,255,0.15)' }}
        >
          Añade tus fotos en /public/gallery/ y edita components/gallery/galleryData.ts
        </p>
      </div>
    </section>
  )
}
