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
    let rvfcId = 0          // store ID so we can cancel it properly
    let rvfcStopped = false // flag to stop the self-scheduling RVFC chain
    let introActive = true
    let introEndTime = 0

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
      video.play().catch(() => {})
    }

    if (video.readyState >= 3) startIntro()
    else video.addEventListener('canplay', startIntro, { once: true })

    const introTimeout = setTimeout(() => {
      introActive = false
      video.pause()
      introEndTime = video.currentTime   // freeze here — scroll 0% maps here
      lerpTime   = video.currentTime
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

    // ── RVFC: signals when the browser has painted the previous seek ──────
    // Prevents over-seeking (queuing seeks faster than frames can render).
    // rvfcStopped + stored rvfcId ensure the chain is fully cancelled on unmount.
    if (supportsRVFC) {
      const onFrame = () => {
        frameReady = true
        if (!rvfcStopped) rvfcId = vEl.requestVideoFrameCallback(onFrame)
      }
      rvfcId = vEl.requestVideoFrameCallback(onFrame)
    }

    // ── RAF loop: lerp lerpTime → targetTime, write currentTime ──────────
    //
    //  LERP     = 0.07 → 7 % of remaining gap per step. Gradual approach
    //             that feels like natural playback, not a jump. The loop
    //             continues running after scroll stops (rAF reschedules
    //             first, unconditionally) so the ease-out finishes smoothly.
    //
    //  FRAME    = 1/30 s → minimum step per seek. Prevents sub-frame seeks
    //             that are invisible to the eye but burn decoder cycles.
    //
    //  MAX_STEP = 0.2 s → ceiling per seek. Avoids crossing many keyframes
    //             in one shot, which stalls the decoder and looks jarring.

    const LERP     = 0.07
    const FRAME    = 1 / 30
    const MAX_STEP = 0.2

    const loop = () => {
      // Reschedule FIRST — guarantees the loop keeps running every frame
      // even when the early-return below fires (e.g. last frame after scroll).
      rafId = requestAnimationFrame(loop)

      if (!introActive && video.readyState >= 2 && video.duration) {
        const diff = targetTime - lerpTime

        // Dead zone: within half a frame → nothing left to do
        if (Math.abs(diff) <= FRAME * 0.5) return

        // Step: lerp-based, floored at 1 frame, capped at MAX_STEP,
        // clamped so we never overshoot targetTime
        const raw  = diff * LERP
        const step = Math.sign(diff) *
          Math.min(Math.max(Math.abs(raw), FRAME), MAX_STEP)
        lerpTime += Math.abs(step) > Math.abs(diff) ? diff : step

        // Hard-clamp lerpTime to valid range so currentTime never receives
        // a value outside [introEndTime, duration] (prevents micro-jumps
        // at the extremes).
        lerpTime = Math.min(Math.max(lerpTime, introEndTime), video.duration)

        // Seek only when RVFC signals the previous frame has been painted.
        // Falls back to every RAF frame when RVFC is not supported.
        if (!supportsRVFC || frameReady) {
          video.currentTime = lerpTime
          if (supportsRVFC) frameReady = false
        }
      }
    }

    rafId = requestAnimationFrame(loop)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      clearTimeout(introTimeout)
      cancelAnimationFrame(rafId)
      rvfcStopped = true
      if (supportsRVFC && rvfcId) vEl.cancelVideoFrameCallback(rvfcId)
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
