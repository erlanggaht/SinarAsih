import Image from "next/image";
import Link from "next/link";

const brands = [
  { name: "Oppo", slug: "oppo", href: "https://www.oppo.com/id/" },
  { name: "Vivo", slug: "vivo", href: "https://www.vivo.com/id" },
  { name: "Samsung", slug: "samsung", href: "https://www.samsung.com/id/" },
  { name: "Realme", slug: "realme", href: "https://www.realme.com/id/" },
  { name: "Xiaomi", slug: "xiaomi", href: "https://www.mi.co.id/id/" },
  { name: "Infinix", slug: "infinix", href: "https://id.infinixmobility.com/" },
  { name: "Tecno", slug: "tecno", href: "https://www.tecno-mobile.com/id/" },
  { name: "ASUS", slug: "asus", href: "https://www.asus.com/id/" },
  { name: "Lenovo", slug: "lenovo", href: "https://www.lenovo.com/id/id/" },
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
