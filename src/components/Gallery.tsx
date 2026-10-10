"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Expand, ImageOff, X } from "lucide-react";
import { useRef, useState } from "react";
import { galleryPhotos } from "@/data/gallery";

function GalleryImage({ src, title, large = false }: { src: string; title: string; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-full items-center justify-center gap-2 bg-muted p-6 text-sm text-muted-foreground">
        <ImageOff className="size-5" aria-hidden="true" />
        Foto belum dapat dimuat
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={title}
      fill
      sizes={large ? "90vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"}
      onError={() => setFailed(true)}
      className={large ? "object-contain" : "object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"}
    />
  );
}

export function Gallery() {
  const [selected, setSelected] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const photo = galleryPhotos[selected];
  const move = (direction: number) => {
    setSelected((current) => (current + direction + galleryPhotos.length) % galleryPhotos.length);
  };
  const control = "flex size-11 shrink-0 items-center justify-center border border-border bg-card text-card-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {galleryPhotos.map(({ src, title }, index) => (
          <button
            key={src}
            type="button"
            aria-label={`Lihat ${title}`}
            onClick={() => {
              setSelected(index);
              dialog.current?.showModal();
            }}
            className="group border border-border bg-card text-left text-card-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <GalleryImage src={src} title={title} />
              <span className="absolute right-3 bottom-3 flex size-9 items-center justify-center bg-navigation/80 text-navigation-foreground">
                <Expand className="size-4" aria-hidden="true" />
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-4">
              <span className="text-sm font-medium">{title}</span>
              <span className="text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
            </div>
          </button>
        ))}
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="gallery-photo-title"
        className="fixed inset-0 m-auto w-[92vw] max-w-6xl max-h-[92dvh] border border-border bg-card p-4 text-card-foreground backdrop:bg-black/80 sm:p-6"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        <header className="mb-4 flex items-center justify-between gap-4">
          <h2 id="gallery-photo-title" className="font-semibold" aria-live="polite">{photo.title}</h2>
          <button type="button" aria-label="Tutup foto" className={control} onClick={() => dialog.current?.close()}>
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>
        <div className="relative h-[55dvh] bg-muted sm:h-[65dvh]">
          <GalleryImage key={photo.src} src={photo.src} title={photo.title} large />
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <button type="button" aria-label="Foto sebelumnya" className={control} onClick={() => move(-1)}>
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <p className="text-sm text-muted-foreground" aria-live="polite">{selected + 1} / {galleryPhotos.length}</p>
          <button type="button" aria-label="Foto berikutnya" className={control} onClick={() => move(1)}>
            <ArrowRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </dialog>
    </>
  );
}
