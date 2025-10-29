import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo } from 'react'
import FiberOpticCable from './components/FiberOpticCable'
import PhotonParticles from './components/PhotonParticles'

function Scene() {
  // Create a curved path for the fiber optic cable
  const fiberPath = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5, 0, 0),
      new THREE.Vector3(-3, 2, -1),
      new THREE.Vector3(-1, 1, -2),
      new THREE.Vector3(1, -1, -1),
      new THREE.Vector3(3, 0, 1),
      new THREE.Vector3(5, 2, 0),
    ])
    return curve
  }, [])

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 3, 8]} fov={60} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={15}
      />

      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -5, -5]} intensity={0.5} color="#4488ff" />
      <spotLight
        position={[0, 5, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.5}
        castShadow
        color="#00d4ff"
      />

      {/* Background stars for atmosphere */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Fiber Optic Cable */}
      <FiberOpticCable path={fiberPath} />

      {/* Photon Particles flowing through the cable */}
      <PhotonParticles path={fiberPath} count={80} />

      {/* Optional: Grid helper for reference */}
      <gridHelper args={[20, 20, '#444444', '#222222']} position={[0, -2, 0]} />
    </>
  )
}

export default function App() {
  return (
    <>
      <div className="info-panel">
        <h1>Fiber Optic Photon Flow</h1>
        <p>
          This demo showcases photon flow through a fiber optic cable using React Three Fiber.
        </p>
        <p><strong>Features:</strong></p>
        <ul>
          <li>3D curved fiber optic cable</li>
          <li>Animated photon particles</li>
          <li>Realistic material properties</li>
          <li>Interactive camera controls</li>
        </ul>
        <p style={{ marginTop: '12px', fontSize: '12px', opacity: 0.7 }}>
          Drag to rotate • Scroll to zoom • Right-click to pan
        </p>
      </div>

      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        style={{ background: '#000814' }}
      >
        <Scene />
      </Canvas>
    </>
  )
}
