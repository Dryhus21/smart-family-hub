import { requireFamily } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { formatDateShortID, daysUntil } from "@/lib/utils";
import { TASK_STATUS_LABEL, type TaskStatus } from "@/lib/types";
import { SubmitButton } from "@/components/SubmitButton";
import { Icon } from "@/components/Icon";
import TaskForm from "./form";
import { updateTaskStatusAction, deleteTaskAction } from "./actions";

const STATUS_FLOW: Record<TaskStatus, TaskStatus> = {
  belum_dimulai: "sedang_dikerjakan",
  sedang_dikerjakan: "selesai",
  selesai: "belum_dimulai",
};

const STATUS_ICON: Record<TaskStatus, string> = {
  belum_dimulai: "play_arrow",
  sedang_dikerjakan: "check",
  selesai: "replay",
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

  const memberList = (memberRows ?? []).map((m: { user_id: string }) => ({
    id: m.user_id,
    name: profileMap.get(m.user_id) ?? "Anggota",
  }));

  const columns: { key: TaskStatus; title: string; icon: string; accent: string }[] = [
    { key: "belum_dimulai", title: "Belum Dimulai", icon: "schedule", accent: "border-on-surface-variant/30" },
    { key: "sedang_dikerjakan", title: "Sedang Dikerjakan", icon: "autorenew", accent: "border-primary/40" },
    { key: "selesai", title: "Selesai", icon: "check_circle", accent: "border-success-green/40" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-display-lg-mobile tracking-tight">
          <span className="text-gradient">Tugas Rumah Tangga</span>
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Semua anggota dapat menambahkan dan mengubah status tugas. Pembuat atau admin dapat menghapus.
        </p>
      </header>

      <TaskForm members={memberList} />

      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => {
          const items = (tasks ?? []).filter((t: { status: string }) => t.status === col.key);
          return (
            <div key={col.key} className={`rounded-xl border-t-2 ${col.accent} bg-surface-container-low/60 p-4 backdrop-blur-lg`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold text-on-surface">
                  <Icon name={col.icon} className="text-base text-on-surface-variant" />
                  {col.title}
                </h2>
                <span className="badge bg-surface-container text-on-surface-variant">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((t: { id: string; task_name: string; description: string | null; assigned_to: string | null; status: TaskStatus; deadline: string | null; created_by: string }) => {
                  const assigneeName = t.assigned_to ? profileMap.get(t.assigned_to) ?? "?" : "Belum ditugaskan";
                  const overdue = t.deadline && daysUntil(t.deadline) < 0 && t.status !== "selesai";
                  const canChange = ctx.isAdmin || t.assigned_to === ctx.userId || t.created_by === ctx.userId;
                  const canDelete = ctx.isAdmin || t.created_by === ctx.userId;
                  return (
                    <div key={t.id} className="rounded-lg border border-white/10 bg-surface-container/70 p-3 transition hover:border-primary/30">
                      <div className="font-semibold text-on-surface">{t.task_name}</div>
                      {t.description && <p className="mt-1 text-xs text-on-surface-variant">{t.description}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="badge bg-primary-container/20 text-primary"><Icon name="person" className="text-xs" /> {assigneeName}</span>
                        {t.deadline && (
                          <span className={`badge ${overdue ? "bg-danger-red/20 text-danger-red" : "bg-surface-container-high text-on-surface-variant"}`}>
                            <Icon name="event" className="text-xs" /> {formatDateShortID(t.deadline)}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 text-[10px] text-on-surface-variant">
                        Dibuat oleh: {profileMap.get(t.created_by) ?? "Anggota"}{t.created_by === ctx.userId ? " (Anda)" : ""}
                      </div>
                      <div className="mt-3 flex gap-2">
                        {canChange && (
                          <form action={updateTaskStatusAction} className="flex-1">
                            <input type="hidden" name="id" value={t.id} />
                            <input type="hidden" name="status" value={STATUS_FLOW[t.status as TaskStatus]} />
                            <SubmitButton className="btn btn-secondary w-full text-xs" pendingLabel="...">
                              <Icon name={STATUS_ICON[t.status as TaskStatus]} className="text-sm" />
                              {TASK_STATUS_LABEL[STATUS_FLOW[t.status as TaskStatus]]}
                            </SubmitButton>
                          </form>
                        )}
                        {canDelete && (
                          <form action={deleteTaskAction}>
                            <input type="hidden" name="id" value={t.id} />
                            <SubmitButton className="btn btn-ghost text-xs text-danger-red hover:bg-danger-red/10" pendingLabel="...">
                              <Icon name="delete" className="text-sm" />
                            </SubmitButton>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!items.length && <div className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-xs text-on-surface-variant">Kosong</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
