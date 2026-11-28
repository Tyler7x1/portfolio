"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Html } from "@react-three/drei";
import * as THREE from "three";
import type {
  BarsSpec,
  DonutSpec,
  HeatSpec,
  SceneSpec,
} from "@/components/three/types";

const FOV = 30;
const EDGE = "#8a8a8a";

type Anim = { e: { current: number }; dark: boolean };
const AnimContext = createContext<Anim | null>(null);

function useAnim() {
  const v = useContext(AnimContext);
  if (!v) throw new Error("useAnim must be used inside Stage3D");
  return v;
}

// Greys that match the site's black and white look
function shade(o: number, dark: boolean) {
  const v = Math.round(dark ? 10 + o * 245 : 250 - o * 222);
  return `rgb(${v},${v},${v})`;
}

/* ------------------------------------------------------------------
   Camera: top-down (looks like the flat 2D chart) to tilted (3D)
------------------------------------------------------------------- */
const CAMERA = {
  donut: { tilt: 0.93, yaw: 0, zoom: 1.0 },
  bars: { tilt: 0.98, yaw: -0.5, zoom: 1.2 },
  heat: { tilt: 0.87, yaw: -0.42, zoom: 1.25 },
} as const;

function Rig({
  kind,
  target,
  flatRef,
  onFlat,
}: {
  kind: SceneSpec["kind"];
  target: 0 | 1;
  flatRef: { current: HTMLElement | null };
  onFlat: () => void;
}) {
  const { e } = useAnim();
  const s = useRef(0);
  const reported = useRef(true);
  const reduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useFrame(({ camera, size, pointer }, dt) => {
    s.current = reduced
      ? target
      : THREE.MathUtils.damp(s.current, target, 4, Math.min(dt, 0.05));
    const x = THREE.MathUtils.clamp(s.current, 0, 1);
    const k = x * x * (3 - 2 * x); // smoothstep
    e.current = k;

    const cfg = CAMERA[kind];
    const phi = k * cfg.tilt;
    const az = k * cfg.yaw + pointer.x * 0.1 * k; // small mouse parallax
    const sp = Math.sin(phi);
    const cp = Math.cos(phi);
    const sa = Math.sin(az);
    const ca = Math.cos(az);

    // Narrow screens need a bit more room for the rotated scene
    const narrow = kind !== "donut" && size.width < 520 ? 1.35 : 1;
    const zoom = cfg.zoom * narrow;

    // The donut is drawn in SVG units (200 high), the rest in pixels
    const high = kind === "donut" ? 200 : size.height;
    const D =
      (high / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2))) *
      (1 + (zoom - 1) * k);

    camera.position.set(D * sp * sa, D * cp, D * sp * ca);
    camera.up.set(-sa * cp, sp, -ca * cp);
    camera.lookAt(0, 0, 0);

    // While flat, keep the scene aligned with the top of the 2D chart
    const flatH = flatRef.current?.offsetHeight ?? size.height;
    const offY = Math.max(0, (size.height - flatH) / 2) * (1 - k);
    (camera as THREE.PerspectiveCamera).setViewOffset(
      size.width,
      size.height,
      0,
      offY,
      size.width,
      size.height
    );

    if (target === 0 && s.current < 0.004) {
      if (!reported.current) {
        reported.current = true;
        onFlat();
      }
    } else if (target === 1) {
      reported.current = false;
    }
  });

  return null;
}

