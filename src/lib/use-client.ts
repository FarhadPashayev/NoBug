"use client";

import { useSyncExternalStore } from "react";

// Browser-only facts (media queries, WebGL support) read without a
// setState-in-effect round trip: the server snapshot renders first, the client
// value takes over after hydration.

const never = () => () => {};

/** A value that only exists in the browser and does not change (cache it inside `get`). */
export function useClientValue<T>(get: () => T, server: T): T {
  return useSyncExternalStore(never, get, () => server);
}

/** Live `matchMedia` result; `false` on the server. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}

let webgl: boolean | null = null;
/** Can this browser create a WebGL context at all? (cached) */
export function hasWebGL(): boolean {
  if (webgl !== null) return webgl;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
    webgl = !!gl;
  } catch {
    webgl = false;
  }
  return webgl;
}
