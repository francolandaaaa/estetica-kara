'use client'

import { useEffect, useRef, useState } from 'react'

const TOTAL   = 192          // frame_001.jpg … frame_192.jpg
const FPS     = 24
const INTRO_S = 3.5          // seconds of auto-play on load (stops 0.5s before old end)
// Last frame index (0-based) shown during intro  →  frame_084.jpg
const INTRO_END = Math.min(Math.round(FPS * INTRO_S) - 1, TOTAL - 1)

const frameSrc = (i: number) =>
  `/frames/frame_${String(i + 1).padStart(3, '0')}.jpg`

export default function VideoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = window.devicePixelRatio || 1

    // Mutable state shared across closures
    let cancelled   = false
    let rafId       = 0
    let currentIdx  = 0
    let removeScroll: () => void = () => {}

    // ── Frame array declared first so sizeCanvas can reference it ─────────
    const frames = new Array<HTMLImageElement>(TOTAL)

    // ── Canvas sizing ─────────────────────────────────────────────────────
    // Multiplied by dpr for sharp rendering on retina / high-DPI displays.
    // CSS width/height stays at 100% (set in JSX), so the element fills the
    // container while the pixel buffer is high-resolution.
    const sizeCanvas = () => {
      canvas.width  = Math.round(window.innerWidth  * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      // Re-draw current frame so canvas isn't blank after orientation change
      const img = frames[currentIdx]
      if (img?.naturalWidth) drawCover(img)
    }
    window.addEventListener('resize', sizeCanvas)
    sizeCanvas()

    // ── object-fit: cover equivalent ──────────────────────────────────────
    const drawCover = (img: HTMLImageElement) => {
      const cw = canvas.width, ch = canvas.height
      const iw = img.naturalWidth, ih = img.naturalHeight
      const s  = Math.max(cw / iw, ch / ih)
      ctx.drawImage(img,
        (cw - iw * s) / 2, (ch - ih * s) / 2,
        iw * s, ih * s,
      )
    }

    // ── Preload: decode all frames off the main thread before starting ─────
    // img.decode() returns a Promise that resolves when the browser has fully
    // decoded the image and it's ready for instant drawImage — no decode stall
    // on first paint. Errors are swallowed so one bad file doesn't stall init.
    Promise.all(
      Array.from({ length: TOTAL }, (_, i) => {
        const img = new Image()
        img.src   = frameSrc(i)
        frames[i] = img
        return img.decode().catch(() => {})
      }),
    ).then(() => {
      if (cancelled) return
      setReady(true)
      runIntro()
    })

    // ── Intro: step through frames 0 → INTRO_END at FPS ──────────────────
    // Uses canvas + requestAnimationFrame so there are NO autoplay
    // restrictions (no <video> element, no audio, works on all mobile).
    let introEndIdx = INTRO_END

    const runIntro = () => {
      drawCover(frames[0])
      currentIdx = 0
      const t0 = performance.now()

      const tick = (now: number) => {
        if (cancelled) return
        const idx = Math.min(
          Math.round(((now - t0) / 1000) * FPS),
          INTRO_END,
        )
        if (idx !== currentIdx && frames[idx]?.naturalWidth) {
          drawCover(frames[idx])
          currentIdx = idx
        }
        if (idx >= INTRO_END) {
          introEndIdx = currentIdx
          runScrubbing()          // hand off to scroll-driven mode
        } else {
          rafId = requestAnimationFrame(tick)
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    // ── Scroll scrubbing ──────────────────────────────────────────────────
    // scroll 0%   →  introEndIdx   (the frozen intro frame)
    // scroll 100% →  TOTAL − 1    (last image)
    //
    // targetIdx is set in the (throttle-free) scroll listener.
    // lerpIdx is interpolated toward targetIdx inside RAF — never inside
    // the scroll event — so the drawing stays on the compositor thread.
    const runScrubbing = () => {
      const getScrollMax = () =>
        Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)

      const computeTarget = () => {
        const p = Math.min(Math.max(window.scrollY / getScrollMax(), 0), 1)
        return Math.round(introEndIdx + p * (TOTAL - 1 - introEndIdx))
      }

      let targetIdx: number = introEndIdx
      let lerpIdx:   number = introEndIdx

      // Scroll listener only writes a number — O(1), no DOM work
      const onScroll = () => { targetIdx = computeTarget() }
      window.addEventListener('scroll', onScroll, { passive: true })
      removeScroll = () => window.removeEventListener('scroll', onScroll)

      const loop = () => {
        rafId = requestAnimationFrame(loop)   // reschedule first — always runs
        if (cancelled) return

        const diff = targetIdx - lerpIdx
        if (Math.abs(diff) < 0.5) return     // within half a frame → done

        lerpIdx += diff * 0.12               // ease-out: 12% of gap per frame
        const idx = Math.round(
          Math.min(Math.max(lerpIdx, introEndIdx), TOTAL - 1),
        )
        if (idx !== currentIdx && frames[idx]?.naturalWidth) {
          drawCover(frames[idx])
          currentIdx = idx
        }
      }
      rafId = requestAnimationFrame(loop)
    }

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', sizeCanvas)
      removeScroll()
    }
  }, [])

  return (
    <>
      {/* Dark screen while frames are decoding — removed once ready */}
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
