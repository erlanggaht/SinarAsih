"use client";

export default function ProfileError({ reset }: { reset: () => void }) {
  return (
    <section className="px-6 py-16">
      <h1 className="text-2xl font-bold">Profil belum dapat dimuat</h1>
      <p className="mt-3 text-muted-foreground">Silakan coba kembali.</p>
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
