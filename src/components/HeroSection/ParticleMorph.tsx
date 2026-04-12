"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT  = 480;
const CX = 0, CY = 0.6, CZ = -2.0;    // world-space centre for both formations
const SPHERE_R = 0.88;                   // radius of the morph target sphere

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
function invLerp(lo: number, hi: number, v: number): number {
  return Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
}

// ── Sample "MUTAMBO" text pixel positions on an offscreen canvas ──────────────
function sampleText(): THREE.Vector3[] {
  const W = 512, H = 80;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.font = "bold 60px Impact, 'Arial Black', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("MUTAMBO", W / 2, H / 2);

  const data = ctx.getImageData(0, 0, W, H).data;
  const filled: [number, number][] = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] > 120) filled.push([x, y]);
    }
  }

  // Font not loaded or no pixels → scatter randomly in the same region
  if (filled.length < 80) {
    return Array.from({ length: COUNT }, () => new THREE.Vector3(
      (Math.random() - 0.5) * 2.0 + CX,
      (Math.random() - 0.5) * 0.55 + CY,
      (Math.random() - 0.5) * 0.2  + CZ,
    ));
  }

  return Array.from({ length: COUNT }, (_, i) => {
    const [px, py] = filled[Math.floor((i / COUNT) * filled.length)];
    return new THREE.Vector3(
      ((px / W) - 0.5) * 2.1            + CX + (Math.random() - 0.5) * 0.012,
      -((py / H) - 0.5) * 0.58          + CY + (Math.random() - 0.5) * 0.012,
      CZ + (Math.random() - 0.5) * 0.15,
    );
  });
}

// ── Fibonacci sphere positions ────────────────────────────────────────────────
function buildSphere(): THREE.Vector3[] {
  const phi = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: COUNT }, (_, i) => {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = phi * i;
    return new THREE.Vector3(
      r * Math.cos(t) * SPHERE_R + CX,
      y * SPHERE_R                + CY,
      r * Math.sin(t) * SPHERE_R + CZ,
    );
  });
}

type Props = { progress: React.MutableRefObject<number> };

export function ParticleMorph({ progress }: Props) {
  const geomRef = useRef<THREE.BufferGeometry>(null!);
  const matRef  = useRef<THREE.PointsMaterial>(null!);

  // Per-particle stagger phase (random 0→1) — gives organic dissolve timing
  const phases = useMemo(() => Float32Array.from({ length: COUNT }, Math.random), []);

  const { src, dst } = useMemo(() => {
    const src = sampleText();
    const dst = buildSphere();
    // Shuffle dst so each particle travels to a random sphere spot
    for (let i = dst.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dst[i], dst[j]] = [dst[j], dst[i]];
    }
    return { src, dst };
  }, []);

  // Prime the geometry buffer with text positions
  useEffect(() => {
    if (!geomRef.current) return;
    const buf = new Float32Array(COUNT * 3);
    src.forEach((v, i) => { buf[i*3] = v.x; buf[i*3+1] = v.y; buf[i*3+2] = v.z; });
    geomRef.current.setAttribute("position", new THREE.BufferAttribute(buf, 3));
  }, [src]);

  useFrame(({ clock }) => {
    if (!geomRef.current?.attributes.position || !matRef.current) return;
    const p = progress.current;

    // Fade in 0.58→0.65 (arrives just before HTML name overlay at ~0.72)
    // Fade out 0.82→0.90 (dissolves as HTML name is fully visible)
    const fadeIn  = invLerp(0.58, 0.65, p);
    const fadeOut = Math.max(0, 1 - invLerp(0.82, 0.90, p));
    const opacity = fadeIn * fadeOut;
    matRef.current.opacity = opacity;

    // Skip expensive per-particle update when invisible
    if (opacity === 0) return;

    const buf = geomRef.current.attributes.position.array as Float32Array;
    const t   = clock.elapsedTime;

    for (let i = 0; i < COUNT; i++) {
      const ph = phases[i];
      // Text formation visible 0.64→0.68, then morph to sphere 0.68→0.84
      const rawMorph = invLerp(0.65 + ph * 0.08, 0.82 + ph * 0.05, p);
      const morph    = easeInOut(rawMorph);

      // Idle drift while still in text formation (dies off as morph increases)
      const drift = (1 - morph) * 0.007;

      buf[i*3]   = src[i].x + (dst[i].x - src[i].x) * morph + Math.sin(t * 0.55 + ph * 6.28) * drift;
      buf[i*3+1] = src[i].y + (dst[i].y - src[i].y) * morph + Math.cos(t * 0.47 + ph * 6.28) * drift;
      buf[i*3+2] = src[i].z + (dst[i].z - src[i].z) * morph;
    }
    geomRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geomRef} />
      <pointsMaterial
        ref={matRef}
        size={0.015}
        color="#8aabff"
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
