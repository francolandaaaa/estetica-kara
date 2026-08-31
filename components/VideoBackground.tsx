'use client'

import { useEffect, useRef } from 'react'

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // ── Feature detect requestVideoFrameCallback ──────────────────────────
    const supportsRVFC = 'requestVideoFrameCallback' in video
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vEl = video as any

    let rafId = 0
    let introActive = true
    let introEndTime = 0
    let playing = false

    // targetTime  – where scroll says the video should be
    // lerpTime    – smoothly interpolated value we feed to currentTime
    // frameReady  – RVFC gate: true once previous seek has been rendered
    let targetTime = 0
    let lerpTime   = 0
    let frameReady = true
    let lastScrollAt = 0

    const getScrollMax = () =>
      Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)

    const computeTarget = () => {
      if (!video.duration) return introEndTime
      const p = Math.min(Math.max(window.scrollY / getScrollMax(), 0), 1)
      return introEndTime + p * (video.duration - introEndTime)
    }

    // ── Intro: untouched ─────────────────────────────────────────────────
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
      introEndTime = video.currentTime   // freeze here — scroll 0% maps here
      lerpTime  = video.currentTime
      targetTime = video.currentTime
    }, 4000)

    // ── Scroll: throttled to ≈60 fps, only updates targetTime ────────────
    const onScroll = () => {
      if (introActive) return
      const now = performance.now()
      if (now - lastScrollAt < 16) return   // ~60 fps cap
      lastScrollAt = now
      targetTime = computeTarget()
    }

    // ── RVFC: marks when the browser has rendered the previous seek ───────
    // This prevents over-seeking (queuing seeks faster than frames render).
    if (supportsRVFC) {
      const onFrame = () => {
        frameReady = true
        vEl.requestVideoFrameCallback(onFrame)
      }
      vEl.requestVideoFrameCallback(onFrame)
    }

    // ── RAF loop: lerp lerpTime → targetTime, then write currentTime ──────
    //
    //  FRAME    = minimum step (one video frame at 30 fps = 0.033 s).
    //             Prevents invisible sub-frame seeks that waste CPU with
    //             no visible result.
    //
    //  LERP     = 18 % of the remaining gap per step. Gives a natural
    //             ease-out: fast at first, decelerates as it approaches
    //             the target — so the video "settles" smoothly when you
    //             stop scrolling instead of cutting hard.
    //
    //  MAX_STEP = 0.2 s cap per seek. Prevents large gaps from triggering
    //             multi-second seeks that cross many keyframes (expensive
    //             for the decoder and visually jarring).

    const FRAME    = 1 / 30
    const LERP     = 0.18
    const MAX_STEP = 0.2

    const loop = () => {
      if (!introActive && video.readyState >= 2 && video.duration) {
        const diff = targetTime - lerpTime

        if (Math.abs(diff) > FRAME * 0.5) {
          // Lerp step: at least 1 frame, at most MAX_STEP, clamped to diff
          const raw = diff * LERP
          const step = Math.sign(diff) *
            Math.min(Math.max(Math.abs(raw), FRAME), MAX_STEP)
          lerpTime += Math.abs(step) > Math.abs(diff) ? diff : step

          // Write to video only when the previous frame has been painted.
          // Without RVFC support we write every RAF — still better than
          // writing directly inside the scroll event.
          if (!supportsRVFC || frameReady) {
            video.currentTime = lerpTime
            if (supportsRVFC) frameReady = false
          }
        }
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      clearTimeout(introTimeout)
      cancelAnimationFrame(rafId)
      if (supportsRVFC) vEl.cancelVideoFrameCallback?.()
      window.removeEventListener('scroll', onScroll)
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
