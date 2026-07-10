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
uniform float u_scroll;    // 0..1 – energy from scroll velocity
uniform vec2  u_mouse;     // screen UV (x: 0-1 left→right, y: 0-1 bottom→top)
uniform vec2  u_mvel;      // normalised mouse direction
uniform float u_mstr;      // 0..1 – accumulated mouse energy
uniform float u_imgAsp;    // image width / height
uniform float u_canvAsp;   // canvas width / height

varying vec2 v_uv;         // screen UV

// Object-fit: cover – maps screen UV to image UV
vec2 coverUV(vec2 suv) {
  if (u_canvAsp > u_imgAsp) {
    // canvas wider than image → fill width, crop height
    return vec2(suv.x, (suv.y - 0.5) * (u_imgAsp / u_canvAsp) + 0.5);
  } else {
    // canvas taller than image → fill height, crop width
    return vec2((suv.x - 0.5) * (u_canvAsp / u_imgAsp) + 0.5, suv.y);
  }
}

void main() {
  vec2 suv = v_uv;
  float t  = u_time;
  vec2 drift = vec2(0.0);

  // ── Mouse air current ─────────────────────────────────────────────────
  // Directional push in the direction of mouse movement; soft gaussian field
  vec2 diff = suv - u_mouse;
  diff.x *= u_canvAsp;                        // isotropic screen-space distance
  float falloff = exp(-dot(diff, diff) * 6.0);
  drift += u_mvel * falloff * u_mstr * 0.032;

  // ── Ambient breath – always alive, very subtle ────────────────────────
  // Multiple waves at different frequencies and phases for organic feel
  drift.x += sin(suv.y * 2.8  + t * 0.47)            * 0.0024;
  drift.x += sin(suv.y * 5.3  - t * 0.32 + 1.9)      * 0.0011;
  drift.x += sin(suv.y * 1.5  + suv.x * 0.9 + t * 0.23) * 0.0016;
  drift.y += cos(suv.x * 3.0  + t * 0.37)            * 0.0008;
  drift.y += cos(suv.y * 2.2  + t * 0.28 + 1.1)      * 0.0006;

  // ── Scroll energy – amplitude grows with scroll speed ─────────────────
  float sA = u_scroll * 0.025;
  drift.x += sin(suv.y * 6.8  + t * 2.2)              * sA;
  drift.x += sin(suv.y * 4.1  - t * 1.6 + 2.1)        * sA * 0.55;
  drift.y += cos(suv.y * 5.2  + t * 1.9)              * sA * 0.28;

  // ── Sample image with cover-mode UV ──────────────────────────────────
  vec2 imageUV = coverUV(suv + drift);
  imageUV = clamp(imageUV, 0.001, 0.999);
  gl_FragColor = texture2D(u_tex, imageUV);
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
    const uMvel    = gl.getUniformLocation(prog, 'u_mvel')
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

    // ── Interaction state (no allocations per frame) ──────────────────────
    let scrollEnergy = 0
    let lastScrollY  = window.scrollY
    let mouseX = 0.5, mouseY = 0.5
    let mouseVX = 0,  mouseVY = 0    // normalised direction
    let mouseStr = 0
    let pmouseX = 0.5, pmouseY = 0.5

    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY)
      scrollEnergy = Math.min(1, scrollEnergy + delta * 0.008)
      lastScrollY  = window.scrollY
    }

    const onMouse = (e: MouseEvent) => {
      const nx   = e.clientX / window.innerWidth
      const ny   = 1 - e.clientY / window.innerHeight // flip Y for WebGL
      const dvx  = nx - pmouseX
      const dvy  = ny - pmouseY
      const spd  = Math.sqrt(dvx * dvx + dvy * dvy)
      if (spd > 0.0001) {
        mouseVX = dvx / spd  // normalised direction
        mouseVY = dvy / spd
      }
      mouseStr  = Math.min(1, mouseStr + spd * 30)
      pmouseX   = mouseX
      pmouseY   = mouseY
      mouseX    = nx
      mouseY    = ny
    }

    window.addEventListener('scroll',    onScroll, { passive: true })
    window.addEventListener('mousemove', onMouse,  { passive: true })

    // ── Render loop ───────────────────────────────────────────────────────
    const t0 = performance.now()
    let raf: number

    const frame = () => {
      if (!texReady) { raf = requestAnimationFrame(frame); return }

      const t       = (performance.now() - t0) * 0.001
      const canvAsp = canvas!.width / canvas!.height
      const imgAsp  = imgW / imgH

      // Smooth decay
      scrollEnergy *= 0.978
      mouseStr     *= 0.962
      mouseVX      *= 0.910
      mouseVY      *= 0.910

      gl!.uniform1f(uTime,    t)
      gl!.uniform1f(uScroll,  scrollEnergy)
      gl!.uniform2f(uMouse,   mouseX, mouseY)
      gl!.uniform2f(uMvel,    mouseVX, mouseVY)
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
        zIndex: 0,
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  )
}
