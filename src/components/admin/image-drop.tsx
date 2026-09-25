"use client";

import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

/** Drag-and-drop (or click) upload with a live preview. Posts to /api/admin/upload. */
export function ImageDrop({
  value,
  onChange,
  label = "Şəkil",
  aspect = "aspect-[16/9]",
  className,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  aspect?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) return toast.error("Yalnız şəkil faylı");
    if (file.size > 5 * 1024 * 1024) return toast.error("Maksimum 5 MB");
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Yükləmək alınmadı");
      onChange(json.url as string);
      toast.success("Şəkil yükləndi");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Yükləmək alınmadı");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <span className="block text-sm font-medium text-ad-fg">{label}</span>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void upload(file);
        }}
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors",
          aspect,
          over ? "border-ad-accent bg-ad-accent/5" : "border-ad-border bg-ad-muted/40",
        )}
      >
        {value ? (
          <Image src={value} alt="" fill sizes="480px" className="object-cover" unoptimized />
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} className="flex flex-col items-center gap-2 p-6 text-center text-sm text-ad-muted-fg transition-colors hover:text-ad-fg">
            <ImagePlus className="size-6" aria-hidden="true" />
            Sürüşdürüb buraxın və ya seçin
            <span className="text-xs">PNG, JPG, WEBP · 5 MB-a qədər</span>
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-ad-bg/70">
            <Loader2 className="size-5 animate-spin text-ad-accent" />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
          {value ? "Dəyiş" : "Fayl seç"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)} disabled={busy}>
            <Trash2 />
            Sil
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
