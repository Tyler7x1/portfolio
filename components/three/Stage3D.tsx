"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, useCursor } from "@react-three/drei";
import * as THREE from "three";
import type {
  BarsSpec,
  DonutSpec,
  HeatSpec,
  SceneSpec,
} from "@/components/three/types";

const FOV = 30;
const EDGE = "#8a8a8a";

const DarkContext = createContext(false);

function useDark() {
  return useContext(DarkContext);
}

// Tilt writes the 2D to 3D progress (0 to 1) onto the camera, and every
// shape reads it from there. This avoids sharing a mutable value through
// context, which React's lint rules reject.
function phaseOf(camera: { userData: Record<string, unknown> }) {
  const p = camera.userData.phase;
  return typeof p === "number" ? p : 0;
}

// Greys that match the site's black and white look
function shade(o: number, dark: boolean) {
  const v = Math.round(dark ? 10 + o * 245 : 250 - o * 222);
  return `rgb(${v},${v},${v})`;
}

/* ------------------------------------------------------------------
   2D to 3D: the camera stays fixed, looking straight down. The chart
   itself tilts (and its shapes rise), so it turns from flat into 3D.
   Dragging adds a spin and a tilt on top of that default angle.
------------------------------------------------------------------- */
const VIEW = {
  donut: { tilt: 0.93, yaw: 0, zoom: 1.0 },
  bars: { tilt: 0.98, yaw: -0.5, zoom: 1.2 },
  heat: { tilt: 0.87, yaw: -0.42, zoom: 1.25 },
} as const;

const PITCH_MIN = 0.3; // never fully flat while dragging
const PITCH_MAX = 1.38; // never fully edge-on

function clampSpin(kind: SceneSpec["kind"], v: number) {
  // the donut can spin all the way round, wide charts stay readable
  return kind === "donut" ? v : THREE.MathUtils.clamp(v, -1, 1);
}

function clampPitch(kind: SceneSpec["kind"], v: number) {
  const base = VIEW[kind].tilt;
  return THREE.MathUtils.clamp(v, PITCH_MIN - base, PITCH_MAX - base);
}

