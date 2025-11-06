import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Stars, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo, useState, useEffect } from 'react'
import FiberOpticCable from './components/FiberOpticCable'
import PhotonParticles from './components/PhotonParticles'

// Reusable Server Rack Component - Cartoonish Style
function ServerRack({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Main rack chassis - rounded and colorful */}
      <RoundedBox args={[1.2, 2.4, 0.8]} radius={0.1} smoothness={4}>
        <meshPhysicalMaterial
          color="#3d5a78"
          metalness={0.2}
          roughness={0.4}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          emissive="#1a2d42"
          emissiveIntensity={0.3}
        />
      </RoundedBox>
      
      {/* Base platform */}
      <RoundedBox position={[0, -1.3, 0]} args={[1.4, 0.2, 1.0]} radius={0.05} smoothness={4}>
        <meshPhysicalMaterial
          color="#2a3d52"
          metalness={0.3}
          roughness={0.4}
          clearcoat={1.0}
          emissive="#152030"
          emissiveIntensity={0.2}
        />
      </RoundedBox>
      
      {/* Server units (4 larger units instead of 12 small ones) */}
      {[...Array(4)].map((_, i) => {
        const yPos = 0.6 - (i * 0.4)
        const colors = ['#4a6b8a', '#4a6b8a', '#6b8aa4', '#4a6b8a']
        const ledColors = [
          { primary: '#00a8ff', secondary: '#00ff88' },
          { primary: '#00a8ff', secondary: '#00ff88' },  
          { primary: '#ff6b35', secondary: '#00ff88' },
          { primary: '#00a8ff', secondary: '#ff4757' }
        ]
        
        return (
          <group key={i} position={[0, yPos, 0.1]}>
            {/* Server body - rounded */}
            <RoundedBox args={[1.0, 0.3, 0.6]} radius={0.05} smoothness={4}>
              <meshPhysicalMaterial
                color={colors[i]}
                metalness={0.1}
                roughness={0.5}
                clearcoat={1.0}
                clearcoatRoughness={0.1}
                emissive={colors[i]}
                emissiveIntensity={0.2}
              />
            </RoundedBox>
            
            {/* Server front panel - inset design */}
            <RoundedBox position={[0, 0, 0.31]} args={[0.95, 0.25, 0.02]} radius={0.02} smoothness={4}>
              <meshPhysicalMaterial
                color="#5a7a95"
                metalness={0.05}
                roughness={0.6}
                clearcoat={0.8}
                emissive="#2a3d52"
                emissiveIntensity={0.3}
              />
            </RoundedBox>
            
            {/* Large colorful status LEDs */}
            <mesh position={[-0.35, 0.05, 0.32]}>
              <sphereGeometry args={[0.035]} />
              <meshPhysicalMaterial
                color={ledColors[i].primary}
                emissive={ledColors[i].primary}
                emissiveIntensity={1.5}
                roughness={0.0}
                metalness={0.0}
                transmission={0.2}
              />
            </mesh>
            
            <mesh position={[-0.35, -0.05, 0.32]}>
              <sphereGeometry args={[0.03]} />
              <meshPhysicalMaterial
                color={ledColors[i].secondary}
                emissive={ledColors[i].secondary}
                emissiveIntensity={1.2}
                roughness={0.0}
                metalness={0.0}
                transmission={0.2}
              />
            </mesh>
            
            {/* Decorative ventilation strips */}
            {[...Array(6)].map((_, j) => (
              <RoundedBox key={j} position={[-0.1 + (j * 0.1), 0, 0.32]} args={[0.06, 0.15, 0.005]} radius={0.01} smoothness={2}>
                <meshPhysicalMaterial
                  color="#2a3d52"
                  metalness={0.4}
                  roughness={0.3}
                  emissive="#0a1117"
                  emissiveIntensity={0.5}
                />
              </RoundedBox>
            ))}
            
            {/* Modern rectangular ports */}
            {i < 2 && (
              <>
                <RoundedBox position={[0.35, 0.05, 0.32]} args={[0.08, 0.03, 0.01]} radius={0.005} smoothness={2}>
                  <meshPhysicalMaterial
                    color="#1a1a1a"
                    metalness={0.8}
                    roughness={0.2}
                  />
                </RoundedBox>
                <RoundedBox position={[0.35, -0.05, 0.32]} args={[0.08, 0.03, 0.01]} radius={0.005} smoothness={2}>
                  <meshPhysicalMaterial
                    color="#1a1a1a"
                    metalness={0.8}
                    roughness={0.2}
                  />
                </RoundedBox>
              </>
            )}
          </group>
        )
      })}
      
      {/* Stylized top section with fiber connections */}
      <RoundedBox position={[0, 1.1, 0.1]} args={[1.0, 0.4, 0.6]} radius={0.05} smoothness={4}>
        <meshPhysicalMaterial
          color="#4a6b8a"
          metalness={0.2}
          roughness={0.4}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          emissive="#1a2d42"
          emissiveIntensity={0.4}
        />
      </RoundedBox>
      
      {/* Colorful fiber optic connection indicators */}
      {[...Array(6)].map((_, i) => {
        const colors = ['#00a8ff', '#00ff88', '#ff6b35', '#00a8ff', '#ff4757', '#00ff88']
        return (
          <mesh key={i} position={[-0.25 + (i * 0.1), 1.1, 0.41]}>
            <sphereGeometry args={[0.025]} />
            <meshPhysicalMaterial
              color={colors[i]}
              emissive={colors[i]}
              emissiveIntensity={2.0}
              roughness={0.0}
              metalness={0.0}
              transmission={0.2}
              ior={1.4}
            />
          </mesh>
        )
      })}
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
      <PhotonParticles path={fiberPaths.leftToCenter} count={25} isBranch={true} hasNoise={hasNoise} hasColorfulPhotons={hasColorfulPhotons} />
      <PhotonParticles path={fiberPaths.centerToLeft} count={25} isBranch={true} hasNoise={hasNoise} hasColorfulPhotons={hasColorfulPhotons} />
      <PhotonParticles path={fiberPaths.centerToRight} count={25} isBranch={true} hasNoise={hasNoise} hasColorfulPhotons={hasColorfulPhotons} />
      <PhotonParticles path={fiberPaths.rightToCenter} count={25} isBranch={true} hasNoise={hasNoise} hasColorfulPhotons={hasColorfulPhotons} />
    </>
  )
}

export default function App() {
  const [hasNoise, setHasNoise] = useState(false)
  const [hasColorfulPhotons, setHasColorfulPhotons] = useState(false)
  const [showColorfulPhotonsOption, setShowColorfulPhotonsOption] = useState(false)

  // Keyboard event handler for 'C' key
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key.toLowerCase() === 'c') {
        setShowColorfulPhotonsOption(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

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
          
          {/* Colorful Photons Control - Hidden by default, shown when 'C' is pressed */}
          {showColorfulPhotonsOption && (
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
          )}
          
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
            {showColorfulPhotonsOption && (
              hasColorfulPhotons 
                ? "Colors: Random rainbow photon colors."
                : "Colors: Dark ruby red photons."
            )}
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
