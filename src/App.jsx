import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo, useState } from 'react'
import FiberOpticCable from './components/FiberOpticCable'
import PhotonParticles from './components/PhotonParticles'

// Reusable Server Rack Component
function ServerRack({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Main rack chassis */}
      <mesh>
        <boxGeometry args={[1.2, 2.4, 0.8]} />
        <meshStandardMaterial
          color="#4a4a4a"
          metalness={0.8}
          roughness={0.3}
          emissive="#1a1a1a"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Rack frame (left rail) */}
      <mesh position={[-0.55, 0, 0.35]}>
        <boxGeometry args={[0.05, 2.4, 0.1]} />
        <meshStandardMaterial
          color="#777777"
          metalness={0.9}
          roughness={0.2}
          emissive="#2a2a2a"
          emissiveIntensity={0.15}
        />
      </mesh>
      
      {/* Rack frame (right rail) */}
      <mesh position={[0.55, 0, 0.35]}>
        <boxGeometry args={[0.05, 2.4, 0.1]} />
        <meshStandardMaterial
          color="#777777"
          metalness={0.9}
          roughness={0.2}
          emissive="#2a2a2a"
          emissiveIntensity={0.15}
        />
      </mesh>
      
      {/* Server units (1U servers) */}
      {[...Array(12)].map((_, i) => {
        const yPos = 1.0 - (i * 0.18)
        return (
          <group key={i} position={[0, yPos, 0.1]}>
            {/* Server body */}
            <mesh>
              <boxGeometry args={[1.0, 0.15, 0.6]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? "#3a3a3a" : "#4a4a4a"}
                metalness={0.7}
                roughness={0.4}
                emissive={i % 2 === 0 ? "#151515" : "#1a1a1a"}
                emissiveIntensity={0.1}
              />
            </mesh>
            
            {/* Server bezel/front panel */}
            <mesh position={[0, 0, 0.31]}>
              <boxGeometry args={[0.98, 0.13, 0.02]} />
              <meshStandardMaterial
                color="#555555"
                metalness={0.6}
                roughness={0.3}
                emissive="#222222"
                emissiveIntensity={0.15}
              />
            </mesh>
            
            {/* Status LEDs */}
            <mesh position={[-0.4, 0, 0.32]}>
              <sphereGeometry args={[0.01]} />
              <meshStandardMaterial
                color={i < 8 ? "#00ff00" : "#ff0000"}
                emissive={i < 8 ? "#004400" : "#440000"}
                emissiveIntensity={0.8}
              />
            </mesh>
            
            <mesh position={[-0.35, 0, 0.32]}>
              <sphereGeometry args={[0.01]} />
              <meshStandardMaterial
                color="#0088ff"
                emissive="#002244"
                emissiveIntensity={0.6}
              />
            </mesh>
            
            {/* Ventilation grilles */}
            {[...Array(8)].map((_, j) => (
              <mesh key={j} position={[0.1 + (j * 0.08), 0, 0.32]}>
                <boxGeometry args={[0.03, 0.08, 0.005]} />
                <meshStandardMaterial
                  color="#000000"
                  metalness={0.8}
                  roughness={0.9}
                />
              </mesh>
            ))}
            
            {/* Network ports (fiber optic connections) */}
            {i < 4 && (
              <>
                <mesh position={[-0.45, 0.03, 0.32]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.02]} />
                  <meshStandardMaterial
                    color="#444444"
                    metalness={0.7}
                    roughness={0.3}
                  />
                </mesh>
                <mesh position={[-0.45, -0.03, 0.32]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.02]} />
                  <meshStandardMaterial
                    color="#444444"
                    metalness={0.7}
                    roughness={0.3}
                  />
                </mesh>
              </>
            )}
          </group>
        )
      })}
      
      {/* Rack mounting holes */}
      {[...Array(24)].map((_, i) => {
        const yPos = 1.15 - (i * 0.09)
        return (
          <group key={i}>
            <mesh position={[-0.52, yPos, 0.35]}>
              <cylinderGeometry args={[0.01, 0.01, 0.12]} />
              <meshStandardMaterial
                color="#000000"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[0.52, yPos, 0.35]}>
              <cylinderGeometry args={[0.01, 0.01, 0.12]} />
              <meshStandardMaterial
                color="#000000"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          </group>
        )
      })}
      
      {/* Cable management tray */}
      <mesh position={[0, -1.3, 0]}>
        <boxGeometry args={[1.0, 0.1, 0.6]} />
        <meshStandardMaterial
          color="#666666"
          metalness={0.6}
          roughness={0.4}
          emissive="#222222"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Network switch (top unit with fiber connections) */}
      <mesh position={[0, 1.3, 0.1]}>
        <boxGeometry args={[1.0, 0.2, 0.6]} />
        <meshStandardMaterial
          color="#2a2a4e"
          metalness={0.8}
          roughness={0.2}
          emissive="#1a1a2e"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Fiber optic patch panel indicators */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[-0.3 + (i * 0.12), 1.3, 0.41]}>
          <sphereGeometry args={[0.015]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#003333"
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

function Scene({ hasNoise, hasColorfulPhotons }) {
  // Create bidirectional fiber optic cable paths between center and side racks
  const fiberPaths = useMemo(() => {
    // Connection from left rack to center rack
    const leftToCenter = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6, 0.2, 1.8), // Left rack - moved back slightly
      new THREE.Vector3(-4, 0.4, 1.2),
      new THREE.Vector3(-2, 0.3, 0.6),
      new THREE.Vector3(-0.3, 0.1, 0.3), // Central rack - offset left side
    ])

    // Connection from center rack to left rack  
    const centerToLeft = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.3, -0.4, -0.3), // Central rack - moved down
      new THREE.Vector3(-2, -0.2, 0.0),
      new THREE.Vector3(-4, -0.1, 0.5),
      new THREE.Vector3(-6, -0.5, 1.2), // Left rack - moved down
    ])

    // Connection from center rack to right rack
    const centerToRight = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.3, -0.2, 0.3), // Central rack - moved down
      new THREE.Vector3(2, 0.0, -0.0),
      new THREE.Vector3(4, -0.1, -0.5),
      new THREE.Vector3(6, -0.1, -1.2), // Right rack - moved down
    ])

    // Connection from right rack to center rack
    const rightToCenter = new THREE.CatmullRomCurve3([
      new THREE.Vector3(6, -0.2, -1.8), // Right rack - moved back slightly
      new THREE.Vector3(4, 0.4, -1.2),
      new THREE.Vector3(2, 0.1, -0.6),
      new THREE.Vector3(0.3, -0.1, -0.3), // Central rack - offset right side, moved forward
    ])

    return {
      leftToCenter,
      centerToLeft,
      centerToRight,
      rightToCenter,
    }
  }, [])

  return (
    <>
      {/* Set black background */}
      <color attach="background" args={['#000000']} />
      
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={60} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={20}
      />

      {/* Enhanced Lighting for data center visibility */}
      <ambientLight intensity={1.5} />
      
      {/* Main overhead lighting (data center fluorescents) */}
      <pointLight position={[0, 12, 0]} intensity={6} color="#ffffff" />
      <pointLight position={[-6, 12, 1.5]} intensity={6} color="#ffffff" />
      <pointLight position={[6, 12, -1.5]} intensity={6} color="#ffffff" />
      
      {/* Additional overhead grid lighting */}
      <pointLight position={[-3, 10, 0]} intensity={4} color="#ffffff" />
      <pointLight position={[3, 10, 0]} intensity={4} color="#ffffff" />
      <pointLight position={[0, 10, 3]} intensity={4} color="#ffffff" />
      <pointLight position={[0, 10, -3]} intensity={4} color="#ffffff" />
      
      {/* Key lights from upper corners */}
      <pointLight position={[10, 12, 10]} intensity={4} color="#ffffff" />
      <pointLight position={[-10, 12, 10]} intensity={4} color="#ffffff" />
      <pointLight position={[10, 12, -10]} intensity={4} color="#ffffff" />
      <pointLight position={[-10, 12, -10]} intensity={4} color="#ffffff" />
      
      {/* Rack-specific spotlights with higher intensity */}
      <spotLight
        position={[0, 8, 4]}
        angle={0.6}
        penumbra={0.2}
        intensity={8}
        color="#ffffff"
        target-position={[0, 0, 0]}
      />
      
      <spotLight
        position={[-6, 8, 5.5]}
        angle={0.6}
        penumbra={0.2}
        intensity={8}
        color="#ffffff"
        target-position={[-6, 0, 1.5]}
      />
      
      <spotLight
        position={[6, 8, 2.5]}
        angle={0.6}
        penumbra={0.2}
        intensity={8}
        color="#ffffff"
        target-position={[6, 0, -1.5]}
      />
      
      {/* Front lighting for server details */}
      <pointLight position={[0, 2, 5]} intensity={5} color="#ffffff" />
      <pointLight position={[-6, 2, 6.5]} intensity={5} color="#ffffff" />
      <pointLight position={[6, 2, 3.5]} intensity={5} color="#ffffff" />
      
      {/* Side and back lighting for dimension */}
      <pointLight position={[-15, 6, 0]} intensity={3} color="#ffffff" />
      <pointLight position={[15, 6, 0]} intensity={3} color="#ffffff" />
      <pointLight position={[0, 6, -10]} intensity={3} color="#ffffff" />

      {/* Background stars removed for white background */}

      {/* Bidirectional Fiber Optic Cable System */}
      <FiberOpticCable path={fiberPaths.leftToCenter} />
      <FiberOpticCable path={fiberPaths.centerToLeft} />
      <FiberOpticCable path={fiberPaths.centerToRight} />
      <FiberOpticCable path={fiberPaths.rightToCenter} />

      {/* Three Server Racks */}
      <ServerRack position={[0, 0, 0]} />      {/* Central rack */}
      <ServerRack position={[-6, 0, 1.5]} />   {/* Left rack */}
      <ServerRack position={[6, 0, -1.5]} />   {/* Right rack */}

      {/* Photon Particles flowing bidirectionally between racks */}
      <PhotonParticles path={fiberPaths.leftToCenter} count={80} isBranch={true} hasNoise={hasNoise} hasColorfulPhotons={hasColorfulPhotons} />
      <PhotonParticles path={fiberPaths.centerToLeft} count={80} isBranch={true} hasNoise={hasNoise} hasColorfulPhotons={hasColorfulPhotons} />
      <PhotonParticles path={fiberPaths.centerToRight} count={80} isBranch={true} hasNoise={hasNoise} hasColorfulPhotons={hasColorfulPhotons} />
      <PhotonParticles path={fiberPaths.rightToCenter} count={80} isBranch={true} hasNoise={hasNoise} hasColorfulPhotons={hasColorfulPhotons} />
    </>
  )
}

