"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { BLADE_LEFT, BLADE_RIGHT } from "@/components/Logo";

// Fond des sections B2B (réf. labs.lusion.co/about, adapté) : le symbole Héroïstes en volume,
// fait de milliers de particules floues comme le flou d'un objectif photo.
// Cycle en boucle : le logo est lisible (flou léger) → il se disperse dans l'espace en vague,
// du haut vers le bas, le flou grandit → les particules reviennent reconstruire le logo.
// Rendu : particules additives (densité) en basse résolution → flou Kawase → gris sur fond clair.

// Nombre de particules : moitié moins sur mobile et tablette (GPU plus modestes)
const COUNT_DESKTOP = 40000;
const COUNT_COMPACT = 20000;
const CYCLE = 16; // secondes : tenue, dispersion, dérive, retour

/** Polygone SVG simple (M, L, H, V, Z) → points normalisés, centrés sur le symbole */
function polygonFromPath(d: string) {
  const pts: [number, number][] = [];
  const tokens = d.match(/[MLHVZ]|-?\d*\.?\d+/g)!;
  let x = 0;
  let y = 0;
  let cmd = "";
  for (let i = 0; i < tokens.length; ) {
    if (/[MLHVZ]/.test(tokens[i])) cmd = tokens[i++];
    if (cmd === "Z") break;
    if (cmd === "H") x = parseFloat(tokens[i++]);
    else if (cmd === "V") y = parseFloat(tokens[i++]);
    else {
      x = parseFloat(tokens[i++]);
      y = parseFloat(tokens[i++]);
    }
    pts.push([(x - 267) / 194, -(y - 194) / 194]); // le SVG a l'axe Y vers le bas
  }
  return pts;
}

function inside(poly: [number, number][], x: number, y: number) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Particules réparties dans le volume des deux lames, avec direction et retard de dispersion */
function buildParticles(COUNT: number) {
  const blades = [polygonFromPath(BLADE_LEFT), polygonFromPath(BLADE_RIGHT)];
  const position = new Float32Array(COUNT * 3);
  const dir = new Float32Array(COUNT * 3);
  const delay = new Float32Array(COUNT);
  const rand = new Float32Array(COUNT);
  for (let n = 0; n < COUNT; ) {
    const x = Math.random() * 1.2 - 0.6;
    const y = Math.random() * 2 - 1;
    const b = blades.findIndex((p) => inside(p, x, y));
    if (b < 0) continue;
    const z = (Math.random() - 0.5) * 0.22 + (b === 0 ? -0.1 : 0.1); // lames décalées en profondeur
    position.set([x, y, z], n * 3);
    // Vers l'extérieur du logo, avec une part aléatoire en 3D
    const v = new THREE.Vector3(x * 0.8, y * 0.5, 0).add(new THREE.Vector3().randomDirection());
    v.z *= 0.35; // peu vers la caméra : sinon les particules envahissent tout l'écran
    v.normalize();
    dir.set([v.x, v.y, v.z], n * 3);
    delay[n] = (1 - y) / 2 * 0.8 + Math.random() * 0.2; // la vague part du haut
    rand[n] = Math.random();
    n++;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(position, 3));
  g.setAttribute("aDir", new THREE.BufferAttribute(dir, 3));
  g.setAttribute("aDelay", new THREE.BufferAttribute(delay, 1));
  g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
  return g;
}

