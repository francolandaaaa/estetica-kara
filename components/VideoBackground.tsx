'use client'

import { useEffect, useRef } from 'react'

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let raf: number
    let introActive = true
    let introEndTime = 0  // video.currentTime when intro finishes
    let lastScrollY = window.scrollY
    let smoothScrollY = lastScrollY
    let velocity = 0
    let playing = false

    const scrollMax = () =>
      Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)

    // After intro, scroll [0 → scrollMax] maps to video [introEndTime → end]
    // so the video continues exactly from where the intro left off.
    const getTarget = (sy: number) => {
      if (!video.duration) return introEndTime
      const progress = Math.min(sy / scrollMax(), 1)
      return introEndTime + progress * (video.duration - introEndTime)
    }

    // ── Intro: 4s autoplay on load ──────────────────────────────────────────
    const startIntro = () => {
      video.currentTime = 0
      video.playbackRate = 1
      video.play().then(() => { playing = true }).catch(() => {})
    }

    if (video.readyState >= 3) {
      startIntro()
    } else {
      video.addEventListener('canplay', startIntro, { once: true })
    }

    const introTimeout = setTimeout(() => {
      introActive = false
      video.pause()
      playing = false
      introEndTime = video.currentTime   // freeze here, scroll continues from this frame
      smoothScrollY = window.scrollY
      lastScrollY = window.scrollY
      velocity = 0
      // Do NOT seek — video stays at the intro's last frame
    }, 4000)

    // ── Scroll listener ─────────────────────────────────────────────────────
    const onScroll = () => {
      const newY = window.scrollY
      velocity = newY - lastScrollY
      lastScrollY = newY
    }

    // ── Main loop ───────────────────────────────────────────────────────────
    const tick = () => {
      if (!introActive && video.readyState >= 2 && video.duration) {
        // Scroll inertia: position coasts after releasing scroll
        smoothScrollY += velocity * 0.5
        velocity *= 0.78
        smoothScrollY = Math.max(0, Math.min(scrollMax(), smoothScrollY))

        const targetTime = getTarget(smoothScrollY)
        const diff = targetTime - video.currentTime

        if (diff > 0.004) {
          // ── Forward: proportional playbackRate — zero seeking, fully smooth ──
          // diff * 20 → rate ≈ 1x when diff = 50ms (one scroll tick of a
          // ~20s video over a ~5000px page). Naturally scales up for fast
          // scroll and down to a crawl when nearly synced.
          const rate = Math.min(Math.max(diff * 20, 0.07), 4)
          video.playbackRate = rate
          if (!playing) {
            video.play().then(() => { playing = true }).catch(() => {})
          }
        } else if (diff < -0.06) {
          // ── Backward: one clean seek (unavoidable, but rate-limited by
          //    the -0.06 threshold so it only fires on meaningful scroll-up) ──
          if (playing) { video.pause(); playing = false }
          video.currentTime = Math.max(0, targetTime)
        } else if (diff < 0.001 && playing) {
          // ── At target: stop ─────────────────────────────────────────────
          video.pause()
          playing = false
        }
        // Hysteresis zone 0.001–0.004: keep current state to avoid cycling
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
