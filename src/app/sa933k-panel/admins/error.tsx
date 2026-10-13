"use client";
export default function AdminsError({ reset }: { reset: () => void }) {
  return (
    <section className="px-6 py-16">
      <h1 className="text-2xl font-bold">Akun pengelola belum dapat dimuat</h1>
      <button
        type="button"
        onClick={reset}
        className="mt-6 min-h-11 bg-primary px-5 py-3 text-primary-foreground"
      >
        Coba lagi
      </button>
    </section>
  );
}
