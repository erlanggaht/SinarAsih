import { LoginForm } from "@/app/sa933k-panel/login/_partials/form";
import { BRAND_NAME } from "@/lib/config";
import { getPrivateMetadata } from "@/lib/seo";

export const metadata = getPrivateMetadata("Login Pengelola");

export default function AdminLoginPage() {
  return (
    <section className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold">Login pengelola</h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Masuk menggunakan akun pengelola {BRAND_NAME}.
        </p>

        <LoginForm />
      </div>
    </section>
  );
}
