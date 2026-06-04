'use client'

/**
 * Premium Japanese hairdressing scissors — mechanically correct 3D model.
 *
 * RING NON-CROSSING PROOF
 * ──────────────────────
 * Each arm carries its ring at lateral offset ±RING_X from the arm axis.
 * At minimum closing angle θ_min = 0.05 rad, ring centres are separated by:
 *   d_2D = 2·(RING_X·cosθ + RING_Y·sinθ) ≈ 2·(0.24·0.9988 + 0.73·0.050) = 0.553
 * Sum of outer torus radii = (0.206+0.033)+(0.218+0.033) = 0.490
 * 0.553 > 0.490  →  rings NEVER cross at any point in the animation.
 *
 * SEAMLESS BLADE–HANDLE CONNECTION
 * ─────────────────────────────────
 * Blade base (y = 0): cylinderGeometry radiusBottom = BASE_R
 * Handle top (y = 0): cylinderGeometry radiusTop    = BASE_R  ← identical
 * Both use the same scale and material → zero visible joint at the pivot.
 *
 * Z OFFSET
 * ────────
 * Arms at z = ±0.020 (was ±0.055).  Blade faces nearly touching near pivot.
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Materials ─────────────────────────────────────────────────────────────────
const STEEL = { metalness: 0.98, roughness: 0.02, color: '#EAEAEA' } as const
const WINE  = { metalness: 0.88, roughness: 0.12, color: '#6B1229' } as const
const GOLD  = { metalness: 0.92, roughness: 0.08, color: '#C9A84C' } as const

// ── Geometry constants ────────────────────────────────────────────────────────
const BASE_R   = 0.040  // shared radius at pivot for seamless blade↔handle join
const BLADE_H  = 1.36   // blade length (pivot → tip)
const RING_X   = 0.24   // lateral offset ensuring rings never cross
const RING_Y   = 0.73   // distance from pivot to ring centre along arm axis

// Handle strut: straight rod from (0,0) to (±RING_X, -RING_Y)
// Length and pivot-relative rotation computed analytically:
//   axis = (−sinθ, cosθ) must be anti-parallel to (RING_X, −RING_Y)
//   → θ = atan2(RING_X, RING_Y)
const STRUT_LEN = Math.sqrt(RING_X ** 2 + RING_Y ** 2) // ≈ 0.769
const STRUT_ROT = Math.atan2(RING_X, RING_Y)           // ≈ 0.314 rad
const STRUT_CX  = RING_X / 2   // cx of strut centre = 0.12
const STRUT_CY  = -RING_Y / 2  // cy of strut centre = -0.365

// ── One complete arm ──────────────────────────────────────────────────────────
function ScissorsArm({ thumb = false }: { thumb?: boolean }) {
  const sx = thumb ? -1 : 1   // mirror for thumb
  const ringR = thumb ? 0.218 : 0.206
  const ringT = 0.033
  // Ring centre sits so its outer tube top exactly touches the handle end:
  //   ring centre y = −RING_Y − ringR − ringT/2
  const ringCY = -RING_Y - ringR - ringT * 0.5

  return (
    <group>

      {/* ── BLADE ── long, flat, tapered from BASE_R at pivot to a fine tip ─ */}
      <mesh position={[0, BLADE_H / 2, 0]} scale={[2.2, 1, 0.17]}>
        <cylinderGeometry args={[0.001, BASE_R, BLADE_H, 16]} />
        <meshStandardMaterial {...STEEL} emissive="#BBBBBB" emissiveIntensity={0.07} />
      </mesh>

      {/* ── SHOULDER ── flat collar at pivot: hides blade↔handle junction ── */}
      <mesh position={[sx * RING_X * 0.08, -0.025, 0]} scale={[2.6, 1, 0.19]}>
        <cylinderGeometry args={[0.034, 0.048, 0.06, 10]} />
        <meshStandardMaterial {...STEEL} emissive="#AAAAAA" emissiveIntensity={0.06} />
      </mesh>

      {/* ── HANDLE ── tapers from BASE_R (pivot) to thin (ring end) ────────
          Rotation is +STRUT_ROT for finger arm, −STRUT_ROT for thumb arm.
          Derivation (verified): axis = (−sin θ, cos θ)
            → for θ = +STRUT_ROT: end1 = (0,0) [pivot], end2 = (+RING_X,−RING_Y)
            → for θ = −STRUT_ROT: end1 = (0,0) [pivot], end2 = (−RING_X,−RING_Y)
      ─────────────────────────────────────────────────────────────────────── */}
      <mesh
        position={[sx * STRUT_CX, STRUT_CY, 0]}
        rotation={[0, 0, sx * STRUT_ROT]}
        scale={[2.2, 1, 0.17]}
      >
        {/* radiusTop = BASE_R  → same cross-section as blade at y = 0 (pivot) */}
        <cylinderGeometry args={[BASE_R, 0.017, STRUT_LEN, 12]} />
        <meshStandardMaterial {...STEEL} emissive="#BBBBBB" emissiveIntensity={0.07} />
      </mesh>

      {/* ── RING ── lateral, no rotation → hole faces camera ────────────── */}
      <mesh position={[sx * RING_X, ringCY, 0]}>
        <torusGeometry args={[ringR, ringT, 18, 64]} />
        <meshStandardMaterial {...WINE} emissive="#1A0008" emissiveIntensity={0.18} />
      </mesh>

      {/* ── TANG ── finger arm only, curved hook at ring top ─────────────── */}
      {!thumb && (
        <mesh
          position={[
            sx * RING_X - ringR * 0.50,
            ringCY + ringR * 0.88,
            0,
          ]}
          rotation={[0, 0, 0.65]}
        >
          <torusGeometry args={[ringR * 0.36, 0.018, 8, 24, Math.PI * 0.66]} />
          <meshStandardMaterial {...STEEL} emissive="#AAAAAA" emissiveIntensity={0.08} />
        </mesh>
      )}

    </group>
  )
}

