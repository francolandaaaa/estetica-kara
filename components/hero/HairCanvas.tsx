'use client'

import { useEffect, useRef } from 'react'

// ── WebGL shaders ────────────────────────────────────────────────────────────

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;

uniform sampler2D u_tex;
uniform float u_time;
uniform float u_scroll;    // 0..1  scroll energy
uniform vec2  u_mouse;     // screen UV (x: 0→1, y: 0→1 bottom→top)
uniform float u_mstr;      // 0..1  mouse presence strength
uniform float u_imgAsp;    // image w/h
uniform float u_canvAsp;   // canvas w/h

varying vec2 v_uv;

// Object-fit: cover
vec2 coverUV(vec2 suv) {
  if (u_canvAsp > u_imgAsp) {
    return vec2(suv.x, (suv.y - 0.5) * (u_imgAsp / u_canvAsp) + 0.5);
  } else {
    return vec2((suv.x - 0.5) * (u_canvAsp / u_imgAsp) + 0.5, suv.y);
  }
}

void main() {
  vec2 suv = v_uv;
  float t  = u_time;
  vec2 drift = vec2(0.0);

  // ── Radial repulsion (same-charge magnet) ─────────────────────────────
  // diff/lenA gives a unit repulsion vector that is isotropic in screen-
  // pixel space (not in UV space), so the "opening" looks circular.
  vec2 diff  = suv - u_mouse;
  vec2 diffA = vec2(diff.x * u_canvAsp, diff.y);   // aspect-corrected
  float lenA = length(diffA);
  float d2   = dot(diffA, diffA);
  float repFalloff = exp(-d2 * 10.0);               // focused zone ~300 px
  vec2 repDir = lenA > 0.001 ? diff / lenA : vec2(0.0);
  drift -= repDir * repFalloff * u_mstr * 0.022;

  // ── Ambient breath – always alive ─────────────────────────────────────
  drift.x += sin(suv.y * 2.8  + t * 0.47)                * 0.010;
  drift.x += sin(suv.y * 5.3  - t * 0.32 + 1.9)          * 0.005;
  drift.x += sin(suv.y * 1.5  + suv.x * 0.9 + t * 0.23)  * 0.007;
  drift.y += cos(suv.x * 3.0  + t * 0.37)                * 0.004;
  drift.y += cos(suv.y * 2.2  + t * 0.28 + 1.1)          * 0.003;

  // ── Scroll energy ─────────────────────────────────────────────────────
  float sA = u_scroll * 0.025;
  drift.x += sin(suv.y * 6.8  + t * 2.2)                 * sA;
  drift.x += sin(suv.y * 4.1  - t * 1.6 + 2.1)           * sA * 0.55;
  drift.y += cos(suv.y * 5.2  + t * 1.9)                 * sA * 0.28;

  // ── Sample ────────────────────────────────────────────────────────────
  vec2 imageUV = coverUV(suv + drift);
  imageUV = clamp(imageUV, 0.001, 0.999);
  vec4 raw = texture2D(u_tex, imageUV);

  // ── Castaño brown colorisation ────────────────────────────────────────
  // Convert to luminance, then map through a 5-stop brown ramp.
  // Preserves all strand-level contrast from the original image –
  // darker strands → deep brown, lighter strands → honey highlights.
  float lum = dot(raw.rgb, vec3(0.2126, 0.7152, 0.0722));

  // 5-stop ramp: near-black root → dark brown → castaño → warm → honey
  vec3 c0 = vec3(0.07, 0.03, 0.01);   // deep shadow / root
  vec3 c1 = vec3(0.22, 0.10, 0.04);   // dark castaño
  vec3 c2 = vec3(0.40, 0.20, 0.08);   // base castaño
  vec3 c3 = vec3(0.62, 0.38, 0.16);   // warm brown
  vec3 c4 = vec3(0.82, 0.64, 0.36);   // honey / light strand highlight

  vec3 brown = mix(c0, c1, smoothstep(0.00, 0.25, lum));
       brown = mix(brown, c2, smoothstep(0.25, 0.50, lum));
       brown = mix(brown, c3, smoothstep(0.50, 0.75, lum));
       brown = mix(brown, c4, smoothstep(0.75, 1.00, lum));

  // Slightly reduce overall brightness so lettering stays legible
  brown *= 0.95;

  gl_FragColor = vec4(brown, 1.0);
}
`

// ── Component ────────────────────────────────────────────────────────────────

export default function HairCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    })
    if (!gl) return

    // ── Compile & link ────────────────────────────────────────────────────
    function mkShader(src: string, type: number) {
      const s = gl!.createShader(type)!
      gl!.shaderSource(s, src)
      gl!.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, mkShader(VERT, gl.VERTEX_SHADER))
    gl.attachShader(prog, mkShader(FRAG, gl.FRAGMENT_SHADER))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    // ── Full-screen quad ──────────────────────────────────────────────────
    const vbuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    // ── Uniforms ──────────────────────────────────────────────────────────
    const uTime    = gl.getUniformLocation(prog, 'u_time')
    const uScroll  = gl.getUniformLocation(prog, 'u_scroll')
    const uMouse   = gl.getUniformLocation(prog, 'u_mouse')
    const uMstr    = gl.getUniformLocation(prog, 'u_mstr')
    const uImgAsp  = gl.getUniformLocation(prog, 'u_imgAsp')
    const uCanvAsp = gl.getUniformLocation(prog, 'u_canvAsp')
    gl.uniform1i(gl.getUniformLocation(prog, 'u_tex'), 0)

    // ── Load texture ──────────────────────────────────────────────────────
    const tex = gl.createTexture()!
    let imgW = 1, imgH = 1, texReady = false

    const img = new Image()
    img.src = '/gallery/pelo-background.jpg'
    img.onload = () => {
      imgW = img.naturalWidth
      imgH = img.naturalHeight
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      texReady = true
    }

    // ── Viewport resize ───────────────────────────────────────────────────
    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas!.width  = window.innerWidth  * dpr
      canvas!.height = window.innerHeight * dpr
      gl!.viewport(0, 0, canvas!.width, canvas!.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // ── Interaction state ─────────────────────────────────────────────────
    let scrollEnergy = 0
    let lastScrollY  = window.scrollY
    let mouseX = -2, mouseY = 0.5   // start off-screen so no initial repulsion
    let mouseStr = 0
    let mousePresent = false

    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY)
      scrollEnergy = Math.min(1, scrollEnergy + delta * 0.008)
      lastScrollY  = window.scrollY
    }

    const onMouse = (e: MouseEvent) => {
      mouseX       = e.clientX / window.innerWidth
      mouseY       = 1 - e.clientY / window.innerHeight
      mousePresent = true
    }

    // Fade out when cursor leaves the browser window
    const onLeave = () => { mousePresent = false }

    window.addEventListener('scroll',    onScroll, { passive: true })
    window.addEventListener('mousemove', onMouse,  { passive: true })
    document.addEventListener('mouseleave', onLeave)

    // ── Render loop ───────────────────────────────────────────────────────
    const t0 = performance.now()
    let raf: number

    const frame = () => {
      if (!texReady) { raf = requestAnimationFrame(frame); return }

      const t       = (performance.now() - t0) * 0.001
      const canvAsp = canvas!.width / canvas!.height
      const imgAsp  = imgW / imgH

      scrollEnergy *= 0.978

      // Mouse strength: fade in while present, fade out when cursor leaves
      mouseStr = mousePresent
        ? Math.min(1, mouseStr + 0.05)   // ~20 frames to full strength
        : Math.max(0, mouseStr - 0.012)  // ~80 frames (~1.3 s) to zero

      gl!.uniform1f(uTime,    t)
      gl!.uniform1f(uScroll,  scrollEnergy)
      gl!.uniform2f(uMouse,   mouseX, mouseY)
      gl!.uniform1f(uMstr,    mouseStr)
      gl!.uniform1f(uImgAsp,  imgAsp)
      gl!.uniform1f(uCanvAsp, canvAsp)

      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize',    resize)
      window.removeEventListener('scroll',    onScroll)
      window.removeEventListener('mousemove', onMouse)
      document.removeEventListener('mouseleave', onLeave)
      gl.deleteProgram(prog)
      gl.deleteTexture(tex)
      gl.deleteBuffer(vbuf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  )
}
