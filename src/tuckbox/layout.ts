export type Point = {
  x: number;
  y: number;
};

export type Panel = {
  loc: Point;
  size: Point;
};

export type Flap = Panel & {
  kind: string;
  orient: Orientation;
};

export type Matrix = [number, number, number, number, number, number];

export type Orientation = "up" | "down" | "left" | "right" | undefined;

export function pt(x: number, y: number): Point {
  return { x: x, y: y };
}

export function add(p1: Point, x: number, y: number): Point {
  return pt(p1.x + x, p1.y + y);
}

export function CMrot(deg: number) {
  return [Math.cos(deg), Math.sin(deg), -Math.sin(deg), Math.cos(deg), 0, 0];
}

export function CMtranslate(x: number, y: number) {
  const inchesToMm = 0.03937;
  // TODO is this pixels? not really sure
  const pixels = 72;
  return [1, 0, 0, 1, x * pixels * inchesToMm, y * pixels * inchesToMm];
}

export function CMcomp(m0: number[], m1: number[]): Matrix {
  return [
    m0[0] * m1[0] + m0[1] * m1[2],
    m0[0] * m1[1] + m0[1] * m1[3],

    m0[2] * m1[0] + m0[3] * m1[2],
    m0[2] * m1[1] + m0[3] * m1[3],

    m0[4] * m1[0] + m0[5] * m1[2] + m1[4],
    m0[4] * m1[1] + m0[5] * m1[3] + m1[5],
  ];
}

export function CMstr(m: Matrix) {
  const round = (n: number): string => {
    return n.toFixed(3);
  };
  // TODO this type is so strange
  // it will always be string but
  // the body assumes a number
  // setup unit test once types are working
  const posZero = (n: string | number) => {
    return n === 0 ? 0 : n;
  };
  return m.map(round).map(posZero).join(" ") + " cm";
}

export function dir2deg(orient: Orientation) {
  let deg = 0;
  if (orient === "left") {
    deg = Math.PI / 2;
  } else if (orient === "down") {
    deg = Math.PI;
  } else if (orient === "right") {
    deg = (3 * Math.PI) / 2;
  }
  return deg;
}

export function hexToRgb(hex: string): [number, number, number] {
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}
