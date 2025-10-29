# React Three Fiber - Photon Flow Demo

A stunning 3D visualization demonstrating photon flow through fiber optic cables using React Three Fiber.

## Features

- **3D Fiber Optic Cable**: Realistic curved fiber optic cable with multiple layers (core, cladding, and glow effect)
- **Animated Photon Particles**: Particles flowing through the cable with realistic physics and variation
- **Interactive Camera Controls**: Rotate, zoom, and pan around the scene
- **Lighting Effects**: Dynamic lighting with ambient, point, and spot lights
- **Starfield Background**: Atmospheric star field for enhanced visual appeal

## Technologies Used

- **React**: UI framework
- **React Three Fiber**: React renderer for Three.js
- **Three.js**: 3D graphics library
- **@react-three/drei**: Useful helpers for React Three Fiber
- **Vite**: Fast development build tool

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How It Works

### Fiber Optic Cable

The fiber optic cable is rendered using THREE.js `TubeGeometry` along a `CatmullRomCurve3` path. It consists of three layers:

1. **Core**: Semi-transparent blue material with high transmission
2. **Cladding**: Outer protective layer
3. **Glow**: Inner glowing core for visual effect

### Photon Particles

Photons are rendered as points that:
- Flow along the same curve as the cable
- Have randomized speeds and sizes for natural variation
- Pulse and wobble slightly for organic movement
- Use additive blending for a glowing effect

## Controls

- **Left Mouse Button + Drag**: Rotate camera
- **Right Mouse Button + Drag**: Pan camera
- **Mouse Wheel**: Zoom in/out

## Customization

You can customize various parameters in the code:

- **Cable Path**: Modify the curve points in `App.jsx`
- **Particle Count**: Change the `count` prop in `<PhotonParticles />`
- **Colors**: Adjust material colors in `FiberOpticCable.jsx` and `PhotonParticles.jsx`
- **Animation Speed**: Modify `particle.speed` in `PhotonParticles.jsx`

## License

MIT
