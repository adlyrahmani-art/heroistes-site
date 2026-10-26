// Cibles des particules pour chaque lame du hero : sphère → constellation → symbole H.
// Porté depuis le prototype WebGL (claude.ai/artifact/DC14Ukd3AAqJNT9tyFgaMs).

export type Vec2 = [number, number];

export type View = { w: number; h: number; wide: boolean; cx: number; cy: number };

// Nœuds de la constellation (maquette Figma « Section1 - Option2 », coordonnées px)
export const NODES: Vec2[] = [
  [1797, 218],
  [1244, 474],
  [1385, 527],
  [1238, 931],
  [1595, 764],
];
export const PATH = [0, 1, 2, 3, 4, 0];
export const HUBS = [0, 1, 3, 4];

// Symbole H : deux lames (approximation — à remplacer par les vectors Figma 1:32 et 1:33)
export const BLADE_L: Vec2[] = [
  [0, 80],
  [105, 0],
  [105, 150],
  [175, 130],
  [105, 200],
  [105, 270],
  [0, 350],
];
export const BLADE_R: Vec2[] = BLADE_L.map(([x, y]) => [175 - x + 52.36, 350 - y + 38.32]);

function inPoly(x: number, y: number, p: Vec2[]) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i];
    const [xj, yj] = p[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function samplePoly(p: Vec2[]): Vec2 {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of p) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  for (let k = 0; k < 200; k++) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    if (inPoly(x, y, p)) return [x, y];
  }
  return p[0];
}

const gauss = () => {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

export type Targets = {
  view: View;
  shapes: [Float32Array, Float32Array, Float32Array];
  lines: Float32Array; // 5 segments × 2 points × xyz
  hubs: Float32Array; // 4 nœuds × xyz
};

/** Calcule les 3 formes cibles pour un viewport donné (h, w = taille visible à z=0). */
export function buildTargets(n: number, h: number, w: number, aspect: number, turquoise: Uint8Array): Targets {
  const wide = aspect > 1.1;
  const cx = wide ? w * 0.2 : 0;
  const cy = wide ? 0 : h * 0.17;
  const dust = (i: number, A: Float32Array) => {
    A[i * 3] = (Math.random() - 0.5) * w * 1.2;
    A[i * 3 + 1] = (Math.random() - 0.5) * h * 1.2;
    A[i * 3 + 2] = (Math.random() - 0.5) * 3 - 0.5;
  };

  // 0 · sphère (spirale de Fibonacci)
  const S = new Float32Array(n * 3);
  const r = Math.min(h * 0.3, w * (wide ? 0.22 : 0.36));
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    if (Math.random() < 0.06) { dust(i, S); continue; }
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    const rr = r * (Math.random() < 0.12 ? Math.random() * 0.9 : 0.94 + Math.random() * 0.1);
    S[i * 3] = cx + Math.cos(th) * rad * rr;
    S[i * 3 + 1] = cy + y * rr;
    S[i * 3 + 2] = Math.sin(th) * rad * rr;
  }

  // 1 · constellation
  const xs = NODES.map((p) => p[0]);
  const ys = NODES.map((p) => p[1]);
  const mx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const my = (Math.min(...ys) + Math.max(...ys)) / 2;
  const s = Math.min(
    (h * (wide ? 0.74 : 0.5)) / (Math.max(...ys) - Math.min(...ys)),
    (w * (wide ? 0.42 : 0.82)) / (Math.max(...xs) - Math.min(...xs)),
  );
  const P: Vec2[] = NODES.map(([x, y]) => [cx + (x - mx) * s, cy - (y - my) * s]);
  const segs: [Vec2, Vec2, number][] = [];
  let tot = 0;
  for (let k = 0; k < PATH.length - 1; k++) {
    const a = P[PATH[k]], b = P[PATH[k + 1]];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segs.push([a, b, L]);
    tot += L;
  }
  const C = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const q = Math.random();
    if (q < 0.58) {
      let u = Math.random() * tot, k = 0;
      while (u > segs[k][2] && k < segs.length - 1) { u -= segs[k][2]; k++; }
      const [a, b, L] = segs[k];
      const f = u / L;
      C[i * 3] = a[0] + (b[0] - a[0]) * f + gauss() * 0.018;
      C[i * 3 + 1] = a[1] + (b[1] - a[1]) * f + gauss() * 0.018;
      C[i * 3 + 2] = gauss() * 0.03;
    } else if (q < 0.82) {
      const p = P[HUBS[i % 4]];
      C[i * 3] = p[0] + gauss() * 0.05;
      C[i * 3 + 1] = p[1] + gauss() * 0.05;
      C[i * 3 + 2] = gauss() * 0.05;
    } else dust(i, C);
  }
  const lines = new Float32Array(10 * 3);
  for (let k = 0; k < 5; k++) {
    const a = P[PATH[k]], b = P[PATH[k + 1]];
    lines.set([a[0], a[1], 0, b[0], b[1], 0], k * 6);
  }
  const hubs = new Float32Array(4 * 3);
  HUBS.forEach((idx, k) => hubs.set([P[idx][0], P[idx][1], 0], k * 3));

  // 2 · symbole H (gris à gauche, turquoise à droite)
  const H = new Float32Array(n * 3);
  const sh = Math.min((h * (wide ? 0.62 : 0.42)) / 389, (w * (wide ? 0.4 : 0.6)) / 229);
  for (let i = 0; i < n; i++) {
    if (Math.random() < 0.12) { dust(i, H); continue; }
    const [x, y] = samplePoly(turquoise[i] ? BLADE_R : BLADE_L);
    H[i * 3] = cx + (x - 114.5) * sh;
    H[i * 3 + 1] = cy - (y - 194) * sh;
    H[i * 3 + 2] = (turquoise[i] ? 0.12 : -0.12) + gauss() * 0.035;
  }

  return { view: { w, h, wide, cx, cy }, shapes: [S, C, H], lines, hubs };
}
