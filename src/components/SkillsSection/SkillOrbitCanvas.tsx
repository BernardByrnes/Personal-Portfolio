"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { allSkills, categoryMeta } from "./skillsData";

/* Fibonacci sphere — evenly distributes n points on a sphere */
function fibonacciSphere(n: number, radius: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y     = 1 - (i / (n - 1)) * 2;
    const r     = Math.sqrt(1 - y * y);
    const theta = phi * i;
    pts.push(new THREE.Vector3(r * Math.cos(theta) * radius, y * radius, r * Math.sin(theta) * radius));
  }
  return pts;
}

type OrbitProps = {
  onHover: (name: string | null) => void;
};

function Orbit({ onHover }: OrbitProps) {
  const groupRef  = useRef<THREE.Group>(null!);
  const nodeRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const positions = useMemo(() => fibonacciSphere(allSkills.length, 2.4), []);

  useFrame(({ clock }, delta) => {
    groupRef.current.rotation.y += delta * 0.22;
    groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.06) * 0.12;

    // Depth-fade nodes at the back of the sphere
    const q = groupRef.current.quaternion;
    allSkills.forEach((_, i) => {
      const el = nodeRefs.current[i];
      if (!el) return;
      const world = positions[i].clone().applyQuaternion(q);
      // world.z: front = positive (toward camera), back = negative
      const depth  = THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(world.z, -2.5, 0.5, 0.06, 1), 0.06, 1);
      el.style.opacity = String(depth);
    });
  });

  return (
    <group ref={groupRef}>
      {allSkills.map((skill, i) => {
        const accent = categoryMeta[skill.category].accent;
        const Icon   = skill.icon;
        return (
          <Html
            key={skill.name}
            position={[positions[i].x, positions[i].y, positions[i].z]}
            center
            distanceFactor={7}
            zIndexRange={[0, 10]}
          >
            <div
              ref={el => { nodeRefs.current[i] = el; }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "scale(1.55)";
                onHover(skill.name);
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                onHover(null);
              }}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${accent}10`,
                border: `1px solid ${accent}40`,
                cursor: "default",
                transition: "transform 0.2s ease",
                userSelect: "none",
              }}
            >
              <Icon size={22} color={skill.color} />
            </div>
          </Html>
        );
      })}
    </group>
  );
}

export function SkillOrbitCanvas({ onHover }: OrbitProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.4, 7.5], fov: 50 }}
    >
      <ambientLight intensity={1} />
      <Orbit onHover={onHover} />
    </Canvas>
  );
}
