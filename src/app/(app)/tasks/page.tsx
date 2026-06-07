import { requireFamily } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { formatDateShortID, daysUntil } from "@/lib/utils";
import { TASK_STATUS_LABEL, type TaskStatus } from "@/lib/types";
import { SubmitButton } from "@/components/SubmitButton";
import TaskForm from "./form";
import { updateTaskStatusAction, deleteTaskAction } from "./actions";

const STATUS_FLOW: Record<TaskStatus, TaskStatus> = {
  belum_dimulai: "sedang_dikerjakan",
  sedang_dikerjakan: "selesai",
  selesai: "belum_dimulai",
};

export default async function TasksPage() {
  const ctx = await requireFamily();
  const service = createServiceClient();

  const [{ data: tasks }, { data: memberRows }] = await Promise.all([
    service.from("tasks").select("*").eq("family_id", ctx.family.id).order("created_at", { ascending: false }),
    service.from("family_members").select("user_id, role").eq("family_id", ctx.family.id),
  ]);

  const userIds = (memberRows ?? []).map((m: { user_id: string }) => m.user_id);
  const { data: profileRows } = userIds.length
    ? await service.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] as { id: string; full_name: string }[] };
  const profileMap = new Map<string, string>();
  (profileRows ?? []).forEach((p: { id: string; full_name: string }) => profileMap.set(p.id, p.full_name));

  const memberList = (memberRows ?? []).map((m: { user_id: string; role: string }) => ({
    id: m.user_id,
    name: profileMap.get(m.user_id) ?? "Anggota",
    role: m.role,
  }));

  const columns: { key: TaskStatus; title: string; color: string }[] = [
    { key: "belum_dimulai", title: "Belum Dimulai", color: "bg-slate-100" },
    { key: "sedang_dikerjakan", title: "Sedang Dikerjakan", color: "bg-blue-100" },
    { key: "selesai", title: "Selesai", color: "bg-green-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tugas Rumah Tangga</h1>
        <p className="mt-1 text-sm text-slate-600">
          Semua anggota dapat menambahkan dan mengubah status tugas. Hanya pembuat tugas atau admin yang dapat menghapus.
        </p>
      </div>

      <TaskForm members={memberList.map(({ id, name }) => ({ id, name }))} />

      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => {
          const items = (tasks ?? []).filter((t: { status: string }) => t.status === col.key);
          return (
            <div key={col.key} className={`rounded-xl ${col.color} p-3`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">{col.title}</h2>
                <span className="badge bg-white text-slate-700">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((t: { id: string; task_name: string; description: string | null; assigned_to: string | null; status: TaskStatus; deadline: string | null; created_by: string }) => {
                  const assigneeName = t.assigned_to ? profileMap.get(t.assigned_to) ?? "?" : "Belum ditugaskan";
                  const overdue = t.deadline && daysUntil(t.deadline) < 0 && t.status !== "selesai";
                  const canChange = ctx.isAdmin || t.assigned_to === ctx.userId || t.created_by === ctx.userId;
                  const canDelete = ctx.isAdmin || t.created_by === ctx.userId;
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
                      <div className="mt-1 text-[11px] text-slate-500">
                        Dibuat oleh: {profileMap.get(t.created_by) ?? "Anggota"}{t.created_by === ctx.userId ? " (Anda)" : ""}
                      </div>
                      <div className="mt-3 flex gap-2">
                        {canChange && (
                          <form action={updateTaskStatusAction}>
                            <input type="hidden" name="id" value={t.id} />
                            <input type="hidden" name="status" value={STATUS_FLOW[t.status as TaskStatus]} />
                            <SubmitButton className="btn btn-secondary text-xs" pendingLabel="Mengubah...">
                              → {TASK_STATUS_LABEL[STATUS_FLOW[t.status as TaskStatus]]}
                            </SubmitButton>
                          </form>
                        )}
                        {canDelete && (
                          <form action={deleteTaskAction}>
                            <input type="hidden" name="id" value={t.id} />
                            <SubmitButton className="btn btn-ghost text-xs text-red-600 hover:bg-red-50" pendingLabel="Menghapus...">Hapus</SubmitButton>
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
