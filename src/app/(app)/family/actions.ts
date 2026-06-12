"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { requireAdmin, requireFamily, logActivity } from "@/lib/auth";

export type UploadResult = { error?: string; url?: string };

export async function uploadAvatarAction(formData: FormData): Promise<UploadResult> {
  const ctx = await requireFamily();
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

  revalidatePath("/family");
  revalidatePath("/", "layout");
  return { url };
}

export type ActionResult = { error?: string; success?: string; token?: string };

export async function updateFamilyAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireAdmin();
  const family_name = String(formData.get("family_name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const photo_url = String(formData.get("photo_url") ?? "").trim() || null;
  if (family_name.length < 2) return { error: "Nama keluarga minimal 2 karakter" };

  const supabase = await createClient();
  const { error } = await supabase.from("families").update({ family_name, description, photo_url }).eq("id", ctx.family.id);
  if (error) return { error: error.message };

  await logActivity({ familyId: ctx.family.id, actorId: ctx.userId, action: "update_family", entityType: "family", entityId: ctx.family.id });
  revalidatePath("/family");
  revalidatePath("/", "layout");
  return { success: "Profil keluarga diperbarui" };
}

export async function inviteMemberAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return { error: "Email tidak valid" };

  const service = createServiceClient();
  const { data: existing } = await service.from("family_invitations").select("token, status").eq("family_id", ctx.family.id).eq("email", email).eq("status", "pending").maybeSingle();
  if (existing) return { success: "Undangan sudah ada — kode di bawah.", token: existing.token };

  const { data, error } = await service
    .from("family_invitations")
    .insert({ family_id: ctx.family.id, email, invited_by: ctx.userId })
    .select()
    .single();
  if (error) return { error: error.message };

  await logActivity({ familyId: ctx.family.id, actorId: ctx.userId, action: "invite_member", entityType: "invitation", entityId: data.id, metadata: { email } });
  revalidatePath("/family");
  return { success: "Undangan dibuat! Bagikan kode di bawah ke anggota keluarga.", token: data.token };
}

export async function revokeInviteAction(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  const id = String(formData.get("id"));
  const service = createServiceClient();
  await service.from("family_invitations").update({ status: "revoked" }).eq("id", id).eq("family_id", ctx.family.id);
  revalidatePath("/family");
}

export async function removeMemberAction(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  const userId = String(formData.get("user_id"));
  if (userId === ctx.userId) return;
  const service = createServiceClient();
  await service.from("family_members").delete().eq("user_id", userId).eq("family_id", ctx.family.id);
  await logActivity({ familyId: ctx.family.id, actorId: ctx.userId, action: "remove_member", entityType: "family_member", entityId: userId });
  revalidatePath("/family");
}

export async function leaveFamilyAction(): Promise<void> {
  const ctx = await requireFamily();
  const service = createServiceClient();
  await service.from("family_members").delete().eq("user_id", ctx.userId);
  await logActivity({ familyId: ctx.family.id, actorId: ctx.userId, action: "leave_family", entityType: "family_member", entityId: ctx.userId });
  revalidatePath("/", "layout");
}
