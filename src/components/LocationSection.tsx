import Link from "next/link";
import { Navigation } from "lucide-react";

const mapEmbedUrl =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5822.09630829556!2d107.921047972043!3d-6.851553304185402!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68d13c23b8d543%3A0xcc70fffbbb6b33af!2sSinar%20Asih%20Makmur%20Sumedang!5e0!3m2!1sid!2sid!4v1687095605018!5m2!1sid!2sid";

const mapUrl = "https://www.google.com/maps/search/?api=1&query=Sinar%20Asih%20Makmur%20Sumedang";
const directionsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=Sinar%20Asih%20Makmur%20Sumedang";

export function LocationSection() {
  return (
    <section
      id="address"
      aria-labelledby="location-title"
      className="bg-background px-6 py-12 text-card-foreground sm:px-12 lg:px-24 lg:py-32"
    >
      <div className="grid lg:grid-cols-[0.85fr_1.4fr]">
        <div className="flex flex-col items-start px-6 py-8 sm:px-8 lg:py-10">
          <h2 id="location-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Alamat
          </h2>
          <h3 className="mt-7 font-semibold">Sinar Asih Makmur Sumedang</h3>
          <address className="mt-3 text-sm leading-relaxed text-muted-foreground not-italic">
            Jl. Prabu Geusan Ulun, Regol Wetan, Kec. Sumedang Selatan, Kabupaten Sumedang, Jawa
            Barat 45311.
          </address>
          <p className="mt-3 border-l-2 border-primary pl-3 text-sm font-medium">
            Depan Bank Mandiri
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Navigation className="size-4" aria-hidden="true" />
              Petunjuk arah
              <span className="sr-only">di Google Maps (buka tab baru)</span>
            </Link>
            <Link
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Buka Google Maps
              <span className="sr-only">(buka tab baru)</span>
            </Link>
          </div>
        </div>
        <div className="min-h-80 border-t border-border bg-muted lg:min-h-110 lg:border-t-0 lg:border-l">
          <iframe
            title="Lokasi Sinar Asih Makmur Sumedang di Google Maps"
            src={mapEmbedUrl}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-80 w-full border-0 sm:h-96 lg:h-full lg:min-h-110"
          />
        </div>
      </div>
    </section>
  );
}
