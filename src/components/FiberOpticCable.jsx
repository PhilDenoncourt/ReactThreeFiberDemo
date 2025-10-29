import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function FiberOpticCable({ path }) {
  const cableRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    // Very subtle pulsing effect on the glow
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.05 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03
    }
  })

  return (
    <group>
      {/* Outer cladding - very transparent to allow particles to show through */}
      <mesh renderOrder={3}>
        <tubeGeometry args={[path, 64, 0.12, 8, false]} />
        <meshPhysicalMaterial
          color="#1a4d7d"
          transparent
          opacity={0.15}
          roughness={0.2}
          metalness={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Main fiber core - highly transparent glass-like material */}
      <mesh ref={cableRef} renderOrder={2}>
        <tubeGeometry args={[path, 64, 0.1, 8, false]} />
        <meshPhysicalMaterial
          color="#b8d4e9"
          transparent
          opacity={0.2}
          roughness={0.05}
          metalness={0.0}
          transmission={0.95}
          thickness={0.1}
          ior={1.46} // Index of refraction for optical fiber
          depthWrite={false}
        />
      </mesh>

      {/* Subtle glowing inner core effect - very faint */}
      <mesh ref={glowRef} renderOrder={1}>
        <tubeGeometry args={[path, 64, 0.08, 8, false]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
