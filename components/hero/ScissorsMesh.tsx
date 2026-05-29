'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Materiales ────────────────────────────────────────────────────────────────
const BLADE  = { metalness: 0.96, roughness: 0.04, color: '#D4D4D4' } as const
const EDGE   = { metalness: 1.00, roughness: 0.00, color: '#F5F5F5' } as const
const SHANK  = { metalness: 0.90, roughness: 0.10, color: '#C0C0C0' } as const
const RED    = { metalness: 0.88, roughness: 0.10, color: '#C41800' } as const
const GOLD   = { metalness: 0.90, roughness: 0.10, color: '#C9A84C' } as const

/**
 * Lámina plana y ancha — escala X:2.6 / Z:0.28 sobre un cilindro cónico
 * da la sección transversal oval achatada de una hoja real de tijeras.
 */
function Blade() {
  return (
    <group>
      {/* Cuerpo principal — achatado en Z, ancho en X */}
      <mesh position={[0, 0.70, 0]} scale={[2.6, 1, 0.28]}>
        <cylinderGeometry args={[0.008, 0.042, 1.40, 8]} />
        <meshStandardMaterial {...BLADE} />
      </mesh>
      {/* Filo brillante en el borde exterior */}
      <mesh position={[0.106, 0.70, 0]}>
        <boxGeometry args={[0.012, 1.40, 0.012]} />
        <meshStandardMaterial {...EDGE} />
      </mesh>
    </group>
  )
}

/** Brazo del dedo (recto) */
function FingerArm() {
  return (
    <group>
      <Blade />
      {/* Shank */}
      <mesh position={[0, -0.24, 0]}>
        <cylinderGeometry args={[0.021, 0.028, 0.48, 10]} />
        <meshStandardMaterial {...SHANK} />
      </mesh>
      {/* Tope rojo (finger rest) */}
      <mesh position={[0.042, -0.11, 0]}>
        <sphereGeometry args={[0.028, 10, 10]} />
        <meshStandardMaterial {...RED} />
      </mesh>
      {/* Anillo rojo */}
      <mesh position={[0, -0.64, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.145, 0.028, 14, 52]} />
        <meshStandardMaterial {...RED} />
      </mesh>
    </group>
  )
}

/** Brazo del pulgar (ergo — shank ligeramente desplazado) */
function ThumbArm() {
  return (
    <group>
      <Blade />
      {/* Shank con offset ergonómico */}
      <mesh position={[0.038, -0.26, 0]} rotation={[0, 0, -0.10]}>
        <cylinderGeometry args={[0.019, 0.025, 0.52, 10]} />
        <meshStandardMaterial {...SHANK} />
      </mesh>
      {/* Anillo rojo exterior */}
      <mesh position={[0.100, -0.70, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.148, 0.028, 14, 52]} />
        <meshStandardMaterial {...RED} />
      </mesh>
      {/* Aro interior — el "360°" swivel */}
      <mesh position={[0.100, -0.70, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.118, 0.010, 8, 52]} />
        <meshStandardMaterial
          metalness={1.0}
          roughness={0.0}
          color="#EE2200"
          emissive="#3A0000"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}

export default function ScissorsMesh() {
  const groupRef = useRef<THREE.Group>(null)
  const arm1Ref  = useRef<THREE.Group>(null)
  const arm2Ref  = useRef<THREE.Group>(null)
  const rotYRef  = useRef(0)

  useFrame((state) => {
    if (!groupRef.current || !arm1Ref.current || !arm2Ref.current) return
    const t      = state.clock.elapsedTime
    const scroll = typeof window !== 'undefined' ? window.scrollY : 0

    // Apertura / cierre de las tijeras
    const angle = 0.26 + Math.sin(t * 1.05) * 0.22
    arm1Ref.current.rotation.z =  angle
    arm2Ref.current.rotation.z = -angle

    // Rotación Y suave guiada por el scroll
    rotYRef.current = THREE.MathUtils.lerp(rotYRef.current, scroll * 0.005, 0.07)
    groupRef.current.rotation.y = rotYRef.current

    // Siempre centradas: X fijo, Y con flotación suave
    groupRef.current.position.x = 0
    groupRef.current.position.y = Math.sin(t * 0.70) * 0.10
  })

  return (
    <group ref={groupRef} scale={1.45}>
      {/* Brazo delantero — dedo */}
      <group ref={arm1Ref} position={[0, 0, 0.06]}>
        <FingerArm />
      </group>
      {/* Brazo trasero — pulgar ergo */}
      <group ref={arm2Ref} position={[0, 0, -0.06]}>
        <ThumbArm />
      </group>

      {/* ── Pivote dorado ─────────────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.050, 0.050, 0.14, 16]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.050, 0.012, 8, 16]} />
        <meshStandardMaterial metalness={1.0} roughness={0.0} color="#D4AA50" />
      </mesh>
      {/* Ranura del tornillo */}
      <mesh position={[0, 0, 0.078]}>
        <boxGeometry args={[0.060, 0.008, 0.005]} />
        <meshStandardMaterial metalness={0.9} roughness={0.1} color="#A8863A" />
      </mesh>
    </group>
  )
}
