import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Gallery } from "@/components/Gallery";
import { ROUTES } from "@/lib/config";

export const metadata: Metadata = {
  title: "Galeri Perusahaan | Sinar Asih",
  description: "Dokumentasi kegiatan dan momen kebersamaan Sinar Asih Sumedang.",
};

export default function GalleryPage() {
  return (
    <section className="bg-background px-6 py-10 sm:px-12 lg:px-24 lg:py-16">
      <Link
        href={ROUTES.home}
        className="mb-8 inline-flex items-center gap-2 text-sm text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke beranda
      </Link>
      <header className="mb-10 border-b border-border pb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Galeri Perusahaan</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Mengenal Sinar Asih lebih dekat melalui dokumentasi kegiatan, event, dan momen
          kebersamaan.
        </p>
      </header>
      <Gallery />
    </section>
  );
}
