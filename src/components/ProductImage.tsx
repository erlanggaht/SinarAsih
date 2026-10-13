"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/LoadingSkeletons";

export function ProductImage({
  src,
  name,
  imageClassName = "object-contain p-5",
  sizes = "(min-width: 1280px) 25vw, (min-width: 640px) 42vw, 90vw",
}: {
  src: string | null;
  name: string;
  imageClassName?: string;
  sizes?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const imageSrc = src?.trim();
  const validSrc =
    imageSrc &&
    ((imageSrc.startsWith("/") && !imageSrc.startsWith("//") && !imageSrc.includes("\\")) ||
      (URL.canParse(imageSrc) && new URL(imageSrc).protocol === "https:"));

  if (!validSrc || failedSrc === imageSrc) {
    return (
      <div
        role="img"
        aria-label={`Gambar ${name} belum tersedia`}
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted px-5 text-muted-foreground"
      >
        <ImageOff className="size-12" strokeWidth={1.5} aria-hidden="true" />
        <span className="text-center text-sm">Gambar belum tersedia</span>
      </div>
    );
  }

  return (
    <>
      {loadedSrc !== imageSrc && <Skeleton className="absolute inset-0" />}
      <Image
        key={imageSrc}
        src={imageSrc}
        unoptimized
        alt={name}
        fill
        sizes={sizes}
        className={`${imageClassName} ${loadedSrc === imageSrc ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoadedSrc(imageSrc)}
        onError={() => setFailedSrc(imageSrc)}
      />
    </>
  );
}
