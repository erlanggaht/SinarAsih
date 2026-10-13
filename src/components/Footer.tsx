import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { EXTERNAL_LINKS, ROUTES, getWhatsAppUrl } from "@/lib/config";

const groups = [
  {
    title: "Jelajahi",
    links: [
      { label: "Beranda", href: ROUTES.home },
      { label: "Katalog Produk", href: ROUTES.catalog },
      { label: "Kategori Produk", href: `${ROUTES.home}#categories` },
      { label: "Tim Kami", href: ROUTES.team },
      { label: "Galeri Perusahaan", href: ROUTES.gallery },
    ],
  },
  {
    title: "Layanan",
    links: [
      {
        label: "Konsultasi Perangkat",
        href: getWhatsAppUrl("Halo Sinar Asih, saya ingin konsultasi memilih perangkat."),
      },
      {
        label: "Konsultasi Servis",
        href: getWhatsAppUrl("Halo Sinar Asih, saya ingin bertanya tentang layanan servis."),
      },
      {
        label: "Cash On Delivery",
        href: getWhatsAppUrl(
          "Halo Sinar Asih, saya ingin bertanya tentang area dan ketentuan COD.",
        ),
      },
    ],
  },
  {
    title: "Kunjungi & Hubungi",
    links: [
      { label: "Alamat Toko", href: `${ROUTES.home}#address` },
      { label: "Petunjuk Arah", href: EXTERNAL_LINKS.maps.directions },
      { label: "Hubungi Owner", href: getWhatsAppUrl() },
    ],
  },
];
const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navigation-foreground";

export function Footer() {
  return (
    <footer className="bg-navigation px-6 pt-10 pb-8 text-navigation-foreground sm:px-12 lg:px-24 lg:pt-14">
      <div className="mx-auto max-w-7xl">
        <div className="border border-navigation-foreground/10 bg-navigation-hover px-6 py-8 sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:py-10">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Butuh bantuan memilih produk?</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-navigation-foreground/70">
              Konsultasikan kebutuhan perangkat, harga, dan ketersediaan langsung dengan owner Sinar
              Asih.
            </p>
          </div>
          <Link
            href={getWhatsAppUrl("Halo Sinar Asih, saya ingin konsultasi memilih perangkat.")}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-6 inline-flex shrink-0 items-center gap-3 border-b border-navigation-foreground/40 pb-2 font-medium lg:mt-0 ${focus}`}
          >
            Konsultasi Sekarang
            <ArrowRight className="size-4" aria-hidden="true" />
            <span className="sr-only">melalui WhatsApp (buka tab baru)</span>
          </Link>
        </div>
        <div className="grid gap-x-8 gap-y-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
          {groups.map(({ title, links }) => (
            <nav key={title} aria-label={`Footer ${title}`}>
              <h3 className="mb-5 text-sm font-semibold">{title}</h3>
              <ul className="space-y-3">
                {links.map(({ label, href }) => {
                  const external = href.startsWith("https://");
                  return (
                    <li key={label}>
                      <Link
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className={`text-sm text-navigation-foreground/65 hover:text-navigation-foreground ${focus}`}
                      >
                        {label}
                        {external && <span className="sr-only"> (buka tab baru)</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
          <div>
            <Link
              href={ROUTES.home}
              aria-label="Sinar Asih Sumedang — beranda"
              className={`text-5xl font-bold tracking-tight ${focus}`}
            >
              <span className="text-navigation-muted">S</span>A
              <span className="text-navigation-muted">S</span>
            </Link>
            <p className="mt-5 text-sm font-medium">Sinar Asih Sumedang</p>
            <p className="mt-3 text-sm leading-6 text-navigation-foreground/65">
              Perangkat, aksesori, dan konsultasi untuk kebutuhan Anda.
            </p>
            <Link
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-5 inline-flex items-center gap-2 text-sm ${focus}`}
            >
              <WhatsAppIcon className="size-5" />
              0813 1355 5545<span className="sr-only">WhatsApp owner (buka tab baru)</span>
            </Link>
          </div>
        </div>
        <div className="border-t border-navigation-foreground/15 pt-6">
          <p className="text-xs text-navigation-foreground/50">
            © {new Date().getFullYear()} Sinar Asih Sumedang. Seluruh hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
