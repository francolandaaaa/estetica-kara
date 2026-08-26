'use client'

import { useEffect, useRef } from 'react'

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let raf: number
    let introActive = true
    let introEndTime = 0
    let playing = false
    let smoothScrollY = window.scrollY
    let prevScrollY = window.scrollY
    let lastSeekAt = 0

    const getScrollMax = () =>
      Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)

    // scroll 0% → introEndTime  |  scroll 100% → video.duration
    const getTarget = (sy: number) => {
      if (!video.duration) return introEndTime
      const p = Math.min(Math.max(sy / getScrollMax(), 0), 1)
      return introEndTime + p * (video.duration - introEndTime)
    }

    // ── Intro: 4 s autoplay ───────────────────────────────────────────────
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
      introEndTime = video.currentTime   // this frame = scroll 0%
      smoothScrollY = window.scrollY
      prevScrollY = window.scrollY
    }, 4000)

    // ── Main loop ─────────────────────────────────────────────────────────
    const tick = () => {
      if (!introActive && video.readyState >= 2 && video.duration) {
        const currentScrollY = window.scrollY

        // Detect real upward scroll (1 px hysteresis to ignore tiny jitter)
        const scrollingUp = currentScrollY < prevScrollY - 1
        prevScrollY = currentScrollY

        // Smooth follow: lerp toward real scrollY (coast ~12 frames = 200 ms)
        smoothScrollY += (currentScrollY - smoothScrollY) * 0.15
        smoothScrollY = Math.max(0, Math.min(getScrollMax(), smoothScrollY))

        const target = getTarget(smoothScrollY)
        const diff = target - video.currentTime   // + → need to go forward

        if (diff > 0.012) {
          // ── FORWARD ────────────────────────────────────────────────────
          // Rate scales with how far behind we are.
          // Floor 2x: always shows ≥2 new video frames per display frame
          // so the motion always feels natural, never sub-frame.
          const rate = Math.min(Math.max(diff * 25, 2), 4)
          video.playbackRate = rate
          if (!playing) {
            playing = true                          // set before async play()
            video.play().catch(() => { playing = false })
          }

        } else if (scrollingUp && diff < -0.05) {
          // ── BACKWARD: only when user is actively scrolling up ──────────
          // Never fires as an automatic correction → eliminates resets.
          if (playing) { video.pause(); playing = false }
          const now = performance.now()
          if (now - lastSeekAt > 67) {             // ≤15 seeks / sec
            video.currentTime = Math.max(introEndTime, target)
            lastSeekAt = now
          }

        } else if (playing && diff < 0.003) {
          // ── AT TARGET: stop ────────────────────────────────────────────
          video.pause()
          playing = false
        }
        // Hysteresis zone 0.003 – 0.012: keep current state → no cycling
      }

      raf = requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)

    return () => {
      clearTimeout(introTimeout)
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
