"use client";

import Image from "next/image";
import { UserRound } from "lucide-react";
import { useState } from "react";

export function ProfileImage({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const valid =
    src &&
    ((src.startsWith("/") && !src.startsWith("//") && !src.includes("\\")) ||
      (URL.canParse(src) && new URL(src).protocol === "https:"));
  if (!valid || failed === src)
    return (
      <div
        role="img"
        aria-label={`Foto ${name} belum tersedia`}
        className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground"
      >
        <UserRound className="size-16" strokeWidth={1.5} aria-hidden="true" />
      </div>
    );
  return (
    <Image
      src={src}
      alt={name}
      fill
      unoptimized
      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
      className="object-cover object-top"
      onError={() => setFailed(src)}
    />
  );
}
