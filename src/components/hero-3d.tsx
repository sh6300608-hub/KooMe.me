"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Core() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.18;
    ref.current.rotation.y += delta * 0.3;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, state.pointer.x * 0.35, 0.04);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, state.pointer.y * 0.22, 0.04);
  });

  return (
    <Float speed={1.15} rotationIntensity={0.3} floatIntensity={0.55}>
      <mesh ref={ref} scale={1.45}>
        <icosahedronGeometry args={[1, 2]} />
        <MeshTransmissionMaterial thickness={0.7} roughness={0.16} transmission={0.95} ior={1.45} chromaticAberration={0.035} distortion={0.12} distortionScale={0.3} color="#6d8cff" />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="hero-canvas" aria-label="Interactive 3D portfolio visual" role="img">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5.2], fov: 42 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 2, 4]} intensity={12} distance={8} />
        <pointLight position={[-3, -1, 2]} intensity={7} distance={7} />
        <Core />
        <Sparkles count={35} scale={5.5} size={1.2} speed={0.22} opacity={0.35} />
      </Canvas>
    </div>
  );
}
