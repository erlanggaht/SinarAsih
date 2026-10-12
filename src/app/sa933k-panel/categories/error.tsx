"use client";

export default function CategoriesError({ reset }: { reset: () => void }) {
  return (
    <section role="alert" className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold">Kategori belum dapat dimuat</h1>
      <p className="mt-3 text-muted-foreground">Periksa koneksi lalu coba lagi.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 min-h-11 bg-primary px-5 py-3 text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Coba lagi
      </button>
    </section>
  );
}
