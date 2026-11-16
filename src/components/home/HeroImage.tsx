"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Effet au survol inspiré de philos.site : autour du curseur, la photo s'éclaire,
// des ondes concentriques la déforment et les canaux RVB se décalent ; grain animé partout.
// « La foule qui file » : avec un masque (blanc = l'héroïne), la foule autour glisse et s'étire
// vers la droite en continu, l'héroïne reste nette.

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform sampler2D uMask;
  uniform float uFlow;
  uniform vec2 uImageRes;
  uniform vec2 uPlaneRes;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uHover;
  uniform float uSpeed;
  varying vec2 vUv;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
               mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  vec3 rgb(vec2 uv, float shift) {
    return vec3(texture2D(uMap, uv + vec2(shift, 0.0)).r,
                texture2D(uMap, uv).g,
                texture2D(uMap, uv - vec2(shift, 0.0)).b);
  }

  // Équivalent de background-size: cover; background-position: right center
  vec2 coverUv(vec2 uv) {
    float rp = uPlaneRes.x / uPlaneRes.y;
    float ri = uImageRes.x / uImageRes.y;
    vec2 s = rp < ri ? vec2(rp / ri, 1.0) : vec2(1.0, ri / rp);
    return uv * s + vec2(1.0 - s.x, (1.0 - s.y) * 0.5);
  }

  void main() {
    vec2 asp = vec2(uPlaneRes.x / uPlaneRes.y, 1.0);
    vec2 uv = vUv;

    // Zone de lumière autour du curseur
    float d = distance(uv * asp, uMouse * asp);
    float zone = smoothstep(0.48, 0.0, d) * uHover;

    // Ondes concentriques, plus fortes quand la souris bouge vite
    vec2 dir = normalize((uv - uMouse) * asp + 0.0001);
    uv += dir / asp * sin(d * 38.0 - uTime * 5.0) * 0.01 * zone * (1.0 + uSpeed * 2.5);

    // Léger zoom vers le curseur
    uv = mix(uv, uMouse, 0.03 * zone);

    vec2 cuv = coverUv(uv);
    float shift = 0.008 * zone;
    vec3 tex;

    // Foule : bande des passants (hors ciel, sol et zone noire de gauche), sauf l'héroïne
    float band = smoothstep(0.14, 0.3, cuv.y) * smoothstep(0.82, 0.68, cuv.y) * smoothstep(0.28, 0.48, cuv.x);
    float flow = uFlow * band * (1.0 - texture2D(uMask, cuv).r);
    if (flow > 0.001) {
      // Ondulation horizontale qui voyage vers la droite + traînée de flou directionnel
      float n = vnoise(vec2(cuv.x * 7.0 - uTime * 0.9, cuv.y * 26.0)) * 0.6
              + vnoise(vec2(cuv.x * 3.0 - uTime * 0.45, cuv.y * 8.0 + 5.0)) * 0.4;
      float dx = (n - 0.5) * 0.016 * flow;
      vec3 acc = vec3(0.0);
      float wsum = 0.0;
      for (int i = 0; i < 8; i++) {
        float f = float(i) / 7.0;
        float w = 1.0 - f * 0.7;
        acc += rgb(cuv + vec2(dx - (f - 0.25) * 0.014 * flow, 0.0), shift) * w;
        wsum += w;
      }
      tex = acc / wsum;
    } else {
      tex = rgb(cuv, shift);
    }

    // « En plein jour » : contraste et luminosité relevés, pointe de turquoise dans les clairs
    float lum = dot(tex, vec3(0.299, 0.587, 0.114));
    vec3 lit = clamp((tex - 0.02) * 2.1, 0.0, 1.0);
    lit += vec3(0.067, 0.89, 0.78) * 0.06 * smoothstep(0.1, 0.4, lum);
    vec3 col = mix(tex, lit, zone);

    col += (hash12(vUv * 900.0 + fract(uTime) * 100.0) - 0.5) * 0.05;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Photo de fond du hero en WebGL, réactive au survol. Le fond CSS reste en dessous en secours. */
export default function HeroImage({ src, maskSrc, className }: { src: string; maskSrc?: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const host = canvas.parentElement!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    } catch {
      return; // pas de WebGL : on garde le fond CSS
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const uniforms = {
      uMap: { value: null as THREE.Texture | null },
      uMask: { value: null as THREE.Texture | null },
      uFlow: { value: 0 },
      uImageRes: { value: new THREE.Vector2(1920, 1080) },
      uPlaneRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.75, 0.5) },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uSpeed: { value: 0 },
    };
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    scene.add(new THREE.Mesh(geometry, material));

    let texture: THREE.Texture | null = null;
    new THREE.TextureLoader().load(src, (t) => {
      t.colorSpace = THREE.NoColorSpace;
      t.minFilter = THREE.LinearFilter;
      texture = t;
      uniforms.uMap.value = t;
      uniforms.uImageRes.value.set(t.image.width, t.image.height);
      canvas.style.opacity = "1";
    });

    let mask: THREE.Texture | null = null;
    if (maskSrc) {
      new THREE.TextureLoader().load(maskSrc, (t) => {
        t.colorSpace = THREE.NoColorSpace;
        t.minFilter = THREE.LinearFilter;
        mask = t;
        uniforms.uMask.value = t;
      });
    }

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(width, height, false);
      uniforms.uPlaneRes.value.set(width, height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // Souris (repère UV : origine en bas à gauche), lissée dans la boucle
    const target = new THREE.Vector2(0.75, 0.5);
    let inside = false;
    let speed = 0;
    let last = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      speed += Math.hypot(e.clientX - last.x, e.clientY - last.y) / r.width;
      last = { x: e.clientX, y: e.clientY };
      inside = true;
    };
    const onLeave = () => {
      inside = false;
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    // Ne rend que si la photo est à l'écran
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(host);

    const clock = new THREE.Clock();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible || !texture) return;
      const k = 1 - Math.exp(-dt * 7);
      uniforms.uTime.value += dt;
      uniforms.uMouse.value.lerp(target, k);
      // La foule se met en mouvement en douceur une fois le masque chargé
      uniforms.uFlow.value += ((mask ? 1 : 0) - uniforms.uFlow.value) * (1 - Math.exp(-dt * 0.8));
      uniforms.uHover.value += ((inside ? 1 : 0) - uniforms.uHover.value) * (1 - Math.exp(-dt * 4));
      speed *= Math.exp(-dt * 3);
      uniforms.uSpeed.value += (Math.min(speed, 1) - uniforms.uSpeed.value) * k;
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      texture?.dispose();
      mask?.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [src, maskSrc]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