function Tilt({
  kind,
  target,
  flatRef,
  onFlat,
  children,
}: {
  kind: SceneSpec["kind"];
  target: 0 | 1;
  flatRef: { current: HTMLElement | null };
  onFlat: () => void;
  children: ReactNode;
}) {
  const lift = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const s = useRef(0);
  const flatReported = useRef(false);
  const reduced = useRef(false);
  const targetRef = useRef(target);
  // spin/pitch: what is drawn. goal*: where the drag points.
  // v*: glide speed after letting go.
  const rot = useRef({
    spin: 0,
    pitch: 0,
    goalSpin: 0,
    goalPitch: 0,
    vSpin: 0,
    vPitch: 0,
    down: false,
  });
  const get = useThree((st) => st.get);
  const invalidate = useThree((st) => st.invalidate);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  // Every change of target restarts the animation, even if the canvas is idle
  useEffect(() => {
    targetRef.current = target;
    flatReported.current = false;
    get().gl.domElement.style.cursor = target === 1 ? "grab" : "";
    invalidate();
  }, [target, get, invalidate]);

  // Drag to rotate (mouse, pen and touch)
  useEffect(() => {
    const el = get().gl.domElement;
    const r = rot.current;
    let id = -1;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;

    const hoverCursor = () =>
      targetRef.current === 1
        ? document.body.style.cursor === "pointer"
          ? "pointer"
          : "grab"
        : "";

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      const now = performance.now();
      const dt = Math.max(1, now - lastT) / 1000;
      const dSpin = (e.clientX - lastX) * 0.008;
      // touch only spins, so the page can still scroll vertically
      const dPitch =
        e.pointerType === "touch" ? 0 : -(e.clientY - lastY) * 0.006;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;

      r.goalSpin = clampSpin(kind, r.goalSpin + dSpin);
      r.goalPitch = clampPitch(kind, r.goalPitch + dPitch);
      // remember how fast the pointer moved, for the glide
      r.vSpin = THREE.MathUtils.clamp(0.5 * r.vSpin + 0.5 * (dSpin / dt), -8, 8);
      r.vPitch = THREE.MathUtils.clamp(
        0.5 * r.vPitch + 0.5 * (dPitch / dt),
        -6,
        6
      );
      invalidate();
    };

    const end = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = -1;
      r.down = false;
      // paused before letting go: no glide
      if (performance.now() - lastT > 90) {
        r.vSpin = 0;
        r.vPitch = 0;
      }
      el.style.cursor = hoverCursor();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      invalidate();
    };

    const onDown = (e: PointerEvent) => {
      if (targetRef.current !== 1 || id !== -1) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      id = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = performance.now();
      r.down = true;
      r.vSpin = 0;
      r.vPitch = 0;
      el.style.cursor = "grabbing";
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
      invalidate();
    };

    const onHover = () => {
      if (id === -1) el.style.cursor = hoverCursor();
    };

    // double-click puts the chart back to its default angle
    const onReset = () => {
      r.goalSpin = 0;
      r.goalPitch = 0;
      r.vSpin = 0;
      r.vPitch = 0;
      invalidate();
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onHover);
    el.addEventListener("dblclick", onReset);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onHover);
      el.removeEventListener("dblclick", onReset);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [kind, get, invalidate]);

  useFrame(({ camera, size, invalidate: again }, dt) => {
    const step = Math.min(dt, 0.05);
    const r = rot.current;
    const cfg = VIEW[kind];

    if (reduced.current) {
      s.current = target;
    } else {
      s.current = THREE.MathUtils.damp(s.current, target, 6, step);
      if (Math.abs(s.current - target) < 0.0008) s.current = target;
    }
    const x = THREE.MathUtils.clamp(s.current, 0, 1);
    const k = x * x * (3 - 2 * x); // smoothstep
    camera.userData.phase = k; // the shapes read this to rise

    // After letting go, the chart glides to a stop
    if (!r.down && (r.vSpin !== 0 || r.vPitch !== 0)) {
      r.goalSpin = clampSpin(kind, r.goalSpin + r.vSpin * step);
      r.goalPitch = clampPitch(kind, r.goalPitch + r.vPitch * step);
      const decay = Math.exp(-4 * step);
      r.vSpin *= decay;
      r.vPitch *= decay;
      if (Math.abs(r.vSpin) < 0.02) r.vSpin = 0;
      if (Math.abs(r.vPitch) < 0.02) r.vPitch = 0;
    }
    r.spin = THREE.MathUtils.damp(r.spin, r.goalSpin, 14, step);
    r.pitch = THREE.MathUtils.damp(r.pitch, r.goalPitch, 14, step);
    if (Math.abs(r.spin - r.goalSpin) < 0.0004) r.spin = r.goalSpin;
    if (Math.abs(r.pitch - r.goalPitch) < 0.0004) r.pitch = r.goalPitch;

    // Back to flat: forget the drag, and tell the parent it can show the 2D chart
    const isFlat = target === 0 && k < 0.002;
    if (isFlat) {
      r.spin = r.pitch = r.goalSpin = r.goalPitch = r.vSpin = r.vPitch = 0;
    }

    // Fixed camera, straight above the chart. Narrow screens get a little
    // more room for the tilted scene.
    const narrow = kind !== "donut" && size.width < 520 ? 1.35 : 1;
    const zoom = cfg.zoom * narrow;
    const high = kind === "donut" ? 200 : size.height; // donut is in SVG units
    const D =
      (high / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2))) *
      (1 + (zoom - 1) * k);
    camera.position.set(0, D, 0);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);

    // While flat, keep the chart aligned with the top of the 2D version
    const flatH = flatRef.current?.offsetHeight ?? size.height;
    const offY = Math.max(0, (size.height - flatH) / 2);
    if (lift.current) lift.current.position.z = -offY * (1 - k);

    if (tilt.current) {
      tilt.current.rotation.set(
        -k * (cfg.tilt + r.pitch),
        -k * cfg.yaw + k * r.spin,
        0
      );
    }

    if (isFlat && !flatReported.current) {
      flatReported.current = true;
      onFlat();
    }

    // The canvas only draws while something is moving
    const moving =
      s.current !== target ||
      r.down ||
      r.vSpin !== 0 ||
      r.vPitch !== 0 ||
      r.spin !== r.goalSpin ||
      r.pitch !== r.goalPitch;
    if (moving) again();
  });

  return (
    <group ref={lift}>
      <group ref={tilt}>{children}</group>
    </group>
  );
}

