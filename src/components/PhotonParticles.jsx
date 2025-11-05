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
      speed: 0.35, // Constant speed representing the speed of light
      offset: Math.random() * Math.PI * 2, // Random offset for variation
      size: 0.01 + Math.random() * 0.02, // Much smaller random size, similar to stars
      startDelay: isBranch ? Math.random() * 2 : 0, // Stagger branch particle starts
      isDropped: false, // Track if particle has been dropped due to splice loss
      dropTime: 0, // When the particle was dropped
      scatterDirection: null, // Random direction for scattered particles
      scatterPosition: { x: 0, y: 0, z: 0 }, // Current position when scattering
      fadeAlpha: 1, // Opacity for fading out scattered particles
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

      // Check if particle is inside the junction box (centered at origin)
      // Junction box dimensions: 1.0 x 0.7 x 0.6
      const isInsideJunctionBox = (
        Math.abs(particleX) < 0.5 && 
        Math.abs(particleY) < 0.35 && 
        Math.abs(particleZ) < 0.3
      )

      // Simulate splice loss: 1 in 1000 particles (0.1%) get dropped at the junction
      if (isInsideJunctionBox && !particle.isDropped && !isBranch) {
        // Only main trunk particles can be dropped (not branch particles)
        if (Math.random() < 0.001) { // 0.1% chance (1 in 1000)
          particle.isDropped = true
          particle.dropTime = state.clock.elapsedTime
          
          // Create random scatter direction
          const theta = Math.random() * Math.PI * 2 // Random angle around Y axis
          const phi = Math.random() * Math.PI // Random angle from vertical
          particle.scatterDirection = {
            x: Math.sin(phi) * Math.cos(theta),
            y: Math.sin(phi) * Math.sin(theta),
            z: Math.cos(phi)
          }
          
          // Start scattering from current position
          particle.scatterPosition = {
            x: particleX,
            y: particleY,
            z: particleZ
          }
          particle.fadeAlpha = 1
        }
      }

      // Handle dropped particles - scatter them away
      if (particle.isDropped) {
        const timeElapsed = state.clock.elapsedTime - particle.dropTime
        const scatterSpeed = 0.15
        
        if (timeElapsed < 2) {
          // Particle scatters away from junction box
          particle.scatterPosition.x += particle.scatterDirection.x * scatterSpeed * delta
          particle.scatterPosition.y += particle.scatterDirection.y * scatterSpeed * delta
          particle.scatterPosition.z += particle.scatterDirection.z * scatterSpeed * delta
          
          // Fade out as it scatters
          particle.fadeAlpha = Math.max(0, 1 - timeElapsed / 2)
          
          // Position the scattered particle
          positions[i * 3] = particle.scatterPosition.x
          positions[i * 3 + 1] = particle.scatterPosition.y
          positions[i * 3 + 2] = particle.scatterPosition.z
          
          // Shrink size as it fades
          const fadeSize = particle.size * particle.fadeAlpha
          sizes[i] = fadeSize
        } else {
          // Particle has completely faded away, respawn it
          particle.isDropped = false
          particle.position = 0 // Restart from beginning
          particle.fadeAlpha = 1
        }
      } else if (isInsideJunctionBox) {
        // Hide particle inside junction box (but not permanently dropped)
        positions[i * 3] = 0
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = 0
        sizes[i] = 0
      } else {
        // Particle is visible in fiber cable
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
