"use client";

import Image from "next/image";
import Link from "next/link";
import { LayoutGrid, MessageCircle, Truck } from "lucide-react";

import { CategorySection } from "@/components/CategorySection";
import { ServiceSection } from "@/components/ServiceSection";
import { LocationSection } from "@/components/LocationSection";
import { RepairSection } from "@/components/RepairSection";
import { BrandPartnersSection } from "@/components/BrandPartnersSection";
import { HomeCategorySearch } from "@/components/forms/home-category-search";
import { BRAND_NAME, ANCHORS, getWhatsAppUrl } from "@/lib/config";
import type { Category } from "@/feat/categories/schema";
import type { Product } from "@/feat/products/schema";

export default function HomeContent({
  categories,
  products,
  categoryError = false,
}: {
  categories: Category[];
  products: Product[];
  categoryError?: boolean;
}) {
  return (
    <section aria-label={BRAND_NAME} className="bg-card text-card-foreground">
      <div className="px-6 pt-6 pb-12 sm:px-12 lg:px-24 lg:pb-20">
        <div className="mb-5 flex flex-col gap-3 bg-background p-3 sm:flex-row sm:items-center">
          <Link
            href={ANCHORS.categories}
            className="flex shrink-0 items-center gap-3 px-3 py-2 font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
          >
            <LayoutGrid className="size-6 text-primary" aria-hidden="true" />
            Kategori
          </Link>
          <HomeCategorySearch categories={categories} error={categoryError} />
        </div>

        <section className="@container relative isolate bg-linear-to-br from-navigation-action to-brand-accent text-navigation-action-foreground">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-24 -right-24 size-96 rounded-full border-48 border-white/10" />
          </div>
          <div className="px-6 pt-10 pb-64 sm:px-10 sm:pb-80 lg:min-h-115 lg:px-12 lg:py-16">
            <div className="relative z-10">
              <h1 className="max-w-3xl text-[clamp(1.75rem,5cqw,3.75rem)] leading-tight font-bold tracking-tight text-balance">
                {BRAND_NAME}
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/90 lg:max-w-[45%]">
                {BRAND_NAME} menyediakan HP, laptop, komputer, dan aksesori untuk kebutuhan Anda.
                Kunjungi toko kami di Jl. Prabu Geusan Ulun, Regol Wetan, Sumedang Selatan, depan
                Bank Mandiri, atau konsultasikan pilihan perangkat melalui WhatsApp.
              </p>
              <div className="mt-5 flex items-center gap-2 text-sm text-white/90">
                <Truck className="size-5" aria-hidden="true" />
                Melayani Cash On Delivery (COD)
              </div>
              <Link
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-3 bg-card px-6 py-3.5 font-medium text-card-foreground shadow-md transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <MessageCircle className="size-5" aria-hidden="true" />
                Hubungi Kami
                <span className="sr-only">melalui WhatsApp (buka tab baru)</span>
              </Link>
            </div>
            <div className="absolute right-4 -bottom-12 z-10 w-[calc(100%-2rem)] max-w-105 sm:right-8 lg:right-0 lg:-bottom-14 lg:w-[50%] lg:max-w-137.5">
              <Image
                src="/gadgets.png"
                alt={`Pilihan perangkat gadget ${BRAND_NAME}`}
                width={1080}
                height={567}
                preload
                sizes="(min-width: 1280px) 550px, (min-width: 1024px) 45vw, (min-width: 640px) 420px, 90vw"
                className="h-auto w-full drop-shadow-2xl"
              />
            </div>
          </div>
        </section>

        <ServiceSection />
      </div>
      <CategorySection categories={categories} products={products} error={categoryError} />
      <RepairSection />
      <LocationSection />
      <BrandPartnersSection />
    </section>
  );
}
