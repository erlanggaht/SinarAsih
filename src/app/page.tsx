import HomeContent from "@/components/HomeContent";
import { getCatalogData } from "@/feat/products/catalog";

export default async function Home() {
  const data = await getCatalogData().then(
    (result) => ({ ...result, categoryError: false }),
    () => ({ categories: [], products: [], categoryError: true }),
  );
  return <HomeContent {...data} />;
}
