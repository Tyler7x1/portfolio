"use client";

import { lazy, Suspense, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { Dim } from "@/components/Dimension";
import type { SceneSpec } from "@/components/three/types";

const Stage3D = lazy(() => import("@/components/three/Stage3D"));

export default function View3D({
  dim,
  spec,
  minHeight3d = 0,
  className = "",
  children,
}: {
  dim: Dim;
  spec: SceneSpec;
  minHeight3d?: number; // extra room the tilted view needs
  className?: string;
  children: React.ReactNode; // the normal 2D chart
}) {
  const { resolvedTheme } = useTheme();
  const on = dim === "3d";

  const [armed, setArmed] = useState(false); // 3D code requested at least once
  const [ready, setReady] = useState(false); // canvas created
  const [settled, setSettled] = useState(true); // camera back to flat
  const flatRef = useRef<HTMLDivElement>(null);

  if (on && !armed) setArmed(true);
  if (on && settled) setSettled(false);

  const show = ready && !settled;

  return (
    <div
      className={`relative transition-[min-height] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${className}`}
      style={{ minHeight: on ? minHeight3d : 0 }}
    >
      <div
        ref={flatRef}
        inert={show}
        className={`transition-opacity duration-300 motion-reduce:transition-none ${
          show ? "opacity-0" : "opacity-100"
        }`}
      >
        {children}
      </div>

      {armed && (
        <div
          className={`absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${
            show ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <Suspense fallback={null}>
            <Stage3D
              spec={spec}
              dark={resolvedTheme === "dark"}
              target={on ? 1 : 0}
              active={!settled}
              flatRef={flatRef}
              onReady={() => setReady(true)}
              onFlat={() => setSettled(true)}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}