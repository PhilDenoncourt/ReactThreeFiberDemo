import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function PhotonParticles({ path, count = 50, isBranch = false, hasNoise = false, hasColorfulPhotons = false }) {
  const groupRef = useRef()
  const particlesRef = useRef([])

  // Initialize particle data
  const particleData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: isBranch ? Math.random() * 0.2 : i / count, // Branches start with random positions near junction
      speed: 0.75, // Faster speed for more dynamic flow
      offset: Math.random() * Math.PI * 2, // Random offset for variation
      size: 0.03 + Math.random() * 0.04, // Larger random size for better visibility
      startDelay: isBranch ? Math.random() * 2 : 0, // Stagger branch particle starts
      isDropped: false, // Track if particle has been dropped due to splice loss
      dropTime: 0, // When the particle was dropped
      scatterDirection: null, // Random direction for scattered particles
      scatterPosition: { x: 0, y: 0, z: 0 }, // Current position when scattering
      fadeAlpha: 1, // Opacity for fading out scattered particles
      // Noise-related properties
      hasNoiseEffect: Math.random() < 0.3, // Only 30% of particles are affected by noise
      noiseOffsetX: Math.random() * Math.PI * 2,
      noiseOffsetY: Math.random() * Math.PI * 2,
      noiseOffsetZ: Math.random() * Math.PI * 2,
      noiseFrequency: 2 + Math.random() * 3, // Much lower frequency for subtle effect
      noiseAmplitude: 0.08 + Math.random() * 0.012, // Much smaller amplitude
    }))
  }, [count, isBranch])

  // Create particle colors
  const particleColors = useMemo(() => {
    return particleData.map(() => {
      const color = new THREE.Color()
      if (hasColorfulPhotons) {
        // Random rainbow colors
        color.setHSL(Math.random(), 0.8 + Math.random() * 0.2, 0.4 + Math.random() * 0.4)
      } else {
        // Dark ruby red - consistent color for all particles
        color.setHSL(0.0, 0.9, 0.25)
      }
      return color
    })
  }, [particleData, hasColorfulPhotons])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    particleData.forEach((particle, i) => {
      const sphereMesh = particlesRef.current[i]
      if (!sphereMesh) return

      // Handle start delay for branch particles
      if (particle.startDelay > 0) {
        particle.startDelay -= delta
        // Hide particle during delay
        sphereMesh.visible = false
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

      let particleX, particleY, particleZ

      if (hasNoise && particle.hasNoiseEffect) {
        // Add significant noise/interference for jagged paths (only for 30% of particles)
        const time = state.clock.elapsedTime
        
        // Very subtle multi-layered noise for minimal interference
        const noiseX = 
          Math.sin(time * particle.noiseFrequency + particle.noiseOffsetX) * particle.noiseAmplitude +
          Math.sin(time * particle.noiseFrequency * 2.3 + particle.noiseOffsetX * 1.7) * (particle.noiseAmplitude * 0.2) +
          Math.sin(time * particle.noiseFrequency * 0.7 + particle.noiseOffsetX * 0.4) * (particle.noiseAmplitude * 0.3)
        
        const noiseY = 
          Math.sin(time * particle.noiseFrequency * 1.3 + particle.noiseOffsetY) * particle.noiseAmplitude +
          Math.sin(time * particle.noiseFrequency * 1.9 + particle.noiseOffsetY * 1.4) * (particle.noiseAmplitude * 0.25) +
          Math.sin(time * particle.noiseFrequency * 0.5 + particle.noiseOffsetY * 0.6) * (particle.noiseAmplitude * 0.2)
        
        const noiseZ = 
          Math.sin(time * particle.noiseFrequency * 0.9 + particle.noiseOffsetZ) * particle.noiseAmplitude +
          Math.sin(time * particle.noiseFrequency * 2.1 + particle.noiseOffsetZ * 1.2) * (particle.noiseAmplitude * 0.15) +
          Math.sin(time * particle.noiseFrequency * 0.6 + particle.noiseOffsetZ * 0.3) * (particle.noiseAmplitude * 0.25)

        // Add some position-based variation to simulate fiber imperfections
        const positionFactor = particle.position * 4
        const fiberImperfection = Math.sin(positionFactor) * 0.005 // Much smaller imperfection

        particleX = point.x + noiseX + fiberImperfection
        particleY = point.y + noiseY + fiberImperfection * 0.7
        particleZ = point.z + noiseZ + fiberImperfection * 1.2
      } else {
        // Add slight randomness for a more natural flow (original behavior)
        const wobble = Math.sin(state.clock.elapsedTime * 2 + particle.offset) * 0.015

        particleX = point.x + wobble
        particleY = point.y + wobble
        particleZ = point.z + wobble
      }

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
          sphereMesh.visible = true
          sphereMesh.position.set(
            particle.scatterPosition.x,
            particle.scatterPosition.y,
            particle.scatterPosition.z
          )
          
          // Shrink size as it fades
          const fadeScale = particle.fadeAlpha
          sphereMesh.scale.setScalar(fadeScale)
          
          // Update opacity and transmission
          if (sphereMesh.material) {
            sphereMesh.material.opacity = particle.fadeAlpha * 0.4
            sphereMesh.material.transmission = particle.fadeAlpha * 0.8
          }
        } else {
          // Particle has completely faded away, respawn it
          particle.isDropped = false
          particle.position = 0 // Restart from beginning
          particle.fadeAlpha = 1
        }
      } else if (isInsideJunctionBox) {
        // Hide particle inside junction box (but not permanently dropped)
        sphereMesh.visible = false
      } else {
        // Particle is visible in fiber cable
        sphereMesh.visible = true
        sphereMesh.position.set(particleX, particleY, particleZ)
        
        // Pulse size with slightly different frequency for branches
        const frequency = isBranch ? 4 : 3
        const pulseSize = particle.size * (1 + Math.sin(state.clock.elapsedTime * frequency + particle.offset) * 0.3)
        const scale = pulseSize / particle.size
        sphereMesh.scale.setScalar(scale)
        
        // Update opacity for fading effects
        if (sphereMesh.material) {
          sphereMesh.material.opacity = particle.fadeAlpha * 0.4
          sphereMesh.material.transmission = particle.fadeAlpha * 0.8
        }
      }
    })
  })

  return (
    <group ref={groupRef}>
      {particleData.map((particle, i) => (
        <mesh
          key={i}
          ref={(ref) => {
            if (ref) particlesRef.current[i] = ref
          }}
          renderOrder={5}
        >
          <sphereGeometry args={[particle.size, 8, 6]} />
          <meshPhysicalMaterial
            color={particleColors[i]}
            transparent
            opacity={0.4}
            transmission={0.8}
            thickness={0.3}
            roughness={0.0}
            metalness={0.1}
            reflectivity={1.0}
            ior={1.8}
            iridescence={1.0}
            iridescenceIOR={1.5}
            iridescenceThicknessRange={[200, 1000]}
            clearcoat={1.0}
            clearcoatRoughness={0.0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
