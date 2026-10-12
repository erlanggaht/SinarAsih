import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/config";
import { getAdminContext } from "@/feat/sa933k-panel/admin-context";
import type { Category } from "@/feat/categories/schema";
import { CategoryManager } from "./_partials/category-manager";

export const metadata: Metadata = { title: "Kelola Kategori | Sinar Asih" };

export default async function CategoriesPage() {
  const { supabase, profile } = await getAdminContext();
  if (!profile) redirect(ROUTES.panel.dashboard);

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, is_active")
    .order("name");
  if (error) throw new Error("Daftar kategori gagal dimuat.");

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href={ROUTES.panel.dashboard}
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
      >
        Kembali ke panel
      </Link>
      <header className="mt-3 border-b border-border pb-6">
        <h1 className="text-3xl font-bold">Kelola kategori</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Atur kategori agar produk toko mudah dikelompokkan.
        </p>
      </header>
      <CategoryManager initialCategories={(data ?? []) as Category[]} />
    </section>
  );
}
