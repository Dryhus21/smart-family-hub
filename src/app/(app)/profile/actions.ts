"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export type ActionResult = { error?: string; success?: string };
export type UploadResult = { error?: string; url?: string };

export async function uploadProfileAvatarAction(formData: FormData): Promise<UploadResult> {
  const ctx = await requireAuth();
  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "File tidak ditemukan" };
  if (file.size > 2 * 1024 * 1024) return { error: "Ukuran file maksimal 2 MB" };
  if (!file.type.startsWith("image/")) return { error: "File harus berupa gambar" };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `avatars/${ctx.userId}.${ext}`;
  const bytes = await file.arrayBuffer();

  const service = createServiceClient();
  const { error: uploadError } = await service.storage
    .from("family-assets")
    .upload(path, bytes, { contentType: file.type, upsert: true });
  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = service.storage.from("family-assets").getPublicUrl(path);
  const url = `${urlData.publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await service
    .from("profiles")
    .update({ avatar_url: urlData.publicUrl })
    .eq("id", ctx.userId);
  if (updateError) return { error: updateError.message };

  revalidatePath("/profile");
  revalidatePath("/family");
  revalidatePath("/", "layout");
  return { url };
}

export async function updateProfileAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireAuth();
  const full_name = String(formData.get("full_name") ?? "").trim();
  const birth_date_raw = String(formData.get("birth_date") ?? "").trim();
  const description_raw = String(formData.get("description") ?? "").trim();

  if (full_name.length < 2) return { error: "Nama minimal 2 karakter" };

  const birth_date = birth_date_raw || null;
  const description = description_raw || null;

  const service = createServiceClient();
  const { error } = await service
    .from("profiles")
    .update({ full_name, birth_date, description })
    .eq("id", ctx.userId);
  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/family");
  revalidatePath("/", "layout");
  return { success: "Profil diperbarui" };
}
