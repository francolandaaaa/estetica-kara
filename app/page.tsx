import HeroSection from '@/components/hero/HeroSection'
import ServicesSection from '@/components/services/ServicesSection'
import GallerySection from '@/components/gallery/GallerySection'
import BookingSection from '@/components/booking/BookingSection'
import MapSection from '@/components/map/MapSection'
import Footer from '@/components/footer/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import IntroReveal from '@/components/IntroReveal'

export default function Home() {
  return (
    <IntroReveal>
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
