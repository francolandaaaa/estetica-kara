import dynamic from 'next/dynamic'
import HeroSection from '@/components/hero/HeroSection'
import ServicesSection from '@/components/services/ServicesSection'
import GallerySection from '@/components/gallery/GallerySection'
import BookingSection from '@/components/booking/BookingSection'
import MapSection from '@/components/map/MapSection'
import Footer from '@/components/footer/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import IntroReveal from '@/components/IntroReveal'

const HairCanvas = dynamic(() => import('@/components/hero/HairCanvas'), { ssr: false })

export default function Home() {
  return (
    <IntroReveal>
      {/* Fixed hair animation — behind everything */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <HairCanvas />
      </div>
      {/* All sections sit on top with semi-transparent backgrounds */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection />
        <ServicesSection />
        <GallerySection />
        <BookingSection />
        <MapSection />
        <Footer />
        <WhatsAppButton />
      </main>
    </IntroReveal>
  )
}
