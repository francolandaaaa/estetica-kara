'use client'

import { useEffect, useRef } from 'react'

const FPS = 24  // assumed video frame rate

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let raf: number
    let playing = false
    let introActive = true
    let lastScrollY = window.scrollY
    let burstEnd = 0  // video.currentTime target to play until

    // ── Intro: 4s autoplay ────────────────────────────────────────────────
    const startIntro = () => {
      video.currentTime = 0
      video.playbackRate = 1
      video.play().then(() => { playing = true }).catch(() => {})
    }

    if (video.readyState >= 3) startIntro()
    else video.addEventListener('canplay', startIntro, { once: true })

    const introTimeout = setTimeout(() => {
      introActive = false
      video.pause()
      playing = false
      burstEnd = video.currentTime  // scroll continues from this exact frame
    }, 4000)

    // ── Scroll: burst-play 3–6 frames depending on intensity ─────────────
    const onScroll = () => {
      if (introActive || !video.duration) return

      const newY = window.scrollY
      const delta = newY - lastScrollY
      lastScrollY = newY

      if (Math.abs(delta) < 1) return

      // Intensity: 0 at ≤20px delta, 1 at ≥120px delta
      const intensity = Math.min(Math.max((Math.abs(delta) - 20) / 100, 0), 1)
      const frames = 3 + intensity * 3          // 3–6 frames
      const burst = frames / FPS                 // seconds to play

      if (delta > 0) {
        // Forward: extend burst window and let video play at 1x (no seeks)
        burstEnd = Math.min(
          Math.max(burstEnd, video.currentTime) + burst,
          video.duration
        )
        if (video.paused) {
          video.playbackRate = 1
          video.play().then(() => { playing = true }).catch(() => {})
        }
      } else {
        // Backward: one seek back by the burst amount (single seek, not per-frame)
        const target = Math.max(0, video.currentTime - burst)
        if (playing) { video.pause(); playing = false }
        video.currentTime = target
        burstEnd = target
      }
    }

    // ── Tick: pause when burst is consumed ────────────────────────────────
    const tick = () => {
      if (!introActive && playing && video.currentTime >= burstEnd) {
        video.pause()
        playing = false
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
        objectPosition: 'center center',
        display: 'block',
        willChange: 'transform',
      }}
    >
      <source src="/video-fondo-kara.mp4" type="video/mp4" />
    </video>
  )
}
