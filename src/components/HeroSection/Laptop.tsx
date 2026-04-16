"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Animated screen — typewriter code effect ──────────────────────────────────
const CODE_LINES = [
  "const portfolio = {",
  "  name: 'Mutambo Bernard',",
  "  role: 'Software Developer',",
  "  stack: ['Next.js', 'React', 'TypeScript'],",
  "  shipped: 20,",
  "  events: '10M+ / day',",
  "  open: true,",
  "};",
];
const LINE_COLORS = [
  "#7dcfff",   // keyword
  "#9ece6a",   // string
  "#9ece6a",   // string
  "#ff9e64",   // array
  "#bb9af7",   // number
  "#9ece6a",   // string
  "#bb9af7",   // bool
  "#7dcfff",   // punctuation
];
const CHARS_PER_SEC = 22;
const TOTAL_CHARS   = CODE_LINES.reduce((a, l) => a + l.length, 0);

function drawScreen(
  ctx: CanvasRenderingContext2D,
  totalChars: number,
  cursorOn: boolean,
) {
  const W = 1024, H = 640;
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = "#080818";
  ctx.fillRect(0, 0, W, H);

  const grad = ctx.createRadialGradient(512, 320, 0, 512, 320, 480);
  grad.addColorStop(0, "rgba(40, 70, 200, 0.22)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.font = "500 30px 'Consolas', 'Courier New', monospace";
  ctx.textBaseline = "top";

  const LEFT = 80, TOP = 80, LINE_H = 64;
  let remaining = totalChars;
  let cx = LEFT, cy = TOP;

  for (let i = 0; i < CODE_LINES.length; i++) {
    if (remaining <= 0) break;
    const line  = CODE_LINES[i];
    const drawn = Math.min(remaining, line.length);
    const text  = line.slice(0, drawn);

    ctx.fillStyle = LINE_COLORS[i];
    ctx.fillText(text, LEFT, TOP + i * LINE_H);

    remaining -= drawn;
    if (remaining > 0) {
      cx = LEFT;
      cy = TOP + (i + 1) * LINE_H;
    } else {
      cx = LEFT + ctx.measureText(text).width;
      cy = TOP + i * LINE_H;
    }
  }

  if (cursorOn && totalChars < TOTAL_CHARS) {
    ctx.fillStyle = "rgba(130, 170, 255, 0.85)";
    ctx.fillRect(cx + 1, cy + 3, 2, 26);
  }
}

// ── Keyboard layout ───────────────────────────────────────────────────────────
//
//  All rows share the same total width, built on a 15-step column grid:
//    15 × K_W  +  14 × GAP  =  2.446  (≈ recess width of 2.44)
//
//  step(n) key: physical width  =  n × STEP − GAP
//  step(n) key: x-centre        =  X0 + (startStep + (n−1)/2) × STEP
//
const STEP   = 0.164;                           // K_W + GAP
const K_W    = 0.150;                           // standard key width
const K_D    = 0.138;                           // standard key depth
const K_H    = 0.018;                           // key height above surface
const GAP    = 0.014;                           // gap between keys
const KB_Y   = 0.062;                           // sits just above the recess
const KB_TOT = 15 * K_W + 14 * GAP;            // 2.446
const X0     = -(KB_TOT / 2) + K_W / 2;        // −1.148  (step-0 centre)

// Physical width of a key spanning n column-steps
function kw(n: number)            { return n * STEP - GAP; }

// X-centre of a key that starts at `step` and spans `w` steps
function kx(step: number, w = 1) { return X0 + (step + (w - 1) / 2) * STEP; }

// ── Row Z centres (screen-side → touchpad-side) ───────────────────────────────
const FN_D = 0.100;                             // fn keys are shallower
const Z0   = -0.52;                             // fn row
const Z1   = Z0 + FN_D / 2 + 0.036 + K_D / 2; // number row  (≈ −0.365)
const Z2   = Z1 + K_D + GAP;                   // QWERTY      (≈ −0.213)
const Z3   = Z2 + K_D + GAP;                   // ASDF        (≈ −0.061)
const Z4   = Z3 + K_D + GAP;                   // ZXCV        (≈  0.091)
const Z5   = Z4 + K_D + GAP;                   // bottom row  (≈  0.243)

// ── Standard-width keys — 46 total, rendered as one InstancedMesh ─────────────
const STD_KEYS = [
  // Row 1 — ` 1 2 3 4 5 6 7 8 9 0 - =  (13 keys, steps 0–12)
  ...[...Array(13)].map((_, i) => [X0 + i * STEP, Z1]),
  // Row 2 — Q W E R T Y U I O P [ ]    (12 keys, steps 1.5–12.5)
  ...[...Array(12)].map((_, i) => [kx(1.5 + i), Z2]),
  // Row 3 — A S D F G H J K L ; '      (11 keys, steps 1.75–11.75)
  ...[...Array(11)].map((_, i) => [kx(1.75 + i), Z3]),
  // Row 4 — Z X C V B N M , . /        (10 keys, steps 2.25–11.25)
  ...[...Array(10)].map((_, i) => [kx(2.25 + i), Z4]),
];

// ── Fn-row keys — 14 uniform keys that together span the full keyboard width ──
const FN_W    = (KB_TOT - 13 * GAP) / 14;      // ≈ 0.162
const FN_STEP = FN_W + GAP;                     // ≈ 0.176
const FN_X0   = -(KB_TOT / 2) + FN_W / 2;      // left-most fn-key centre
const FN_KEYS = Array.from({ length: 14 }, (_, i) => FN_X0 + i * FN_STEP);

// ── Wide / special keys — individual meshes ───────────────────────────────────
const WIDE_KEYS = [
  // Row 1
  { x: kx(13, 2),       z: Z1, w: kw(2)    },  // Backspace   (2 steps)
  // Row 2
  { x: kx(0, 1.5),      z: Z2, w: kw(1.5)  },  // Tab         (1.5)
  { x: kx(13.5, 1.5),   z: Z2, w: kw(1.5)  },  // Backslash   (1.5)
  // Row 3
  { x: kx(0, 1.75),     z: Z3, w: kw(1.75) },  // CapsLock    (1.75)
  { x: kx(12.75, 2.25), z: Z3, w: kw(2.25) },  // Enter       (2.25)
  // Row 4
  { x: kx(0, 2.25),     z: Z4, w: kw(2.25) },  // Left Shift  (2.25)
  { x: kx(12.25, 2.75), z: Z4, w: kw(2.75) },  // Right Shift (2.75)
  // Row 5 — Ctrl · Alt · Space · Alt · Ctrl  (sums to 15 steps)
  { x: kx(0, 1.5),      z: Z5, w: kw(1.5)  },  // Ctrl L
  { x: kx(1.5, 1.25),   z: Z5, w: kw(1.25) },  // Alt L
  { x: 0,               z: Z5, w: kw(9.5)   },  // Space (centred by symmetry)
  { x: kx(12.25, 1.25), z: Z5, w: kw(1.25) },  // Alt R
  { x: kx(13.5, 1.5),   z: Z5, w: kw(1.5)  },  // Ctrl R
];

function KeyboardKeys() {
  const stdRef = useRef<THREE.InstancedMesh>(null!);
  const fnRef  = useRef<THREE.InstancedMesh>(null!);

  useEffect(() => {
    const dummy = new THREE.Object3D();

    STD_KEYS.forEach(([x, z], i) => {
      dummy.position.set(x, KB_Y, z);
      dummy.updateMatrix();
      stdRef.current.setMatrixAt(i, dummy.matrix);
    });
    stdRef.current.instanceMatrix.needsUpdate = true;

    FN_KEYS.forEach((x, i) => {
      dummy.position.set(x, KB_Y, Z0);
      dummy.updateMatrix();
      fnRef.current.setMatrixAt(i, dummy.matrix);
    });
    fnRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <>
      {/* Standard keys */}
      <instancedMesh ref={stdRef} args={[undefined, undefined, STD_KEYS.length]}>
        <boxGeometry args={[K_W, K_H, K_D]} />
        <meshStandardMaterial color="#212124" roughness={0.80} metalness={0.20} />
      </instancedMesh>

      {/* Fn row — slightly shallower, spans the full width */}
      <instancedMesh ref={fnRef} args={[undefined, undefined, FN_KEYS.length]}>
        <boxGeometry args={[FN_W, K_H, FN_D]} />
        <meshStandardMaterial color="#212124" roughness={0.80} metalness={0.20} />
      </instancedMesh>

      {/* Wide / special keys */}
      {WIDE_KEYS.map(({ x, z, w }, i) => (
        <mesh key={i} position={[x, KB_Y, z]}>
          <boxGeometry args={[w, K_H, K_D]} />
          <meshStandardMaterial color="#212124" roughness={0.80} metalness={0.20} />
        </mesh>
      ))}
    </>
  );
}

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
  const canvasCtxRef    = useRef<CanvasRenderingContext2D | null>(null);
  const canvasTexRef    = useRef<THREE.CanvasTexture | null>(null);
  const screenOnTimeRef = useRef(-1);
  const lastDrawRef     = useRef({ chars: -1, cursor: false });

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width  = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext("2d")!;
    canvasCtxRef.current = ctx;

    drawScreen(ctx, 0, false);  // dark initial state

    const tex = new THREE.CanvasTexture(canvas);
    canvasTexRef.current = tex;
    setScreenTexture(tex);
    return () => tex.dispose();
  }, []);

  useFrame(({ clock }) => {
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
        0, 0.85, invLerp(0.4, 0.56, p)
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

    // Typewriter — starts when screen becomes visible (p > 0.38)
    const ctx = canvasCtxRef.current;
    const tex = canvasTexRef.current;
    if (ctx && tex) {
      if (p > 0.38 && screenOnTimeRef.current < 0) {
        screenOnTimeRef.current = clock.elapsedTime;
      }
      if (screenOnTimeRef.current >= 0) {
        const elapsed   = clock.elapsedTime - screenOnTimeRef.current;
        const charCount = Math.min(TOTAL_CHARS, Math.floor(elapsed * CHARS_PER_SEC));
        const cursorOn  = Math.floor(clock.elapsedTime * 1.8) % 2 === 0;

        if (charCount !== lastDrawRef.current.chars || cursorOn !== lastDrawRef.current.cursor) {
          drawScreen(ctx, charCount, cursorOn);
          tex.needsUpdate = true;
          lastDrawRef.current = { chars: charCount, cursor: cursorOn };
        }
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* ── Base / keyboard deck ─────────────────────────────── */}
      <mesh>
        <boxGeometry args={[3, 0.1, 2]} />
        <meshStandardMaterial color="#1c1c1e" roughness={0.74} metalness={0.88} />
      </mesh>

      {/* Keyboard recess */}
      <mesh position={[0, 0.051, -0.06]}>
        <boxGeometry args={[2.44, 0.004, 1.44]} />
        <meshStandardMaterial color="#111113" roughness={0.95} metalness={0.3} />
      </mesh>

      {/* Keyboard keys */}
      <KeyboardKeys />

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
        <mesh position={[0, 0.04, 1]}>
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
