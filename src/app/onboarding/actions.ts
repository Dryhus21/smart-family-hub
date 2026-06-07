"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { requireAuth, logActivity } from "@/lib/auth";

export type ActionResult = { error?: string; success?: string };

export async function createFamilyAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (ctx.family) return { error: "Anda sudah tergabung dalam sebuah keluarga." };

  const name = String(formData.get("family_name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (name.length < 2) return { error: "Nama keluarga minimal 2 karakter" };

  const service = createServiceClient();
  const { data: fam, error } = await service
    .from("families")
    .insert({ family_name: name, description: description || null, created_by: ctx.userId })
    .select()
    .single();
  if (error || !fam) return { error: error?.message ?? "Gagal membuat keluarga" };

  const { error: memErr } = await service
    .from("family_members")
    .insert({ family_id: fam.id, user_id: ctx.userId, role: "admin" });
  if (memErr) return { error: memErr.message };

  await logActivity({
    familyId: fam.id,
    actorId: ctx.userId,
    action: "create_family",
    entityType: "family",
    entityId: fam.id,
    metadata: { name },
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function joinByTokenAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (ctx.family) return { error: "Anda sudah tergabung dalam sebuah keluarga." };

  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { error: "Kode undangan wajib diisi" };

  const service = createServiceClient();
  const { data: inv } = await service
    .from("family_invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .maybeSingle();

  if (!inv) return { error: "Kode undangan tidak valid atau sudah dipakai" };

  if (inv.email.toLowerCase() !== ctx.email.toLowerCase()) {
    return { error: "Undangan ini ditujukan untuk email lain" };
  }

  const { error: insErr } = await service
    .from("family_members")
    .insert({ family_id: inv.family_id, user_id: ctx.userId, role: "member" });
  if (insErr) return { error: insErr.message };

  await service.from("family_invitations").update({ status: "accepted" }).eq("id", inv.id);

  await logActivity({
    familyId: inv.family_id,
    actorId: ctx.userId,
    action: "join_family",
    entityType: "family_member",
    entityId: ctx.userId,
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
