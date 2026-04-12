"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Shape() {
  const outerRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    outerRef.current.rotation.y = t * 0.14;
    outerRef.current.rotation.x = t * 0.07;
    innerRef.current.rotation.y = -t * 0.09;
    innerRef.current.rotation.z =  t * 0.11;
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 3, 2]} intensity={0.8} />

      {/* Outer wireframe icosahedron */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshBasicMaterial color="#667eea" wireframe transparent opacity={0.35} />
      </mesh>

      {/* Inner solid — barely visible */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.72, 0]} />
        <meshStandardMaterial
          color="#667eea"
          roughness={0.6}
          metalness={0.4}
          transparent
          opacity={0.12}
        />
      </mesh>
    </>
  );
}

export function FloatingShape() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 3.8], fov: 44 }}
    >
      <Shape />
    </Canvas>
  );
}