export default function App() {
  const [hasNoise, setHasNoise] = useState(false)
  const [hasColorfulPhotons, setHasColorfulPhotons] = useState(false)

  return (
    <>
      <div className="info-panel">
        <h1>Data Center Fiber Network</h1>
        <p>
          This demo showcases photon flow through a fiber optic network connecting three server racks in a data center environment using React Three Fiber.
        </p>
        <p><strong>Features:</strong></p>
        <ul>
          <li>Three realistic 3D server racks</li>
          <li>Inter-rack fiber optic connections</li>
          <li>Animated photon particles showing data flow</li>
          <li>Server units with status LEDs and network ports</li>
          <li>Interactive camera controls</li>
        </ul>
        
        {/* Controls */}
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <p><strong>Visualization Controls:</strong></p>
          
          {/* Noise Control */}
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '8px'
          }}>
            <input
              type="checkbox"
              checked={hasNoise}
              onChange={(e) => setHasNoise(e.target.checked)}
              style={{ transform: 'scale(1.2)' }}
            />
            <span>Enable Fiber Noise/Interference</span>
          </label>
          
          {/* Colorful Photons Control */}
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            <input
              type="checkbox"
              checked={hasColorfulPhotons}
              onChange={(e) => setHasColorfulPhotons(e.target.checked)}
              style={{ transform: 'scale(1.2)' }}
            />
            <span>Colorful Photons</span>
          </label>
          
          <p style={{ 
            fontSize: '12px', 
            opacity: 0.8, 
            margin: '8px 0 0 0',
            lineHeight: '1.3'
          }}>
            {hasNoise 
              ? "Noise: Photons follow jagged paths indicating signal interference. "
              : "Noise: Photons flow smoothly along the ideal fiber optic path. "
            }
            {hasColorfulPhotons 
              ? "Colors: Random rainbow photon colors."
              : "Colors: Traditional yellow/amber fiber optic photons."
            }
          </p>
        </div>
        
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
        <Scene hasNoise={hasNoise} hasColorfulPhotons={hasColorfulPhotons} />
      </Canvas>
    </>
  )
}
