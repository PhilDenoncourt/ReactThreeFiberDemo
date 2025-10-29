import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function PhotonParticles({ path, count = 50 }) {
  const pointsRef = useRef()
  const particlesRef = useRef()

  // Initialize particle data
  const particleData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: i / count, // Position along the curve (0-1)
      speed: 0.3 + Math.random() * 0.4, // Random speed
      offset: Math.random() * Math.PI * 2, // Random offset for variation
      size: 0.05 + Math.random() * 0.1, // Random size
    }))
  }, [count])

  // Create geometry for particles
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const colors = new Float32Array(count * 3)

    particleData.forEach((particle, i) => {
      sizes[i] = particle.size

      // Color variation - cyan to blue
      const color = new THREE.Color()
      color.setHSL(0.5 + Math.random() * 0.1, 1, 0.6)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    })

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    return geo
  }, [count, particleData])

  useFrame((state, delta) => {
    if (!pointsRef.current || !particlesRef.current) return

    const positions = pointsRef.current.geometry.attributes.position.array
    const sizes = pointsRef.current.geometry.attributes.size.array

    particleData.forEach((particle, i) => {
      // Update position along the path
      particle.position += delta * particle.speed

      // Loop back to start
      if (particle.position > 1) {
        particle.position = 0
      }

      // Get point on curve
      const point = path.getPoint(particle.position)

      // Add slight randomness for a more natural flow
      const wobble = Math.sin(state.clock.elapsedTime * 2 + particle.offset) * 0.02

      positions[i * 3] = point.x + wobble
      positions[i * 3 + 1] = point.y + wobble
      positions[i * 3 + 2] = point.z + wobble

      // Pulse size
      const pulseSize = particle.size * (1 + Math.sin(state.clock.elapsedTime * 3 + particle.offset) * 0.3)
      sizes[i] = pulseSize
    })

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.geometry.attributes.size.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry attach="geometry" {...geometry} />
      <pointsMaterial
        ref={particlesRef}
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