// ── Pivot — red gem in gold setting ──────────────────────────────────────────
function Pivot() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.044, 0.044, 0.012, 20]} />
        <meshStandardMaterial metalness={0.92} roughness={0.08} color="#C9A84C" />
      </mesh>
      <mesh>
        <torusGeometry args={[0.042, 0.011, 8, 20]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position={[0, 0, 0.015]}>
        <sphereGeometry args={[0.027, 16, 16]} />
        <meshStandardMaterial
          color="#CC1000" metalness={0.65} roughness={0.15}
          emissive="#660000" emissiveIntensity={0.38}
        />
      </mesh>
    </group>
  )
}

// ── Main component — animation unchanged ─────────────────────────────────────
export default function ScissorsMesh() {
  const groupRef = useRef<THREE.Group>(null)
  const arm1Ref  = useRef<THREE.Group>(null)
  const arm2Ref  = useRef<THREE.Group>(null)
  const rotYRef  = useRef(0)

  useFrame((state) => {
    if (!groupRef.current || !arm1Ref.current || !arm2Ref.current) return
    const t      = state.clock.elapsedTime
    const scroll = typeof window !== 'undefined' ? window.scrollY : 0

    // Open  = 0.31 rad (≈18° per arm, 36° total) — matches DOS47 reference
    // Closed = 0.05 rad (≈3° per arm)            — matches Kokoro reference
    const angle = 0.18 + Math.sin(t * 0.9) * 0.13
    arm1Ref.current.rotation.z =  angle
    arm2Ref.current.rotation.z = -angle

    // Scroll-driven Y rotation
    rotYRef.current = THREE.MathUtils.lerp(rotYRef.current, scroll * 0.005, 0.07)
    groupRef.current.rotation.y = rotYRef.current
    groupRef.current.position.x = 0
    groupRef.current.position.y = Math.sin(t * 0.70) * 0.10
  })

  return (
    <group ref={groupRef} scale={1.45}>
      {/* z = ±0.020: arms nearly co-planar → no visible triangle gap near pivot */}
      <group ref={arm1Ref} position={[0, 0,  0.020]}>
        <ScissorsArm thumb={false} />
      </group>
      <group ref={arm2Ref} position={[0, 0, -0.020]}>
        <ScissorsArm thumb={true} />
      </group>
      <Pivot />
    </group>
  )
}
