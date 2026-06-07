import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateShortID, daysUntil } from "@/lib/utils";
import { TASK_STATUS_LABEL, type TaskStatus } from "@/lib/types";
import TaskForm from "./form";
import { updateTaskStatusAction, deleteTaskAction } from "./actions";

const STATUS_FLOW: Record<TaskStatus, TaskStatus> = {
  belum_dimulai: "sedang_dikerjakan",
  sedang_dikerjakan: "selesai",
  selesai: "belum_dimulai",
};

export default async function TasksPage() {
  const ctx = await requireFamily();
  const supabase = await createClient();
  const [{ data: tasks }, { data: members }] = await Promise.all([
    supabase.from("tasks").select("*").eq("family_id", ctx.family.id).order("created_at", { ascending: false }),
    supabase.from("family_members").select("user_id, role, profile:profiles(id, full_name, email)").eq("family_id", ctx.family.id),
  ]);

  const memberMap = new Map<string, { name: string }>();
  (members as unknown as { user_id: string; profile: { id: string; full_name: string } }[])?.forEach((m) => memberMap.set(m.user_id, { name: m.profile.full_name }));

  const columns: { key: TaskStatus; title: string; color: string }[] = [
    { key: "belum_dimulai", title: "Belum Dimulai", color: "bg-slate-100" },
    { key: "sedang_dikerjakan", title: "Sedang Dikerjakan", color: "bg-blue-100" },
    { key: "selesai", title: "Selesai", color: "bg-green-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tugas Rumah Tangga</h1>
        <p className="mt-1 text-sm text-slate-600">{ctx.isAdmin ? "Sebagai Admin, Anda dapat membuat dan menghapus tugas." : "Update status tugas yang ditugaskan kepada Anda."}</p>
      </div>

      {ctx.isAdmin && (
        <TaskForm members={(members as unknown as { user_id: string; profile: { full_name: string } }[])?.map((m) => ({ id: m.user_id, name: m.profile.full_name })) ?? []} />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => {
          const items = tasks?.filter((t) => t.status === col.key) ?? [];
          return (
            <div key={col.key} className={`rounded-xl ${col.color} p-3`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">{col.title}</h2>
                <span className="badge bg-white text-slate-700">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((t) => {
                  const assigneeName = t.assigned_to ? memberMap.get(t.assigned_to)?.name ?? "?" : "Belum ditugaskan";
                  const overdue = t.deadline && daysUntil(t.deadline) < 0 && t.status !== "selesai";
                  const canChange = ctx.isAdmin || t.assigned_to === ctx.userId;
                  return (
                    <div key={t.id} className="rounded-lg bg-white p-3 shadow-sm">
                      <div className="font-medium text-slate-900">{t.task_name}</div>
                      {t.description && <p className="mt-1 text-xs text-slate-600">{t.description}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="badge bg-indigo-50 text-indigo-700">👤 {assigneeName}</span>
                        {t.deadline && (
                          <span className={`badge ${overdue ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>
                            📅 {formatDateShortID(t.deadline)}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex gap-2">
                        {canChange && (
                          <form action={updateTaskStatusAction}>
                            <input type="hidden" name="id" value={t.id} />
                            <input type="hidden" name="status" value={STATUS_FLOW[t.status as TaskStatus]} />
                            <button className="btn btn-secondary text-xs" type="submit">
                              → {TASK_STATUS_LABEL[STATUS_FLOW[t.status as TaskStatus]]}
                            </button>
                          </form>
                        )}
                        {ctx.isAdmin && (
                          <form action={deleteTaskAction}>
                            <input type="hidden" name="id" value={t.id} />
                            <button className="btn btn-ghost text-xs text-red-600 hover:bg-red-50" type="submit">Hapus</button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!items.length && <div className="text-xs text-slate-500">Kosong</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
