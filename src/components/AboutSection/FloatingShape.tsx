"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, RigidBody, BallCollider, CuboidCollider } from "@react-three/rapier";
import { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";

// ── Shape definitions ─────────────────────────────────────────────────────────
const SHAPES = [
  { pos: [-0.72,  0.75,  0.10] as [number, number, number], r: 0.38, detail: 1 },
  { pos: [ 0.68,  0.55, -0.15] as [number, number, number], r: 0.25, detail: 0 },
  { pos: [-0.18, -0.50,  0.20] as [number, number, number], r: 0.32, detail: 1 },
  { pos: [ 0.82, -0.48,  0.00] as [number, number, number], r: 0.22, detail: 0 },
  { pos: [ 0.05,  0.10,  0.00] as [number, number, number], r: 0.46, detail: 1 },
];

// Invisible walls that keep shapes inside the visible canvas (camera fov 44°, z=3.8)
// Visible half-height ≈ 1.53 → walls at ±1.45 with a little padding
const WALLS = [
  { pos: [0,  1.50, 0] as [number, number, number], args: [2, 0.05, 2] as [number, number, number] },
  { pos: [0, -1.50, 0] as [number, number, number], args: [2, 0.05, 2] as [number, number, number] },
  { pos: [ 1.50, 0, 0] as [number, number, number], args: [0.05, 2, 2] as [number, number, number] },
  { pos: [-1.50, 0, 0] as [number, number, number], args: [0.05, 2, 2] as [number, number, number] },
  { pos: [0, 0,  0.85] as [number, number, number], args: [2, 2, 0.05] as [number, number, number] },
  { pos: [0, 0, -0.85] as [number, number, number], args: [2, 2, 0.05] as [number, number, number] },
];

type SceneProps = { scrollVel: React.MutableRefObject<number> };

function PhysicsScene({ scrollVel }: SceneProps) {
  const bodyRefs = useRef<(RapierRigidBody | null)[]>(Array(SHAPES.length).fill(null));

  // Kick off initial random velocities once physics is ready
  useEffect(() => {
    const rng = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
    // Short delay — let Rapier finish loading WASM before poking bodies
    const id = setTimeout(() => {
      bodyRefs.current.forEach(body => {
        if (!body) return;
        body.setLinvel({ x: rng(-0.7, 0.7), y: rng(-0.7, 0.7), z: rng(-0.2, 0.2) }, true);
        body.setAngvel({ x: rng(-0.4, 0.4), y: rng(-0.4, 0.4), z: rng(-0.4, 0.4) }, true);
      });
    }, 300);
    return () => clearTimeout(id);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // Gentle continuous sine force — keeps shapes drifting without gravity
    bodyRefs.current.forEach((body, i) => {
      if (!body) return;
      const ph = i * 1.618;
      body.applyImpulse({
        x: Math.sin(t * 0.28 + ph)       * 0.005,
        y: Math.cos(t * 0.22 + ph * 1.4) * 0.005,
        z: 0,
      }, true);
    });

    // Scroll impulse — nudge shapes in the direction of scroll
    const si = scrollVel.current;
    if (Math.abs(si) > 0.1) {
      bodyRefs.current.forEach(body => {
        if (body) body.applyImpulse({ x: 0, y: -si * 0.004, z: 0 }, true);
      });
      scrollVel.current *= 0.80;
    }
  });

  return (
    <>
      {/* Invisible boundary walls */}
      {WALLS.map(({ pos, args }, i) => (
        <RigidBody key={i} type="fixed" position={pos}>
          <CuboidCollider args={args} />
        </RigidBody>
      ))}

      {/* Physics-driven shapes */}
      {SHAPES.map((shape, i) => (
        <RigidBody
          key={i}
          ref={el => { bodyRefs.current[i] = el; }}
          position={shape.pos}
          type="dynamic"
          linearDamping={0.55}
          angularDamping={0.30}
          restitution={0.85}
          friction={0.05}
        >
          <BallCollider args={[shape.r]} />

          {/* Outer wireframe */}
          <mesh>
            <icosahedronGeometry args={[shape.r, shape.detail]} />
            <meshBasicMaterial color="#667eea" wireframe transparent opacity={0.38} />
          </mesh>

          {/* Faint inner solid for depth */}
          <mesh>
            <icosahedronGeometry args={[shape.r * 0.55, 0]} />
            <meshStandardMaterial color="#667eea" roughness={0.6} metalness={0.4} transparent opacity={0.10} />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}

export function FloatingShape() {
  const scrollVel  = useRef(0);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Pause rendering when the canvas is off-screen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "300px 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Track scroll velocity to drive impulse
  useEffect(() => {
    let lastY = window.scrollY;
    let lastT = performance.now();
    const onScroll = () => {
      const now = performance.now();
      scrollVel.current = (window.scrollY - lastY) / Math.max(1, now - lastT) * 16;
      lastY = window.scrollY;
      lastT = now;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%" }}>
      <Canvas
        frameloop={active ? "always" : "demand"}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 3.8], fov: 44 }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 3, 2]} intensity={0.8} />

        <Physics gravity={[0, 0, 0]} timeStep="vary">
          <PhysicsScene scrollVel={scrollVel} />
        </Physics>
      </Canvas>
    </div>
  );
}
