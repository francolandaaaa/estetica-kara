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
    let velocity = 0          // px accumulated per rAF, +down / -up
    let lastScrollY = window.scrollY
    let lastSeekAt = 0

    const scrollMax = () =>
      Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)

    // scroll 0% → introEndTime  |  scroll 100% → video end
    const getTarget = (sy: number) => {
      if (!video.duration) return introEndTime
      const p = Math.min(Math.max(sy / scrollMax(), 0), 1)
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
      lastScrollY = window.scrollY
      velocity = 0
    }, 4000)

    // ── Scroll: accumulate velocity between rAF frames ────────────────────
    const onScroll = () => {
      if (introActive) return
      const newY = window.scrollY
      velocity += newY - lastScrollY
      lastScrollY = newY
    }

    // ── Main loop ─────────────────────────────────────────────────────────
    const tick = () => {
      if (!introActive && video.readyState >= 2 && video.duration) {

        velocity *= 0.78   // coast decay: ~300 ms of natural momentum

        if (velocity > 0.8) {
          // ─── FORWARD ───────────────────────────────────────────────────
          // Rate proportional to scroll speed; floor 1.5x so the video
          // always shows several frames per gesture (never sub-frame steps).
          const rate = Math.min(Math.max(velocity * 0.12, 1.5), 4)
          video.playbackRate = rate
          if (!playing) {
            video.play().then(() => { playing = true }).catch(() => {})
          }
          // Hard-stop at last frame
          if (video.currentTime >= video.duration - 0.05) {
            video.currentTime = video.duration
            video.pause(); playing = false; velocity = 0
          }

        } else if (velocity < -0.8) {
          // ─── BACKWARD: rate-limited seeks (≤15/sec) ───────────────────
          if (playing) { video.pause(); playing = false }
          const now = performance.now()
          if (now - lastSeekAt > 67) {
            // Seek proportional to scroll speed (~3-6 video frames each)
            const secs = Math.abs(velocity) * (video.duration / scrollMax()) * 3
            const to = Math.max(introEndTime, video.currentTime - secs)
            video.currentTime = to
            lastSeekAt = now
          }

        } else {
          // ─── STOPPED ──────────────────────────────────────────────────
          // Gently correct position so scroll 0%=introEnd, 100%=videoEnd.
          const expected = getTarget(window.scrollY)
          const diff = expected - video.currentTime

          if (diff > 0.12) {
            // Softly play forward to catch up
            video.playbackRate = Math.min(diff * 4, 1.5)
            if (!playing) {
              video.play().then(() => { playing = true }).catch(() => {})
            }
          } else if (diff < -0.12) {
            // Softly seek backward
            if (playing) { video.pause(); playing = false }
            const now = performance.now()
            if (now - lastSeekAt > 200) {
              video.currentTime = Math.max(introEndTime, expected)
              lastSeekAt = now
            }
          } else {
            if (playing) { video.pause(); playing = false }
          }
        }
      }

      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    requestAnimationFrame(tick)

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
