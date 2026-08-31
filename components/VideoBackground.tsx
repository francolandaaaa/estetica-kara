'use client'

import { useEffect, useRef, useState } from 'react'

const TOTAL    = 192
const FPS      = 24
const INTRO_S  = 3.2
const INTRO_END = Math.min(Math.round(FPS * INTRO_S) - 1, TOTAL - 1)
// Background doesn't need full retina resolution — cap DPR to limit canvas pixel budget.
const MAX_DPR  = 1.5

const frameSrc = (i: number) =>
  `/frames/frame_${String(i + 1).padStart(3, '0')}.jpg`

export default function VideoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)

    let cancelled    = false
    let rafId        = 0
    let currentIdx   = 0
    let loopRunning  = false
    let removeScroll: () => void = () => {}

    const frames = new Array<HTMLImageElement>(TOTAL)

    // ── Draw cache — updated once on resize, not on every drawImage call ──
    // All 192 frames are 1280×720; scale+offset only changes when canvas resizes.
    let ddx = 0, ddy = 0, ddw = 0, ddh = 0

    const updateDrawCache = () => {
      const cw = canvas.width, ch = canvas.height
      const iw = frames[0]?.naturalWidth  || 1280
      const ih = frames[0]?.naturalHeight || 720
      const s  = Math.max(cw / iw, ch / ih)
      ddx = Math.round((cw - iw * s) / 2)
      ddy = Math.round((ch - ih * s) / 2)
      ddw = Math.round(iw * s)
      ddh = Math.round(ih * s)
    }

    // ── Canvas sizing ────────────────────────────────────────────────────
    const sizeCanvas = () => {
      canvas.width  = Math.round(window.innerWidth  * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      updateDrawCache()
      if (frames[currentIdx]?.naturalWidth) drawFrame(frames[currentIdx])
    }
    window.addEventListener('resize', sizeCanvas)
    sizeCanvas()

    // ── Single drawImage with pre-computed integer coords ────────────────
    const drawFrame = (img: HTMLImageElement) => {
      ctx.drawImage(img, ddx, ddy, ddw, ddh)
    }

    // ── Preload ──────────────────────────────────────────────────────────
    Promise.all(
      Array.from({ length: TOTAL }, (_, i) => {
        const img = new Image()
        img.src   = frameSrc(i)
        frames[i] = img
        return img.decode().catch(() => {})
      }),
    ).then(() => {
      if (cancelled) return
      updateDrawCache()   // now frames[0].naturalWidth is real
      setReady(true)
      runIntro()
    })

    // ── Intro ────────────────────────────────────────────────────────────
    let introEndIdx = INTRO_END

    const runIntro = () => {
      if (frames[0]?.naturalWidth) drawFrame(frames[0])
      currentIdx = 0
      const t0 = performance.now()

      const tick = (now: number) => {
        if (cancelled) return
        const idx = Math.min(Math.round(((now - t0) / 1000) * FPS), INTRO_END)
        if (idx !== currentIdx && frames[idx]?.naturalWidth) {
          drawFrame(frames[idx])
          currentIdx = idx
        }
        if (idx >= INTRO_END) {
          introEndIdx = currentIdx
          runScrubbing()
        } else {
          rafId = requestAnimationFrame(tick)
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    // ── Scroll scrubbing — RAF pauses when lerp converges ────────────────
    // RAF is only active while there are frames left to interpolate toward.
    // The scroll listener restarts it whenever the target changes.
    const runScrubbing = () => {
      const getScrollMax = () =>
        Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)

      const computeTarget = () => {
        const p = Math.min(Math.max(window.scrollY / getScrollMax(), 0), 1)
        return Math.round(introEndIdx + p * (TOTAL - 1 - introEndIdx))
      }

      let targetIdx: number = introEndIdx
      let lerpIdx:   number = introEndIdx

      const loop = () => {
        const diff = targetIdx - lerpIdx
        if (Math.abs(diff) < 0.5) {
          loopRunning = false
          return              // converged — stop until next scroll
        }

        rafId = requestAnimationFrame(loop)

        lerpIdx += diff * 0.16   // 0.16 > 0.12: more responsive, still smooth
        const idx = Math.round(Math.min(Math.max(lerpIdx, introEndIdx), TOTAL - 1))
        if (idx !== currentIdx && frames[idx]?.naturalWidth) {
          drawFrame(frames[idx])
          currentIdx = idx
        }
      }

      const onScroll = () => {
        targetIdx = computeTarget()
        if (!loopRunning) {     // kick-start RAF only when it isn't already running
          loopRunning = true
          rafId = requestAnimationFrame(loop)
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true })
      removeScroll = () => window.removeEventListener('scroll', onScroll)
    }

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', sizeCanvas)
      removeScroll()
    }
  }, [])

  return (
    <>
      {!ready && (
        <div style={{ position: 'absolute', inset: 0, background: '#050505' }} />
      )}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </>
  )
}
