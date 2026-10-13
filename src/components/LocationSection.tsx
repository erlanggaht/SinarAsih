import Link from "next/link";
import Image from "next/image";
import { MapPin, Navigation } from "lucide-react";
import { BRAND_NAME, EXTERNAL_LINKS } from "@/lib/config";
import outletPhoto from "../../public/outlet-sinarasih.jpg";

export function LocationSection() {
  return (
    <section
      id="address"
      aria-labelledby="location-title"
      className="bg-background px-6 py-12 text-card-foreground sm:px-12 lg:px-24 lg:py-32"
    >
      <header className="mb-8">
        <h2 id="location-title" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          Alamat & lokasi
        </h2>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <figure className="overflow-hidden border border-border bg-card">
          <div className="relative aspect-4/3">
            <Image
              src={outletPhoto}
              alt={`Tampak depan bangunan toko ${BRAND_NAME} di Jalan Prabu Geusan Ulun`}
              fill
              sizes="(min-width: 1024px) 50vw, 90vw"
              className="object-cover"
            />
          </div>
          <figcaption className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
            Tampak depan outlet {BRAND_NAME}.
          </figcaption>
        </figure>
        <div className="flex flex-col items-start border border-border bg-card p-6 sm:p-8">
          <div className="flex size-11 items-center justify-center bg-accent text-primary">
            <MapPin className="size-5" aria-hidden="true" />
          </div>
          <h3 className="mt-5 text-xl font-semibold">{BRAND_NAME}</h3>
          <address className="mt-3 text-sm leading-relaxed text-muted-foreground not-italic">
            Jl. Prabu Geusan Ulun, Regol Wetan, Kec. Sumedang Selatan, Kabupaten Sumedang, Jawa
            Barat 45311.
          </address>
          <p className="mt-5 w-full border-l-2 border-primary bg-muted px-4 py-3 text-sm font-medium">
            Depan Bank Mandiri
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={EXTERNAL_LINKS.maps.directions}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Navigation className="size-4" aria-hidden="true" />
              Petunjuk arah
              <span className="sr-only">di Google Maps (buka tab baru)</span>
            </Link>
            <Link
              href={EXTERNAL_LINKS.maps.search}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Buka Google Maps
              <span className="sr-only">(buka tab baru)</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-6 overflow-hidden border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-semibold">Lokasi di peta</h3>
        </div>
        <iframe
          title={`Lokasi ${BRAND_NAME} di Google Maps`}
          src={EXTERNAL_LINKS.maps.embed}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-80 w-full border-0 sm:h-96"
        />
      </div>
    </section>
  );
}
