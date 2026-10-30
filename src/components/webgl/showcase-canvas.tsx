"use client";

/* eslint-disable react-hooks/immutability -- three.js cameras, materials and uniforms are mutable GPU-side objects by design; they are updated per frame in useFrame, outside React rendering */

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { cardFragment, cardVertex } from "./shaders/card";
import { carouselLayout, type CarouselState } from "./layout";

export type CanvasCard = { slug: string; pattern: number; imageUrl: string | null };

type Props = {
  cards: CanvasCard[];
  state: RefObject<CarouselState>;
  reduced: boolean;
  paused: boolean;
  mobile: boolean;
  onReady: () => void;
  onFail: () => void;
  onCardClick: (index: number) => void;
  onHover: (hovering: boolean) => void;
};

const FOV = 30;
const ACCENT = new THREE.Color("#efa83c");

/** One <canvas> for the whole hero — a row of bent, shaded planes. */
export default function ShowcaseCanvas({ cards, state, reduced, paused, mobile, onReady, onFail, onCardClick, onHover }: Props) {
  return (
    <Canvas
      // phones render at 1.5× at most; desktops at the device ratio up to 2×
      dpr={[1, mobile ? 1.5 : 2]}
      frameloop={paused ? "never" : "always"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: FOV, near: 1, far: 10000, position: [0, 0, 1000] }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onFail();
        });
      }}
      aria-hidden="true"
    >
      <Scene cards={cards} state={state} reduced={reduced} onReady={onReady} onCardClick={onCardClick} onHover={onHover} />
    </Canvas>
  );
}

function Scene({ cards, state, reduced, onReady, onCardClick, onHover }: Pick<Props, "cards" | "state" | "reduced" | "onReady" | "onCardClick" | "onHover">) {
  const { size, camera } = useThree();
  const readyFired = useRef(false);
  const layout = useMemo(() => carouselLayout(size.width, size.height), [size.width, size.height]);

  // place the camera so 1 world unit = 1 CSS pixel on the z = 0 plane
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.z = size.height / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    cam.far = cam.position.z * 4;
    cam.updateProjectionMatrix();
  }, [camera, size.height]);

  // the carousel spring — one place, so every card reads the same position
  useFrame((_, dt) => {
    const s = state.current;
    const step = Math.min(dt, 1 / 20);
    const prev = s.current;
    s.current += (s.target - s.current) * (1 - Math.exp(-step * 7));
    if (Math.abs(s.target - s.current) < 0.0005) s.current = s.target;
    const v = (s.current - prev) / Math.max(step, 1e-4);
    s.velocity += (v - s.velocity) * (1 - Math.exp(-step * 10));
    if (!readyFired.current) {
      readyFired.current = true;
      // one frame on screen = ready to lift the preloader
      requestAnimationFrame(onReady);
    }
  }, -1);

  return (
    <>
      {cards.map((c, i) => (
        <Card key={c.slug} index={i} card={c} layout={layout} viewport={size} state={state} reduced={reduced} onCardClick={onCardClick} onHover={onHover} eager={i < 3} />
      ))}
    </>
  );
}

function Card({
  index,
  card,
  layout,
  viewport,
  state,
  reduced,
  onCardClick,
  onHover,
  eager,
}: {
  index: number;
  card: CanvasCard;
  layout: ReturnType<typeof carouselLayout>;
  viewport: { width: number; height: number };
  state: RefObject<CarouselState>;
  reduced: boolean;
  onCardClick: (i: number) => void;
  onHover: (h: boolean) => void;
  eager: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  // a 48×1 strip is enough for a smooth horizontal bend
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 48, 1), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: cardVertex,
        fragmentShader: cardFragment,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uShift: { value: 0 },
          uActive: { value: 0 },
          uPattern: { value: card.pattern },
          uHasTex: { value: 0 },
          uAspect: { value: 1 },
          uImgAspect: { value: 1 },
          uRadius: { value: 0.025 },
          uOpacity: { value: 1 },
          uBend: { value: 0 },
          uExpand: { value: 0 },
          uAccent: { value: ACCENT },
          uTex: { value: null as THREE.Texture | null },
        },
      }),
    [card.pattern],
  );

  // uploaded covers: through the image optimizer (AVIF/WebP, sized), first three right away, the rest when idle
  useEffect(() => {
    if (!card.imageUrl) return;
    let tex: THREE.Texture | null = null;
    let cancelled = false;
    const width = window.innerWidth < 768 ? 828 : 1080;
    const src = card.imageUrl.startsWith("/") || card.imageUrl.startsWith("http") ? `/_next/image?url=${encodeURIComponent(card.imageUrl)}&w=${width}&q=75` : card.imageUrl;
    const load = () => {
      new THREE.TextureLoader().setCrossOrigin("anonymous").load(src, (t) => {
        if (cancelled) return t.dispose();
        t.colorSpace = THREE.SRGBColorSpace;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        tex = t;
        const img = t.image as HTMLImageElement;
        material.uniforms.uTex.value = t;
        material.uniforms.uImgAspect.value = img.width / img.height;
        material.uniforms.uHasTex.value = 1;
      });
    };
    const idle = eager ? 0 : (window.requestIdleCallback?.(load, { timeout: 2500 }) ?? window.setTimeout(load, 800));
    if (eager) load();
    return () => {
      cancelled = true;
      if (!eager) (window.cancelIdleCallback ?? window.clearTimeout)(idle as number);
      tex?.dispose();
    };
  }, [card.imageUrl, eager, material]);

  useEffect(() => () => (geometry.dispose(), material.dispose()), [geometry, material]);

  useFrame(({ clock }) => {
    const m = mesh.current;
    const s = state.current;
    if (!m) return;
    const u = material.uniforms;
    const offset = index - s.current;
    const active = 1 - Math.min(Math.abs(offset), 1);
    const neighbourScale = 0.88 + 0.12 * active;

    let w = layout.w * neighbourScale;
    let h = layout.h * neighbourScale;
    let x = offset * layout.spacing;
    let y = layout.y;
    let z = 0;
    let opacity = 1;

    // opening: this card grows to the full viewport, the others fade
    const e = s.expand;
    if (s.expandIndex >= 0) {
      if (s.expandIndex === index) {
        w += (viewport.width - w) * e;
        h += (viewport.height - h) * e;
        x *= 1 - e;
        y *= 1 - e;
        z = 1 * e; // above its neighbours
      } else opacity = 1 - e;
    }

    m.scale.set(w, h, 1);
    m.position.set(x, y, z);
    m.renderOrder = s.expandIndex === index ? 2 : 1;
    // skip what cannot be seen (with a margin for the bend)
    m.visible = opacity > 0.01 && Math.abs(x) < viewport.width + layout.w;

    u.uTime.value = reduced ? 4 : clock.elapsedTime; // reduced motion: a still frame of each cover
    u.uShift.value = reduced ? 0 : THREE.MathUtils.clamp(s.velocity * 0.12, -1, 1) * (1 - e);
    u.uActive.value = Math.max(active, s.expandIndex === index ? e : 0);
    u.uAspect.value = w / h;
    u.uRadius.value = 0.025 * (1 - e);
    u.uOpacity.value = opacity;
    u.uBend.value = reduced ? 0 : 0.5 / viewport.width;
    u.uExpand.value = s.expandIndex === index ? e : 0;
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={material}
      onClick={(ev: ThreeEvent<MouseEvent>) => {
        // a drag that ends on a card is not a click
        if (ev.delta > 6) return;
        ev.stopPropagation();
        onCardClick(index);
      }}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
    />
  );
}
