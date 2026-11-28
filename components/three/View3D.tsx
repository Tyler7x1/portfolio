"use client";

import {
  Component,
  lazy,
  Suspense,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";
import type { Dim } from "@/components/Dimension";
import type { SceneSpec } from "@/components/three/types";

const Stage3D = lazy(() => import("@/components/three/Stage3D"));

// If WebGL is missing, or the 3D code fails to load, show the 2D chart
// instead of letting the error take down the whole page.
class Boundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("3D view failed, showing 2D instead.", error, info.componentStack);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

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
  children: ReactNode; // the normal 2D chart
}) {
  const { resolvedTheme } = useTheme();
  const on = dim === "3d";

  // Starting values also cover this chart being mounted while already in 3D
  // (for example when switching between Bars and Donut).
  const [armed, setArmed] = useState(on); // 3D code requested at least once
  const [ready, setReady] = useState(false); // canvas created
  const [settled, setSettled] = useState(!on); // camera is back to flat
  const [failed, setFailed] = useState(false); // 3D unavailable
  const [prevOn, setPrevOn] = useState(on);
  const flatRef = useRef<HTMLDivElement>(null);

  // React's documented way to adjust state when a prop changes
  if (on !== prevOn) {
    setPrevOn(on);
    if (on) {
      setArmed(true);
      setSettled(false);
    }
  }

  const show = ready && !settled && !failed;

  return (
    <div
      className={`relative transition-[min-height] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${className}`}
      style={{ minHeight: on && !failed ? minHeight3d : 0 }}
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

      {armed && !failed && (
        <div
          className={`absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${
            show ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <Boundary onError={() => setFailed(true)}>
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
          </Boundary>
        </div>
      )}
    </div>
  );
}