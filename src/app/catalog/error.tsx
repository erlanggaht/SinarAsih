"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="px-6 py-12 text-center">
      <h1 className="text-2xl font-bold">Katalog belum dapat dimuat</h1>
      <p className="mt-3 text-muted-foreground">Silakan coba kembali beberapa saat lagi.</p>
      <button onClick={reset} className="mt-6 bg-primary px-5 py-3 text-primary-foreground">
        Coba lagi
      </button>
    </section>
  );
}
