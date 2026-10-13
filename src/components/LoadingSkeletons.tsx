export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`bg-secondary motion-safe:animate-pulse ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex h-full flex-col border border-border bg-card">
      <Skeleton className="m-3 aspect-4/3" />
      <div className="flex flex-1 flex-col gap-3 px-5 pt-2 pb-5">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-6 w-4/5" />
        <div className="space-y-2">
          <Skeleton className="h-4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="mt-5 h-7 w-1/2" />
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="mt-3 h-11" />
        <Skeleton className="h-11" />
      </div>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Memuat katalog produk"
      className="px-6 py-12 sm:px-12 lg:px-24 lg:py-16"
    >
      <p role="status" className="sr-only">
        Memuat katalog produk…
      </p>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-5 h-10 w-64 max-w-full" />
      <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside
          aria-hidden="true"
          className="order-2 grid grid-cols-1 gap-4 self-start border border-border bg-card p-5 lg:order-1"
        >
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i}>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-2 h-11" />
            </div>
          ))}
          <Skeleton className="h-11" />
          <Skeleton className="mx-auto h-9 w-32" />
        </aside>
        <div className="order-1 min-w-0 lg:order-2">
          <Skeleton className="mb-5 h-4 w-48" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AdminListSkeleton({ name }: { name: string }) {
  return (
    <section
      aria-busy="true"
      aria-label={`Memuat ${name}`}
      className="mx-auto max-w-6xl px-6 py-12"
    >
      <p role="status" className="sr-only">
        Memuat {name}…
      </p>
      <Skeleton className="h-4 w-32" />
      <div className="mt-5 border-b border-border pb-6">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="mt-3 h-4 w-full max-w-lg" />
      </div>
      <div aria-hidden="true" className="mt-8 border border-border bg-card">
        <div className="flex flex-wrap justify-between gap-4 border-b border-border p-6">
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60 max-w-full" />
          </div>
          <Skeleton className="h-11 w-36" />
        </div>
        <div className="grid gap-4 border-b border-border p-6 sm:grid-cols-2">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="grid gap-4 border-b border-border p-6 sm:grid-cols-[2fr_1fr_1fr]">
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-11 w-32 sm:justify-self-end" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Memuat panel pengelola"
      className="px-6 py-10 sm:px-12 lg:px-24 lg:py-16"
    >
      <p role="status" className="sr-only">
        Memuat panel pengelola…
      </p>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-3 h-9 w-full max-w-lg" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="border border-border bg-card p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-6 w-40" />
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="space-y-4 border border-border bg-card p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-5 h-11" />
          </div>
        ))}
      </div>
    </section>
  );
}