const particleVertex = /* glsl */ `
  attribute vec3 aDir;
  attribute float aDelay;
  attribute float aRand;
  uniform float uTime, uSize;
  varying float vAlpha;

  void main() {
    // Enveloppe de dispersion propre à chaque particule (0 = logo, 1 = dispersée)
    float c = mod(uTime, ${CYCLE.toFixed(1)});
    float d = aDelay * 2.0;
    float s = smoothstep(4.0 + d, 7.5 + d, c) * (1.0 - smoothstep(10.0 + d, 13.5 + d, c));

    vec3 p = position + aDir * s * (0.5 + aRand * 1.0);
    // Tourbillon autour de l'axe vertical pendant la dispersion
    float a = s * (0.8 + aRand * 1.2);
    p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
    // Dérive lente, plus ample une fois dispersée
    p += (0.015 + s * 0.12) * vec3(sin(uTime * 0.7 + aRand * 20.0), cos(uTime * 0.6 + aRand * 13.0), sin(uTime * 0.5 + aRand * 7.0));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // Flou d'objectif : une fois dispersées, la plupart des particules s'effacent et quelques-unes
    // restent en grands disques flous, pour qu'on lise des particules dans l'espace et pas un voile
    float keep = step(0.975, aRand);
    gl_PointSize = min(uSize * (1.0 + s * (0.5 + keep * 4.0)) * (6.0 / -mv.z), uSize * 6.0);
    vAlpha = mix(1.0, mix(0.025, 0.8, keep), s);
  }
`;

const particleFragment = /* glsl */ `
  uniform float uGain;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    if (r > 1.0) discard;
    // Disque doux, comme le bokeh d'un objectif
    float a = smoothstep(1.0, 0.45, r) * vAlpha * uGain;
    gl_FragColor = vec4(vec3(a), 1.0);
  }
`;

const quadVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Flou Kawase : 4 échantillons en diagonale, l'écart grandit à chaque passe
const kawaseFragment = /* glsl */ `
  uniform sampler2D tMap;
  uniform vec2 uTexel;
  uniform float uOffset;
  varying vec2 vUv;
  void main() {
    vec2 o = (uOffset + 0.5) * uTexel;
    gl_FragColor = 0.25 * (
      texture2D(tMap, vUv + vec2(o.x, o.y)) + texture2D(tMap, vUv + vec2(-o.x, o.y)) +
      texture2D(tMap, vUv + vec2(o.x, -o.y)) + texture2D(tMap, vUv + vec2(-o.x, -o.y)));
  }
`;

const compositeFragment = /* glsl */ `
  uniform sampler2D tBlur, tSoft;
  varying vec2 vUv;
  void main() {
    // Cœur lisible + halo doux ; la densité sature en douceur
    float density = texture2D(tBlur, vUv).r + texture2D(tSoft, vUv).r * 0.35;
    float d = 1.0 - exp(-density * 1.6);
    gl_FragColor = vec4(mix(vec3(0.937), vec3(0.11), d * 0.6), 1.0);
  }
`;

