import HomeContent from "@/components/HomeContent";
import { getCatalogData } from "@/feat/products/catalog";
import { getBusinessStructuredData, getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("home");

export default async function Home() {
  const data = await getCatalogData().then(
    (result) => ({ ...result, categoryError: false }),
    () => ({ categories: [], products: [], categoryError: true }),
  );
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBusinessStructuredData()).replace(/</g, "\\u003c"),
        }}
      />
      <HomeContent {...data} />
    </>
  );
}
