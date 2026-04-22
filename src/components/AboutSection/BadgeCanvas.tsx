"use client";

// npm i three @react-three/fiber @react-three/drei @react-three/rapier meshline

import { useRef, useEffect, useMemo, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import {
  Physics,
  RigidBody,
  BallCollider,
  CuboidCollider,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useGLTF, Environment, ContactShadows } from "@react-three/drei";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";

extend({ MeshLineGeometry, MeshLineMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: object;
    meshLineMaterial: object & { color?: string; depthTest?: boolean; resolution?: number[]; lineWidth?: number };
  }
}

useGLTF.preload("/3d/badge-opt.glb");

const BH = 2.6;
const BW = BH / 1.834;
const BD = 0.07;
const BHH = BH / 2;

const MODEL_SCALE = BH / 1.834;
const MODEL_X_OFFSET = 0.5 * MODEL_SCALE;
const CLIP_PLANE = new THREE.Plane(new THREE.Vector3(-1, 0, 0), MODEL_X_OFFSET);

function buildBadgeTexture(): THREE.CanvasTexture {
  const W = 540;
  const H = Math.round(W * 1.834);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const r = 50;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(W - r, 0); ctx.arcTo(W, 0, W, r, r);
  ctx.lineTo(W, H - r); ctx.arcTo(W, H, W - r, H, r);
  ctx.lineTo(r, H); ctx.arcTo(0, H, 0, H - r, r);
  ctx.lineTo(0, r); ctx.arcTo(0, 0, r, 0, r);
  ctx.closePath();
  ctx.clip();

  ctx.fillStyle = "#1c1c2e";
  ctx.fillRect(0, 0, W, H);

  const g = ctx.createLinearGradient(0, 0, 0, 260);
  g.addColorStop(0, "rgba(102,126,234,0.18)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 260);

  ctx.fillStyle = "#667eea";
  ctx.fillRect(0, 0, W, 5);

  const nW = 76, nH = 56;
  ctx.fillStyle = "#000";
  ctx.fillRect(W / 2 - nW / 2, 0, nW, nH);

  ctx.font = "500 18px 'Courier New', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("PORTFOLIO · 2025", W - 40, 88);

  ctx.font = "bold 240px Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.042)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("BM", W / 2 + 12, H * 0.44);
  ctx.textBaseline = "alphabetic";

  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, H * 0.63);
  ctx.lineTo(W - 40, H * 0.63);
  ctx.stroke();

  ctx.font = "bold 104px system-ui, -apple-system, Arial, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText("Bernard", 40, H * 0.63 + 120);
  ctx.fillText("Mutambo", 40, H * 0.63 + 232);

  ctx.font = "500 21px 'Courier New', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.36)";
  ctx.fillText("FRONTEND DEVELOPER", 40, H * 0.63 + 272);

  ctx.font = "500 19px 'Courier New', monospace";
  ctx.fillStyle = "#4ade80";
  ctx.textAlign = "right";
  ctx.fillText("● OPEN TO WORK", W - 40, H - 32);

  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;
  return tex;
}

function Carabiner() {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#555566", roughness: 0.16, metalness: 0.97 }),
    [],
  );
  return (
    <group>
      <mesh material={mat} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.30, 0]}>
        <torusGeometry args={[0.115, 0.025, 12, 32]} />
      </mesh>
      <mesh material={mat} position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.020, 0.020, 0.10, 10]} />
      </mesh>
      <mesh material={mat} position={[-0.088, -0.085, 0]}>
        <capsuleGeometry args={[0.022, 0.27, 6, 12]} />
      </mesh>
      <mesh material={mat} position={[0.088, -0.072, 0]}>
        <capsuleGeometry args={[0.022, 0.23, 6, 12]} />
      </mesh>
      <mesh material={mat} rotation={[Math.PI / 2, 0, Math.PI]} position={[0, 0.058, 0]}>
        <torusGeometry args={[0.088, 0.022, 8, 20, Math.PI]} />
      </mesh>
      <mesh material={mat} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.215, 0]}>
        <torusGeometry args={[0.088, 0.022, 8, 20, Math.PI]} />
      </mesh>
    </group>
  );
}

interface JProps {
  a: RefObject<RapierRigidBody | null>;
  b: RefObject<RapierRigidBody | null>;
  pA: [number, number, number];
  pB: [number, number, number];
}
function SJoint({ a, b, pA, pB }: JProps) {
  useSphericalJoint(
    a as RefObject<RapierRigidBody>,
    b as RefObject<RapierRigidBody>,
    [pA, pB],
  );
  return null;
}

