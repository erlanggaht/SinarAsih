import Link from "next/link";
import { AdminForm } from "../admins/_partials/admin-form";
import { ADMIN_PROFILE_COLUMNS, type AdminProfile } from "@/feat/admins/schema";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { getPrivateMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/config";

export const metadata = getPrivateMetadata("Profil saya");

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session) redirect(ROUTES.panel.login);
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("admin_profiles")
    .select(ADMIN_PROFILE_COLUMNS)
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) throw new Error("Profil gagal dimuat. Silakan coba kembali.");
  if (!profile?.is_active)
    return (
      <section className="px-6 py-16">
        <h1 className="text-2xl font-bold">Akses ditolak</h1>
        <p className="mt-3 text-muted-foreground">
          Profil pengelola tidak ditemukan atau sudah dinonaktifkan.
        </p>
      </section>
    );
  const date = (value: string) =>
    new Intl.DateTimeFormat("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(new Date(value));
  const fields = [
    ["Terdaftar", date(profile.created_at)],
    ["Terakhir diperbarui", date(profile.updated_at)],
  ];
  return (
    <section className="px-6 py-10 sm:px-12 lg:px-24 lg:py-16">
      <Link href={ROUTES.panel.dashboard} className="text-sm text-primary hover:underline">
        ← Panel pengelola
      </Link>
      <header className="mt-6 border-b border-border pb-6">
        <h1 className="text-3xl font-bold">Profil saya</h1>
        <p className="mt-3 text-muted-foreground">Kelola informasi dan foto profil akun Anda.</p>
      </header>
      <div className="mt-8">
        <AdminForm profile={profile as AdminProfile} currentUserId={session.user.id} />
      </div>
      <dl className="mt-8 grid gap-5 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="min-w-0 border border-border bg-card p-5">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-2 font-medium wrap-anywhere">{value || "Belum diisi"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
