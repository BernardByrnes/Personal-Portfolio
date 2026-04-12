"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  progress: React.MutableRefObject<number>;
};

function invLerp(min: number, max: number, v: number) {
  return Math.min(1, Math.max(0, (v - min) / (max - min)));
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function Laptop({ progress }: Props) {
  const groupRef       = useRef<THREE.Group>(null!);
  const pivotRef       = useRef<THREE.Group>(null!);
  const screenMatRef   = useRef<THREE.MeshStandardMaterial>(null!);
  const screenLightRef = useRef<THREE.PointLight>(null!);
  const kbLightRef     = useRef<THREE.PointLight>(null!);
  const textMatRef     = useRef<THREE.MeshBasicMaterial>(null!);

  const [screenTexture, setScreenTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width  = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext("2d")!;

    // Screen background
    ctx.fillStyle = "#04040e";
    ctx.fillRect(0, 0, 1024, 640);

    // Radial glow
    const grad = ctx.createRadialGradient(512, 320, 0, 512, 320, 480);
    grad.addColorStop(0, "rgba(60, 90, 220, 0.18)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 640);

    // Main text
    ctx.fillStyle = "rgba(255, 255, 255, 0.93)";
    ctx.font = "600 46px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Engineered for Experience", 512, 308);

    // Accent underline
    ctx.strokeStyle = "rgba(110, 145, 255, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(195, 362);
    ctx.lineTo(830, 362);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    setScreenTexture(tex);
    return () => tex.dispose();
  }, []);

  useFrame(() => {
    const p = progress.current;

    // Whole laptop Y rotation (0 → 0.35 rad) — builds 3/4 view over full scroll
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        0, 0.35, easeInOut(invLerp(0, 0.9, p))
      );
    }

    // Lid opens: scroll 0.2 → 0.42, rotation -0.02 → -1.92 rad (110°)
    if (pivotRef.current) {
      const t = easeInOut(invLerp(0.2, 0.42, p));
      pivotRef.current.rotation.x = THREE.MathUtils.lerp(-0.02, -1.92, t);
    }

    // Screen glow turns on: scroll 0.4 → 0.56
    if (screenMatRef.current) {
      screenMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        0, 0.6, invLerp(0.4, 0.56, p)
      );
    }

    // Screen point light: scroll 0.4 → 0.56
    if (screenLightRef.current) {
      screenLightRef.current.intensity = THREE.MathUtils.lerp(
        0, 2.2, invLerp(0.4, 0.56, p)
      );
    }

    // Keyboard backlight: scroll 0.42 → 0.58
    if (kbLightRef.current) {
      kbLightRef.current.intensity = THREE.MathUtils.lerp(
        0, 0.45, invLerp(0.42, 0.58, p)
      );
    }

    // Screen text fades in: scroll 0.56 → 0.74
    if (textMatRef.current) {
      textMatRef.current.opacity = THREE.MathUtils.lerp(
        0, 1, invLerp(0.56, 0.74, p)
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Soft shadow beneath laptop */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.055, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.4} />
      </mesh>

      {/* ── Base / keyboard deck ─────────────────────────────── */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 0.1, 2]} />
        <meshStandardMaterial color="#1c1c1e" roughness={0.74} metalness={0.88} />
      </mesh>

      {/* Keyboard recess */}
      <mesh position={[0, 0.051, -0.06]}>
        <boxGeometry args={[2.44, 0.004, 1.44]} />
        <meshStandardMaterial color="#111113" roughness={0.95} metalness={0.3} />
      </mesh>

      {/* Touchpad */}
      <mesh position={[0, 0.052, 0.62]}>
        <boxGeometry args={[0.88, 0.003, 0.52]} />
        <meshStandardMaterial color="#161618" roughness={0.52} metalness={0.68} />
      </mesh>

      {/* Keyboard backlight — rises with screen */}
      <pointLight
        ref={kbLightRef}
        position={[0, 0.22, 0.08]}
        intensity={0}
        color="#aabdff"
        distance={2.2}
        decay={2}
      />

      {/* Hinge cylinder */}
      <mesh position={[0, 0.066, -0.968]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.032, 0.032, 3.12, 16]} />
        <meshStandardMaterial color="#2a2a2e" roughness={0.38} metalness={0.96} />
      </mesh>

      {/* ── Lid pivot group — hinge at back-top of base ──────── */}
      {/*   pivot at [0, 0.05, -1]; lid extends toward +z        */}
      <group ref={pivotRef} position={[0, 0.05, -1]}>

        {/* Lid shell */}
        <mesh castShadow position={[0, 0.04, 1]}>
          <boxGeometry args={[3, 0.08, 2]} />
          <meshStandardMaterial color="#1c1c1e" roughness={0.72} metalness={0.88} />
        </mesh>

        {/* Screen bezel (slightly larger, matte black) */}
        <mesh position={[0, -0.0005, 1]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.84, 1.84]} />
          <meshStandardMaterial color="#0a0a0c" roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Screen surface — emissive glow background */}
        <mesh position={[0, -0.0015, 1]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.58, 1.64]} />
          <meshStandardMaterial
            ref={screenMatRef}
            color="#04040e"
            emissive={new THREE.Color("#2244ff")}
            emissiveIntensity={0}
            roughness={0.04}
            metalness={0}
          />
        </mesh>

        {/* Screen text — fades in once screen is on */}
        {screenTexture && (
          <mesh position={[0, -0.0025, 1]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.58, 1.64]} />
            <meshBasicMaterial
              ref={textMatRef}
              map={screenTexture}
              transparent
              opacity={0}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Screen glow light — spills onto keyboard when open */}
        <pointLight
          ref={screenLightRef}
          position={[0, -0.35, 0.6]}
          intensity={0}
          color="#3355ff"
          distance={5}
          decay={2}
        />
      </group>
    </group>
  );
}