/* ------------------------------------------------------------------
   Donut
------------------------------------------------------------------- */
function Segment({
  item,
  spec,
}: {
  item: DonutSpec["items"][number];
  spec: DonutSpec;
}) {
  const { e, dark } = useAnim();
  const mesh = useRef<THREE.Mesh>(null!);
  const lift = useRef(0);
  const isActive = spec.activeKey === item.key;
  const dimmed = spec.activeKey !== null && !isActive;

  const geometry = useMemo(() => {
    const a0 = Math.PI / 2 - item.start * 2 * Math.PI;
    const a1 = Math.PI / 2 - (item.start + item.len) * 2 * Math.PI;
    const shape = new THREE.Shape();
    shape.moveTo(Math.cos(a1) * spec.rOuter, Math.sin(a1) * spec.rOuter);
    shape.absarc(0, 0, spec.rOuter, a1, a0, false);
    shape.absarc(0, 0, spec.rInner, a0, a1, true);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 1,
      bevelEnabled: false,
      curveSegments: Math.max(8, Math.ceil(item.len * 120)),
    });
  }, [item.start, item.len, spec.rOuter, spec.rInner]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, dt) => {
    lift.current = THREE.MathUtils.damp(lift.current, isActive ? 6 : 0, 10, dt);
    mesh.current.scale.z = Math.max(
      0.05,
      (6 + item.h * 30 + lift.current) * e.current
    );
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerOver={(ev) => {
        ev.stopPropagation();
        spec.onHover?.(item.key);
        document.body.style.cursor = spec.onSelect ? "pointer" : "auto";
      }}
      onPointerOut={() => {
        spec.onHover?.(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(ev) => {
        ev.stopPropagation();
        spec.onSelect?.(item.key);
      }}
    >
      <meshLambertMaterial color={shade(dimmed ? 0.15 : item.o, dark)} />
      <Edges threshold={20} color={EDGE} />
    </mesh>
  );
}

function DonutScene({ spec }: { spec: DonutSpec }) {
  const { dark } = useAnim();
  return (
    <group>
      {spec.track && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <ringGeometry args={[spec.rInner, spec.rOuter, 96]} />
          <meshBasicMaterial color={shade(0.06, dark)} />
        </mesh>
      )}
      {spec.items.map((it) => (
        <Segment key={it.key} item={it} spec={spec} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------
   Bars (matches the layout of the 2D list: 6rem label, bar, 6.5rem value)
------------------------------------------------------------------- */
function Bar({
  item,
  W,
  x0,
  trackW,
  z,
  onSelect,
}: {
  item: BarsSpec["items"][number];
  W: number;
  x0: number;
  trackW: number;
  z: number;
  onSelect: (key: string) => void;
}) {
  const { e, dark } = useAnim();
  const mesh = useRef<THREE.Mesh>(null!);
  const len = Math.max(2, item.n * trackW);
  const H = 18 + item.n * 84;

  useFrame(() => {
    const h = Math.max(0.05, H * e.current);
    mesh.current.scale.y = h;
    mesh.current.position.y = h / 2;
  });

  return (
    <group position={[0, 0, z]}>
      {/* track */}
      <mesh position={[x0 + trackW / 2, -0.1, 0]}>
        <boxGeometry args={[trackW, 0.2, 12]} />
        <meshBasicMaterial color={shade(0.06, dark)} />
      </mesh>

      {/* bar */}
      <group position={[x0 + len / 2, 0, 0]}>
        <mesh
          ref={mesh}
          onClick={(ev) => {
            ev.stopPropagation();
            onSelect(item.key);
          }}
        >
          <boxGeometry args={[len, 1, 12]} />
          <meshLambertMaterial color={shade(item.on ? 1 : 0.22, dark)} />
          <Edges threshold={20} color={EDGE} />
        </mesh>
      </group>

      {/* whole row is clickable */}
      <mesh
        position={[0, 0.5, 0]}
        onClick={() => onSelect(item.key)}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <boxGeometry args={[W, 1, 30]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Html position={[-W / 2, 0, 0]} pointerEvents="none" zIndexRange={[10, 0]}>
        <div className="-translate-y-1/2 whitespace-nowrap text-sm">
          {item.key}
        </div>
      </Html>
      <Html position={[W / 2, 0, 0]} pointerEvents="none" zIndexRange={[10, 0]}>
        <div className="-translate-x-full -translate-y-1/2 whitespace-nowrap text-right font-mono text-xs">
          {item.valueLabel}
        </div>
      </Html>
    </group>
  );
}

function BarsScene({ spec }: { spec: BarsSpec }) {
  const { size } = useThree();
  const W = size.width;
  const rows = spec.items.length;
  const pitch = 36; // 28px row + 8px gap in the 2D list
  const flatH = rows * pitch - 8;
  const labelW = 108; // 6rem + gap
  const valueW = 116; // 6.5rem + gap
  const trackW = Math.max(80, W - labelW - valueW);
  const x0 = -W / 2 + labelW;

  return (
    <group>
      {spec.items.map((it, i) => (
        <Bar
          key={it.key}
          item={it}
          W={W}
          x0={x0}
          trackW={trackW}
          z={-flatH / 2 + 14 + i * pitch}
          onSelect={spec.onSelect}
        />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------
   Heatmap: every cell becomes a tower
------------------------------------------------------------------- */
function Tower({
  cell,
  x,
  z,
  w,
  d,
  onPick,
}: {
  cell: HeatSpec["cells"][number];
  x: number;
  z: number;
  w: number;
  d: number;
  onPick: (r: string, c: string) => void;
}) {
  const { e, dark } = useAnim();
  const mesh = useRef<THREE.Mesh>(null!);
  const top = useRef<THREE.Group>(null!);
  const H = 8 + cell.n * 64;
  const strong = cell.n > 0.5;
  const blackText = dark ? strong : !strong;

  useFrame(() => {
    const h = Math.max(0.05, H * e.current);
    mesh.current.scale.y = h;
    mesh.current.position.y = h / 2;
    top.current.position.y = h;
  });

  return (
    <group position={[x, 0, z]}>
      {cell.on && (
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[w + 8, 0.2, d + 8]} />
          <meshBasicMaterial color={dark ? "#ffffff" : "#000000"} />
        </mesh>
      )}

      <mesh
        ref={mesh}
        onClick={(ev) => {
          ev.stopPropagation();
          onPick(cell.r, cell.c);
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <boxGeometry args={[w, 1, d]} />
        <meshLambertMaterial color={shade(cell.n, dark)} />
        <Edges threshold={20} color={EDGE} />
      </mesh>

      <group ref={top}>
        <Html pointerEvents="none" zIndexRange={[10, 0]}>
          <div
            className={`-translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[11px] ${
              blackText ? "text-black" : "text-white"
            }`}
          >
            {cell.text}
          </div>
        </Html>
      </group>
    </group>
  );
}

function HeatScene({ spec }: { spec: HeatSpec }) {
  const { size } = useThree();
  const W = size.width;
  const labelW = 88; // 5.5rem
  const gap = 6;
  const rowH = 44;
  const cols = spec.regions.length;
  const rows = spec.categories.length;
  const colW = (W - labelW - gap * cols) / cols;
  const pitch = rowH + gap;
  const flatH = 26 + rows * rowH + (rows - 1) * gap; // header row + grid
  const top = -flatH / 2;

  const colX = (j: number) =>
    -W / 2 + labelW + gap + j * (colW + gap) + colW / 2;
  const rowZ = (i: number) => top + 26 + rowH / 2 + i * pitch;

  return (
    <group>
      {spec.regions.map((r, j) => (
        <Html
          key={r}
          position={[colX(j), 0, top + 10]}
          pointerEvents="none"
          zIndexRange={[10, 0]}
        >
          <div className="-translate-x-1/2 -translate-y-1/2 text-[10px] text-black/50 sm:text-xs dark:text-white/50">
            {r}
          </div>
        </Html>
      ))}

      {spec.categories.map((c, i) => (
        <Html
          key={c}
          position={[-W / 2, 0, rowZ(i)]}
          pointerEvents="none"
          zIndexRange={[10, 0]}
        >
          <div className="-translate-y-1/2 whitespace-nowrap text-xs text-black/50 dark:text-white/50">
            {c}
          </div>
        </Html>
      ))}

      {spec.cells.map((cell) => {
        const i = spec.categories.indexOf(cell.c);
        const j = spec.regions.indexOf(cell.r);
        return (
          <Tower
            key={`${cell.r}|${cell.c}`}
            cell={cell}
            x={colX(j)}
            z={rowZ(i)}
            w={colW}
            d={rowH}
            onPick={spec.onPick}
          />
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------
   Stage
------------------------------------------------------------------- */
export type StageProps = {
  spec: SceneSpec;
  dark: boolean;
  target: 0 | 1;
  active: boolean;
  flatRef: { current: HTMLElement | null };
  onReady: () => void;
  onFlat: () => void;
};

export default function Stage3D({
  spec,
  dark,
  target,
  active,
  flatRef,
  onReady,
  onFlat,
}: StageProps) {
  const e = useRef(0);

  return (
    <Canvas
      flat
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: FOV, near: 1, far: 8000, position: [0, 1000, 0.01] }}
      gl={{ antialias: true, alpha: true }}
      onCreated={() => onReady()}
    >
      <AnimContext.Provider value={{ e, dark }}>
        <Rig
          kind={spec.kind}
          target={target}
          flatRef={flatRef}
          onFlat={onFlat}
        />
        <ambientLight intensity={0.62 * Math.PI} />
        <directionalLight position={[30, 80, 40]} intensity={0.45 * Math.PI} />

        {spec.kind === "donut" && <DonutScene spec={spec} />}
        {spec.kind === "bars" && <BarsScene spec={spec} />}
        {spec.kind === "heat" && <HeatScene spec={spec} />}
      </AnimContext.Provider>
    </Canvas>
  );
}