"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireFamily, logActivity } from "@/lib/auth";

export type ActionResult = { error?: string; success?: string };

export async function createEventAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireFamily();
  const title = String(formData.get("title") ?? "").trim();
  const event_date = String(formData.get("event_date") ?? "");
  const event_time = String(formData.get("event_time") ?? "") || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!title) return { error: "Judul acara wajib diisi" };
  if (!event_date) return { error: "Tanggal acara wajib diisi" };

  const service = createServiceClient();
  const { data, error } = await service
    .from("events")
    .insert({ family_id: ctx.family.id, title, event_date, event_time, location, description, created_by: ctx.userId })
    .select()
    .single();
  if (error) return { error: error.message };

  await logActivity({ familyId: ctx.family.id, actorId: ctx.userId, action: "create_event", entityType: "event", entityId: data.id, metadata: { title } });
  revalidatePath("/events");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: "Acara berhasil dibuat" };
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  const ctx = await requireFamily();
  const id = String(formData.get("id"));
  const service = createServiceClient();
  const { data: ev } = await service.from("events").select("title, family_id, created_by").eq("id", id).single();
  if (!ev || ev.family_id !== ctx.family.id) return;
  // Only creator or admin can delete
  if (ev.created_by !== ctx.userId && !ctx.isAdmin) return;
  await service.from("events").delete().eq("id", id);
  await logActivity({ familyId: ctx.family.id, actorId: ctx.userId, action: "delete_event", entityType: "event", entityId: id, metadata: { title: ev.title } });
  revalidatePath("/events");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}
