export const loadStage = () => import("@/components/three/Stage3D");

export function preload3D() {
  void loadStage();
}