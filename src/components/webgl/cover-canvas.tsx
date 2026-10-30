"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { cardFragment, cardVertex } from "./shaders/card";

/**
 * The card's procedural cover, drawn flat into one block on the case-study
 * page — the same picture the visitor just opened from the carousel. Plain
 * three.js (no React renderer); animates only while on screen, a single
 * still frame with reduced motion.
 */
export default function CoverCanvas({ pattern, onFail }: { pattern: number; onFail: () => void }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" });
    } catch {
      onFail();
      return;
    }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
    renderer.setClearColor(0x0e0f11, 1);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    camera.position.z = 1;
    const material = new THREE.ShaderMaterial({
      vertexShader: cardVertex,
      fragmentShader: cardFragment,
      defines: { PATTERN: pattern },
      uniforms: {
        uTime: { value: 4 },
        uShift: { value: 0 },
        uActive: { value: 1 },
        uPattern: { value: pattern },
        uHasTex: { value: 0 },
        uAspect: { value: 1 },
        uImgAspect: { value: 1 },
        uRadius: { value: 0 },
        uOpacity: { value: 1 },
        uBend: { value: 0 },
        uExpand: { value: 1 },
        uAccent: { value: new THREE.Color("#efa83c") },
        uTex: { value: null },
      },
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    scene.add(mesh);

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      material.uniforms.uAspect.value = w / Math.max(h, 1);
      renderer.render(scene, camera);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let raf = 0;
    let visible = false;
    const start = performance.now();
    const loop = () => {
      material.uniforms.uTime.value = 4 + (performance.now() - start) / 1000;
      renderer.render(scene, camera);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !reduce;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    renderer.domElement.addEventListener("webglcontextlost", (e) => (e.preventDefault(), onFail()));

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [pattern, onFail]);

  return <div ref={host} className="absolute inset-0" />;
}
