"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { hasWebGL, useClientValue } from "@/lib/use-client";

const CoverCanvas = dynamic(() => import("@/components/webgl/cover-canvas"), { ssr: false });

/**
 * Header media of a case study without an uploaded image: the procedural
 * cover the carousel card showed (WebGL), or the brand photo when WebGL is
 * not available. The server renders the dark block, so nothing shifts.
 */
export function CaseCover({ pattern, photo, alt }: { pattern: number; photo: string; alt: string }) {
  const gl = useClientValue<boolean | null>(hasWebGL, null);
  const [failed, setFailed] = useState(false);
  const fail = useCallback(() => setFailed(true), []);
  // WebGL starts once the browser is idle — never on the hydration path
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const go = () => setIdle(true);
    const id = window.requestIdleCallback?.(go, { timeout: 1200 }) ?? window.setTimeout(go, 300);
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id);
  }, []);
  const mode = gl === null ? "pending" : gl && !failed ? (idle ? "gl" : "pending") : "photo";

  return (
    <div role="img" aria-label={alt} className="absolute inset-0 bg-[#0e0f11]">
      {mode === "gl" && <CoverCanvas pattern={pattern} onFail={fail} />}
      {mode === "photo" && <Image src={photo} alt="" fill sizes="100vw" className="object-cover" />}
    </div>
  );
}
