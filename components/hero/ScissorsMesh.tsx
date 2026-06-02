'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Materiales ────────────────────────────────────────────────────────────────
const CHROME = { metalness: 0.98, roughness: 0.02, color: '#EEEEEE' } as const
const GOLD   = { metalness: 0.92, roughness: 0.08, color: '#C9A84C' } as const
const WINE   = { metalness: 0.86, roughness: 0.14, color: '#6B1229' } as const

// ─────────────────────────────────────────────────────────────────────────────
// Lámina — plana, larga, punta afilada
// ─────────────────────────────────────────────────────────────────────────────
function Blade() {
  return (
    <group>
      <mesh position={[0, 0.68, 0]} scale={[2.1, 1, 0.18]}>
        <cylinderGeometry args={[0.001, 0.040, 1.36, 8]} />
        <meshStandardMaterial {...CHROME} emissive="#CCCCCC" emissiveIntensity={0.10} />
      </mesh>
      <mesh position={[0.084, 0.68, 0]}>
        <boxGeometry args={[0.009, 1.36, 0.007]} />
        <meshStandardMaterial metalness={1.0} roughness={0.0} color="#FFFFFF" emissive="#DDDDDD" emissiveIntensity={0.22} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Mango inclinado — une el pivote con el anillo desplazado lateralmente.
// cx/cy = centro de la pieza, rot = inclinación en Z, h = longitud
// ─────────────────────────────────────────────────────────────────────────────
function HandleStrut({ cx, cy, rot, h }: { cx: number; cy: number; rot: number; h: number }) {
  return (
    <mesh position={[cx, cy, 0]} rotation={[0, 0, rot]} scale={[1.0, 1, 0.26]}>
      <cylinderGeometry args={[0.038, 0.056, h, 7]} />
      <meshStandardMaterial {...CHROME} emissive="#AAAAAA" emissiveIntensity={0.08} />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Brazo del dedo
//
// El mango parte del pivote (0,0) y llega al anillo en (+0.20, -0.55).
// Con este offset lateral, al cerrarse al mínimo (≈0.04 rad) la distancia
// entre centros de anillo = 0.444 > suma de radios 0.426 → nunca se cruzan.
// ─────────────────────────────────────────────────────────────────────────────
function FingerArm() {
  // strut: desde (0,0) hasta (0.20, -0.55)
  // centro = (0.10, -0.275), longitud = √(0.20²+0.55²) ≈ 0.585
  // inclinación = atan(0.20/0.55) ≈ 0.35 rad hacia la derecha → zRot = -0.35
  return (
    <group>
      <Blade />
      <HandleStrut cx={0.10} cy={-0.275} rot={0.35} h={0.585} />

      {/* Anillo dedo — desplazado +X, sin rotación → agujero hacia cámara */}
      <mesh position={[0.20, -0.55, 0]}>
        <torusGeometry args={[0.208, 0.036, 18, 64]} />
        <meshStandardMaterial {...WINE} emissive="#1A0008" emissiveIntensity={0.15} />
      </mesh>

      {/* Tang / gancho curvo — arriba del anillo */}
      <mesh position={[0.13, -0.325, 0]} rotation={[0, 0, 0.60]}>
        <torusGeometry args={[0.088, 0.022, 10, 32, Math.PI * 0.68]} />
        <meshStandardMaterial {...CHROME} emissive="#AAAAAA" emissiveIntensity={0.10} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Brazo del pulgar (ergo)
//
// El mango parte del pivote (0,0) y llega al anillo en (-0.20, -0.56).
// centro = (-0.10, -0.28), longitud = √(0.20²+0.56²) ≈ 0.595
// inclinación hacia la izquierda → zRot = +0.34
// ─────────────────────────────────────────────────────────────────────────────
function ThumbArm() {
  return (
    <group>
      <Blade />
      <HandleStrut cx={-0.10} cy={-0.28} rot={-0.34} h={0.595} />

      {/* Anillo pulgar — desplazado -X, sin rotación */}
      <mesh position={[-0.20, -0.56, 0]}>
        <torusGeometry args={[0.218, 0.036, 18, 64]} />
        <meshStandardMaterial {...WINE} emissive="#1A0008" emissiveIntensity={0.15} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Pivote — gema roja en montura dorada
// ─────────────────────────────────────────────────────────────────────────────
function Pivot() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.010, 24]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.052, 0.014, 10, 24]} />
        <meshStandardMaterial metalness={1.0} roughness={0.0} color="#D4AA50" emissive="#553300" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <sphereGeometry args={[0.036, 18, 18]} />
        <meshStandardMaterial color="#CC1000" metalness={0.65} roughness={0.15} emissive="#660000" emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal — animación sin cambios
// ─────────────────────────────────────────────────────────────────────────────
export default function ScissorsMesh() {
  const groupRef = useRef<THREE.Group>(null)
  const arm1Ref  = useRef<THREE.Group>(null)
  const arm2Ref  = useRef<THREE.Group>(null)
  const rotYRef  = useRef(0)

  useFrame((state) => {
    if (!groupRef.current || !arm1Ref.current || !arm2Ref.current) return
    const t      = state.clock.elapsedTime
    const scroll = typeof window !== 'undefined' ? window.scrollY : 0

    const angle = 0.26 + Math.sin(t * 1.05) * 0.22
    arm1Ref.current.rotation.z =  angle
    arm2Ref.current.rotation.z = -angle

    rotYRef.current = THREE.MathUtils.lerp(rotYRef.current, scroll * 0.005, 0.07)
    groupRef.current.rotation.y = rotYRef.current

    groupRef.current.position.x = 0
    groupRef.current.position.y = Math.sin(t * 0.70) * 0.10
  })

  return (
    <group ref={groupRef} scale={1.45}>
      <group ref={arm1Ref} position={[0, 0, 0.06]}>
        <FingerArm />
      </group>
      <group ref={arm2Ref} position={[0, 0, -0.06]}>
        <ThumbArm />
      </group>
      <Pivot />
    </group>
  )
}
