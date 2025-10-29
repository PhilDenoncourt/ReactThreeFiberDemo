import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function PhotonParticles({ path, count = 50, isBranch = false }) {
  const pointsRef = useRef()
  const particlesRef = useRef()

  // Initialize particle data
  const particleData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: isBranch ? Math.random() * 0.2 : i / count, // Branches start with random positions near junction
      speed: 0.2 + Math.random() * 0.3, // Slightly slower for better visibility
      offset: Math.random() * Math.PI * 2, // Random offset for variation
      size: 0.01 + Math.random() * 0.02, // Much smaller random size, similar to stars
      startDelay: isBranch ? Math.random() * 2 : 0, // Stagger branch particle starts
    }))
  }, [count, isBranch])

  // Create geometry for particles
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const colors = new Float32Array(count * 3)

    particleData.forEach((particle, i) => {
      sizes[i] = particle.size

      // Color variation - yellow to dark yellow (black)
      const color = new THREE.Color()
      color.setHSL(0.15 + Math.random() * 0.02, 1, 0.2 + Math.random() * 0.4)
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
      // Handle start delay for branch particles
      if (particle.startDelay > 0) {
        particle.startDelay -= delta
        // Hide particle during delay
        positions[i * 3] = 0
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = 0
        sizes[i] = 0
        return
      }

      // Update position along the path
      particle.position += delta * particle.speed

      // Loop back to start
      if (particle.position > 1) {
        particle.position = isBranch ? 0 : 0
      }

      // Get point on curve
      const point = path.getPoint(Math.min(particle.position, 1))

      // Add slight randomness for a more natural flow
      const wobble = Math.sin(state.clock.elapsedTime * 2 + particle.offset) * 0.015

      const particleX = point.x + wobble
      const particleY = point.y + wobble
      const particleZ = point.z + wobble

      // Hide particles inside the junction box (centered at origin)
      // Junction box dimensions: 1.0 x 0.7 x 0.6
      const isInsideJunctionBox = (
        Math.abs(particleX) < 0.5 && 
        Math.abs(particleY) < 0.35 && 
        Math.abs(particleZ) < 0.3
      )

      if (isInsideJunctionBox) {
        // Hide particle by making it invisible
        positions[i * 3] = 0
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = 0
        sizes[i] = 0
      } else {
        positions[i * 3] = particleX
        positions[i * 3 + 1] = particleY
        positions[i * 3 + 2] = particleZ
      }

      // Only update size if particle is not hidden
      if (!isInsideJunctionBox) {
        // Pulse size with slightly different frequency for branches
        const frequency = isBranch ? 4 : 3
        const pulseSize = particle.size * (1 + Math.sin(state.clock.elapsedTime * frequency + particle.offset) * 0.3)
        sizes[i] = pulseSize
      }
    })

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.geometry.attributes.size.needsUpdate = true
  })

  return (
    <points ref={pointsRef} renderOrder={5}>
      <bufferGeometry attach="geometry" {...geometry} />
      <pointsMaterial
        ref={particlesRef}
        size={0.05}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.NormalBlending}
        depthWrite={false}
        depthTest={false}
      />
    </points>
  )
}
