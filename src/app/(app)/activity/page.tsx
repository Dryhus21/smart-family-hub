import { requireFamily } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { Icon } from "@/components/Icon";

const ACTION_LABEL: Record<string, string> = {
  create_family: "membuat keluarga",
  join_family: "bergabung ke keluarga",
  invite_member: "mengundang anggota baru",
  remove_member: "mengeluarkan anggota",
  leave_family: "meninggalkan keluarga",
  update_family: "memperbarui profil keluarga",
  create_event: "menambahkan acara",
  delete_event: "menghapus acara",
  create_task: "membuat tugas",
  update_task_status: "memperbarui status tugas",
  delete_task: "menghapus tugas",
  create_note: "membuat catatan",
  delete_note: "menghapus catatan",
};

const ACTION_ICON: Record<string, string> = {
  create_family: "add_home",
  join_family: "login",
  invite_member: "person_add",
  remove_member: "person_remove",
  leave_family: "logout",
  update_family: "edit",
  create_event: "celebration",
  delete_event: "event_busy",
  create_task: "add_task",
  update_task_status: "autorenew",
  delete_task: "delete",
  create_note: "note_add",
  delete_note: "delete",
};

function relTime(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "baru saja";
  if (d < 3600) return `${Math.floor(d / 60)} menit lalu`;
  if (d < 86400) return `${Math.floor(d / 3600)} jam lalu`;
  if (d < 2592000) return `${Math.floor(d / 86400)} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID");
}

export default async function ActivityPage() {
  const ctx = await requireFamily();
  const service = createServiceClient();

  const { data: logs } = await service
    .from("activity_logs")
    .select("*")
    .eq("family_id", ctx.family.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const actorIds = Array.from(new Set((logs ?? []).map((l: { actor_id: string | null }) => l.actor_id).filter(Boolean))) as string[];
  const { data: actorRows } = actorIds.length
    ? await service.from("profiles").select("id, full_name").in("id", actorIds)
    : { data: [] as { id: string; full_name: string }[] };
  const actorMap = new Map<string, string>();
  (actorRows ?? []).forEach((a: { id: string; full_name: string }) => actorMap.set(a.id, a.full_name));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-display-lg-mobile tracking-tight">
          <span className="text-gradient">Riwayat Aktivitas</span>
        </h1>
        <p className="mt-2 text-on-surface-variant">100 aktivitas terbaru di keluarga ini.</p>
      </header>

      <div className="glass-card neon-card p-6">
        {logs && logs.length ? (
          <ul className="space-y-3">
            {(logs as { id: string; actor_id: string | null; action: string; metadata: Record<string, unknown> | null; created_at: string }[]).map((l) => {
              const name = l.actor_id ? actorMap.get(l.actor_id) ?? "Seseorang" : "Seseorang";
              const action = ACTION_LABEL[l.action] ?? l.action;
              const detail = (l.metadata && (l.metadata.title || l.metadata.name || l.metadata.email)) ?? "";
              const icon = ACTION_ICON[l.action] ?? "notifications";
              return (
                <li key={l.id} className="flex items-start gap-3 rounded-lg border border-white/5 bg-surface-container/40 p-3 transition hover:border-primary/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/30 text-primary">
                    <Icon name={icon} className="text-base" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-on-surface">
                      <span className="font-bold text-primary">{name}</span> {action}
                      {detail ? <> <span className="italic text-on-surface-variant">&quot;{String(detail)}&quot;</span></> : null}
                    </div>
                    <div className="mt-0.5 text-xs text-on-surface-variant">{relTime(l.created_at)}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="py-8 text-center text-sm text-on-surface-variant">
            <Icon name="history" className="text-3xl" />
            <p className="mt-2">Belum ada aktivitas tercatat.</p>
          </div>
        )}
      </div>
    </div>
  );
}
