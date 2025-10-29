import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function FiberOpticCable({ path }) {
  const cableRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    // Subtle pulsing effect on the glow
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <group>
      {/* Main fiber core */}
      <mesh ref={cableRef}>
        <tubeGeometry args={[path, 64, 0.1, 8, false]} />
        <meshPhysicalMaterial
          color="#1a4d6d"
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.2}
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>

      {/* Outer cladding */}
      <mesh>
        <tubeGeometry args={[path, 64, 0.12, 8, false]} />
        <meshPhysicalMaterial
          color="#2a5d8d"
          transparent
          opacity={0.3}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Glowing inner core effect */}
      <mesh ref={glowRef}>
        <tubeGeometry args={[path, 64, 0.08, 8, false]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  )
}
