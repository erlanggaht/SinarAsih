import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutForm } from "@/components/forms/logout-form";
import { PanelMenu } from "@/components/PanelMenu";
import { ROUTES } from "@/lib/config";
import { getServerSession } from "@/lib/auth/get-server-session";

export const metadata: Metadata = {
  title: "Admin | Sinar Asih",
};

export default async function AdminPage() {
  const supabase = await createClient();

  const session = await getServerSession();
  const userId = session?.user.id;

  if (!userId) {
    redirect(ROUTES.panel.login);
  }

  const { data: profile, error } = await supabase
    .from("admin_profiles")
    .select("full_name, username, role, is_active")
    .eq("user_id", userId)
    .single();

  if (error || !profile || !profile.is_active) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-bold">Akses ditolak</h1>

        <p className="mt-3 text-muted-foreground">
          Profil pengelola tidak ditemukan atau sudah dinonaktifkan.
        </p>

        <LogoutForm
          className="mt-6"
          buttonClassName="min-h-11 bg-primary px-5 py-3 font-medium text-primary-foreground"
        >
          Keluar
        </LogoutForm>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <header className="border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">Panel pengelola</p>
        <h1 className="mt-2 text-3xl font-bold">Selamat datang, {profile.full_name}</h1>
      </header>

      <dl className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="border border-border bg-card p-5">
          <dt className="text-sm text-muted-foreground">Username</dt>
          <dd className="mt-2 font-medium">{profile.username ?? "-"}</dd>
        </div>

        <div className="border border-border bg-card p-5">
          <dt className="text-sm text-muted-foreground">Peran</dt>
          <dd className="mt-2 font-medium">{profile.role === "owner" ? "Pemilik" : "Staf"}</dd>
        </div>
      </dl>

      <PanelMenu />

      <LogoutForm
        className="mt-8"
        buttonClassName="min-h-11 border border-border bg-card px-5 py-3 font-medium hover:bg-muted"
      >
        Keluar dari akun
      </LogoutForm>
    </section>
  );
}
