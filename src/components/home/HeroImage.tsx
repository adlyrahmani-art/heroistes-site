"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Effet au survol inspiré de philos.site : autour du curseur, la photo s'éclaire,
// des ondes concentriques la déforment et les canaux RVB se décalent ; grain animé partout.

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
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
    tex.r = texture2D(uMap, cuv + vec2(shift, 0.0)).r;
    tex.g = texture2D(uMap, cuv).g;
    tex.b = texture2D(uMap, cuv - vec2(shift, 0.0)).b;

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
export default function HeroImage({ src, className }: { src: string; className?: string }) {
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
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [src]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
