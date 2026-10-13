import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/feat/sa933k-panel/admin-context";
import { ADMIN_PROFILE_COLUMNS, type AdminProfile } from "@/feat/admins/schema";
import { ROUTES } from "@/lib/config";
import { getPrivateMetadata } from "@/lib/seo";
import { AdminManager } from "./_partials/admin-manager";

export const metadata = getPrivateMetadata("Akun pengelola");

export default async function AdminsPage() {
  const { supabase, profile } = await getAdminContext();
  if (!profile) redirect(ROUTES.panel.dashboard);
  if (profile.role !== "owner")
    return (
      <section className="px-6 py-16">
        <h1 className="text-2xl font-bold">Akses terbatas</h1>
        <p className="mt-3 text-muted-foreground">
          Hanya pemilik yang dapat mengelola akun pengguna.
        </p>
        <Link
          href={ROUTES.panel.profile}
          className="mt-6 inline-flex min-h-11 items-center text-primary hover:underline"
        >
          Kelola profil saya
        </Link>
      </section>
    );
  const { data, error } = await supabase
    .from("admin_profiles")
    .select(ADMIN_PROFILE_COLUMNS)
    .order("full_name");
  if (error) throw new Error("Akun pengelola gagal dimuat.");
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href={ROUTES.panel.dashboard}
        className="inline-flex min-h-11 items-center text-sm text-primary hover:underline"
      >
        ← Kembali ke panel
      </Link>
      <header className="mt-3 border-b border-border pb-6">
        <h1 className="text-3xl font-bold">Akun pengelola</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Kelola pengguna, foto profil, peran, dan akses panel toko.
        </p>
      </header>
      <AdminManager
        initialProfiles={(data ?? []) as AdminProfile[]}
        currentUserId={profile.user_id}
      />
    </section>
  );
}
