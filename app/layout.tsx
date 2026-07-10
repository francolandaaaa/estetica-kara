import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Cormorant_Garamond } from 'next/font/google'
import dynamic from 'next/dynamic'
import './globals.css'

const HairCanvas = dynamic(() => import('@/components/hero/HairCanvas'), { ssr: false })

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: 'NUDO Salón de Belleza',
  description: 'Experiencia de belleza premium. Agenda tu cita y transforma tu estilo.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geist.variable} ${cormorant.variable}`}>
      <body className="antialiased" style={{ background: '#050505', color: '#F5F5F5' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <HairCanvas />
        </div>
        {children}
      </body>
    </html>
  )
}
