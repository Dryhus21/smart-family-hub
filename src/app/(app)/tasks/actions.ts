"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireFamily, logActivity } from "@/lib/auth";
import type { TaskStatus } from "@/lib/types";

export type ActionResult = { error?: string; success?: string };

export async function createTaskAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireAdmin();
  const task_name = String(formData.get("task_name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const assigned_to = String(formData.get("assigned_to") ?? "") || null;
  const deadline = String(formData.get("deadline") ?? "") || null;
  if (!task_name) return { error: "Nama tugas wajib diisi" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({ family_id: ctx.family.id, task_name, description, assigned_to, deadline, created_by: ctx.userId })
    .select()
    .single();
  if (error) return { error: error.message };

  await logActivity({ familyId: ctx.family.id, actorId: ctx.userId, action: "create_task", entityType: "task", entityId: data.id, metadata: { name: task_name } });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: "Tugas berhasil dibuat" };
}

export async function updateTaskStatusAction(formData: FormData): Promise<void> {
  const ctx = await requireFamily();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as TaskStatus;
  const supabase = await createClient();
  const { data: t } = await supabase.from("tasks").select("task_name").eq("id", id).single();
  await supabase.from("tasks").update({ status }).eq("id", id);
  await logActivity({ familyId: ctx.family.id, actorId: ctx.userId, action: "update_task_status", entityType: "task", entityId: id, metadata: { name: t?.task_name, status } });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { data: t } = await supabase.from("tasks").select("task_name").eq("id", id).single();
  await supabase.from("tasks").delete().eq("id", id);
  await logActivity({ familyId: ctx.family.id, actorId: ctx.userId, action: "delete_task", entityType: "task", entityId: id, metadata: { name: t?.task_name } });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
