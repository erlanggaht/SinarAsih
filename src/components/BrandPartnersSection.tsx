import Image from "next/image";
import Link from "next/link";
import { EXTERNAL_LINKS } from "@/lib/config";

const brands = [
  { name: "Oppo", slug: "oppo", href: EXTERNAL_LINKS.brands.oppo },
  { name: "Vivo", slug: "vivo", href: EXTERNAL_LINKS.brands.vivo },
  { name: "Samsung", slug: "samsung", href: EXTERNAL_LINKS.brands.samsung },
  { name: "Realme", slug: "realme", href: EXTERNAL_LINKS.brands.realme },
  { name: "Xiaomi", slug: "xiaomi", href: EXTERNAL_LINKS.brands.xiaomi },
  { name: "Infinix", slug: "infinix", href: EXTERNAL_LINKS.brands.infinix },
  { name: "Tecno", slug: "tecno", href: EXTERNAL_LINKS.brands.tecno },
  { name: "ASUS", slug: "asus", href: EXTERNAL_LINKS.brands.asus },
  { name: "Lenovo", slug: "lenovo", href: EXTERNAL_LINKS.brands.lenovo },
];

export function BrandPartnersSection() {
  return (
    <section
      aria-labelledby="brands-title"
      className="px-6 py-12 text-card-foreground sm:px-12 lg:px-24 lg:py-20"
    >
      <header className="mb-6 text-center">
        <h2 id="brands-title" className="text-xl font-bold tracking-tight sm:text-2xl">
          Brand Partner Resmi
        </h2>
      </header>
      <ul className="grid grid-cols-3 gap-px sm:grid-cols-5 lg:grid-cols-3">
        {brands.map(({ name, slug, href }) => (
          <li key={slug}>
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Kunjungi situs resmi ${name} (buka tab baru)`}
              className="flex min-h-24 items-center justify-center bg-card px-4 py-6 transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:min-h-28"
            >
              <Image
                src={`/brands/${slug}.svg`}
                alt={name}
                width={120}
                height={48}
                className="h-10 w-full max-w-28 object-contain"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
