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

        <ambientLight intensity={0.22} />
        <directionalLight position={[4, 8, 4]} intensity={2.5} color="#FFFFFF" />
        <pointLight position={[-4, 3, -3]} intensity={7} color="#C9A84C" />
        <pointLight position={[5, -3, 4]} intensity={1.5} color="#7090C0" />
        <spotLight
          position={[0, 10, 1]}
          intensity={9}
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
