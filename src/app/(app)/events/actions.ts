"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { data, error } = await supabase
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
  const supabase = await createClient();
  const { data: ev } = await supabase.from("events").select("title").eq("id", id).single();
  await supabase.from("events").delete().eq("id", id);
  await logActivity({ familyId: ctx.family.id, actorId: ctx.userId, action: "delete_event", entityType: "event", entityId: id, metadata: { title: ev?.title } });
  revalidatePath("/events");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}
