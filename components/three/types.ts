export type DonutItem = {
  key: string;
  start: number; // 0 to 1, where the segment begins (12 o'clock, clockwise)
  len: number; // 0 to 1, visible length
  o: number; // 0 to 1, how strongly the foreground shows
  h: number; // 0 to 1, relative height in 3D
};

export type DonutSpec = {
  kind: "donut";
  items: DonutItem[];
  rOuter: number; // in viewBox units (the SVG is 200 x 200)
  rInner: number;
  track: boolean;
  activeKey: string | null;
  onHover?: (key: string | null) => void;
  onSelect?: (key: string) => void;
};

export type BarItem = {
  key: string;
  valueLabel: string;
  n: number; // 0 to 1, value relative to the largest bar
  on: boolean;
};

export type BarsSpec = {
  kind: "bars";
  items: BarItem[];
  onSelect: (key: string) => void;
};

export type HeatCell = {
  r: string;
  c: string;
  n: number; // 0 to 1, strength (same value that drives the shade)
  text: string;
  on: boolean;
};

export type HeatSpec = {
  kind: "heat";
  regions: string[];
  categories: string[];
  cells: HeatCell[];
  onPick: (r: string, c: string) => void;
};

export type SceneSpec = DonutSpec | BarsSpec | HeatSpec;