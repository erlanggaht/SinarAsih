import Link from "next/link";
import { MessageCircle, PackageSearch, Truck } from "lucide-react";

const services = [
  {
    title: "Konsultasi perangkat",
    description:
      "Ceritakan kebutuhan Anda. Kami bantu memilih perangkat untuk bekerja, belajar, atau hiburan.",
    icon: MessageCircle,
    message: "Halo Sinar Asih, saya ingin konsultasi memilih perangkat.",
    link: "https://wa.me/6281324063363?text=Halo%20Sinar%20Asih,%20saya%20ingin%20konsultasi%20memilih%20perangkat.",
    textlink: "Hubungi Kami",
  },

  {
    title: "Cash On Delivery",
    description:
      "Ingin menggunakan layanan COD? Hubungi kami untuk memastikan area dan ketentuan pengiriman.",
    icon: Truck,
    message: "Halo Sinar Asih, saya ingin bertanya tentang area dan ketentuan COD.",
    link: "https://wa.me/6281324063363?text=Halo%20Sinar%20Asih,%20saya%20ingin%20bertanya%20tentang%20area%20dan%20ketentuan%20COD.",
    textlink: "Hubungi Kami",
  },
  {
    title: "Cek harga & ketersediaan",
    description:
      "Tanyakan pilihan model, harga, dan stok terbaru sebelum menentukan perangkat Anda.",
    icon: PackageSearch,
    message: "Halo Sinar Asih, saya ingin mengecek harga dan ketersediaan perangkat.",
    link: "https://wa.me/6281324063363?text=Halo%20Sinar%20Asih,%20saya%20ingin%20mengecek%20harga%20dan%20ketersediaan%20perangkat.",
    textlink: "Lihat Produk",
  },
];

export function ServiceSection() {
  return (
    <section aria-labelledby="services-title" className="pt-24 lg:pt-38">
      <div className="grid gap-4 md:grid-cols-3">
        {services.map(({ title, description, icon: Icon, link, textlink }) => (
          <Link
            key={title}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col border border-t-2 border-border border-t-primary p-6 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <div className="mb-5 flex items-center justify-between text-primary">
              <Icon className="size-7" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
            <span className="mt-5 text-sm font-medium text-primary"> {textlink} </span>
            <span className="sr-only">melalui WhatsApp (buka tab baru)</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
