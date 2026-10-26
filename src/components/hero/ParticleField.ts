// Moteur du nuage de particules du hero, indépendant de React :
// morphing sphère → constellation → symbole H, Drag to Spin, Click to Burst.
import * as THREE from "three";
import { buildTargets, type Targets } from "./shapes";

const vertexShader = /* glsl */ `
  attribute vec3 customColor;
  attribute float size;
  uniform float uPR;
  uniform float uScale;
  varying vec3 vC;
  varying float vA;
  void main() {
    vC = customColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * uPR * uScale * (3.0 / -mv.z);
    vA = clamp(1.4 - (-mv.z - 6.0) * 0.25, 0.15, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vC;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    if (a < 0.01) discard;
    gl_FragColor = vec4(vC, a * vA * 0.9);
  }
`;

function makeDotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,255,255,1)");
  g.addColorStop(0.5, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export class ParticleField {
  readonly group = new THREE.Group();
  readonly n: number;
  private pos: Float32Array;
  private vel: Float32Array;
  private delay: Float32Array;
  private tq: Uint8Array;

  private geo = new THREE.BufferGeometry();
  private mat: THREE.ShaderMaterial;
  private lineGeo = new THREE.BufferGeometry();
  private lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
  private nodeGeo = new THREE.BufferGeometry();
  private nodeMat: THREE.PointsMaterial;
  private dotTex: THREE.CanvasTexture;

  private targets: Targets | null = null;
  private t = 0;
  private stage = 0;
  private prevStage = 0;
  private switchT = 0;
  private input = { down: false, sx: 0, sy: 0, lx: 0, ly: 0, moved: 0, downT: 0, type: "mouse", spinX: 0, spinY: 0, mx: 0, my: 0 };

  constructor(n: number) {
    this.n = n;
    this.pos = new Float32Array(n * 3);
    this.vel = new Float32Array(n * 3);
    this.delay = new Float32Array(n);
    this.tq = new Uint8Array(n);
    const col = new Float32Array(n * 3);
    const sizes = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      this.tq[i] = Math.random() < 0.42 ? 1 : 0;
      const g = 0.72 + Math.random() * 0.28;
      if (this.tq[i]) col.set([0.067, 0.89, 0.78], i * 3);
      else col.set([g, g, g], i * 3);
      sizes[i] = (this.tq[i] ? 1.5 : 1.1) + Math.random() * 1.8;
      this.delay[i] = Math.random() * 0.75;
      this.pos[i * 3] = (Math.random() - 0.5) * 12;
      this.pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      this.pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }

    this.geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute("customColor", new THREE.BufferAttribute(col, 3));
    this.geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uPR: { value: 1 }, uScale: { value: 4.2 } },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.group.add(new THREE.Points(this.geo, this.mat));

    // Lignes et nœuds de la constellation (maquette Section1 - Option2)
    this.lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(10 * 3), 3));
    this.group.add(new THREE.LineSegments(this.lineGeo, this.lineMat));
    this.dotTex = makeDotTexture();
    this.nodeGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(4 * 3), 3));
    this.nodeMat = new THREE.PointsMaterial({
      color: 0x11e3c7, size: 0.11, map: this.dotTex, transparent: true, opacity: 0, depthWrite: false,
    });
    this.group.add(new THREE.Points(this.nodeGeo, this.nodeMat));
  }

  /** Recalcule les formes cibles pour la taille visible à z = 0. */
  resize(camera: THREE.PerspectiveCamera, aspect: number, dpr: number) {
    const h = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const t = buildTargets(this.n, h, h * aspect, aspect, this.tq);
    this.targets = t;
    (this.lineGeo.attributes.position as THREE.BufferAttribute).set(t.lines).needsUpdate = true;
    (this.nodeGeo.attributes.position as THREE.BufferAttribute).set(t.hubs).needsUpdate = true;
    this.mat.uniforms.uPR.value = dpr;
  }

  /** Change de forme ; l'explosion de la sphère amorce la recomposition en constellation. */
  setStage(stage: number) {
    if (stage === this.stage) return;
    this.prevStage = this.stage;
    this.stage = stage;
    this.switchT = this.t;
    const v = this.targets?.view;
    if (v) this.burst(v.cx, v.cy, 0, this.prevStage === 0 && stage === 1 ? 1.6 : 0.6);
  }

  burst(cx: number, cy: number, cz: number, k: number) {
    const { n, pos, vel } = this;
    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      const dx = pos[i3] - cx, dy = pos[i3 + 1] - cy, dz = pos[i3 + 2] - cz;
      const d = Math.hypot(dx, dy, dz) || 0.001;
      const f = (0.22 * Math.exp((-d * d) / 1.1) + 0.02) * (0.5 + Math.random()) * k;
      vel[i3] += (dx / d) * f;
      vel[i3 + 1] += (dy / d) * f;
      vel[i3 + 2] += (dz / d) * f + (Math.random() - 0.5) * 0.04 * k;
    }
  }

  /** Branche Drag to Spin / Click to Burst sur le canvas. Renvoie la fonction de nettoyage. */
  attach(el: HTMLElement, camera: THREE.Camera) {
    const p = this.input;
    const group = this.group;
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hit = new THREE.Vector3();

    const burstAt = (x: number, y: number) => {
      const ring = document.createElement("div");
      ring.className = "burst-ring";
      ring.style.left = x + "px";
      ring.style.top = y + "px";
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 720);
      const r = el.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1), camera);
      if (!ray.ray.intersectPlane(plane, hit)) return;
      const c = group.worldToLocal(hit.clone());
      this.burst(c.x, c.y, c.z, 1);
    };
    const onDown = (e: PointerEvent) => {
      Object.assign(p, { down: true, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, moved: 0, downT: performance.now(), type: e.pointerType });
      if (e.pointerType !== "touch") el.setPointerCapture(e.pointerId);
      el.classList.add("dragging");
    };
    const onMove = (e: PointerEvent) => {
      p.mx = (e.clientX / window.innerWidth) * 2 - 1;
      p.my = (e.clientY / window.innerHeight) * 2 - 1;
      if (!p.down) return;
      const dx = e.clientX - p.lx, dy = e.clientY - p.ly;
      p.lx = e.clientX;
      p.ly = e.clientY;
      p.moved += Math.abs(dx) + Math.abs(dy);
      p.spinY = dx * 0.006;
      group.rotation.y += p.spinY;
      // Au toucher, le glissé vertical reste au scroll natif (touch-action: pan-y)
      if (p.type !== "touch") {
        p.spinX = dy * 0.004;
        group.rotation.x = THREE.MathUtils.clamp(group.rotation.x + p.spinX, -0.7, 0.7);
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!p.down) return;
      p.down = false;
      el.classList.remove("dragging");
      if (p.moved < 8 && performance.now() - p.downT < 450) burstAt(e.clientX, e.clientY);
    };
    const onCancel = () => {
      p.down = false;
      el.classList.remove("dragging");
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onCancel);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
    };
  }

  update(delta: number, camera: THREE.Camera, reduce: boolean) {
    const t = this.targets;
    if (!t) return;
    const dt = Math.min(delta, 0.05);
    this.t += dt;
    const el = this.t - this.switchT;
    const A = t.shapes[this.stage], B = t.shapes[this.prevStage];
    const { n, pos, vel, delay } = this;
    const k = 0.042, damp = 0.87;
    for (let i = 0; i < n; i++) {
      const src = reduce || el > delay[i] ? A : B;
      const i3 = i * 3;
      for (let j = 0; j < 3; j++) {
        const v = vel[i3 + j] * damp + (src[i3 + j] - pos[i3 + j]) * k;
        vel[i3 + j] = v;
        pos[i3 + j] += v;
      }
    }
    this.geo.attributes.position.needsUpdate = true;

    const p = this.input;
    const g = this.group;
    if (!p.down) {
      p.spinY *= 0.95;
      p.spinX *= 0.92;
      g.rotation.y += p.spinY;
      if (this.stage === 0) {
        if (!reduce) g.rotation.y += 0.0022;
        g.rotation.x += (0.12 - g.rotation.x) * 0.02;
      } else if (Math.abs(p.spinY) < 0.003) {
        const ty = Math.round(g.rotation.y / (Math.PI * 2)) * Math.PI * 2;
        g.rotation.y += (ty - g.rotation.y) * 0.045;
        g.rotation.x += (0 - g.rotation.x) * 0.045;
      }
    }

    const lineTarget = this.stage === 1 && el > 0.9 ? 0.38 : 0;
    this.lineMat.opacity += (lineTarget - this.lineMat.opacity) * 0.06;
    this.nodeMat.opacity += ((lineTarget ? 1 : 0) - this.nodeMat.opacity) * 0.06;

    // Parallaxe caméra à la souris
    const par = reduce ? 0 : 1;
    camera.position.x += (p.mx * 0.22 * par - camera.position.x) * 0.04;
    camera.position.y += (-p.my * 0.14 * par - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  }

  dispose() {
    this.geo.dispose();
    this.mat.dispose();
    this.lineGeo.dispose();
    this.lineMat.dispose();
    this.nodeGeo.dispose();
    this.nodeMat.dispose();
    this.dotTex.dispose();
  }
}
