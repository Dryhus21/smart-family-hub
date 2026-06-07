"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireFamily, logActivity } from "@/lib/auth";

export type ActionResult = { error?: string; success?: string };

export async function createNoteAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireFamily();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!title) return { error: "Judul wajib diisi" };
  if (!content) return { error: "Isi catatan wajib diisi" };

  const service = createServiceClient();
  const { data, error } = await service
    .from("notes")
    .insert({ family_id: ctx.family.id, title, content, created_by: ctx.userId })
    .select()
    .single();
  if (error) return { error: error.message };

  await logActivity({ familyId: ctx.family.id, actorId: ctx.userId, action: "create_note", entityType: "note", entityId: data.id, metadata: { title } });
  revalidatePath("/notes");
  revalidatePath("/dashboard");
  return { success: "Catatan tersimpan" };
}

export async function deleteNoteAction(formData: FormData): Promise<void> {
  const ctx = await requireFamily();
  const id = String(formData.get("id"));
  const service = createServiceClient();
  const { data: n } = await service.from("notes").select("title, family_id, created_by").eq("id", id).single();
  if (!n || n.family_id !== ctx.family.id) return;
  if (n.created_by !== ctx.userId && !ctx.isAdmin) return;
  await service.from("notes").delete().eq("id", id);
  await logActivity({ familyId: ctx.family.id, actorId: ctx.userId, action: "delete_note", entityType: "note", entityId: id, metadata: { title: n.title } });
  revalidatePath("/notes");
}
