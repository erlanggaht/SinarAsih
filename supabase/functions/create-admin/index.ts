import { createClient } from "@supabase/supabase-js";
import { createAdminSchema, ADMIN_PROFILE_COLUMNS } from "./schema.ts";

const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return reply({ error: "Metode tidak didukung." }, 405);
  try {
    const authorization = request.headers.get("Authorization") ?? "";
    if (!authorization.startsWith("Bearer "))
      return reply({ error: "Silakan masuk kembali." }, 401);
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    const { data: auth, error: authError } = await admin.auth.getUser(authorization.slice(7));
    if (authError || !auth.user) return reply({ error: "Sesi tidak valid." }, 401);
    const { data: actor, error: actorError } = await admin
      .from("admin_profiles")
      .select("role, is_active")
      .eq("user_id", auth.user.id)
      .single();
    if (actorError || !actor?.is_active || actor.role !== "owner")
      return reply({ error: "Hanya pemilik aktif yang dapat menambah pengelola." }, 403);
    const raw = await request.text();
    if (raw.length > 20000) return reply({ error: "Data terlalu besar." }, 413);
    const parsed = createAdminSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return reply({ error: parsed.error.issues[0].message }, 400);
    const { password, ...values } = parsed.data;
    const { data: account, error: createError } = await admin.auth.admin.createUser({
      email: values.email,
      password,
      email_confirm: true,
    });
    if (createError || !account.user)
      return reply(
        {
          error:
            createError?.code === "email_exists" || createError?.code === "email_already_exists"
              ? "Email sudah digunakan akun lain."
              : "Akun gagal dibuat. Periksa email dan kekuatan password.",
        },
        400,
      );
    const { data: profile, error: profileError } = await admin
      .from("admin_profiles")
      .insert({
        ...values,
        user_id: account.user.id,
        username: values.username || null,
        image_path: values.image_path || null,
        whatsapp: values.whatsapp || null,
        instagram: values.instagram || null,
      })
      .select(ADMIN_PROFILE_COLUMNS)
      .single();
    if (profileError || !profile) {
      const { error: rollbackError } = await admin.auth.admin.deleteUser(account.user.id);
      if (rollbackError)
        return reply(
          {
            error:
              "Akun autentikasi terbentuk, tetapi profil gagal disimpan. Hubungi pemilik sebelum mencoba kembali.",
          },
          500,
        );
      return reply(
        {
          error:
            profileError?.code === "23505"
              ? "Email atau username sudah digunakan."
              : "Profil gagal dibuat. Silakan coba kembali.",
        },
        400,
      );
    }
    return reply({ success: true, profile }, 201);
  } catch {
    return reply({ error: "Akun belum dapat dibuat. Silakan coba kembali." }, 500);
  }
});
