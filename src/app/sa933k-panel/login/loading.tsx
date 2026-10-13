import { Skeleton } from "@/components/LoadingSkeletons";
export default function LoadingLogin() {
  return (
    <section
      aria-busy="true"
      aria-label="Memuat halaman login"
      className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-6 py-12"
    >
      <p role="status" className="sr-only">
        Memuat halaman login…
      </p>
      <div className="w-full max-w-md space-y-5 border border-border bg-card p-6 sm:p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
      </div>
    </section>
  );
}
