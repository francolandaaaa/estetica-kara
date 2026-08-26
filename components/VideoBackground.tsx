'use client'

import { useEffect, useRef } from 'react'

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let targetTime = 0
    let smoothTime = 0
    let lastTimestamp = 0
    let raf: number

    // Preload aggressively
    video.preload = 'auto'
    video.load()

    const updateTarget = () => {
      if (!video.duration) return
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollMax > 0 ? Math.min(window.scrollY / scrollMax, 1) : 0
      // Ease-in-out for more cinematic feel at start/end
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2
      targetTime = eased * video.duration
    }

    const tick = (timestamp: number) => {
      const dt = lastTimestamp ? Math.min((timestamp - lastTimestamp) / 1000, 0.1) : 0.016
      lastTimestamp = timestamp

      if (video.readyState >= 2 && video.duration) {
        // Frame-rate independent lerp: decay = 1 - pow(0.001, dt) ≈ smooth at any fps
        const decay = 1 - Math.pow(0.001, dt)
        smoothTime += (targetTime - smoothTime) * decay

        const diff = Math.abs(smoothTime - video.currentTime)
        if (diff > 0.005) {
          video.currentTime = smoothTime
        }
      }
      raf = requestAnimationFrame(tick)
    }

    updateTarget()
    window.addEventListener('scroll', updateTarget, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', updateTarget)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      preload="auto"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        willChange: 'transform',
      }}
    >
      <source src="/video-fondo-kara.mp4" type="video/mp4" />
    </video>
  )
}
