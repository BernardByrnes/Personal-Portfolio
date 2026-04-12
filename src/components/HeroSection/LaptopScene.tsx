"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { Laptop } from "./Laptop";

/* ── Ambient particle field around the laptop ─────────────── */
function Particles() {
  const ref = useRef<THREE.Points>(null!);

  const geometry = useMemo(() => {
    const count = 160;
    const pos   = new Float32Array(count * 3);
    const col   = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r     = 6 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const t = Math.random();
      col[i * 3]     = 0.65 + t * 0.35;   // R: warm blue-white
      col[i * 3 + 1] = 0.72 + t * 0.28;   // G
      col[i * 3 + 2] = 1.0;               // B
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    ref.current.rotation.y =  clock.elapsedTime * 0.04;
    ref.current.rotation.x =  Math.sin(clock.elapsedTime * 0.018) * 0.08;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.022}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

type SceneProps = {
  progress: React.MutableRefObject<number>;
  mouse:    React.MutableRefObject<{ x: number; y: number }>;
};

function invLerp(min: number, max: number, v: number) {
  return Math.min(1, Math.max(0, (v - min) / (max - min)));
}

/** Remaps scroll progress to curve parameter — slow start/end, fast arc */
function progressToT(p: number): number {
  if (p < 0.35) return invLerp(0, 0.35, p) * 0.25;
  if (p < 0.68) return 0.25 + invLerp(0.35, 0.68, p) * 0.5;
  return 0.75 + invLerp(0.68, 1, p) * 0.25;
}

function CameraRig({ progress, mouse }: SceneProps) {
  const { camera } = useThree();

  // Arc from behind laptop → high over top → in front 3/4 view
  const arc = useMemo(
    () =>
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0,   1.2, -5.5),  // start: close to back of closed lid
        new THREE.Vector3(0,   6.5,  0.5),  // control: high arc
        new THREE.Vector3(2.8, 2.0,  8.0)   // end: front 3/4 pulled back
      ),
    []
  );

  const basePos  = useMemo(() => new THREE.Vector3(), []);
  const finalPos = useMemo(() => new THREE.Vector3(), []);
  const lookAt   = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const p  = progress.current;
    const t  = progressToT(p);
    const mx = mouse.current.x;
    const my = mouse.current.y;

    arc.getPoint(t, basePos);

    // Subtle mouse parallax layered on top
    finalPos.set(
      basePos.x + mx * 0.18,
      basePos.y + my * 0.12,
      basePos.z
    );

    camera.position.copy(finalPos);

    // lookAt — slightly above laptop centre, drifts right as we pull back
    lookAt.set(
      THREE.MathUtils.lerp(0, 0.6, invLerp(0.65, 1, p)),
      THREE.MathUtils.lerp(0.3, 0.45, invLerp(0.65, 1, p)),
      0
    );
    camera.lookAt(lookAt);
  });

  return null;
}

function Scene({ progress, mouse }: SceneProps) {
  return (
    <>
      <CameraRig progress={progress} mouse={mouse} />

      {/* Lighting */}
      <ambientLight intensity={0.90} />
      <directionalLight
        position={[3, 6, 3]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />
      {/* Rim light — edges of aluminium */}
      <directionalLight position={[-4, 3, -4]} intensity={0.85} color="#8899ff" />
      {/* Fill from behind — primary light for the closed-lid opening shot */}
      <directionalLight position={[0, 2, -6]} intensity={1.8} />
      {/* Extra top-back fill so the lid reads clearly from camera start position */}
      <directionalLight position={[0, 5, -4]} intensity={1.1} color="#ccd6ff" />

      <Environment preset="city" background={false} />

      <Laptop progress={progress} />
      <Particles />

      <fog attach="fog" args={["#0c0c12", 14, 32]} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.55} luminanceSmoothing={0.35} intensity={0.55} mipmapBlur />
        <ChromaticAberration offset={new THREE.Vector2(0.0004, 0.0004)} />
        <Vignette offset={0.4} darkness={0.55} />
      </EffectComposer>
    </>
  );
}

export type { SceneProps };

export function LaptopScene({ progress, mouse }: SceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 1.2, -5.5], fov: 42, near: 0.1, far: 60 }}
      style={{ background: "#0e0e14" }}
    >
      <Scene progress={progress} mouse={mouse} />
    </Canvas>
  );
}
