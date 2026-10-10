import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons/SocialIcons";

const groups = [
  {
    title: "Perangkat",
    links: ["Laptop & Komputer", "Smartphone", "Smart TV", "Printer & Scanner"],
  },
  {
    title: "Aksesori",
    links: ["Smart Wearable", "Perangkat Gaming", "Penyimpanan", "Aksesori"],
  },
  {
    title: "Layanan",
    links: ["Konsultasi Perangkat", "Informasi Harga", "Cek Ketersediaan", "Cash On Delivery"],
  },
  {
    title: "Sinar Asih",
    links: ["Tentang Kami", "Tim Kami", "Galeri Perusahaan", "Alamat Toko", "Hubungi Kami"],
  },
];

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navigation-foreground";

export function Footer() {
  return (
    <footer className="bg-navigation px-6 pt-10 pb-8 text-navigation-foreground sm:px-12 lg:px-24 lg:pt-14">
      <div className="mx-auto max-w-7xl">
        <div className="relative isolate overflow-hidden border border-navigation-foreground/10 bg-navigation-hover">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-1/3 bg-primary/50"
          />
          <div className="flex flex-col gap-6 px-6 py-8 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:py-10">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Konsultasi</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-navigation-foreground/70">
                Bingung memilih perangkat yang sesuai kebutuhan? Konsultasikan dengan tim kami untuk
                mendapatkan rekomendasi terbaik.
              </p>
            </div>
            <Link
              href="#"
              className={`inline-flex shrink-0 items-center gap-2 self-start border-b border-navigation-foreground/40 pb-2 text-lg font-medium transition-colors hover:text-navigation-foreground/70 lg:self-auto ${focus}`}
            >
              Konsultasi Sekarang
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:grid-cols-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_1.2fr] lg:py-16">
          {groups.map(({ title, links }) => (
            <nav key={title} aria-label={`Footer ${title}`}>
              <h3 className="mb-5 text-sm font-semibold">{title}</h3>
              <ul className="space-y-3">
                {links.map((label) => (
                  <li key={label}>
                    <Link
                      href={label === "Tim Kami" ? "/team" : "#"}
                      className={`text-sm text-navigation-foreground/65 transition-colors hover:text-navigation-foreground ${focus}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="col-span-2 flex flex-col items-start sm:col-span-4 lg:col-span-1 lg:items-end lg:text-right">
            <Link
              href="#"
              aria-label="Sinar Asih Sumedang"
              className={`text-5xl font-bold tracking-tight ${focus}`}
            >
              <span className="text-navigation-muted">S</span>A
              <span className="text-navigation-muted">S</span>
            </Link>
            <div aria-hidden="true" className="my-5 h-px w-10 bg-navigation-foreground/30" />
            <p className="text-sm font-medium">Sinar Asih Sumedang</p>
          </div>
        </div>

        <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
          <Link
            href="#"
            className={`flex items-center justify-between border-t border-navigation-foreground/40 py-5 text-sm transition-colors hover:text-navigation-foreground/70 ${focus}`}
          >
            Instagram
            <InstagramIcon className="size-5" />
          </Link>
          <Link
            href="#"
            className={`flex items-center justify-between border-t border-navigation-foreground/40 py-5 text-sm transition-colors hover:text-navigation-foreground/70 ${focus}`}
          >
            WhatsApp
            <WhatsAppIcon className="size-5" />
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-between gap-6 lg:mt-16">
          <p className="text-xs text-navigation-foreground/50">
            © Sinar Asih Sumedang. Seluruh hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
