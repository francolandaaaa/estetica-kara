import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Cormorant_Garamond } from 'next/font/google'
import VideoBackgroundClient from '@/components/VideoBackgroundClient'
import './globals.css'

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
  title: 'Estética Kara',
  description: 'Experiencia de belleza premium. Agenda tu cita y transforma tu estilo.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geist.variable} ${cormorant.variable}`}>
      <body className="antialiased" style={{ background: '#050505', color: '#F5F5F5' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <VideoBackgroundClient />
          {/* Gradient overlay: heavy at edges, lighter in center for cinematic look */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.30) 30%, rgba(5,5,5,0.30) 70%, rgba(5,5,5,0.65) 100%)',
          }} />
        </div>
        {children}
      </body>
    </html>
  )
}
