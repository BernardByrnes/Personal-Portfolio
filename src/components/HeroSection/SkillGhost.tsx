"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { allSkills, categoryMeta } from "../SkillsSection/skillsData";

/* ── Interleave skills by category for even visual spread ── */
function interleaveByCategory() {
  const buckets = ["frontend", "backend", "data", "tools"] as const;
  const groups  = buckets.map(cat => allSkills.filter(s => s.category === cat));
  const result  = [];
  const max     = Math.max(...groups.map(g => g.length));
  for (let i = 0; i < max; i++) {
    for (const g of groups) { if (g[i]) result.push(g[i]); }
  }
  return result;
}
const orderedSkills = interleaveByCategory();

/* ── Fibonacci sphere — evenly distributes n points on unit sphere ── */
function fibonacciSphere(n: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y     = 1 - (i / (n - 1)) * 2;
    const r     = Math.sqrt(1 - y * y);
    const theta = phi * i;
    pts.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
  }
  return pts;
}

type Props = {
  progress: React.MutableRefObject<number>;
  mouse:    React.MutableRefObject<{ x: number; y: number }>;
};

function invLerp(min: number, max: number, v: number) {
  return Math.min(1, Math.max(0, (v - min) / (max - min)));
}

export function SkillGhost({ progress, mouse }: Props) {
  const groupRef   = useRef<THREE.Group>(null!);
  const nodeRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const currentRot = useRef({ x: 0, y: 0 });

  // Wide ellipsoid — x/z scaled out, y compressed slightly for desktop feel
  const baseRot = useRef(0);

  const positions = useMemo(() => {
    const unit = fibonacciSphere(allSkills.length);
    return unit.map(p => new THREE.Vector3(p.x * 5.5, p.y * 3.2, p.z * 5.5));
  }, [orderedSkills.length]);


  useFrame(() => {
    const p       = progress.current;
    const opacity = invLerp(0.88, 1.0, p) * 0.35; // max 35% opacity

    // Slow base auto-rotation
    baseRot.current += 0.0008;

    // Mouse parallax layered on top of auto-rotation
    currentRot.current.y = THREE.MathUtils.lerp(
      currentRot.current.y,
      mouse.current.x * 0.35,
      0.03
    );
    currentRot.current.x = THREE.MathUtils.lerp(
      currentRot.current.x,
      mouse.current.y * 0.18,
      0.03
    );

    groupRef.current.rotation.y = baseRot.current + currentRot.current.y;
    groupRef.current.rotation.x = currentRot.current.x;

    // Depth-fade each node based on its world-space Z after rotation
    if (opacity <= 0) {
      // Invisible — skip DOM updates
      nodeRefs.current.forEach(el => { // eslint-disable-line @typescript-eslint/no-unused-expressions
        if (el) el.style.opacity = "0";
      });
      return;
    }

    const q = groupRef.current.quaternion;
    orderedSkills.forEach((_, i) => {
      const el = nodeRefs.current[i];
      if (!el) return;
      const world = positions[i].clone().applyQuaternion(q);
      // Depth factor: front nodes slightly more visible, back nodes dimmer
      const depth = THREE.MathUtils.clamp(
        THREE.MathUtils.mapLinear(world.z, -5.5, 2.5, 0.3, 1.0),
        0.3,
        1.0
      );
      el.style.opacity = String(opacity * depth);
    });
  });

  return (
    <group ref={groupRef}>
      {orderedSkills.map((skill, i) => {
        const accent = categoryMeta[skill.category].accent;
        const Icon   = skill.icon;
        return (
          <Html
            key={skill.name}
            position={[positions[i].x, positions[i].y, positions[i].z]}
            center
            distanceFactor={9}
            zIndexRange={[0, 0]}   // behind everything — no z-fighting with overlay
            style={{ pointerEvents: "none" }}
          >
            <div
              ref={el => { nodeRefs.current[i] = el; }}
              style={{
                width:          "38px",
                height:         "38px",
                borderRadius:   "50%",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                background:     `${accent}08`,
                border:         `1px solid ${accent}30`,
                opacity:        0,
                pointerEvents:  "none",
                userSelect:     "none",
                willChange:     "opacity",
              }}
            >
              <Icon size={18} color={skill.color} />
            </div>
          </Html>
        );
      })}
    </group>
  );
}
