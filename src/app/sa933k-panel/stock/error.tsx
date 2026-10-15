"use client";

export default function StockError({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Data stok belum dapat dimuat</h1>
      <p role="alert" className="mt-3 text-sm text-muted-foreground">
        Periksa koneksi lalu coba lagi.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 min-h-11 bg-brand-accent px-5 py-3 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Coba lagi
      </button>
    </section>
  );
}