interface RJProps {
  a: RefObject<RapierRigidBody | null>;
  b: RefObject<RapierRigidBody | null>;
}
function RJoint({ a, b }: RJProps) {
  useRopeJoint(
    a as RefObject<RapierRigidBody>,
    b as RefObject<RapierRigidBody>,
    [[0, 0, 0], [0, 0, 0], 1],
  );
  return null;
}

function Rope({
  anchorRef,
  j1,
  j2,
  j3,
  cardRef,
}: {
  anchorRef: RefObject<RapierRigidBody | null>;
  j1: RefObject<RapierRigidBody | null>;
  j2: RefObject<RapierRigidBody | null>;
  j3: RefObject<RapierRigidBody | null>;
  cardRef: RefObject<RapierRigidBody | null>;
}) {
  const bandRef = useRef<THREE.Mesh>(null);
  const badgeQuat = useMemo(() => new THREE.Quaternion(), []);
  const cardTop = useMemo(() => new THREE.Vector3(), []);

  const curve = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    c.curveType = "chordal";
    return c;
  }, []);

  const resolution = useMemo(
    () => [window.innerWidth, window.innerHeight],
    [],
  );

  useFrame(() => {
    if (!bandRef.current) return;
    const at = anchorRef.current?.translation();
    const t1 = j1.current?.translation();
    const t2 = j2.current?.translation();
    const t3 = j3.current?.translation();
    const bt = cardRef.current?.translation();
    const br = cardRef.current?.rotation();
    if (!at || !t1 || !t2 || !t3 || !bt || !br) return;

    curve.points[0].set(at.x, at.y, at.z);
    curve.points[1].set(t1.x, t1.y, t1.z);
    curve.points[2].set(t2.x, t2.y, t2.z);
    curve.points[3].set(t3.x, t3.y, t3.z);

    badgeQuat.set(br.x, br.y, br.z, br.w);
    cardTop.set(0, BHH, 0).applyQuaternion(badgeQuat);
    curve.points[4].set(bt.x + cardTop.x, bt.y + cardTop.y, bt.z + cardTop.z);

    (bandRef.current as any).geometry.setPoints(curve.getPoints(20));
  });

  return (
    <mesh ref={bandRef}>
      <meshLineGeometry />
      <meshLineMaterial
        color="#667eea"
        depthTest={false}
        resolution={resolution}
        lineWidth={0.4}
      />
    </mesh>
  );
}

