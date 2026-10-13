"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { ProfileImage } from "@/components/ProfileImage";
import type { AdminProfile } from "@/feat/admins/schema";
import { AdminForm } from "./admin-form";
import { AdminFilterForm, type AdminFilters } from "./admin-filters";

type Status = "all" | "active" | "inactive";

export function AdminManager({
  initialProfiles,
  currentUserId,
}: {
  initialProfiles: AdminProfile[];
  currentUserId: string;
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [filters, setFilters] = useState<AdminFilters>({ query: "", role: "" });
  const [status, setStatus] = useState<Status>("all");
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<AdminProfile | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const editor = useRef<HTMLDivElement>(null);
  const listHeading = useRef<HTMLHeadingElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (editing)
      editor.current?.querySelector<HTMLInputElement>('input:not([type="file"])')?.focus();
  }, [editing]);
  const activeCount = profiles.filter((profile) => profile.is_active).length;
  const statuses: { id: Status; label: string; count: number }[] = [
    { id: "all", label: "Semua", count: profiles.length },
    { id: "active", label: "Aktif", count: activeCount },
    { id: "inactive", label: "Nonaktif", count: profiles.length - activeCount },
  ];
  const filtered = profiles.filter(
    (profile) =>
      [profile.full_name, profile.position ?? "", profile.username ?? "", profile.email]
        .join(" ")
        .toLowerCase()
        .includes(filters.query.trim().toLowerCase()) &&
      (!filters.role || profile.role === filters.role) &&
      (status === "all" || profile.is_active === (status === "active")),
  );
  function openEditor(profile: AdminProfile | null, trigger: HTMLButtonElement) {
    lastTrigger.current = trigger;
    setSelected(profile);
    setNotice(null);
    setEditing(true);
  }
  function closeEditor() {
    setEditing(false);
    requestAnimationFrame(() => lastTrigger.current?.focus());
  }

  return (
    <div className="mt-8">
      {notice && (
        <p
          role="status"
          className="mb-5 border border-success bg-success/10 px-4 py-3 text-sm text-success"
        >
          {notice}
        </p>
      )}
      <section
        hidden={editing}
        aria-labelledby="admin-list-title"
        className="border border-border bg-card text-card-foreground"
      >
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2
              ref={listHeading}
              tabIndex={-1}
              id="admin-list-title"
              className="text-xl font-semibold outline-none"
            >
              Daftar pengelola
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pilih Edit untuk mengubah profil, foto, atau akses akun.
            </p>
          </div>
          <button
            type="button"
            onClick={(event) => openEditor(null, event.currentTarget)}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Plus className="size-4" aria-hidden="true" />
            Tambah pengelola
          </button>
        </div>
        <div className="space-y-4 border-b border-border p-5 sm:p-6">
          <AdminFilterForm onChange={setFilters} />
          <div role="group" aria-label="Filter status pengelola" className="flex flex-wrap gap-2">
            {statuses.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={status === filter.id}
                onClick={() => setStatus(filter.id)}
                className={
                  "inline-flex min-h-11 items-center gap-2 border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring " +
                  (status === filter.id
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border hover:bg-muted")
                }
              >
                {filter.label}
                <span className="text-xs tabular-nums">({filter.count})</span>
              </button>
            ))}
          </div>
          <p role="status" className="text-sm text-muted-foreground">
            Menampilkan {filtered.length} dari {profiles.length} pengelola
          </p>
        </div>
        {filtered.length ? (
          <>
            <div
              aria-hidden="true"
              className="hidden grid-cols-[minmax(0,1fr)_7rem_7rem_8rem] gap-5 border-b border-border bg-muted/50 px-6 py-3 text-xs font-semibold text-muted-foreground md:grid"
            >
              <span>Pengelola</span>
              <span>Peran</span>
              <span>Status</span>
              <span className="text-right">Tindakan</span>
            </div>
            <ul className="divide-y divide-border">
              {filtered.map((profile) => (
                <li
                  key={profile.user_id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-5 md:grid-cols-[minmax(0,1fr)_7rem_7rem_8rem] md:items-center md:gap-5 md:px-6"
                >
                  <div className="flex min-w-0 gap-4">
                    <div className="relative size-16 shrink-0 overflow-hidden border border-border bg-muted">
                      <ProfileImage src={profile.image_path} name={profile.full_name} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold wrap-anywhere">
                        {profile.full_name}
                        {profile.user_id === currentUserId && (
                          <span className="ml-2 text-xs text-muted-foreground">(Anda)</span>
                        )}
                      </h3>
                      {profile.position && (
                        <p className="mt-1 text-sm wrap-anywhere text-primary">
                          {profile.position}
                        </p>
                      )}
                      <p className="mt-1 text-sm wrap-anywhere text-muted-foreground">
                        {profile.email}
                      </p>
                      <p className="mt-2 text-xs wrap-anywhere text-muted-foreground">
                        Username: {profile.username || "Belum diisi"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">{profile.role === "owner" ? "Pemilik" : "Staf"}</p>
                  <div>
                    <span
                      className={
                        "inline-flex px-2 py-1 text-xs font-medium " +
                        (profile.is_active
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground")
                      }
                    >
                      {profile.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => openEditor(profile, event.currentTarget)}
                    aria-label={"Edit akun " + profile.full_name}
                    className="inline-flex min-h-11 items-center justify-center gap-2 justify-self-end border border-border px-4 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="px-6 py-12 text-center">
            <h3 className="font-semibold">Tidak ada pengelola yang cocok</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Coba kata pencarian lain atau pilih filter Semua.
            </p>
          </div>
        )}
      </section>
      {editing && (
        <div ref={editor} className="mx-auto max-w-3xl">
          <button
            type="button"
            disabled={pending}
            onClick={closeEditor}
            className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Kembali ke daftar pengelola
          </button>
          <AdminForm
            key={selected?.user_id ?? "new"}
            profile={selected}
            currentUserId={currentUserId}
            manageAccounts
            onPendingChange={setPending}
            onCancel={closeEditor}
            onSaved={(saved) => {
              setProfiles((current) =>
                [...current.filter((profile) => profile.user_id !== saved.user_id), saved].sort(
                  (a, b) => a.full_name.localeCompare(b.full_name, "id"),
                ),
              );
              setNotice(
                selected
                  ? "Perubahan akun berhasil disimpan."
                  : "Akun pengelola berhasil dibuat dan dapat login menggunakan email serta password awal.",
              );
              setSelected(null);
              setEditing(false);
              requestAnimationFrame(() => listHeading.current?.focus());
            }}
          />
        </div>
      )}
    </div>
  );
}
