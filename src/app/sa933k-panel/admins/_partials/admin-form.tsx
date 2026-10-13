"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ErlangForm } from "@/components/forms/schema-form";
import { createStringField, TextField } from "@/components/forms/custom-fields";
import { AdminImageField, AdminImageUploadContext } from "@/components/forms/admin-image-field";
import {
  adminFormSchema,
  createAdminFormSchema,
  type AdminFormValues,
} from "@/feat/admins/form-schema";
import type { AdminProfile } from "@/feat/admins/schema";
import { createAdminAction, saveAdminProfileAction } from "@/feat/admins/actions";
import { uploadAdminImage } from "@/feat/admins/image-upload";

const EmailField = createStringField({ type: "email", autoComplete: "off" });
const InitialPasswordField = createStringField({ type: "password", autoComplete: "new-password" });
const PhoneField = createStringField({ type: "tel" });
const UrlField = createStringField({ type: "url" });
const RoleField = createStringField<"owner" | "staff">();

export function AdminForm({
  profile,
  currentUserId,
  manageAccounts = false,
  onSaved,
  onCancel,
  onPendingChange,
}: {
  profile: AdminProfile | null;
  currentUserId: string;
  manageAccounts?: boolean;
  onSaved?: (profile: AdminProfile) => void;
  onCancel?: () => void;
  onPendingChange?: (pending: boolean) => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const canChangeAccess = manageAccounts && profile?.user_id !== currentUserId;
  const schema = profile ? adminFormSchema : createAdminFormSchema;
  const form = useForm({
    defaultValues: {
      full_name: profile?.full_name ?? "",
      position: profile?.position ?? "",
      username: profile?.username ?? "",
      email: profile?.email ?? "",
      password: "",
      image_path: profile?.image_path ?? "",
      whatsapp: profile?.whatsapp ?? "",
      instagram: profile?.instagram ?? "",
      role: profile?.role ?? "staff",
      is_active: profile?.is_active ?? true,
    } as AdminFormValues,
    validators: { onBlur: schema, onSubmit: schema },
    listeners: { onChange: () => setSuccess(false) },
    onSubmit: async ({ value }) => {
      setError(null);
      setSuccess(false);
      setPending(true);
      onPendingChange?.(true);
      try {
        let imagePath = value.image_path;
        if (imageFile) {
          setUploading(true);
          imagePath = await uploadAdminImage(imageFile);
          form.setFieldValue("image_path", imagePath);
          setImageFile(null);
          setUploading(false);
        }
        const payload = { ...value, image_path: imagePath };
        const result = profile
          ? await saveAdminProfileAction(payload, {
              user_id: profile.user_id,
              updated_at: profile.updated_at,
            })
          : await createAdminAction(payload);
        if (!result.success) {
          setError(result.error);
          return;
        }
        form.setFieldValue("password", "");
        setSuccess(true);
        onSaved?.(result.profile);
        router.refresh();
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Data belum dapat disimpan. Silakan coba kembali.",
        );
      } finally {
        setUploading(false);
        setPending(false);
        onPendingChange?.(false);
      }
    },
  });

  return (
    <section
      aria-labelledby="admin-form-title"
      className="border border-border bg-card p-5 text-card-foreground sm:p-8"
    >
      <h2 id="admin-form-title" className="text-2xl font-semibold">
        {profile
          ? manageAccounts
            ? "Edit akun pengelola"
            : "Edit profil saya"
          : "Tambah akun pengelola"}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Lengkapi informasi akun dan kontak publik. Nama dan email wajib diisi.
      </p>
      <AdminImageUploadContext.Provider
        value={{
          file: imageFile,
          setFile: (file) => {
            setImageFile(file);
            setSuccess(false);
          },
        }}
      >
        <ErlangForm<AdminFormValues>
          form={form}
          schema={schema}
          label={profile ? "Edit profil pengelola" : "Tambah akun pengelola"}
          className="mt-8"
          disabled={pending}
          sectionConfig={{
            information: { title: "Informasi akun", collapsible: false },
            public: { title: "Profil publik", collapsible: false },
            access: { title: "Akses pengelola", collapsible: false },
          }}
          fieldConfig={{
            full_name: {
              label: "Nama lengkap",
              placeholder: "Nama pengelola",
              requiredIf: () => true,
              section: "information",
              layout: { sm: 6 },
            },
            position: {
              label: "Posisi (opsional)",
              component: TextField,
              placeholder: "Misalnya Sales Xiaomi, Sales Realme, atau IT",
              description: "Posisi pekerjaan ditampilkan di halaman Tim Kami.",
              section: "information",
              layout: { sm: 6 },
            },
            username: {
              label: "Username (opsional)",
              placeholder: "nama.pengelola",
              description: "Gunakan huruf, angka, titik, garis bawah, atau tanda hubung.",
              section: "information",
              layout: { sm: 6 },
            },
            email: {
              label: "Email login",
              component: EmailField,
              requiredIf: () => true,
              readOnlyIf: () => Boolean(profile),
              description: profile
                ? "Email terhubung dengan akun login."
                : "Gunakan email untuk masuk ke panel pengelola.",
              section: "information",
              layout: { sm: 6 },
            },
            password: {
              label: "Password awal",
              component: InitialPasswordField,
              showIf: () => !profile,
              requiredIf: () => !profile,
              description: "Minimal 8 karakter. Digunakan untuk login akun baru.",
              section: "information",
              layout: { sm: 6 },
            },
            image_path: {
              label: "URL/path foto (opsional)",
              component: AdminImageField,
              placeholder: "URL HTTPS atau path foto lokal",
              description:
                "Nama, posisi, foto, dan kontak publik akun aktif tampil di halaman Tim Kami.",
              section: "public",
            },
            whatsapp: {
              label: "WhatsApp publik (opsional)",
              component: PhoneField,
              placeholder: "6281234567890",
              description: "Gunakan kode negara 62 tanpa tanda +.",
              section: "public",
              layout: { sm: 6 },
            },
            instagram: {
              label: "Instagram publik (opsional)",
              component: UrlField,
              placeholder: "https://www.instagram.com/namaakun/",
              section: "public",
              layout: { sm: 6 },
            },
            role: {
              label: "Peran",
              component: RoleField,
              options: [
                { value: "staff", label: "Staf" },
                { value: "owner", label: "Pemilik" },
              ],
              disableIf: () => !canChangeAccess,
              description: !canChangeAccess
                ? "Peran akun sendiri tidak dapat diubah."
                : "Pemilik dapat mengelola akun pengelola lainnya.",
              section: "access",
              layout: { sm: 6 },
            },
            is_active: {
              label: "Akun aktif",
              disableIf: () => !canChangeAccess,
              description: "Akun aktif dapat mengakses panel dan tampil di halaman Tim Kami.",
              section: "access",
              layout: { sm: 6 },
            },
          }}
        >
          {error && (
            <p
              role="alert"
              className="border border-error bg-error/10 px-4 py-3 text-sm text-error"
            >
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="text-sm text-success">
              Profil berhasil disimpan.
            </p>
          )}
          <div className="flex flex-wrap gap-3 border-t border-border pt-5">
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 bg-primary px-5 py-3 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading
                ? "Mengunggah foto…"
                : pending
                  ? "Menyimpan…"
                  : profile
                    ? "Simpan perubahan"
                    : "Tambah pengelola"}
            </button>
            {onCancel && (
              <button
                type="button"
                disabled={pending}
                onClick={onCancel}
                className="min-h-11 border border-border px-5 py-3 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              >
                Batal
              </button>
            )}
          </div>
        </ErlangForm>
      </AdminImageUploadContext.Provider>
    </section>
  );
}