function Scene() {
  const anchorRef = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const cardRef = useRef<RapierRigidBody>(null);
  const badgeMeshRef = useRef<THREE.Group>(null);
  const clipRef = useRef<THREE.Group>(null);

  const [dragged, setDragged] = useState<THREE.Vector3 | false>(false);
  const [hovered, setHovered] = useState(false);

  // Memoized scratch — zero per-frame allocation
  const vec = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const badgeQuat = useMemo(() => new THREE.Quaternion(), []);
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const prevPointer = useMemo(() => new THREE.Vector2(), []);
  const pointerVelocity = useMemo(() => new THREE.Vector2(), []);

  const { gl } = useThree();

  const badgeTex = useMemo(() => buildBadgeTexture(), []);
  const { scene: glbScene } = useGLTF("/3d/badge-opt.glb");

  const glbClone = useMemo(() => {
    gl.localClippingEnabled = true;
    const clone = glbScene.clone(true);
    clone.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mat = (obj.material as THREE.MeshStandardMaterial).clone();
      mat.map = badgeTex;
      mat.clippingPlanes = [CLIP_PLANE];
      mat.color = new THREE.Color("#1a1a2e");
      mat.roughness = 0.22;
      mat.metalness = 0.5;
      mat.envMapIntensity = 1.2;
      mat.needsUpdate = true;
      obj.material = mat;
    });
    return clone;
  }, [glbScene, gl, badgeTex]);

  useEffect(() => {
    if (hovered) document.body.style.cursor = dragged ? "grabbing" : "grab";
    return () => { document.body.style.cursor = "auto"; };
  }, [hovered, dragged]);

  useFrame(({ camera, pointer }, delta) => {
    pointerVelocity.set(
      (pointer.x - prevPointer.x) / delta,
      (pointer.y - prevPointer.y) / delta,
    );
    prevPointer.copy(pointer);

    if (dragged && cardRef.current) {
      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(dragPlane, vec);
      vec.sub(dragged);
      cardRef.current.setNextKinematicTranslation({ x: vec.x, y: vec.y, z: vec.z });
    }

    const bt = cardRef.current?.translation();
    const br = cardRef.current?.rotation();
    if (!bt || !br) return;

    badgeMeshRef.current?.position.set(bt.x, bt.y, bt.z);
    badgeMeshRef.current?.quaternion.set(br.x, br.y, br.z, br.w);

    if (clipRef.current) {
      badgeQuat.set(br.x, br.y, br.z, br.w);
      pos.set(0, BHH + 0.08, 0).applyQuaternion(badgeQuat);
      clipRef.current.position.set(bt.x + pos.x, bt.y + pos.y, bt.z + pos.z);
      clipRef.current.quaternion.set(br.x, br.y, br.z, br.w);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-3, 2, 4]} intensity={1.0} color="#667eea" />
      <pointLight position={[0, -3, 4]} intensity={0.9} color="#8b5cf6" />
      <Environment preset="city" />
      <ContactShadows position={[0, -4, 0]} opacity={0.4} blur={2.5} scale={10} />

      {/* Fixed anchor */}
      <RigidBody ref={anchorRef} type="fixed" position={[0, 4, 0]}>
        <BallCollider args={[0.04]} />
      </RigidBody>

      {/* 3 rope joints — offset spawn triggers satisfying entry swing */}
      <RigidBody ref={j1} type="dynamic" position={[0.5, 4, 0]} mass={0.02} linearDamping={0.6} angularDamping={0.6} canSleep={false} colliders={false}>
        <BallCollider args={[0.02]} />
      </RigidBody>
      <RigidBody ref={j2} type="dynamic" position={[1.0, 4, 0]} mass={0.02} linearDamping={0.6} angularDamping={0.6} canSleep={false} colliders={false}>
        <BallCollider args={[0.02]} />
      </RigidBody>
      <RigidBody ref={j3} type="dynamic" position={[1.5, 4, 0]} mass={0.02} linearDamping={0.6} angularDamping={0.6} canSleep={false} colliders={false}>
        <BallCollider args={[0.02]} />
      </RigidBody>

      {/* Badge body — canSleep={false} keeps physics alive after swinging stops */}
      <RigidBody
        ref={cardRef}
        type="dynamic"
        position={[2.0, 4, 0]}
        mass={0.4}
        linearDamping={2}
        angularDamping={2}
        canSleep={false}
        colliders={false}
      >
        <CuboidCollider args={[BW / 2, BHH, BD / 2]} />
      </RigidBody>

      <RJoint a={anchorRef} b={j1} />
      <RJoint a={j1} b={j2} />
      <RJoint a={j2} b={j3} />
      <SJoint a={j3} b={cardRef} pA={[0, 0, 0]} pB={[0, BHH, 0]} />

      <Rope anchorRef={anchorRef} j1={j1} j2={j2} j3={j3} cardRef={cardRef} />

      <group ref={clipRef}>
        <Carabiner />
      </group>

      <group
        ref={badgeMeshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerDown={(e) => {
          e.stopPropagation();
          (e.target as Element).setPointerCapture(e.pointerId);
          pos.copy(cardRef.current!.translation() as THREE.Vector3);
          setDragged(new THREE.Vector3().copy(e.point).sub(pos));
        }}
        onPointerUp={(e) => {
          (e.target as Element).releasePointerCapture(e.pointerId);
          cardRef.current?.setAngvel(
            { x: pointerVelocity.y * 5, y: pointerVelocity.x * 5, z: 0 },
            true,
          );
          setDragged(false);
        }}
      >
        <primitive
          object={glbClone}
          scale={MODEL_SCALE}
          position={[MODEL_X_OFFSET, 0, 0]}
        />
      </group>
    </>
  );
}

export function BadgeCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dropped, setDropped] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setDropped(true); },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%", touchAction: "none" }}>
      <Canvas
        frameloop="always"
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 13], fov: 25 }}
        style={{ background: "transparent", touchAction: "none" }}
      >
        <Physics
          gravity={[0, -40, 0]}
          interpolate
          timeStep={1 / 60}
          paused={!dropped}
        >
          <Scene />
        </Physics>
      </Canvas>
    </div>
  );
}
