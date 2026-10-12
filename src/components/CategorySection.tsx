import Image from "next/image";
import Link from "next/link";
import { getWhatsAppUrl } from "@/lib/config";

const categories = [
  { title: "Smart Wearable", category: "Smart wearable", image: "miband.png" },
  { title: "Laptop & Komputer", category: "Laptop & komputer", image: "asusLaptop.png" },
  { title: "Perangkat Gaming", category: "Perangkat gaming", image: "joystick.png" },
  { title: "Smartphone", category: "Smartphone", image: "realme10.png" },
  { title: "Smart TV", category: "Hiburan rumah", image: "smartMiTv.png" },
  { title: "Printer & Scanner", category: "Printer", image: "printer_l220.png" },
  {
    title: "Flashdisk & Harddisk",
    category: "Penyimpanan eksternal & internal",
    image: "storage.png",
  },
  { title: "Aksesori", category: "Aksesori", image: "tg.png" },
];

export function CategorySection({ query = "" }: { query?: string }) {
  const filtered = categories.filter(({ title, category }) =>
    `${title} ${category}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <section
      id="categories"
      aria-labelledby="categories-title"
      className="bg-background px-6 py-12 sm:px-12 lg:px-24 lg:py-32"
    >
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="categories-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Kategori
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Dari kebutuhan sehari-hari hingga perlengkapan kerja
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 min-[400px]:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {filtered.map(({ title, category, image }) => (
          <article
            key={title}
            className="group flex flex-col overflow-hidden border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="relative m-3 flex h-48 items-center justify-center bg-white sm:h-56">
              <Image
                src={`/products/${image}`}
                alt={title}
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 400px) 42vw, 85vw"
                className="object-contain p-5 drop-shadow-md transition-transform duration-300 motion-safe:group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col px-4 pt-2 pb-4 sm:px-5 sm:pb-5">
              <p className="mb-2 text-xs text-muted-foreground">{category}</p>
              <h3 className="text-base leading-snug font-semibold">{title}</h3>
              <p className="mt-3 mb-5 text-xs leading-relaxed text-muted-foreground">
                Temukan pilihan perangkat dalam kategori ini.
              </p>
              <Link
                href={getWhatsAppUrl(
                  `Halo Sinar Asih, boleh minta informasi harga dan stok ${title}?`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-2 bg-primary px-3 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Lihat Produk
                <span className="sr-only">tentang {title} melalui WhatsApp (buka tab baru)</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <p role="status" className="border border-border p-8 text-center text-muted-foreground">
          Kategori tidak ditemukan. Coba kata lain, seperti laptop atau printer.
        </p>
      )}
    </section>
  );
}
