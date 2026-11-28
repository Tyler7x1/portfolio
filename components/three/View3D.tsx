"use client";

import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";
import type { Dim } from "@/components/Dimension";
import type { SceneSpec } from "@/components/three/types";
import { loadStage, preload3D } from "@/components/three/preload";

const Stage3D = lazy(loadStage);

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

  const [armed, setArmed] = useState(on); // 3D code requested at least once
  const [ready, setReady] = useState(false); // canvas created
  const [settled, setSettled] = useState(!on); // camera is back to flat
  const [failed, setFailed] = useState(false); // 3D unavailable
  const [prevOn, setPrevOn] = useState(on);
  const rootRef = useRef<HTMLDivElement>(null);
  const flatRef = useRef<HTMLDivElement>(null);

  // Start downloading the 3D code shortly before the chart scrolls into view,
  // so the first click on "3D" doesn't have to wait for it.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          preload3D();
          io.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
      ref={rootRef}
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
                flatRef={flatRef}
                onReady={() => setReady(true)}
                onFlat={() => setSettled(true)}
              />
            </Suspense>
          </Boundary>
        </div>
      )}

      {on && !failed && (
        <p
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-full mt-1 text-center text-[11px] text-black/45 dark:text-white/45"
        >
          {show ? "Drag to rotate" : "Loading 3D…"}
        </p>
      )}
    </div>
  );
}