/* ------------------------------------------------------------------
   Text labels, drawn into the scene as sprites. (drei's Html creates a
   separate React root per label, which triggers React's "synchronously
   unmount a root" warning, so it is not used here.)
------------------------------------------------------------------- */
function Label({
  text,
  position,
  anchor = "left",
  color,
  size = 14,
  mono = false,
}: {
  text: string;
  position: [number, number, number];
  anchor?: "left" | "center" | "right";
  color: string;
  size?: number;
  mono?: boolean;
}) {
  const made = useMemo(() => {
    const family = mono
      ? "ui-monospace, SFMono-Regular, Menlo, monospace"
      : getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
    const font = `${size}px ${family}`;

    const probe = document.createElement("canvas").getContext("2d");
    if (!probe) return null;
    probe.font = font;

    const w = Math.ceil(probe.measureText(text).width) + 4;
    const h = Math.ceil(size * 1.4);
    const scale = Math.min(window.devicePixelRatio || 1, 2) * 2; // keep text sharp

    const canvas = document.createElement("canvas");
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.scale(scale, scale);
    ctx.font = font;
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(text, 2, h / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return { texture, w, h };
  }, [text, color, size, mono]);

  useEffect(() => {
    return () => made?.texture.dispose();
  }, [made]);

  if (!made) return null;
  const cx = anchor === "left" ? 0 : anchor === "right" ? 1 : 0.5;

  return (
    <sprite
      position={position}
      scale={[made.w, made.h, 1]}
      center={[cx, 0.5]}
      renderOrder={10}
    >
      <spriteMaterial
        map={made.texture}
        transparent
        depthTest={false}
        toneMapped={false}
      />
    </sprite>
  );
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
  const dark = useDark();
  const mesh = useRef<THREE.Mesh>(null);
  const lift = useRef(0);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered && !!spec.onSelect);
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

  useFrame(({ camera, invalidate }, dt) => {
    const m = mesh.current;
    if (!m) return;
    const goal = isActive ? 6 : 0;
    lift.current = THREE.MathUtils.damp(
      lift.current,
      goal,
      10,
      Math.min(dt, 0.05)
    );
    if (Math.abs(lift.current - goal) < 0.01) lift.current = goal;
    else invalidate();
    m.scale.z = Math.max(
      0.05,
      (6 + item.h * 30 + lift.current) * phaseOf(camera)
    );
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerOver={(ev) => {
        ev.stopPropagation();
        setHovered(true);
        spec.onHover?.(item.key);
      }}
      onPointerOut={() => {
        setHovered(false);
        spec.onHover?.(null);
      }}
      onClick={(ev) => {
        ev.stopPropagation();
        if (ev.delta > 5) return; // that was a drag, not a click
        spec.onSelect?.(item.key);
      }}
    >
      <meshLambertMaterial color={shade(dimmed ? 0.15 : item.o, dark)} />
      <Edges threshold={20} color={EDGE} />
    </mesh>
  );
}

function DonutScene({ spec }: { spec: DonutSpec }) {
  const dark = useDark();
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
  const dark = useDark();
  const mesh = useRef<THREE.Mesh>(null);
  const [rowHover, setRowHover] = useState(false);
  useCursor(rowHover);
  const len = Math.max(2, item.n * trackW);
  const H = 18 + item.n * 84;

  useFrame(({ camera }) => {
    const m = mesh.current;
    if (!m) return;
    const h = Math.max(0.05, H * phaseOf(camera));
    m.scale.y = h;
    m.position.y = h / 2;
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
            if (ev.delta > 5) return;
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
        onClick={(ev) => {
          if (ev.delta > 5) return;
          onSelect(item.key);
        }}
        onPointerOver={() => setRowHover(true)}
        onPointerOut={() => setRowHover(false)}
      >
        <boxGeometry args={[W, 1, 30]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Label
        text={item.key}
        position={[-W / 2, 0, 0]}
        anchor="left"
        color={dark ? "#ffffff" : "#000000"}
        size={14}
      />
      <Label
        text={item.valueLabel}
        position={[W / 2, 0, 0]}
        anchor="right"
        color={dark ? "#ffffff" : "#000000"}
        size={12}
        mono
      />
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
  const dark = useDark();
  const mesh = useRef<THREE.Mesh>(null);
  const top = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  useCursor(hover);
  const H = 8 + cell.n * 64;
  const strong = cell.n > 0.5;
  const blackText = dark ? strong : !strong;

  useFrame(({ camera }) => {
    const m = mesh.current;
    const t = top.current;
    if (!m || !t) return;
    const h = Math.max(0.05, H * phaseOf(camera));
    m.scale.y = h;
    m.position.y = h / 2;
    t.position.y = h;
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
          if (ev.delta > 5) return;
          onPick(cell.r, cell.c);
        }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[w, 1, d]} />
        <meshLambertMaterial color={shade(cell.n, dark)} />
        <Edges threshold={20} color={EDGE} />
      </mesh>

      <group ref={top}>
        <Label
          text={cell.text}
          position={[0, 0, 0]}
          anchor="center"
          color={blackText ? "#000000" : "#ffffff"}
          size={11}
          mono
        />
      </group>
    </group>
  );
}

function HeatScene({ spec }: { spec: HeatSpec }) {
  const dark = useDark();
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
  const muted = dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";

  const colX = (j: number) =>
    -W / 2 + labelW + gap + j * (colW + gap) + colW / 2;
  const rowZ = (i: number) => top + 26 + rowH / 2 + i * pitch;

  return (
    <group>
      {spec.regions.map((r, j) => (
        <Label
          key={r}
          text={r}
          position={[colX(j), 0, top + 10]}
          anchor="center"
          color={muted}
          size={W < 560 ? 10 : 12}
        />
      ))}

      {spec.categories.map((c, i) => (
        <Label
          key={c}
          text={c}
          position={[-W / 2, 0, rowZ(i)]}
          anchor="left"
          color={muted}
          size={12}
        />
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
  flatRef: { current: HTMLElement | null };
  onReady: () => void;
  onFlat: () => void;
};

export default function Stage3D({
  spec,
  dark,
  target,
  flatRef,
  onReady,
  onFlat,
}: StageProps) {
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      frameloop="demand"
      style={{ touchAction: "pan-y", userSelect: "none" }}
      camera={{ fov: FOV, near: 1, far: 8000, position: [0, 1000, 0.01] }}
      gl={{ antialias: true, alpha: true }}
      onCreated={() => onReady()}
    >
      <DarkContext.Provider value={dark}>
        <ambientLight intensity={0.62 * Math.PI} />
        <directionalLight position={[30, 80, 40]} intensity={0.45 * Math.PI} />

        <Tilt
          kind={spec.kind}
          target={target}
          flatRef={flatRef}
          onFlat={onFlat}
        >
          {spec.kind === "donut" && <DonutScene spec={spec} />}
          {spec.kind === "bars" && <BarsScene spec={spec} />}
          {spec.kind === "heat" && <HeatScene spec={spec} />}
        </Tilt>
      </DarkContext.Provider>
    </Canvas>
  );
}