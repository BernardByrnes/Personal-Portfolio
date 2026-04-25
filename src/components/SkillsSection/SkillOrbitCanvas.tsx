"use client";

import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { allSkills, categoryMeta } from "./skillsData";

function fibonacciSphere(n: number, radius: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    pts.push(
      new THREE.Vector3(
        r * Math.cos(theta) * radius,
        y * radius,
        r * Math.sin(theta) * radius
      )
    );
  }
  return pts;
}

type DragState = {
  active: boolean;
  lastX: number;
  lastY: number;
  velX: number;
  velY: number;
};

type OrbitProps = {
  drag: React.MutableRefObject<DragState>;
  nodeEls: React.MutableRefObject<(HTMLDivElement | null)[]>;
  isVisible: React.MutableRefObject<boolean>;
};

function Orbit({ drag, nodeEls, isVisible }: OrbitProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const positions = useMemo(() => fibonacciSphere(allSkills.length, 2.4), []);
  const { camera, size } = useThree();

  const _v = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const d = drag.current;

    // Only spin when visible — but always update node positions so they're
    // pre-warmed before the section scrolls into view
    if (isVisible.current) {
      if (d.active) {
        groupRef.current.rotation.y += d.velX;
        groupRef.current.rotation.x += d.velY;
        d.velX = 0;
        d.velY = 0;
      } else {
        d.velX *= 0.92;
        d.velY *= 0.92;
        groupRef.current.rotation.y += d.velX + dt * 0.22;
        groupRef.current.rotation.x += d.velY;
        const targetX = Math.sin(clock.elapsedTime * 0.06) * 0.12;
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          targetX,
          0.015
        );
      }
    }

    groupRef.current.updateMatrixWorld(true);

    const hw = size.width / 2;
    const hh = size.height / 2;

    for (let i = 0; i < positions.length; i++) {
      const el = nodeEls.current[i];
      if (!el) continue;

      _v.copy(positions[i]).applyMatrix4(groupRef.current.matrixWorld);
      _v.project(camera);

      const sx = _v.x * hw + hw;
      const sy = -_v.y * hh + hh;
      const depth = THREE.MathUtils.clamp(
        THREE.MathUtils.mapLinear(_v.z, 0.99, 1.0, 1, 0.06),
        0.06,
        1
      );

      el.style.transform = `translate(-50%,-50%) translate(${sx}px,${sy}px)`;
      el.style.opacity = String(depth);
      el.style.zIndex = String(Math.round((1 - _v.z) * 100));
    }
  });

  return <group ref={groupRef} />;
}

export type SkillOrbitCanvasProps = {
  onHover?: (name: string | null) => void;
};

export function SkillOrbitCanvas({ onHover = () => {} }: SkillOrbitCanvasProps) {
  const [grabbing, setGrabbing] = useState(false);
  const isVisible = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeEls = useRef<(HTMLDivElement | null)[]>([]);

  const drag = useRef<DragState>({
    active: false,
    lastX: 0,
    lastY: 0,
    velX: 0,
    velY: 0,
  });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { isVisible.current = entry.isIntersecting; },
      { rootMargin: "400px 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current.active = true;
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
    drag.current.velX = 0;
    drag.current.velY = 0;
    setGrabbing(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    const dy = e.clientY - drag.current.lastY;
    drag.current.velX = dx * 0.009;
    drag.current.velY = dy * 0.009;
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
  };

  const onPointerUp = () => {
    drag.current.active = false;
    setGrabbing(false);
  };

  const handleNodeEnter = useCallback(
    (i: number) => {
      if (drag.current.active) return;
      const el = nodeEls.current[i];
      if (el) el.style.transform = el.style.transform.replace(/scale\([^)]*\)/, "") + " scale(1.55)";
      onHover(allSkills[i].name);
    },
    [onHover]
  );

  const handleNodeLeave = useCallback(
    (i: number) => {
      const el = nodeEls.current[i];
      if (el) el.style.transform = el.style.transform.replace(/scale\([^)]*\)/, "");
      onHover(null);
    },
    [onHover]
  );

  return (
    <div
      ref={wrapRef}
      style={{
        width: "100%",
        height: "100%",
        touchAction: "none",
        cursor: grabbing ? "grabbing" : "grab",
        position: "relative",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <Canvas
        frameloop="always"
        dpr={[1, 1.2]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.4, 7.5], fov: 50 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Orbit drag={drag} nodeEls={nodeEls} isVisible={isVisible} />
      </Canvas>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        {allSkills.map((skill, i) => {
          const accent = categoryMeta[skill.category].accent;
          const Icon = skill.icon;
          return (
            <div
              key={skill.name}
              ref={(el) => {
                nodeEls.current[i] = el;
              }}
              onMouseEnter={() => handleNodeEnter(i)}
              onMouseLeave={() => handleNodeLeave(i)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${accent}10`,
                border: `1px solid ${accent}40`,
                pointerEvents: "auto",
                cursor: "inherit",
                transition: "transform 0.2s ease, opacity 0.05s linear",
                userSelect: "none",
                touchAction: "none",
                willChange: "transform, opacity",
                opacity: 0,
              }}
            >
              <Icon size={22} color={skill.color} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
