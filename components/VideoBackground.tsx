'use client'

import { useEffect, useRef } from 'react'

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let raf: number
    let introActive = true
    let lastScrollY = window.scrollY
    let smoothScrollY = lastScrollY
    let velocity = 0
    let lastSeekAt = 0

    const getTarget = (sy: number) => {
      if (!video.duration) return 0
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight
      return Math.min(sy / Math.max(scrollMax, 1), 1) * video.duration
    }

    // Intro: play for 2s on load (muted autoplay always works)
    const startIntro = () => {
      video.currentTime = 0
      video.playbackRate = 1
      video.play().catch(() => {})
    }

    if (video.readyState >= 3) {
      startIntro()
    } else {
      video.addEventListener('canplay', startIntro, { once: true })
    }

    const introTimeout = setTimeout(() => {
      introActive = false
      video.pause()
      smoothScrollY = window.scrollY
      lastScrollY = window.scrollY
      video.currentTime = getTarget(window.scrollY)
    }, 2000)

    const onScroll = () => {
      const newY = window.scrollY
      velocity = newY - lastScrollY
      lastScrollY = newY
    }

    const tick = () => {
      if (!introActive && video.readyState >= 2 && video.duration) {
        // Apply scroll momentum
        smoothScrollY += velocity * 0.4
        velocity *= 0.82
        const scrollMax = document.documentElement.scrollHeight - window.innerHeight
        smoothScrollY = Math.max(0, Math.min(scrollMax, smoothScrollY))

        const targetTime = getTarget(smoothScrollY)
        const diff = targetTime - video.currentTime

        if (diff > 0.02) {
          // Forward: use playbackRate — video plays natively, zero seeks, perfectly smooth
          const rate = Math.min(Math.max(diff * 7, 0.75), 4)
          if (video.paused) video.play().catch(() => {})
          video.playbackRate = rate
        } else if (diff < -0.05) {
          // Backward: rate-limited seek to avoid decoder overload
          if (!video.paused) video.pause()
          const now = performance.now()
          if (now - lastSeekAt > 80) {
            video.currentTime = Math.max(0, targetTime)
            lastSeekAt = now
          }
        } else {
          // At target: stop
          if (!video.paused) video.pause()
        }
      }

      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      clearTimeout(introTimeout)
      window.removeEventListener('scroll', onScroll)
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
        objectPosition: 'center top',
        display: 'block',
        willChange: 'transform',
      }}
    >
      <source src="/video-fondo-kara.mp4" type="video/mp4" />
    </video>
  )
}
