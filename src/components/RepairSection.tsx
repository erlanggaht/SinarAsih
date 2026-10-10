import Link from "next/link";
import { Laptop, Printer, Smartphone } from "lucide-react";

const repairs = [
  {
    title: "Komputer & Laptop",
    description:
      "Komputer atau laptop bermasalah? Ceritakan kendalanya untuk konsultasi penanganan.",
    icon: Laptop,
    message: "Halo Sinar Asih, saya ingin konsultasi servis komputer/laptop. Kendalanya: ",
  },
  {
    title: "HP & Smartphone",
    description:
      "Konsultasikan kendala pada HP Anda dan tanyakan pilihan penanganan yang tersedia.",
    icon: Smartphone,
    message: "Halo Sinar Asih, saya ingin konsultasi servis HP. Model dan kendalanya: ",
  },
  {
    title: "Printer",
    description:
      "Printer tidak bekerja seperti biasanya? Sampaikan model dan kendala yang Anda alami.",
    icon: Printer,
    message: "Halo Sinar Asih, saya ingin konsultasi servis printer. Model dan kendalanya: ",
  },
];

export function RepairSection() {
  return (
    <section
      id="service"
      aria-labelledby="repair-title"
      className="px-6 py-12 text-card-foreground sm:px-12 lg:px-24 lg:py-32"
    >
      <div className="grid border border-border lg:grid-cols-[0.9fr_1.4fr]">
        <div className="flex flex-col items-start bg-navigation px-6 py-8 text-navigation-foreground sm:px-8 lg:py-10">
          <h2 id="repair-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Servis Perangkat
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-navigation-foreground/70">
            Selain menyediakan gadget, Sinar Asih melayani servis komputer, HP, dan printer.
            Konsultasikan kendala perangkat Anda atau kunjungi toko untuk berkonsultasi.
          </p>
          <Link
            href="https://wa.me/6281324063363?text=Halo%20Sinar%20Asih%2C%20saya%20ingin%20bertanya%20tentang%20layanan%20servis."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-3 bg-navigation-action px-5 py-3 text-sm font-medium text-navigation-action-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navigation-foreground"
          >
            Konsultasi
            <span className="sr-only">melalui WhatsApp (buka tab baru)</span>
          </Link>
        </div>
        <div className="divide-y divide-border">
          {repairs.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="group flex items-start gap-4 px-6 py-7 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:gap-5 sm:px-8"
            >
              <Icon
                className="mt-1 size-7 shrink-0 text-primary"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
              <span className="sr-only">— konsultasi melalui WhatsApp (buka tab baru)</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
