'use client'

import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import ScissorsMesh from './ScissorsMesh'
import CameraController from './CameraController'

export default function ThreeCanvas() {
  return (
    // Fixed to viewport — scissors always visible in the background
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0.1, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <Stars
          radius={80}
          depth={50}
          count={700}
          factor={3}
          saturation={0}
          fade
          speed={0.25}
        />

        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 8, 4]} intensity={4.5} color="#FFFFFF" />
        <directionalLight position={[-4, 4, 2]} intensity={2.0} color="#FFFFFF" />
        <pointLight position={[-4, 3, -3]} intensity={12} color="#D4688F" />
        <pointLight position={[5, -3, 4]} intensity={3.5} color="#8AAACC" />
        <spotLight
          position={[0, 10, 1]}
          intensity={14}
          color="#FFFFFF"
          angle={0.35}
          penumbra={0.6}
        />

        <CameraController />
        <ScissorsMesh />
      </Canvas>
    </div>
  )
}
