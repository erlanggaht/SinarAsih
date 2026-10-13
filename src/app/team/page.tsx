import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons/SocialIcons";
import { teamMembers } from "@/data/team";
import { BRAND_NAME, getWhatsAppUrl, ROUTES } from "@/lib/config";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("team");

export default function TeamPage() {
  return (
    <section className="bg-background px-6 py-10 sm:px-12 lg:px-24 lg:py-16">
      <Link
        href={ROUTES.home}
        className="mb-8 inline-flex items-center gap-2 text-sm text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke beranda
      </Link>
      <header className="mb-10 border-b border-border pb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tim Kami</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Bertemu dengan tim {BRAND_NAME} yang siap menyambut Anda di toko dan membantu kebutuhan
          perangkat Anda.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3 lg:gap-8">
        {teamMembers.map(({ name, photo, whatsapp, instagram }, index) => (
          <article key={name} className="border border-border bg-card text-card-foreground">
            <div className="relative aspect-4/3 overflow-hidden bg-muted">
              <Image
                src={photo}
                alt={name}
                fill
                preload={index === 0}
                sizes="(min-width: 1280px) 560px, (min-width: 640px) 45vw, 90vw"
                className="object-cover object-top"
              />
            </div>
            <div className="border-t-2 border-t-primary px-6 py-6 sm:px-8">
              <h2 className="text-xl font-semibold sm:text-2xl">{name}</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {[
                  {
                    label: "WhatsApp",
                    href: whatsapp ? getWhatsAppUrl(undefined, whatsapp) : null,
                    Icon: WhatsAppIcon,
                  },
                  { label: "Instagram", href: instagram, Icon: InstagramIcon },
                ].map(({ label, href, Icon }) =>
                  href ? (
                    <Link
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${label} ${name} (buka tab baru)`}
                      className="inline-flex items-center gap-2 border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <Icon className="size-5" />
                      {label}
                    </Link>
                  ) : (
                    <button
                      key={label}
                      type="button"
                      disabled
                      title={`Kontak ${label} belum tersedia`}
                      className="inline-flex cursor-not-allowed items-center gap-2 border border-border px-4 py-3 text-sm text-muted-foreground opacity-50"
                    >
                      <Icon className="size-5" />
                      {label}
                      <span className="sr-only"> {name}, kontak belum tersedia</span>
                    </button>
                  ),
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-6 border border-border bg-card p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Ada yang ingin ditanyakan?</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Hubungi toko kami untuk konsultasi perangkat, informasi produk, atau layanan servis.
          </p>
        </div>
        <Link
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          Hubungi Kami
          <span className="sr-only">melalui WhatsApp (buka tab baru)</span>
        </Link>
      </div>
    </section>
  );
}
