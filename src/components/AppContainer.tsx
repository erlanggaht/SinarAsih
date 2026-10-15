import type { ReactNode } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FloatingContact } from "@/components/FloatingContact";
import { ANCHORS } from "@/lib/config";
import type { Category } from "@/feat/categories/schema";

export default function AppContainer({
  children,
  categories,
  categoryError,
}: {
  children: ReactNode;
  categories: Category[];
  categoryError: boolean;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Link
        href={ANCHORS.mainContent}
        className="sr-only fixed top-3 left-3 z-50 rounded-sm bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only"
      >
        Lewati navigasi
      </Link>
      <Navigation categories={categories} categoryError={categoryError} />
      <main id="main-content" tabIndex={-1} className="min-h-screen pt-21 outline-none">
        {children}
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
}
