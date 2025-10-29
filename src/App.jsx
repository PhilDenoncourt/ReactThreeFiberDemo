import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo } from 'react'
import FiberOpticCable from './components/FiberOpticCable'
import PhotonParticles from './components/PhotonParticles'

function Scene() {
  // Create multiple fiber optic cable paths for a spliced network
  const fiberPaths = useMemo(() => {
    // Main trunk cable (input)
    const mainTrunk = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6, 0, 0),
      new THREE.Vector3(-4, 1, -0.5),
      new THREE.Vector3(-2, 0.5, -1),
      new THREE.Vector3(0, 0, 0), // Junction point
    ])

    // Branch 1 (upper exit)
    const branch1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), // Junction point
      new THREE.Vector3(1, 1, 0.5),
      new THREE.Vector3(3, 2, 1),
      new THREE.Vector3(5, 3, 1.5),
    ])

    // Branch 2 (middle exit)
    const branch2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), // Junction point
      new THREE.Vector3(1.5, 0, -0.5),
      new THREE.Vector3(3, -0.5, -1),
      new THREE.Vector3(5, -0.5, -1.5),
    ])

    // Branch 3 (lower exit)
    const branch3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), // Junction point
      new THREE.Vector3(1, -1, 0.5),
      new THREE.Vector3(2.5, -2, 0),
      new THREE.Vector3(4.5, -3, -0.5),
    ])

    return {
      mainTrunk,
      branch1,
      branch2,
      branch3,
    }
  }, [])

  return (
    <>
      {/* Set black background */}
      <color attach="background" args={['#000000']} />
      
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 3, 8]} fov={60} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={15}
      />

      {/* Enhanced Lighting for better junction box visibility */}
      <ambientLight intensity={0.4} />
      
      {/* Main key light from upper right */}
      <pointLight position={[5, 8, 5]} intensity={2} color="#ffffff" />
      
      {/* Fill light from upper left */}
      <pointLight position={[-5, 6, 3]} intensity={1.5} color="#ffffff" />
      
      {/* Back light for rim lighting */}
      <pointLight position={[0, 3, -8]} intensity={1} color="#ffffff" />
      
      {/* Focused spotlight on junction box */}
      <spotLight
        position={[3, 4, 3]}
        angle={0.3}
        penumbra={0.5}
        intensity={3}
        castShadow
        color="#ffffff"
        target-position={[0, 0, 0]}
      />
      
      {/* Secondary spotlight from opposite angle */}
      <spotLight
        position={[-3, 4, 3]}
        angle={0.3}
        penumbra={0.5}
        intensity={2}
        color="#ffffff"
        target-position={[0, 0, 0]}
      />

      {/* Background stars removed for white background */}

      {/* Spliced Fiber Optic Cable System */}
      <FiberOpticCable path={fiberPaths.mainTrunk} />
      <FiberOpticCable path={fiberPaths.branch1} />
      <FiberOpticCable path={fiberPaths.branch2} />
      <FiberOpticCable path={fiberPaths.branch3} />

      {/* Junction box/splice enclosure */}
      <group position={[0, 0, 0]}>
        {/* Main junction housing - Much brighter and larger */}
        <mesh>
          <boxGeometry args={[1.0, 0.7, 0.6]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.7}
            roughness={0.3}
            emissive="#404040"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Top access panel - Brighter and more visible */}
        <mesh position={[0, 0.36, 0]}>
          <boxGeometry args={[0.8, 0.03, 0.5]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.8}
            roughness={0.2}
            emissive="#505050"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Side cable ports - Larger and brighter */}
        <mesh position={[-0.5, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.12]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.7}
            roughness={0.25}
            emissive="#303030"
            emissiveIntensity={0.25}
          />
        </mesh>
        
        {/* Mounting screws - Larger and brighter */}
        <mesh position={[0.4, 0.3, 0.3]}>
          <cylinderGeometry args={[0.03, 0.03, 0.03]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.8}
            roughness={0.15}
            emissive="#606060"
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[-0.4, 0.3, 0.3]}>
          <cylinderGeometry args={[0.03, 0.03, 0.03]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.8}
            roughness={0.15}
            emissive="#606060"
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0.4, -0.3, 0.3]}>
          <cylinderGeometry args={[0.03, 0.03, 0.03]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.8}
            roughness={0.15}
            emissive="#606060"
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[-0.4, -0.3, 0.3]}>
          <cylinderGeometry args={[0.03, 0.03, 0.03]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.8}
            roughness={0.15}
            emissive="#606060"
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>

      {/* Photon Particles flowing through the spliced network */}
      <PhotonParticles path={fiberPaths.mainTrunk} count={150} isBranch={false} />
      <PhotonParticles path={fiberPaths.branch1} count={50} isBranch={true} />
      <PhotonParticles path={fiberPaths.branch2} count={50} isBranch={true} />
      <PhotonParticles path={fiberPaths.branch3} count={50} isBranch={true} />
    </>
  )
}

export default function App() {
  return (
    <>
      <div className="info-panel">
        <h1>Spliced Fiber Optic Network</h1>
        <p>
          This demo showcases photon flow through a spliced fiber optic network with multiple branches using React Three Fiber.
        </p>
        <p><strong>Features:</strong></p>
        <ul>
          <li>3D spliced fiber optic network</li>
          <li>Multiple cable branches from junction</li>
          <li>Animated photon particles with flow distribution</li>
          <li>Realistic transparent cable materials</li>
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
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ 
          background: '#4d4c4cff',
          backgroundColor: '#4d4c4cff'
        }}
      >
        <Scene />
      </Canvas>
    </>
  )
}
