"use client";

import { useRef, useMemo, useState, useEffect } from "react";
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

type DragState = {
  active: boolean;
  lastX:  number;
  lastY:  number;
  velX:   number;
  velY:   number;
};

type OrbitProps = {
  onHover: (name: string | null) => void;
  drag:    React.MutableRefObject<DragState>;
};

function Orbit({ onHover, drag }: OrbitProps) {
  const groupRef  = useRef<THREE.Group>(null!);
  const nodeRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const positions = useMemo(() => fibonacciSphere(allSkills.length, 2.4), []);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05); // clamp to 50 ms — prevents jump on first frame
    const d  = drag.current;

    if (d.active) {
      // Direct drag control — apply velocity set by pointer move
      groupRef.current.rotation.y += d.velX;
      groupRef.current.rotation.x += d.velY;
      d.velX = 0;
      d.velY = 0;
    } else {
      // Momentum decay after release, blend back into auto-rotation
      d.velX *= 0.92;
      d.velY *= 0.92;
      groupRef.current.rotation.y += d.velX + dt * 0.22;
      groupRef.current.rotation.x += d.velY;
      // Gently drift X back toward a gentle sine oscillation
      const targetX = Math.sin(clock.elapsedTime * 0.06) * 0.12;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetX,
        0.015
      );
    }

    // Depth-fade nodes toward the back of the sphere
    const q = groupRef.current.quaternion;
    allSkills.forEach((_, i) => {
      const el = nodeRefs.current[i];
      if (!el) return;
      const world = positions[i].clone().applyQuaternion(q);
      const depth = THREE.MathUtils.clamp(
        THREE.MathUtils.mapLinear(world.z, -2.5, 0.5, 0.06, 1),
        0.06,
        1
      );
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
                if (drag.current.active) return;
                (e.currentTarget as HTMLDivElement).style.transform = "scale(1.55)";
                onHover(skill.name);
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                onHover(null);
              }}
              style={{
                width:           "44px",
                height:          "44px",
                borderRadius:    "50%",
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                background:      `${accent}10`,
                border:          `1px solid ${accent}40`,
                cursor:          "inherit",
                transition:      "transform 0.2s ease",
                userSelect:      "none",
                touchAction:     "none",
                willChange:      "transform, opacity",
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

export type SkillOrbitCanvasProps = {
  onHover?: (name: string | null) => void;
};

export function SkillOrbitCanvas({ onHover = () => {} }: SkillOrbitCanvasProps) {
  const [grabbing, setGrabbing] = useState(false);
  const [active, setActive] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const drag = useRef<DragState>({
    active: false,
    lastX:  0,
    lastY:  0,
    velX:   0,
    velY:   0,
  });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "200px 0px",
      threshold: 0
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current.active = true;
    drag.current.lastX  = e.clientX;
    drag.current.lastY  = e.clientY;
    drag.current.velX   = 0;
    drag.current.velY   = 0;
    setGrabbing(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    const dy = e.clientY - drag.current.lastY;
    drag.current.velX  = dx * 0.009;
    drag.current.velY  = dy * 0.009;
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
  };

  const onPointerUp = () => {
    drag.current.active = false;
    setGrabbing(false);
  };

  return (
    <div
      ref={wrapRef}
      style={{
        width:       "100%",
        height:      "100%",
        touchAction: "none",
        cursor:      grabbing ? "grabbing" : "grab",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <Canvas
        frameloop={active ? "always" : "demand"}
        dpr={[1, 1.2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0.4, 7.5], fov: 50 }}
      >
        <ambientLight intensity={1} />
        <Orbit onHover={onHover} drag={drag} />
      </Canvas>
    </div>
  );
}