export default function LogoSmoke3D({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    } catch {
      return;
    }
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    renderer.setPixelRatio(dpr);

    // ---------- Scène : le symbole en particules ----------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 6);

    const count = innerWidth > 1024 ? COUNT_DESKTOP : COUNT_COMPACT;
    const geometry = buildParticles(count);
    const material = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: { uTime: { value: 0 }, uSize: { value: 6 }, uGain: { value: 0.075 * (COUNT_DESKTOP / count) } },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const logo = new THREE.Points(geometry, material);
    logo.scale.setScalar(1.35);
    const pivot = new THREE.Group();
    pivot.add(logo);
    scene.add(pivot);

    // ---------- Flou et composition ----------
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    const quadScene = new THREE.Scene();
    quadScene.add(quad);
    const quadCamera = new THREE.Camera();

    const rtOpts = { type: THREE.HalfFloatType, depthBuffer: false };
    const rtScene = new THREE.WebGLRenderTarget(1, 1, rtOpts);
    const rtA = new THREE.WebGLRenderTarget(1, 1, rtOpts);
    const rtB = new THREE.WebGLRenderTarget(1, 1, rtOpts);
    const rtSoft = new THREE.WebGLRenderTarget(1, 1, rtOpts);

    const kawase = new THREE.ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: kawaseFragment,
      uniforms: { tMap: { value: null }, uTexel: { value: new THREE.Vector2() }, uOffset: { value: 0 } },
    });
    const composite = new THREE.ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: compositeFragment,
      uniforms: { tBlur: { value: null }, tSoft: { value: null } },
    });

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const width = Math.max(r.width, 1);
      const height = Math.max(r.height, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      rtScene.setSize(Math.ceil(width / 2), Math.ceil(height / 2));
      rtA.setSize(Math.ceil(width / 2), Math.ceil(height / 2));
      rtB.setSize(Math.ceil(width / 2), Math.ceil(height / 2));
      rtSoft.setSize(Math.ceil(width / 8), Math.ceil(height / 8));
      // Taille des particules proportionnelle à l'écran (rendu à mi-résolution)
      material.uniforms.uSize.value = Math.max(height / 2 / 120, 3);
      // Le symbole se tient à droite, comme la fumée des maquettes
      const halfW = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
      pivot.position.x = width > 900 ? halfW * 0.5 : halfW * 0.25;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const blur = (src: THREE.WebGLRenderTarget, a: THREE.WebGLRenderTarget, b: THREE.WebGLRenderTarget, offsets: number[]) => {
      quad.material = kawase;
      let read = src;
      offsets.forEach((o, i) => {
        const write = i % 2 === 0 ? a : b;
        kawase.uniforms.tMap.value = read.texture;
        kawase.uniforms.uTexel.value.set(1 / write.width, 1 / write.height);
        kawase.uniforms.uOffset.value = o;
        renderer.setRenderTarget(write);
        renderer.render(quadScene, quadCamera);
        read = write;
      });
      return read;
    };

    // ---------- Souris (légère inclinaison) et défilement ----------
    const mouse = new THREE.Vector2();
    const mouseTarget = new THREE.Vector2();
    const onMove = (e: PointerEvent) => mouseTarget.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
    window.addEventListener("pointermove", onMove, { passive: true });

    const host = canvas.closest<HTMLElement>("[data-smoke-scene]");
    let drift = 0;
    const onScroll = () => {
      if (!host) return;
      const r = host.getBoundingClientRect();
      const p = Math.min(Math.max(-r.top / Math.max(r.height - innerHeight, 1), 0), 1);
      drift = (p - 0.5) * 0.4;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    const render = (t: number) => {
      mouse.lerp(mouseTarget, 0.04);
      // Demi-tour simple (180°) à plat pendant chaque dispersion : le symbole étant symétrique,
      // il se reconstruit à l'endroit, et la boucle est continue
      const k = Math.min(Math.max(((t % CYCLE) - 4) / 9.5, 0), 1);
      const turn = (Math.floor(t / CYCLE) + k * k * (3 - 2 * k)) * Math.PI;
      pivot.rotation.set(mouse.y * 0.15, mouse.x * 0.3, turn);
      pivot.position.y = 0.08 * Math.sin(t * 0.2) + drift;
      material.uniforms.uTime.value = t;

      renderer.setRenderTarget(rtScene);
      renderer.render(scene, camera);
      const sharp = blur(rtScene, rtA, rtB, [0, 1, 2]);
      const soft = blur(sharp, rtSoft, sharp === rtA ? rtB : rtA, [1, 2]);
      composite.uniforms.tBlur.value = sharp.texture;
      composite.uniforms.tSoft.value = soft.texture;
      quad.material = composite;
      renderer.setRenderTarget(null);
      renderer.render(quadScene, quadCamera);
    };

    let raf = 0;
    if (reduce) {
      render(1); // logo assemblé, immobile
    } else {
      const clock = new THREE.Clock();
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (visible) render(clock.getElapsedTime());
      };
      loop();
    }
    canvas.style.opacity = "1";

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      ro.disconnect();
      geometry.dispose();
      [material, kawase, composite].forEach((m) => m.dispose());
      quad.geometry.dispose();
      [rtScene, rtA, rtB, rtSoft].forEach((rt) => rt.dispose());
      renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
