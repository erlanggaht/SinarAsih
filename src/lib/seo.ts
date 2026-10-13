import type { Metadata, MetadataRoute } from "next";
import { BRAND_NAME, EXTERNAL_LINKS, ROUTES } from "@/lib/config";

export const SEO = {
  siteUrl: "https://sinarasihgadgetcentre.com",
  siteName: "Sinar Asih Sumedang",
  googleSiteVerification: "N_wU8qA0Z68kWx4w7YlA_cGmm-KXGRvSd0lrP0R3pvE",
  alternateNames: [
    "Sinar Asih",
    "Sinar Asih Gadget Center Sumedang",
    "Sinar Asih Gadget Center",
    BRAND_NAME,
  ],
  locale: "id_ID",
  image: "/gadgets.png",
  imageAlt: `Pilihan perangkat gadget ${BRAND_NAME} di Sumedang`,
  address: {
    streetAddress: "Jl. Prabu Geusan Ulun, Regol Wetan, Sumedang Selatan",
    addressLocality: "Sumedang",
    addressRegion: "Jawa Barat",
    postalCode: "45311",
    addressCountry: "ID",
  },
  pages: {
    home: {
      path: ROUTES.home,
      title: "Sinar Asih Gadget Center",
      description:
        "Sinar Asih Gadget Center Sumedang menyediakan HP, laptop, komputer, aksesori, serta layanan servis HP, komputer, laptop, dan printer.",
    },
    catalog: {
      path: ROUTES.catalog,
      title: "Katalog HP, Laptop & Aksesori | Sinar Asih Gadget Center",
      description:
        "Jelajahi katalog Sinar Asih Sumedang. Cari HP, laptop, komputer, dan aksesori berdasarkan kategori, merek, harga, dan ketersediaan stok.",
    },
    team: {
      path: ROUTES.team,
      title: "Tim & Kontak Toko | Sinar Asih Gadget Center",
      description:
        "Kenali tim Sinar Asih Gadget Center Sumedang. Hubungi kami untuk konsultasi perangkat, informasi produk, dan layanan servis.",
    },
    gallery: {
      path: ROUTES.gallery,
      title: "Galeri Toko & Kegiatan | Sinar Asih Gadget Center",
      description:
        "Lihat dokumentasi kegiatan dan momen kebersamaan Sinar Asih Gadget Center Sumedang, toko gadget dan aksesori di Sumedang.",
    },
  },
} as const;

export function getSiteUrl(path: string = ROUTES.home): string {
  return new URL(path, SEO.siteUrl).toString();
}

export function isSearchIndexingEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production")
  );
}

export function getPageMetadata(page: keyof typeof SEO.pages): Metadata {
  const { title, description, path } = SEO.pages[page];
  const index = isSearchIndexingEnabled();
  return {
    metadataBase: new URL(SEO.siteUrl),
    applicationName: BRAND_NAME,
    title: { absolute: title },
    description,
    alternates: { canonical: getSiteUrl(path) },
    robots: {
      index,
      follow: index,
      googleBot: { index, follow: index, "max-image-preview": "large" },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || SEO.googleSiteVerification,
    },
    openGraph: {
      type: "website",
      locale: SEO.locale,
      siteName: SEO.siteName,
      title,
      description,
      url: getSiteUrl(path),
      images: [{ url: getSiteUrl(SEO.image), alt: SEO.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: getSiteUrl(SEO.image), alt: SEO.imageAlt }],
    },
  };
}

export function getPrivateMetadata(title: string): Metadata {
  return {
    title: { absolute: `${title} | ${BRAND_NAME}` },
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    alternates: { canonical: null },
    openGraph: null,
    twitter: null,
  };
}

export function getRobots(): MetadataRoute.Robots {
  if (!isSearchIndexingEnabled()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [ROUTES.panel.dashboard, "/api/"],
    },
    sitemap: getSiteUrl("/sitemap.xml"),
  };
}

export function getSitemap(): MetadataRoute.Sitemap {
  if (!isSearchIndexingEnabled()) return [];

  return Object.values(SEO.pages).map(({ path }) => ({ url: getSiteUrl(path) }));
}

export function getBusinessStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": getSiteUrl("/#website"),
        url: getSiteUrl(),
        name: SEO.siteName,
        alternateName: [...SEO.alternateNames],
        inLanguage: "id-ID",
        publisher: { "@id": getSiteUrl("/#business") },
      },
      {
        "@type": "ElectronicsStore",
        "@id": getSiteUrl("/#business"),
        name: BRAND_NAME,
        alternateName: [SEO.siteName, ...SEO.alternateNames.filter((name) => name !== BRAND_NAME)],
        url: getSiteUrl(),
        description: SEO.pages.home.description,
        image: getSiteUrl(SEO.image),
        logo: getSiteUrl("/brand/sas-favicon-master.png"),
        email: EXTERNAL_LINKS.email,
        telephone: `+${EXTERNAL_LINKS.whatsappNumber}`,
        address: { "@type": "PostalAddress", ...SEO.address },
        hasMap: EXTERNAL_LINKS.maps.search,
      },
    ],
  };
}
