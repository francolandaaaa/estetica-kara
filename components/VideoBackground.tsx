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
    let lastSeekAt = 0

    const scrollMax = () =>
      Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)

    // scroll 0% → introEndTime, scroll 100% → video end
    const getTarget = (sy: number) => {
      if (!video.duration) return introEndTime
      const progress = Math.min(Math.max(sy / scrollMax(), 0), 1)
      return introEndTime + progress * (video.duration - introEndTime)
    }

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
      introEndTime = video.currentTime   // freeze here — this becomes scroll-0 frame
      smoothScrollY = window.scrollY
    }, 4000)

    // ── Main loop ─────────────────────────────────────────────────────────
    const tick = () => {
      if (!introActive && video.readyState >= 2 && video.duration) {

        // Smooth inertia: follows real scroll with natural damping
        smoothScrollY += (window.scrollY - smoothScrollY) * 0.12
        smoothScrollY = Math.max(0, Math.min(scrollMax(), smoothScrollY))

        const target = getTarget(smoothScrollY)
        const diff = target - video.currentTime  // + = ahead, - = behind

        if (diff > 0.015) {
          // ── Forward: proportional rate, floor 1x so motion always feels
          //    natural. diff*50 → 1x at diff=20ms, 2x at 40ms, 4x at 80ms+
          const rate = Math.min(Math.max(diff * 50, 1), 4)
          video.playbackRate = rate
          if (!playing) {
            video.play().then(() => { playing = true }).catch(() => {})
          }

        } else if (diff < -0.04) {
          // ── Backward: pause + rate-limited seek (≤15/sec) so the decoder
          //    isn't flooded. Clamp to introEndTime so video never goes
          //    past the intro frame.
          if (playing) { video.pause(); playing = false }
          const now = performance.now()
          if (now - lastSeekAt > 67) {
            video.currentTime = Math.max(introEndTime, target)
            lastSeekAt = now
          }

        } else if (playing && diff < 0.003) {
          // ── At target: stop
          video.pause()
          playing = false
        }
        // Hysteresis 0.003–0.015: keep current state, prevents play/pause cycling
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
