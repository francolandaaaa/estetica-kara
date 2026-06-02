'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Materiales ────────────────────────────────────────────────────────────────
const CHROME = { metalness: 0.98, roughness: 0.02, color: '#EEEEEE' } as const
const GOLD   = { metalness: 0.92, roughness: 0.08, color: '#C9A84C' } as const
const WINE   = { metalness: 0.86, roughness: 0.14, color: '#6B1229' } as const

// ─────────────────────────────────────────────────────────────────────────────
// Lámina — plana, larga, muy brillante (oscurece hacia la punta)
// ─────────────────────────────────────────────────────────────────────────────
function Blade() {
  return (
    <group>
      {/* Cuerpo principal — punta afilada (radiusTop ~0) */}
      <mesh position={[0, 0.68, 0]} scale={[2.1, 1, 0.18]}>
        <cylinderGeometry args={[0.001, 0.040, 1.36, 8]} />
        <meshStandardMaterial {...CHROME} emissive="#CCCCCC" emissiveIntensity={0.10} />
      </mesh>
      {/* Filo brillante */}
      <mesh position={[0.084, 0.68, 0]}>
        <boxGeometry args={[0.009, 1.36, 0.007]} />
        <meshStandardMaterial metalness={1.0} roughness={0.0} color="#FFFFFF" emissive="#DDDDDD" emissiveIntensity={0.22} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Mango plano orgánico — pieza plana que conecta pivote con el anillo
// ─────────────────────────────────────────────────────────────────────────────
function HandleStrut({ xOff = 0, zRot = 0 }: { xOff?: number; zRot?: number }) {
  return (
    <group position={[xOff, -0.22, 0]} rotation={[0, 0, zRot]}>
      {/* Pieza central plana */}
      <mesh scale={[1.0, 1, 0.26]}>
        <cylinderGeometry args={[0.040, 0.058, 0.44, 7]} />
        <meshStandardMaterial {...CHROME} emissive="#AAAAAA" emissiveIntensity={0.08} />
      </mesh>
      {/* Expansión hacia el anillo */}
      <mesh position={[0, -0.25, 0]} scale={[1.8, 1, 0.26]}>
        <cylinderGeometry args={[0.048, 0.040, 0.08, 7]} />
        <meshStandardMaterial {...CHROME} emissive="#AAAAAA" emissiveIntensity={0.08} />
      </mesh>
      {/* Detalle decorativo lateral (tab lateral) */}
      <mesh position={[0.08, -0.02, 0]} rotation={[0, 0, 0.4]} scale={[0.4, 1, 0.22]}>
        <cylinderGeometry args={[0.025, 0.020, 0.10, 6]} />
        <meshStandardMaterial {...CHROME} emissive="#999999" emissiveIntensity={0.06} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Brazo del dedo — anillo con relleno rojo + tang/gancho
// ─────────────────────────────────────────────────────────────────────────────
function FingerArm() {
  return (
    <group>
      <Blade />
      <HandleStrut />

      {/* Anillo — color vino, sin rotación → agujero hacia cámara */}
      <mesh position={[0, -0.57, 0]}>
        <torusGeometry args={[0.208, 0.036, 18, 64]} />
        <meshStandardMaterial {...WINE} emissive="#1A0008" emissiveIntensity={0.15} />
      </mesh>

      {/* Tang / gancho curvo en la parte superior del anillo */}
      <mesh position={[-0.07, -0.345, 0]} rotation={[0, 0, 0.55]}>
        <torusGeometry args={[0.090, 0.023, 10, 32, Math.PI * 0.68]} />
        <meshStandardMaterial {...CHROME} emissive="#AAAAAA" emissiveIntensity={0.10} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Brazo del pulgar — ergo offset, anillo ligeramente más grande
// ─────────────────────────────────────────────────────────────────────────────
function ThumbArm() {
  return (
    <group>
      <Blade />
      <HandleStrut xOff={0.030} zRot={-0.09} />

      {/* Anillo — color vino, sin rotación */}
      <mesh position={[0.040, -0.56, 0]}>
        <torusGeometry args={[0.218, 0.036, 18, 64]} />
        <meshStandardMaterial {...WINE} emissive="#1A0008" emissiveIntensity={0.15} />
      </mesh>

      {/* Pequeña pestaña exterior del anillo del pulgar */}
      <mesh position={[0.155, -0.42, 0]} rotation={[0, 0, -0.50]}>
        <cylinderGeometry args={[0.018, 0.018, 0.065, 10]} />
        <meshStandardMaterial {...CHROME} emissive="#999999" emissiveIntensity={0.06} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Pivote — gema roja en montura dorada (igual que la imagen de referencia)
// ─────────────────────────────────────────────────────────────────────────────
function Pivot() {
  return (
    <group>
      {/* Disco de base dorada */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.010, 24]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      {/* Aro dorado */}
      <mesh>
        <torusGeometry args={[0.052, 0.014, 10, 24]} />
        <meshStandardMaterial metalness={1.0} roughness={0.0} color="#D4AA50" emissive="#553300" emissiveIntensity={0.18} />
      </mesh>
      {/* Gema roja (esfera) */}
      <mesh position={[0, 0, 0.018]}>
        <sphereGeometry args={[0.036, 18, 18]} />
        <meshStandardMaterial
          color="#CC1000"
          metalness={0.65}
          roughness={0.15}
          emissive="#660000"
          emissiveIntensity={0.35}
        />
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

    // Apertura y cierre
    const angle = 0.26 + Math.sin(t * 1.05) * 0.22
    arm1Ref.current.rotation.z =  angle
    arm2Ref.current.rotation.z = -angle

    // Rotación Y con scroll
    rotYRef.current = THREE.MathUtils.lerp(rotYRef.current, scroll * 0.005, 0.07)
    groupRef.current.rotation.y = rotYRef.current

    // Siempre centradas, flotación suave
    groupRef.current.position.x = 0
    groupRef.current.position.y = Math.sin(t * 0.70) * 0.10
  })

  return (
    <group ref={groupRef} scale={1.45}>
      {/* Brazo del dedo (frente) */}
      <group ref={arm1Ref} position={[0, 0, 0.06]}>
        <FingerArm />
      </group>
      {/* Brazo del pulgar (atrás, ergo) */}
      <group ref={arm2Ref} position={[0, 0, -0.06]}>
        <ThumbArm />
      </group>
      {/* Pivote central (gema roja) */}
      <Pivot />
    </group>
  )
}
